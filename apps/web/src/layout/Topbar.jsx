import {useCallback, useEffect, useRef, useState} from 'react';
import {
  Bell,
  Bot,
  ChevronDown,
  Command,
  Menu,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {apiRequest} from '../api';
import {useAuth} from '../auth/AuthContext';
import {useTheme} from '../framework/ThemeContext';
import styles from './Topbar.module.css';

const pageNames = {
  '/': ['Inicio', 'Centro del negocio'],
  '/agenda': ['Business OS', 'Agenda central'],
  '/tareas': ['Trabajo', 'Centro de tareas'],
  '/ventas': ['Ventas', 'Centro comercial'],
  '/ventas/operacion': ['Ventas', 'Entregas y facturación'],
  '/ventas/devoluciones': ['Ventas', 'Devoluciones y notas de crédito'],
  '/ventas/cobranza': ['Ventas', 'Cobranza'],
  '/compras': ['Compras', 'Centro de compras'],
  '/compras/solicitudes': ['Compras', 'Solicitudes'],
  '/compras/ordenes': ['Compras', 'Órdenes de compra'],
  '/compras/recepciones': ['Compras', 'Recepciones'],
  '/compras/proveedores': ['Compras', 'Proveedores'],
  '/inventario/productos': ['Inventario', 'Productos'],
  '/inventario/existencias': ['Inventario', 'Existencias'],
  '/inventario/movimientos': ['Inventario', 'Movimientos'],
  '/inventario/operaciones': ['Inventario', 'Transferencias y ajustes'],
  '/almacenes': ['Inventario', 'Almacenes'],
  '/administracion': ['Administración', 'Centro administrativo'],
  '/finanzas': ['Finanzas', 'Cuentas por pagar'],
  '/finanzas/cuentas-por-pagar': ['Finanzas', 'Cuentas por pagar'],
  '/finanzas/cuentas-por-cobrar': ['Finanzas', 'Cuentas por cobrar'],
  '/finanzas/tesoreria': ['Finanzas', 'Tesorería'],
  '/finanzas/presupuestos': ['Finanzas', 'Presupuestos'],
  '/finanzas/conciliacion-bancaria': ['Finanzas', 'Conciliación bancaria'],
  '/finanzas/flujo-efectivo': ['Finanzas', 'Flujo de efectivo'],
  '/finanzas/contabilidad': ['Finanzas', 'Contabilidad'],
  '/recursos-humanos': ['Recursos humanos', 'Empleados y estructura'],
  '/recursos-humanos/operacion': ['Recursos humanos', 'Asistencias e incidencias'],
  '/recursos-humanos/expedientes': ['Recursos humanos', 'Expedientes'],
  '/recursos-humanos/prenomina': ['Recursos humanos', 'Prenómina'],
  '/reportes': ['Reportes', 'Inteligencia ejecutiva'],
  '/perfil': ['Cuenta', 'Mi perfil'],
  '/preferencias': ['Cuenta', 'Preferencias'],
  '/configuracion/actividad': ['Configuración', 'Centro de actividad'],
};

function handlePopoverEscape(event, isOpen, setOpen, triggerRef) {
  if (event.key !== 'Escape' || !isOpen) return;
  event.preventDefault();
  event.stopPropagation();
  setOpen(false);
  triggerRef.current?.focus();
}

export default function Topbar({
  mobileOpen,
  onOpenMobile,
  onOpenCommand,
  onOpenAI,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const {user, logout} = useAuth();
  const {resolvedTheme, toggleTheme} = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsTriggerRef = useRef(null);
  const profileTriggerRef = useRef(null);
  const notificationsWrapRef = useRef(null);
  const profileWrapRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [section, page] = pageNames[location.pathname] ?? ['Business OS', 'Área de trabajo'];

  // Dismiss transient menus on an outside pointer action without moving focus.
  useEffect(() => {
    if (!notificationsOpen && !profileOpen) return undefined;
    function handleOutsidePointer(event) {
      if (notificationsWrapRef.current?.contains(event.target)
        || profileWrapRef.current?.contains(event.target)) return;
      setNotificationsOpen(false);
      setProfileOpen(false);
    }
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [notificationsOpen, profileOpen]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await apiRequest('/activity/notifications');
      setNotifications(response.notifications || []);
      setUnread(response.unread || 0);
    } catch {
      // La barra superior no debe bloquear la navegación si falla el centro de actividad.
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60_000);
    const onFocus = () => loadNotifications();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadNotifications]);

  async function openNotification(item) {
    if (!item.read) {
      try {
        await apiRequest(`/activity/notifications/${item.id}/read`, {method: 'PATCH'});
      } catch { /* La lectura de notificaciones no debe bloquear la navegación. */ }
    }
    setNotificationsOpen(false);
    await loadNotifications();
    if (item.link) navigate(item.link);
  }

  useEffect(() => {
    function handleKey(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenCommand();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onOpenCommand]);

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.mobileMenu} onClick={onOpenMobile} aria-label="Abrir navegación" aria-expanded={mobileOpen} aria-controls="buzzbee-module-explorer">
          <Menu size={20} />
        </button>
        <div className={styles.breadcrumb}>
          <span>{section}</span>
          <strong>{page}</strong>
        </div>
      </div>

      <button className={styles.search} onClick={onOpenCommand}>
        <Search size={18} />
        <span className={styles.searchText}>Buscar en BuzzBee...</span>
        <kbd><Command size={11} /> K</kbd>
      </button>

      <div className={styles.actions}>
        <button className={styles.iconButton} onClick={onOpenAI} aria-label="Abrir Buzz AI">
          <Bot size={18} />
        </button>

        <button className={styles.iconButton} onClick={toggleTheme} aria-label={resolvedTheme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}>
          {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div ref={notificationsWrapRef} className={styles.popoverWrap} onKeyDown={(event) => handlePopoverEscape(event, notificationsOpen, setNotificationsOpen, notificationsTriggerRef)}>
          <button
            ref={notificationsTriggerRef}
            className={styles.iconButton}
            aria-label={unread ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
            aria-expanded={notificationsOpen}
            aria-controls={notificationsOpen ? 'buzzbee-notifications-popover' : undefined}
            onClick={() => {setProfileOpen(false); setNotificationsOpen((value) => !value); loadNotifications();}}
          >
            <Bell size={18} />
            {unread ? <span className={styles.notificationDot} /> : null}
          </button>
          {notificationsOpen ? (
            <div id="buzzbee-notifications-popover" className={`${styles.popover} ${styles.notificationPopover}`}>
              <header><strong>Notificaciones</strong><span>{unread ? `${unread} nueva${unread===1?'':'s'}` : 'Al día'}</span></header>
              {notifications.slice(0,4).map(item => (
                <button key={item.id} onClick={() => openNotification(item)}>
                  {!item.read ? <i /> : null}
                  {item.title}
                  <small>{item.message}</small>
                </button>
              ))}
              {!notifications.length ? <div className={styles.notificationEmpty}>No tienes notificaciones pendientes.</div> : null}
              <Link to="/configuracion/actividad" onClick={() => setNotificationsOpen(false)}>
                Ver centro de actividad
              </Link>
            </div>
          ) : null}
        </div>

        <div ref={profileWrapRef} className={styles.popoverWrap} onKeyDown={(event) => handlePopoverEscape(event, profileOpen, setProfileOpen, profileTriggerRef)}>
          <button ref={profileTriggerRef} className={styles.profile} aria-label={`Opciones de perfil de ${user?.fullName || 'Usuario'}`} aria-expanded={profileOpen} aria-controls={profileOpen ? 'buzzbee-profile-popover' : undefined} onClick={() => {setNotificationsOpen(false); setProfileOpen((value) => !value);}}>
            <span className={styles.avatar}>{`${user?.firstName?.[0] ?? 'U'}${user?.lastName?.[0] ?? ''}`}</span>
            <span className={styles.profileCopy}>
              <strong>{user?.fullName ?? 'Usuario'}</strong>
              <small>{user?.roles?.[0]?.name ?? 'Colaborador'}</small>
            </span>
            <ChevronDown size={15} />
          </button>
          {profileOpen ? (
            <div id="buzzbee-profile-popover" className={`${styles.popover} ${styles.profilePopover}`}>
              <button onClick={() => {setProfileOpen(false); navigate('/perfil');}}>Mi perfil</button>
              <button onClick={() => {setProfileOpen(false); navigate('/preferencias');}}>Preferencias</button>
              <button onClick={() => {setProfileOpen(false); navigate('/configuracion/actividad');}}>Actividad</button>
              <hr />
              <button onClick={async () => { setProfileOpen(false); await logout(); navigate('/login', {replace: true}); }}>
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
