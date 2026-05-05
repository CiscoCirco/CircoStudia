import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import UserInfo from '../../../core/api/UserInfo';
import User from '../../../core/entities/User';
import { getSP } from '../../../core/pnp/sp/pnpjs-presets';
import { useLoading } from './LoadingContext';
import { Lista, RolId } from '../../../core/utils/Constants';

export interface IEstudiante {
  Id: number;
  Title: string;
  emailPersonal: string;
  preset: boolean;
  usuarioId: number;
}

interface UserContextType {
  user: User | null;
  rolActual: RolId | null;
  isAdmin: boolean;
  estudianteActual: IEstudiante | null;
  error: string | null;
  isInitialLoading: boolean;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [rolActual, setRolActual] = useState<RolId | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [estudianteActual, setEstudianteActual] = useState<IEstudiante | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const { showLoading, hideLoading } = useLoading();
  const userInfo = new UserInfo();

  const loadUserData = async (): Promise<void> => {
    try {
      showLoading();
      setError(null);

      const userData = await userInfo.getLoggedUser();
      if (!userData || userData.message) {
        throw new Error('No se pudo obtener la información del usuario');
      }
      const currentUser = new User(userData);
      setUser(currentUser);

      const sp = getSP();

      const estudianteItems: any[] = await sp.web.lists
        .getByTitle(Lista.ESTUDIANTE)
        .items
        .filter(`usuario/EMail eq '${currentUser.Email}'`)
        .select('Id', 'Title', 'emailPersonal', 'preset', 'usuario/Id', 'usuario/EMail')
        .expand('usuario')
        .top(1)();

      if (estudianteItems.length === 0) {
        console.log('[CircoStudia] Usuario no tiene registro en Estudiante:', currentUser.Email);
        setEstudianteActual(null);
        setRolActual(null);
        setIsAdmin(false);
        return;
      }

      const est = estudianteItems[0];
      const estudiante: IEstudiante = {
        Id: est.Id,
        Title: est.Title || '',
        emailPersonal: est.emailPersonal || '',
        preset: est.preset || false,
        usuarioId: est.usuario ? est.usuario.Id : 0
      };
      setEstudianteActual(estudiante);

      const asignaciones: any[] = await sp.web.lists
        .getByTitle(Lista.ASIGNADO_A)
        .items
        .filter(`idEstudianteId eq ${estudiante.Id}`)
        .select('Id', 'idRol/Id', 'idRol/nombreRol')
        .expand('idRol')
        .top(1)();

      if (asignaciones.length > 0 && asignaciones[0].idRol) {
        const rolId: number = asignaciones[0].idRol.Id;
        const admin = rolId === RolId.ADMIN;
        setIsAdmin(admin);
        setRolActual(admin ? RolId.ADMIN : RolId.ESTUDIANTE);
        console.log('[CircoStudia] Usuario:', currentUser.Title, '| Rol:', asignaciones[0].idRol.nombreRol, '| Estudiante:', estudiante.Title);
      } else {
        setIsAdmin(false);
        setRolActual(RolId.ESTUDIANTE);
        console.log('[CircoStudia] Usuario:', currentUser.Title, '| Sin asignación de rol — asignando Estudiante por defecto');
      }
    } catch (err) {
      console.error('[CircoStudia] Error al cargar datos del usuario:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar datos del usuario');
    } finally {
      hideLoading();
      setIsInitialLoading(false);
    }
  };

  const refreshUserData = async (): Promise<void> => {
    await loadUserData();
  };

  useEffect(() => {
    loadUserData().catch(console.error);
  }, []);

  return (
    <UserContext.Provider value={{ user, rolActual, isAdmin, estudianteActual, error, isInitialLoading, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
