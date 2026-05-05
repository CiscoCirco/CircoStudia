import * as React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner, SpinnerSize, Stack, MessageBar, MessageBarType } from '@fluentui/react';
import { LoadingProvider } from '../contexts/LoadingContext';
import { MessageProvider } from '../providers/MessageProvider';
import { UserProvider } from '../contexts/UserContext';
import { useUser } from '../contexts/UserContext';
import { ICircoStudiaWPProps } from './ICircoStudiaWPProps';
import Home from './home/Home';
import OfertaView from './oferta/OfertaView';
import MisInscripciones from './misInscripciones/MisInscripciones';
import ProtectedRoute from './ProtectedRoute/ProtectedRoute';
import AdminHome from './admin/AdminHome';
import GestionOferta from './admin/gestionOferta/GestionOferta';
import ImportarOferta from './admin/importarOferta/ImportarOferta';
import ReporteInscriptos from './admin/reporteInscriptos/ReporteInscriptos';
import SinPerfil from './sinPerfil/SinPerfil';
import Coincidencias from './coincidencias/Coincidencias';
import Perfil from './perfil/Perfil';
import AppLayout from './layout/AppLayout';
import styles from './CircoStudiaWp.module.scss';

const AppGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { estudianteActual, isInitialLoading, error } = useUser();

  if (isInitialLoading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: 300 } }}>
        <Spinner size={SpinnerSize.large} label="Cargando..." />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack tokens={{ padding: 24 }}>
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      </Stack>
    );
  }

  if (!estudianteActual) {
    return <SinPerfil />;
  }

  return <>{children}</>;
};

const CircoStudiaWP: React.FC<ICircoStudiaWPProps> = () => {
  return (
    <div className={styles.circoStudiaWp}>
      <LoadingProvider>
        <MessageProvider>
          <UserProvider>
            <HashRouter>
              <AppGuard>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/oferta" element={<OfertaView />} />
                    <Route path="/mis-inscripciones" element={<MisInscripciones />} />
                    <Route path="/coincidencias" element={<Coincidencias />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/admin" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />
                    <Route path="/admin/oferta" element={<ProtectedRoute><GestionOferta /></ProtectedRoute>} />
                    <Route path="/admin/importar" element={<ProtectedRoute><ImportarOferta /></ProtectedRoute>} />
                    <Route path="/admin/reporte" element={<ProtectedRoute><ReporteInscriptos /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </AppGuard>
            </HashRouter>
          </UserProvider>
        </MessageProvider>
      </LoadingProvider>
    </div>
  );
};

export default CircoStudiaWP;
