import {useEffect, useState} from 'react';
import {Bot, CalendarDays, Grid2X2, House, Search} from 'lucide-react';
import {NavLink} from 'react-router-dom';
import {apiRequest} from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {navigationGroups} from '../../data/navigation';
import {resolveOSApplication} from './resolveOSApplication';
import styles from './OSDock.module.css';

const LAUNCH_KEYS = ['ventas', 'compras', 'inventario', 'pos'];
const NAV_APPS = navigationGroups.flatMap((group) => group.children)
  .filter((item) => LAUNCH_KEYS.includes(item.moduleKey));

export default function OSDock({onOpenApps, onOpenCommand, onOpenAI,
  runningWindows=[],activeWindowKey=null,onActivateWindow}) {
  const {user} = useAuth();
  const companyScope = String(user?.companyId || user?.company?.id || 'none');
  const [moduleState, setModuleState] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let lastRequest = 0;
    async function reload() {
      const request = ++lastRequest;
      try {
        const response = await apiRequest('/modules/dashboard');
        if (cancelled || request !== lastRequest) return;
        setModuleState({
          companyScope,
          enabled: new Map((response?.companyModules || []).map((row) => [row.module?.key || row.moduleId, row.enabled])),
        });
      } catch {
        if (!cancelled && request === lastRequest) setModuleState(null);
      }
    }
    reload();
    window.addEventListener('buzzbee:modules-changed', reload);
    return () => {cancelled = true;window.removeEventListener('buzzbee:modules-changed', reload);};
  }, [companyScope]);

  const current = moduleState?.companyScope === companyScope ? moduleState.enabled : null;
  const running=runningWindows.map(window=>({...window,app:resolveOSApplication(window.path)}));
  const launchers = NAV_APPS.filter((item) => {
    const enabled = current?.get(item.moduleKey);
    return enabled === undefined ? item.defaultVisible !== false : enabled !== false;
  });

  return (
    <>
    <nav className={styles.dock} data-business-os-dock="true" data-mobile-bottom-nav="true" aria-label="Dock de aplicaciones">
      <NavLink end to="/" className={({isActive}) => `${styles.item} ${isActive ? styles.active : ''}`} aria-label="Escritorio">
        <House size={23}/><span>Inicio</span>
      </NavLink>
      {launchers.map((item) => {
        const Icon = item.icon || Grid2X2;
        const to = item.moduleKey === 'inventario' ? '/inventario/existencias'
          : item.moduleKey === 'compras' ? '/compras/solicitudes'
            : item.to || item.children?.[0]?.to || '/';
        const appKey={ventas:'sales',compras:'procurement',inventario:'inventory',pos:'pos'}[item.moduleKey];
        return <NavLink key={item.moduleKey} to={to}
          onClick={event=>{if(running.some(row=>row.key===appKey)){event.preventDefault();onActivateWindow?.(appKey);}}}
          className={({isActive}) => `${styles.item} ${isActive ? styles.active : ''}`}
          aria-label={`Abrir ${item.label}`}>
          <Icon size={22}/><span>{item.label}</span>
        </NavLink>;
      })}
      <NavLink to="/agenda" className={({isActive}) => `${styles.item} ${isActive ? styles.active : ''}`} aria-label="Abrir Agenda">
        <CalendarDays size={22}/><span>Agenda</span>
      </NavLink>
      {running.length ? <>
        <span className={styles.divider} aria-hidden="true"/>
        <div className={styles.runningShelf} role="group" aria-label="Ventanas abiertas">
          {running.map(window=>{
            const Icon=window.app?.Icon||Grid2X2;
            return <button key={window.key} type="button"
              className={`${styles.item} ${styles.runningItem} ${activeWindowKey===window.key&&!window.minimized?styles.active:''}`}
              aria-label={`${window.minimized?'Restaurar':'Activar'} ventana ${window.app?.title||window.key}`}
              aria-pressed={activeWindowKey===window.key&&!window.minimized}
              title={window.app?.title||window.key}
              onClick={()=>onActivateWindow?.(window.key)}>
              <Icon size={21} aria-hidden="true"/>
              <span>{window.app?.title||window.key}</span>
              <span className={styles.runningDot} aria-hidden="true"/>
            </button>;
          })}
        </div>
      </> : null}
      <span className={styles.divider} aria-hidden="true"/>
      <button type="button" className={styles.item} aria-label="Ver todas las aplicaciones" onClick={onOpenApps}>
        <Grid2X2 size={22}/><span>Apps</span>
      </button>
    </nav>
    <nav className={styles.mobileDock} aria-label="Dock de Pocket OS" data-mobile-bottom-nav="true">
      <NavLink end to="/" aria-label="Ir al escritorio de Pocket OS"
        className={({isActive}) => `${styles.mobileDockItem} ${isActive ? styles.mobileDockActive : ''}`}>
        <House size={23} aria-hidden="true"/><span>Inicio</span>
      </NavLink>
      <button type="button" className={styles.mobileDockItem}
        aria-label="Abrir todas las aplicaciones" aria-haspopup="dialog" aria-controls="workspace-os-app-drawer"
        onClick={onOpenApps}><Grid2X2 size={23} aria-hidden="true"/><span>Apps</span></button>
      <button type="button" className={styles.mobileDockItem}
        aria-label="Buscar aplicaciones y acciones" onClick={onOpenCommand}>
        <Search size={23} aria-hidden="true"/><span>Buscar</span>
      </button>
      <button type="button" className={styles.mobileDockItem}
        aria-label="Abrir asistente empresarial" onClick={onOpenAI}>
        <Bot size={23} aria-hidden="true"/><span>Asistente</span>
      </button>
    </nav>
    </>
  );
}
