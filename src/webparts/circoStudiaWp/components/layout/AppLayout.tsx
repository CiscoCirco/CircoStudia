import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import Icon, { IconName, getInitials } from '../shared/Icon';
import styles from '../CircoStudiaWp.module.scss';

interface INavItem {
  id: string;
  path: string;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: INavItem[] = [
  { id: 'inicio', path: '/', label: 'Inicio', icon: 'home' },
  { id: 'oferta', path: '/oferta', label: 'Oferta de materias', icon: 'book' },
  { id: 'inscripcion', path: '/mis-inscripciones', label: 'Inscripción', icon: 'calendar' },
  { id: 'coincidencias', path: '/coincidencias', label: 'Coincidencias', icon: 'users' },
  { id: 'perfil', path: '/perfil', label: 'Mi perfil', icon: 'user' },
];

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Inicio',
  '/oferta': 'Oferta de materias',
  '/mis-inscripciones': 'Inscripción',
  '/coincidencias': 'Coincidencias',
  '/perfil': 'Mi perfil',
  '/admin': 'Administración',
  '/admin/oferta': 'Gestión de oferta',
  '/admin/importar': 'Importar oferta',
  '/admin/reporte': 'Reporte de inscriptos',
};

interface IAppLayoutProps {
  children: React.ReactNode;
  inscripcionesCount?: number;
}

const AppLayout: React.FC<IAppLayoutProps> = ({ children, inscripcionesCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, estudianteActual, isAdmin } = useUser();

  const nombre = estudianteActual?.Title || user?.Title || 'Usuario';
  const iniciales = getInitials(nombre);
  const currentLabel = ROUTE_LABELS[location.pathname] || 'CircoStudia';

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    if (path === '/admin') return location.pathname.startsWith('/admin');
    return location.pathname === path;
  };

  return (
    <div className={styles.app}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarTitle}>Circo Studia</div>
          <div className={styles.sidebarSub}>2° Cuatrimestre · 2025</div>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navLabel}>Navegación</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.navIcon}>
                <Icon name={item.icon} size={18} />
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'inscripcion' && (inscripcionesCount ?? 0) > 0 && (
                <span className={styles.chip} style={{ background: '#0F9E72', color: '#fff', padding: '1px 7px', fontSize: 10 }}>
                  {inscripcionesCount}
                </span>
              )}
            </button>
          ))}

          {isAdmin && (
            <>
              <div className={styles.navLabel} style={{ marginTop: 14 }}>Admin</div>
              <button
                className={`${styles.navItem} ${isActive('/admin') ? styles.navItemActive : ''}`}
                onClick={() => navigate('/admin')}
              >
                <span className={styles.navIcon}><Icon name="settings" size={18} /></span>
                <span>Administración</span>
              </button>
            </>
          )}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarAvatar}>{iniciales}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nombre}
            </div>
            <div style={{ fontSize: 11, opacity: .75 }}>CircoStudia</div>
          </div>
        </div>
      </aside>

      {/* ── Right side ── */}
      <div className={styles.appContent}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <div className={styles.topbarCrumb}>
            Circo Studia · <strong>{currentLabel}</strong>
          </div>
        </div>

        {/* Page content */}
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
