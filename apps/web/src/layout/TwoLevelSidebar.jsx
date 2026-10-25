import {useEffect, useMemo, useState} from 'react';
import {
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Home,
  PanelLeftClose, PanelLeftOpen, Search, Settings2, Star, X,
} from 'lucide-react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import {adminNavigation, isProfileVisible, navigationGroups} from '../data/navigation';
import {useAuth} from '../auth/AuthContext';
import {apiRequest} from '../api';
import styles from './TwoLevelSidebar.module.css';

const FAVORITES_KEY = 'buzzbee.ux.favorites';
const RECENTS_KEY = 'buzzbee.ux.recents';

function readEntries(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function navigateTo(item) {
  return item.to || item.children?.[0]?.to || '/';
}

function routeMatches(path, to) {
  if (!to) return false;
  return to === '/' ? path === '/' : path === to || path.startsWith(to + '/');
}

function moduleMatches(path, item) {
  return (item.children?.length ? item.children : [item]).some((child) => routeMatches(path, child.to));
}

function recordRecent(item) {
  if (!item?.path || item.path === '/') return;
  const next = [item, ...readEntries(RECENTS_KEY).filter((row) => row.path !== item.path)].slice(0, 5);
  window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('buzzbee:recents-changed', {detail: next}));
}

function AccessibleLink({to, label, icon: Icon, className, onNavigate, end = false}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({isActive}) => [className, isActive ? styles.current : ''].filter(Boolean).join(' ')}
      onClick={() => {
        recordRecent({label, path: to});
        onNavigate?.();
      }}
    >
      {Icon ? <Icon size={16} aria-hidden="true" /> : null}
      <span>{label}</span>
    </NavLink>
  );
}

function LinkList({entries, icon: Icon, onNavigate}) {
    return entries.map((item) => (
      <AccessibleLink
        key={item.path}
        to={item.path}
        label={item.label}
        icon={Icon}
        className={styles.quickLink}
        onNavigate={onNavigate}
      />
    ));
  }


export default function TwoLevelSidebar({collapsed, mobileOpen, onToggle, onCloseMobile}) {
  const {user} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [moduleState, setModuleState] = useState(null);
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState(() => readEntries(FAVORITES_KEY));
  const [recents, setRecents] = useState(() => readEntries(RECENTS_KEY));

  const companyName = user?.company?.name || 'Empresa Cliente';
  const initials = companyName.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase();

  useEffect(() => {
    let cancelled = false;
    async function reload() {
      try {
        const result = await apiRequest('/modules/dashboard');
        if (cancelled) return;
        const state = new Map((result.companyModules || []).map((row) => [row.module?.key || row.moduleId, row.enabled]));
        setModuleState(state);
      } catch {
        if (!cancelled) setModuleState(null);
      }
    }
    reload();
    window.addEventListener('buzzbee:modules-changed', reload);
    window.addEventListener('focus', reload);
    return () => {
      cancelled = true;
      window.removeEventListener('buzzbee:modules-changed', reload);
      window.removeEventListener('focus', reload);
    };
  }, [user?.companyId, user?.company?.id]);

  useEffect(() => {
    const sync = () => {
      setFavorites(readEntries(FAVORITES_KEY));
      setRecents(readEntries(RECENTS_KEY));
    };
    window.addEventListener('buzzbee:favorites-changed', sync);
    window.addEventListener('buzzbee:recents-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('buzzbee:favorites-changed', sync);
      window.removeEventListener('buzzbee:recents-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    function escapeKey(event) {
      if (event.key === 'Escape') onCloseMobile?.();
    }
    window.addEventListener('keydown', escapeKey);
    return () => window.removeEventListener('keydown', escapeKey);
  }, [mobileOpen, onCloseMobile]);

  const visibleGroups = useMemo(() => navigationGroups.map((group) => ({
    ...group,
    children: group.children.filter((item) => {
      if (!isProfileVisible(item)) return false;
      if (!item.moduleKey) return true;
      if (moduleState === null) return item.defaultVisible !== false;
      const enabled = moduleState.get(item.moduleKey);
      return enabled === undefined ? item.defaultVisible !== false : enabled !== false;
    }),
  })).filter((group) => group.children.length), [moduleState]);

  const modules = useMemo(() => visibleGroups.flatMap((group) => group.children), [visibleGroups]);
  const adminItems = adminNavigation.filter((item) => isProfileVisible(item) && !item.secondaryConfig);
  const activeModule = modules.find((item) => moduleMatches(location.pathname, item))
    || adminItems.find((item) => moduleMatches(location.pathname, item))
    || modules[0];
  const [expanded, setExpanded] = useState(null);
  const currentExpanded = expanded || activeModule?.label;
  const normalizedQuery = query.trim().toLocaleLowerCase('es');

  function activate(item) {
    setExpanded(item.label);
    const to = navigateTo(item);
    if (to !== location.pathname) navigate(to);
    if (mobileOpen) onCloseMobile?.();
  }

  const filteredGroups = visibleGroups.map((group) => ({
    ...group,
    children: group.children.filter((item) => {
      if (!normalizedQuery) return true;
      return item.label.toLocaleLowerCase('es').includes(normalizedQuery)
        || item.children?.some((child) => child.label.toLocaleLowerCase('es').includes(normalizedQuery));
    }),
  })).filter((group) => group.children.length);


  return (
    <aside
      className={[styles.root, collapsed ? styles.collapsed : '', mobileOpen ? styles.mobileOpen : ''].filter(Boolean).join(' ')}
      aria-label="Navegación de dos niveles"
      data-two-level-navigation="true"
    >
      <div className={styles.rail}>
        <NavLink to="/" className={styles.brand} title="BuzzBee Business OS" onClick={onCloseMobile}>B</NavLink>
        <nav className={styles.railNav} aria-label="Módulos principales">
          {modules.map((item) => {
            const Icon = item.icon || Home;
            const active = moduleMatches(location.pathname, item);
            return (
              <button
                key={item.moduleKey || item.label}
                type="button"
                title={item.label}
                className={[styles.railButton, active ? styles.railActive : ''].filter(Boolean).join(' ')}
                aria-label={'Abrir ' + item.label}
                aria-current={active ? 'page' : undefined}
                onClick={() => activate(item)}
              >
                <Icon size={20} aria-hidden="true" />
              </button>
            );
          })}
        </nav>
        <div className={styles.railFooter}>
          <button type="button" className={styles.railButton} title={collapsed ? 'Abrir explorador' : 'Ocultar explorador'} aria-label={collapsed ? 'Abrir explorador' : 'Ocultar explorador'} onClick={onToggle}>
            {collapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}
          </button>
          <span className={styles.avatar} title={companyName}>{initials}</span>
        </div>
      </div>

      <div className={styles.context}>
        <div className={styles.contextHeader}>
          <div className={styles.brandText}><strong>Buzz<span>Bee</span></strong><small>Business OS</small></div>
          <button type="button" className={styles.mobileClose} onClick={onCloseMobile} aria-label="Cerrar menú"><X size={20}/></button>
          <button type="button" className={styles.desktopClose} onClick={onToggle} aria-label="Contraer explorador" title="Contraer explorador"><ChevronLeft size={17}/></button>
        </div>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true"/>
          <input aria-label="Buscar módulo" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar módulos..." />
          {query ? <button type="button" aria-label="Limpiar búsqueda" onClick={() => setQuery('')}><X size={14}/></button> : null}
        </label>
        <div className={styles.contextScroll}>
          {!normalizedQuery && favorites.length > 0 ? (
            <section className={styles.section}>
              <h3><Star size={13}/> Favoritos</h3>
              <LinkList entries={favorites} icon={Star} onNavigate={onCloseMobile}/>
            </section>
          ) : null}
          {!normalizedQuery && recents.length > 0 ? (
            <section className={styles.section}>
              <h3><Clock3 size={13}/> Recientes</h3>
              <LinkList entries={recents} icon={Clock3} onNavigate={onCloseMobile}/>
            </section>
          ) : null}
          <section className={styles.section}>
            <h3>Espacio de trabajo</h3>
            {filteredGroups.map((group) => (
              <div key={group.label} className={styles.group}>
                <span className={styles.groupTitle}>{group.label}</span>
                {group.children.map((item) => {
                  const Icon = item.icon || Home;
                  const isOpen = normalizedQuery || currentExpanded === item.label;
                  const isActive = moduleMatches(location.pathname, item);
                  return (
                    <div key={item.moduleKey || item.label}>
                      <button
                        type="button"
                        className={[styles.moduleButton, isActive ? styles.moduleActive : ''].filter(Boolean).join(' ')}
                        aria-expanded={Boolean(item.children?.length) ? Boolean(isOpen) : undefined}
                        onClick={() => {
                          if (item.children?.length && isActive && !normalizedQuery) {
                            setExpanded(isOpen ? '__none__' : item.label);
                          } else {
                            activate(item);
                          }
                        }}
                      >
                        <Icon size={16} aria-hidden="true"/>
                        <span>{item.label}</span>
                        {item.children?.length ? (isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>) : null}
                      </button>
                      {item.children?.length && isOpen ? (
                        <div className={styles.tree} aria-label={'Secciones de ' + item.label}>
                          {item.children.filter((child) => !normalizedQuery
                            || item.label.toLocaleLowerCase('es').includes(normalizedQuery)
                            || child.label.toLocaleLowerCase('es').includes(normalizedQuery)).map((child, index) => (
                            <AccessibleLink
                              key={child.to}
                              to={child.to}
                              label={child.label}
                              end={index === 0}
                              className={styles.treeLink}
                              onNavigate={onCloseMobile}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
            {!filteredGroups.length ? <p className={styles.empty}>No encontramos módulos con ese nombre.</p> : null}
          </section>
          <section className={styles.section}>
            <h3>Preferencias</h3>
            {adminItems.map((item) => (
              <AccessibleLink key={item.to} to={item.to} label={item.label} icon={item.icon || Settings2} className={styles.quickLink} onNavigate={onCloseMobile}/>
            ))}
          </section>
        </div>
        <div className={styles.bottom}>
          <AccessibleLink to="/ayuda" label="Centro de ayuda" icon={CircleHelp} className={styles.quickLink} onNavigate={onCloseMobile}/>
          <small title={companyName}>{companyName}</small>
        </div>
      </div>
    </aside>
  );
}
