import {useEffect, useMemo, useState} from 'react';
import {Grid2X2, House, Search} from 'lucide-react';
import {NavLink} from 'react-router-dom';
import {apiRequest} from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {isProfileVisible, navigationGroups} from '../../data/navigation';
import styles from './WorkspaceOSDock.module.css';

const dockModules = ['ventas', 'inventario', 'pos', 'reportes'];
const moduleCatalog = navigationGroups.flatMap((group) => group.children);

export default function WorkspaceOSDock({onOpenCommand, onOpenApps}) {
  const {user} = useAuth();
  const companyScope = String(user?.companyId || user?.company?.id || 'none');
  const [scopeState, setScopeState] = useState(null);

  useEffect(() => {
    let active = true;
    const reload = async () => {
      try {
        const result = await apiRequest('/modules/dashboard');
        if (!active) return;
        setScopeState({
          scope: companyScope,
          enabled: new Map((result?.companyModules || []).map((row) => [
            row.module?.key || row.moduleId, row.enabled,
          ])),
        });
      } catch {
        if (active) setScopeState({scope: companyScope, enabled: null});
      }
    };
    reload();
    window.addEventListener('buzzbee:modules-changed', reload);
    return () => {
      active = false;
      window.removeEventListener('buzzbee:modules-changed', reload);
    };
  }, [companyScope]);

  const visible = useMemo(() => {
    if (scopeState?.scope !== companyScope || !scopeState.enabled) return [];
    return moduleCatalog.filter((item) =>
      dockModules.includes(item.moduleKey) && isProfileVisible(item)
      && (scopeState.enabled.get(item.moduleKey) === undefined
        ? item.defaultVisible !== false
        : scopeState.enabled.get(item.moduleKey) !== false)
      && (item.to || item.children?.[0]?.to),
    ).sort((a, b) => dockModules.indexOf(a.moduleKey) - dockModules.indexOf(b.moduleKey));
  }, [scopeState, companyScope]);

  return (
    <nav className={styles.dock} aria-label="Dock de Business OS">
      <NavLink end to="/" className={({isActive}) => `${styles.item} ${isActive ? styles.active : ''}`}
        aria-label="Ir al escritorio" title="Escritorio"><House size={23} aria-hidden="true"/></NavLink>
      {visible.map((item) => {
        const Icon = item.icon;
        const to = item.to || item.children[0].to;
        return (
          <NavLink key={item.moduleKey} to={to} title={item.label}
            aria-label={`Abrir ${item.label}`}
            className={({isActive}) => `${styles.item} ${isActive ? styles.active : ''}`}>
            <Icon size={23} aria-hidden="true"/>
          </NavLink>
        );
      })}
      <span className={styles.divider} aria-hidden="true"/>
      <button type="button" className={styles.item} title="Buscar" aria-label="Buscar en Business OS"
        onClick={onOpenCommand}><Search size={23} aria-hidden="true"/></button>
      <button type="button" className={styles.item} title="Ver todas las aplicaciones"
        aria-label="Ver todas las aplicaciones"
        onClick={onOpenApps}>
        <Grid2X2 size={23} aria-hidden="true"/>
      </button>
    </nav>
  );
}
