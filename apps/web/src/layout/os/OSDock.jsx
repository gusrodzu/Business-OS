import {useEffect, useState} from 'react';
import {CalendarDays, Grid2X2, House} from 'lucide-react';
import {NavLink} from 'react-router-dom';
import {apiRequest} from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {navigationGroups} from '../../data/navigation';
import styles from './OSDock.module.css';

const LAUNCH_KEYS = ['ventas', 'inventario', 'pos'];
const NAV_APPS = navigationGroups.flatMap((group) => group.children)
  .filter((item) => LAUNCH_KEYS.includes(item.moduleKey));

export default function OSDock({onOpenApps}) {
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
  const launchers = NAV_APPS.filter((item) => {
    const enabled = current?.get(item.moduleKey);
    return enabled === undefined ? item.defaultVisible !== false : enabled !== false;
  });

  return (
    <nav className={styles.dock} data-business-os-dock="true" data-mobile-bottom-nav="true" aria-label="Dock de aplicaciones">
      <NavLink end to="/" className={({isActive}) => `${styles.item} ${isActive ? styles.active : ''}`} aria-label="Escritorio">
        <House size={23}/><span>Inicio</span>
      </NavLink>
      {launchers.map((item) => {
        const Icon = item.icon || Grid2X2;
        const to = item.moduleKey === 'inventario' ? '/inventario/existencias' : item.to || item.children?.[0]?.to || '/';
        return <NavLink key={item.moduleKey} to={to}
          className={({isActive}) => `${styles.item} ${isActive ? styles.active : ''}`}
          aria-label={`Abrir ${item.label}`}>
          <Icon size={22}/><span>{item.label}</span>
        </NavLink>;
      })}
      <NavLink to="/agenda" className={({isActive}) => `${styles.item} ${isActive ? styles.active : ''}`} aria-label="Abrir Agenda">
        <CalendarDays size={22}/><span>Agenda</span>
      </NavLink>
      <span className={styles.divider} aria-hidden="true"/>
      <button type="button" className={styles.item} aria-label="Ver todas las aplicaciones" onClick={onOpenApps}>
        <Grid2X2 size={22}/><span>Apps</span>
      </button>
    </nav>
  );
}
