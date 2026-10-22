import {useEffect, useMemo, useState} from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LifeBuoy,
  Star,
  X,
} from 'lucide-react';
import {NavLink, useLocation} from 'react-router-dom';
import {adminNavigation, isProfileVisible, navigationGroups} from '../data/navigation';
import styles from './Sidebar.module.css';
import {useAuth} from '../auth/AuthContext';
import {apiRequest} from '../api';

const RECENTS_KEY = 'buzzbee.ux.recents';
const FAVORITES_KEY = 'buzzbee.ux.favorites';

function readStored(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function rememberRecent(item) {
  if (!item?.to || item.to === '/') return;
  const current = readStored(RECENTS_KEY).filter((entry) => entry.path !== item.to);
  const next = [{label:item.label, path:item.to}, ...current].slice(0, 5);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('buzzbee:recents-changed', {detail:next}));
}

export default function Sidebar({collapsed, mobileOpen, onToggle, onCloseMobile}) {
  const {user} = useAuth();
  const [moduleState, setModuleState] = useState(null);
  const [favorites, setFavorites] = useState(() => readStored(FAVORITES_KEY));
  const [recents, setRecents] = useState(() => readStored(RECENTS_KEY));
  const companyName = user?.company?.name ?? 'Empresa Cliente';
  const initials = companyName.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase();

  useEffect(() => {
    const onFavorites = () => setFavorites(readStored(FAVORITES_KEY));
    const onRecents = () => setRecents(readStored(RECENTS_KEY));
    window.addEventListener('buzzbee:favorites-changed', onFavorites);
    window.addEventListener('buzzbee:recents-changed', onRecents);
    window.addEventListener('storage', onFavorites);
    return () => {
      window.removeEventListener('buzzbee:favorites-changed', onFavorites);
      window.removeEventListener('buzzbee:recents-changed', onRecents);
      window.removeEventListener('storage', onFavorites);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadModules() {
      try {
        const response = await apiRequest('/modules/dashboard');
        if (cancelled) return;

        const states = new Map(
          (response.companyModules ?? []).map((row) => [row.module?.key ?? row.moduleId, row.enabled]),
        );

        // CompanyModule includes the Module object. Store the authoritative key.
        (response.companyModules ?? []).forEach((row) => {
          if (row.module?.key) states.set(row.module.key, row.enabled);
        });

        setModuleState(states);
      } catch {
        // Backward-compatible fallback: if the user cannot read module configuration,
        // preserve the complete menu instead of blocking navigation.
        if (!cancelled) setModuleState(null);
      }
    }

    loadModules();
    const refreshModules = () => loadModules();
    window.addEventListener('buzzbee:modules-changed', refreshModules);
    window.addEventListener('focus', refreshModules);
    return () => {
      cancelled = true;
      window.removeEventListener('buzzbee:modules-changed', refreshModules);
      window.removeEventListener('focus', refreshModules);
    };
  }, [user?.companyId, user?.company?.id]);

  const visibleGroups = useMemo(() => {
    return navigationGroups
      .map((group) => ({
        ...group,
        children: group.children.filter((item) => {
          if (!isProfileVisible(item)) return false;
          if (!item.moduleKey) return true;
          if (!moduleState) return item.defaultVisible !== false;
          const configured = moduleState.get(item.moduleKey);
          if (configured === undefined) return item.defaultVisible !== false;
          return configured !== false;
        }),
      }))
      .filter((group) => group.children.length > 0);
  }, [moduleState]);

  const [openGroups, setOpenGroups] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('buzzbee.sidebar.groups') || '[]');
      return new Set(saved.length ? saved : ['Inicio']);
    } catch {
      return new Set(['Inicio']);
    }
  });

  const toggleGroup = (label) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      next.has(label) ? next.delete(label) : next.add(label);
      localStorage.setItem('buzzbee.sidebar.groups', JSON.stringify([...next]));
      return next;
    });
  };
  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${
        mobileOpen ? styles.mobileOpen : ''
      }`}
    >
      <div className={styles.brandRow}>
        <NavLink className={styles.brand} to="/" onClick={onCloseMobile}>
          <span className={styles.brandMark} aria-hidden="true">B</span>
          <span className={styles.brandCopy}>
            <strong>Buzz<span className={styles.brandAccent}>Bee</span></strong>
            <small>Business OS</small>
          </span>
        </NavLink>
        <button className={styles.mobileClose} onClick={onCloseMobile} aria-label="Cerrar menú">
          <X size={20} />
        </button>
      </div>

      <div className={styles.companyCard}>
        <span>{initials}</span>
        <div>
          <strong>{companyName}</strong>
          <small>Espacio de trabajo</small>
        </div>
        <ChevronDown size={16} />
      </div>

      <nav className={styles.navigation} aria-label="Navegación principal">
        {visibleGroups.map((group) => (
          <div className={styles.osSection} key={group.label}>
            <span className={styles.sectionLabel}>{group.label}</span>
            {group.children.map((item) => (
              <NavigationItem key={`${group.label}-${item.label}`} item={item} collapsed={collapsed} onNavigate={onCloseMobile}/>
            ))}
          </div>
        ))}

        <div className={styles.osSection}>
          <span className={styles.sectionLabel}>Configuración</span>
          {adminNavigation.filter((item) => isProfileVisible(item) && !item.secondaryConfig).map((item) => (
            <NavigationItem key={item.label} item={item} collapsed={collapsed} onNavigate={onCloseMobile}/>
          ))}
        </div>
      </nav>

      <div className={styles.footer}>
        <NavLink className={styles.help} to="/ayuda" onClick={onCloseMobile}>
          <LifeBuoy size={19} />
          <span>Centro de ayuda</span>
        </NavLink>
        <button type="button" className={styles.collapseButton} onClick={onToggle} aria-label={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"} title={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span>Contraer menú</span>
        </button>
      </div>
    </aside>
  );
}

function BusinessGroup({group, collapsed, open, onToggle, onNavigate}) {
  const location = useLocation();
  const Icon = group.icon;
  const active = group.children.some((item) => {
    if (!item.to) return item.children?.some((child) => location.pathname === child.to);
    return item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
  });

  return (
    <div className={styles.businessGroup}>
      <button
        className={`${styles.businessGroupButton} ${active ? styles.businessGroupActive : ''}`}
        onClick={onToggle}
        title={collapsed ? group.label : undefined}
        aria-expanded={open}
      >
        <Icon size={19}/>
        <span>{group.label}</span>
        {!collapsed ? <ChevronDown className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} size={16}/> : null}
      </button>
      {!collapsed && open ? (
        <div className={styles.businessChildren}>
          {group.children.map((item) => (
            <NavigationItem key={item.label} item={item} collapsed={false} onNavigate={onNavigate}/>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavigationItem({item, collapsed, onNavigate}) {
  const location = useLocation();
  const Icon = item.icon;
  const target = item.to || item.children?.[0]?.to || '/';

  const active = item.children?.length
    ? item.children.some((child) =>
        child.to === '/'
          ? location.pathname === '/'
          : location.pathname === child.to || location.pathname.startsWith(`${child.to}/`),
      )
    : target === '/'
      ? location.pathname === '/'
      : location.pathname === target || location.pathname.startsWith(`${target}/`);

  return (
    <NavLink
      to={target}
      onClick={() => { rememberRecent({label:item.label, to:target}); onNavigate?.(); }}
      title={collapsed ? item.label : undefined}
      className={`${styles.navItem} ${active ? styles.active : ''}`}
    >
      <Icon size={19} />
      <span>{item.label}</span>
    </NavLink>
  );
}
