import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Bell,
  Bot,
  ChevronDown,
  Command,
  Menu,
  Layers3,
  Moon,
  Search,
  Sun,
  X, CheckCheck, RefreshCw,
} from 'lucide-react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {apiRequest} from '../api';
import {useAuth} from '../auth/AuthContext';
import {useTheme} from '../framework/ThemeContext';
import styles from './Topbar.module.css';
import WorkspaceMenuBar from './workspace-os/WorkspaceMenuBar';

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
  onOpenApps,
  activeOSApp = null,
  onMinimizeOSWindow,
  onMaximizeOSWindow,
  onCloseOSWindow,
  osMode = false,
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
  const [notificationFilter,setNotificationFilter]=useState('all');
  const [notificationError,setNotificationError]=useState('');
  const [notificationBusy,setNotificationBusy]=useState(false);
  const notificationScope=String(user?.companyId||user?.company?.id||'')+':'+String(user?.id||'');
  const scopeRef=useRef(notificationScope);
  useLayoutEffect(()=>{scopeRef.current=notificationScope;},[notificationScope]);
  const [section, page] = pageNames[location.pathname] ?? ['Business OS', 'Área de trabajo'];
  const mobileHomeSearch = location.pathname === '/';

  // Route changes, including browser Back/Forward, must dismiss transient menus.
  // This does not change focus or affect the navigation destination.
  useEffect(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [location.key]);

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
    const scope=notificationScope;
    try {
      const response = await apiRequest('/activity/notifications');
      if(scopeRef.current!==scope)return;
      setNotifications(Array.isArray(response.notifications)?response.notifications:[]);
      setUnread(Number(response.unread)||0);setNotificationError('');
    } catch {
      if(scopeRef.current===scope)setNotificationError('No fue posible actualizar las notificaciones.');
    }
  }, [notificationScope]);

  useEffect(() => {
    setNotifications([]);setUnread(0);setNotificationError('');
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
    if (typeof item.link==='string' && item.link.startsWith('/') && !item.link.startsWith('//')) navigate(item.link);
  }

  async function markVisibleRead(){
    if(notificationBusy)return;
    setNotificationBusy(true);const scope=notificationScope;
    const results=await Promise.allSettled(notifications.filter(item=>!item.read).map(item=>apiRequest(`/activity/notifications/${encodeURIComponent(item.id)}/read`,{method:'PATCH'})));
    if(scopeRef.current===scope){await loadNotifications();if(results.some(result=>result.status==='rejected'))setNotificationError('Algunas notificaciones no pudieron marcarse como leídas.');}
    setNotificationBusy(false);
  }
  useEffect(()=>{if(location.pathname==='/notificaciones'){navigate('/',{replace:true,state:{openNotificationCenter:true}});return;}if(location.state?.openNotificationCenter){setNotificationsOpen(true);loadNotifications();}},[location.key,location.pathname,location.state,navigate,loadNotifications]);
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
    <header data-business-os-topbar="true" className={`${styles.topbar} ${osMode ? styles.osTopbar : ''}`} data-mobile-home={mobileHomeSearch ? 'true' : 'false'}>
      <div className={styles.left}>
        <button className={styles.mobileMenu} onClick={onOpenMobile} aria-label="Abrir navegación" aria-expanded={mobileOpen} aria-controls="buzzbee-module-explorer">
          <Menu size={20} />
        </button>
        {osMode ? <div className={styles.osMenuDesktop}><WorkspaceMenuBar
          section={activeOSApp?.title || section} page={activeOSApp?.subtitle || page}
          activeApp={activeOSApp}
          onOpenCommand={onOpenCommand} onOpenAI={onOpenAI}
          onOpenApps={onOpenApps}
          onMinimizeWindow={onMinimizeOSWindow}
          onMaximizeWindow={onMaximizeOSWindow}
          onCloseWindow={onCloseOSWindow}
          toggleTheme={toggleTheme} resolvedTheme={resolvedTheme}/></div> : null}
        {osMode ? <Link className={styles.osBrand} to="/"><Layers3 size={20} aria-hidden="true"/> <span>Business OS</span></Link> : null}
        <div className={styles.breadcrumb}>
          <span>{section}</span>
          <strong>{osMode ? (user?.company?.name || page) : page}</strong>
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
        {!mobileHomeSearch ? (
          <button type="button" className={styles.mobileSearch} onClick={onOpenCommand}
            aria-label="Buscar en Business OS" aria-haspopup="dialog" title="Buscar aplicaciones y acciones">
            <Search size={20} aria-hidden="true"/>
          </button>
        ) : null}

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
            {unread ? <span className={styles.notificationCount} aria-hidden="true">{unread>99?'99+':unread}</span> : null}
          </button>
          {notificationsOpen ? (
            <section id="buzzbee-notifications-popover" className={`${styles.popover} ${styles.notificationPopover} ${styles.notificationCenter}`} aria-label="Centro de notificaciones">
              <header className={styles.centerHeader}><div><strong>Notificaciones</strong><small>{unread? `${unread} sin leer`:'Todo al día'}</small></div><button type="button" className={styles.centerIcon} aria-label="Cerrar centro de notificaciones" onClick={()=>{setNotificationsOpen(false);notificationsTriggerRef.current?.focus();}}><X size={20}/></button></header>
              <div className={styles.centerTools}><button type="button" aria-pressed={notificationFilter==='all'} onClick={()=>setNotificationFilter('all')}>Todas</button><button type="button" aria-pressed={notificationFilter==='unread'} onClick={()=>setNotificationFilter('unread')}>Sin leer</button><button type="button" className={styles.centerIcon} aria-label="Actualizar notificaciones" onClick={loadNotifications}><RefreshCw size={17}/></button></div>
              {notificationError?<p role="alert" className={styles.centerError}>{notificationError}</p>:null}
              <div className={styles.centerList}>
                {notifications.filter(item=>notificationFilter==='all'||!item.read).map(item=><button type="button" key={item.id} className={styles.centerItem} data-unread={!item.read} onClick={()=>openNotification(item)}><Bell size={17} aria-hidden="true"/><span><strong>{item.title||'Notificación'}</strong><small>{item.message}</small></span>{!item.read?<i aria-hidden="true"/>:null}</button>)}
                {!notifications.some(item=>notificationFilter==='all'||!item.read)?<div className={styles.notificationEmpty}>No hay notificaciones en esta vista.</div>:null}
              </div>
              <footer className={styles.centerFooter}><button type="button" disabled={notificationBusy||!notifications.some(item=>!item.read)} onClick={markVisibleRead}><CheckCheck size={16}/> Marcar avisos como leídos</button><Link to="/configuracion/actividad" onClick={()=>setNotificationsOpen(false)}>Actividad</Link></footer>
            </section>
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
      {mobileHomeSearch ? (
        <button type="button" className={styles.mobileHomeSearch} onClick={onOpenCommand}
          aria-label="Buscar en Business OS" aria-haspopup="dialog">
          <Search size={19} aria-hidden="true"/>
          <span>Buscar aplicaciones y acciones</span>
        </button>
      ) : null}
    </header>
  );
}
