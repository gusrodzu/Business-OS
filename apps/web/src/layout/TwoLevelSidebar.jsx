import {useEffect, useMemo, useRef, useState} from 'react';
import {
  ArrowLeft, Boxes, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Home,
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
    return Array.isArray(value) ? value.filter((row) =>
      row && typeof row.label === 'string' && typeof row.path === 'string'
      && row.path.startsWith('/') && !row.path.startsWith('//')) : [];
  } catch {
    return [];
  }
}

// Match common Spanish searches such as "facturacion" and "configuracion".
function normalizeSearch(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
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
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // Navigation must still work when storage is blocked or its quota is full.
  }
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
        end
        onNavigate={onNavigate}
      />
    ));
  }


export default function TwoLevelSidebar({collapsed, mobileOpen, onToggle, onCloseMobile}) {
  const {user} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const railNavRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileCloseRef = useRef(null);
  const drawerRef = useRef(null);
  const [moduleState, setModuleState] = useState(null);
  // Opening the off-canvas explorer moves keyboard/screen-reader focus inside
  // the drawer without opening the smartphone's virtual keyboard.
  useEffect(() => {
    if (mobileOpen) mobileCloseRef.current?.focus();
  }, [mobileOpen]);
  const [query, setQuery] = useState('');
  // A search is contextual to the current page. Reset it after route navigation
  // (including browser Back/Forward) so the new active module stays visible.
  useEffect(() => {
    setQuery('');
  }, [location.pathname]);
  const [railTip, setRailTip] = useState(null);
  const [favorites, setFavorites] = useState(() => readEntries(FAVORITES_KEY));
  const [recents, setRecents] = useState(() => readEntries(RECENTS_KEY));

  // Never render module entitlements fetched for a different company after switching workspaces.
  const companyScope = String(user?.companyId || user?.company?.id || 'none');
  const scopedModuleState = moduleState?.companyScope === companyScope ? moduleState.values : null;
  const companyName = user?.company?.name || 'Empresa Cliente';
  const initials = companyName.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase();

  useEffect(() => {
    let cancelled = false;
    // Focus and module-change events can overlap: only the newest request may
    // update visibility, even when responses arrive out of order.
    let latestRequest = 0;
    async function reload() {
      const requestId = ++latestRequest;
      try {
        const result = await apiRequest('/modules/dashboard');
        if (cancelled || requestId !== latestRequest) return;
        const state = new Map((result.companyModules || []).map((row) => [row.module?.key || row.moduleId, row.enabled]));
        setModuleState({companyScope, values: state});
      } catch {
        if (!cancelled && requestId === latestRequest) setModuleState(null);
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
  }, [companyScope]);

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
    function handleDrawerKeyDown(event) {
      if (event.key === 'Escape') {
        onCloseMobile?.();
        return;
      }
      if (event.key !== 'Tab') return;

      // Keep keyboard navigation inside the open off-canvas dialog.
      const drawer = drawerRef.current;
      const focusable = Array.from(drawer?.querySelectorAll(
        'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ) || []).filter((node) => node.getClientRects().length && window.getComputedStyle(node).visibility !== 'hidden');
      if (!focusable.length) {
        event.preventDefault();
        drawer?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const outside = !drawer?.contains(document.activeElement);
      if (event.shiftKey && (outside || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (outside || document.activeElement === last)) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', handleDrawerKeyDown);
    return () => window.removeEventListener('keydown', handleDrawerKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const visibleGroups = useMemo(() => navigationGroups.map((group) => ({
    ...group,
    children: group.children.filter((item) => {
      if (!isProfileVisible(item)) return false;
      if (!item.moduleKey) return true;
      if (scopedModuleState === null) return item.defaultVisible !== false;
      const enabled = scopedModuleState.get(item.moduleKey);
      return enabled === undefined ? item.defaultVisible !== false : enabled !== false;
    }),
  })).filter((group) => group.children.length), [scopedModuleState]);

  const modules = useMemo(() => visibleGroups.flatMap((group) => group.children), [visibleGroups]);
  const totalModuleCount = navigationGroups.reduce((total, group) => total + group.children.filter(isProfileVisible).length, 0);
  const moduleUsage = totalModuleCount ? Math.round((modules.length / totalModuleCount) * 100) : 0;
  // Hide saved shortcuts pointing to a disabled business module or a profile-only page.
  // Keep stored entries intact so shortcuts return when the module is re-enabled.
  const savedLinkVisible = (path) => {
    const configuredModule = navigationGroups
      .flatMap((group) => group.children)
      .find((item) => moduleMatches(path, item));
    if (configuredModule && !modules.some((item) => item.moduleKey === configuredModule.moduleKey)) return false;
    if (adminNavigation.some((item) => !isProfileVisible(item) && routeMatches(path, item.to))) return false;
    return true;
  };
  const visibleFavorites = favorites.filter((item) => savedLinkVisible(item.path));
  const visibleRecents = recents.filter((item) => savedLinkVisible(item.path));
  const adminItems = adminNavigation.filter((item) => isProfileVisible(item) && !item.secondaryConfig);
  const activeModule = modules.find((item) => moduleMatches(location.pathname, item))
    || adminItems.find((item) => moduleMatches(location.pathname, item))
    || modules[0];
  // Scope manual expansion to the current route so browser Back/Forward stays in sync.
  const [expansion, setExpansion] = useState(null);
  const currentExpanded = expansion?.path === location.pathname ? expansion.label : activeModule?.label;
  const normalizedQuery = normalizeSearch(query);
  const filteredAdminItems = normalizedQuery
    ? adminItems.filter((item) => normalizeSearch(item.label).includes(normalizedQuery))
    : adminItems;

  // Keep the selected module visible when navigation changes or the mobile drawer opens.
  useEffect(() => {
    const rail = railNavRef.current;
    const active = rail?.querySelector('[aria-current="page"]');
    if (!rail || !active) return;
    const viewport = rail.getBoundingClientRect();
    if (!viewport.height) return;
    const selected = active.getBoundingClientRect();
    if (selected.top < viewport.top) rail.scrollTop += selected.top - viewport.top;
    else if (selected.bottom > viewport.bottom) rail.scrollTop += selected.bottom - viewport.bottom;
  }, [location.pathname, mobileOpen, modules]);

  // Reference-style label next to the icon rail, visible on hover or keyboard focus.
  function showRailTip(event, label) {
    const rect = event.currentTarget.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    setRailTip({label, top: Math.max(30, Math.min(window.innerHeight - 30, center))});
  }

  // Arrow keys move focus within the icon rail; Enter/Space still activate a module.
  function handleRailKeyDown(event) {
    const {key} = event;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll('button:not(:disabled)'));
    if (!buttons.length) return;
    const current = buttons.indexOf(event.target);
    const last = buttons.length - 1;
    let next;
    if (key === 'Home') next = 0;
    else if (key === 'End') next = last;
    else if (key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % buttons.length;
    else next = current < 0 ? last : (current - 1 + buttons.length) % buttons.length;
    event.preventDefault();
    buttons[next].focus();
  }

  function activate(item) {
    const to = navigateTo(item);
    setRailTip(null);

    // In a mobile drawer, selecting a module with sections should expose its
    // nested links without dismissing the menu or navigating prematurely.
    if (mobileOpen && item.children?.length) {
      setExpansion({label: item.label, path: location.pathname});
      return;
    }

    setExpansion({label: item.label, path: to});
    if (collapsed && !mobileOpen) onToggle?.();
    if (to !== location.pathname) navigate(to);
    if (mobileOpen) onCloseMobile?.();
  }

  const filteredGroups = visibleGroups.map((group) => ({
    ...group,
    children: group.children.filter((item) => {
      if (!normalizedQuery) return true;
      return normalizeSearch(item.label).includes(normalizedQuery)
        || item.children?.some((child) => normalizeSearch(child.label).includes(normalizedQuery));
    }),
  })).filter((group) => group.children.length);
  const searchResultCount = filteredGroups.reduce((count, group) => count + group.children.length, 0) + filteredAdminItems.length;

  return (
    <aside
      ref={drawerRef}
      id="buzzbee-module-explorer"
      role={mobileOpen ? 'dialog' : undefined}
      aria-modal={mobileOpen ? 'true' : undefined}
      tabIndex={mobileOpen ? -1 : undefined}
      className={[styles.root, collapsed ? styles.collapsed : '', mobileOpen ? styles.mobileOpen : ''].filter(Boolean).join(' ')}
      aria-label="Navegación de dos niveles"
      data-two-level-navigation="true"
    >
      <div className={styles.rail}>
        <NavLink to="/" className={styles.brand} title="BuzzBee Business OS" onClick={onCloseMobile}>B</NavLink>
        <nav ref={railNavRef} className={styles.railNav} aria-label="Módulos principales" onKeyDown={handleRailKeyDown}>
          {visibleGroups.map((group) => (
            <div key={group.label} className={styles.railGroup} role="group" aria-label={group.label}>
              {group.children.map((item) => {
                const Icon = item.icon || Home;
                const active = moduleMatches(location.pathname, item);
                return (
                  <button
                    key={item.moduleKey || item.label}
                    type="button"
                    className={[styles.railButton, active ? styles.railActive : ''].filter(Boolean).join(' ')}
                    onMouseEnter={(event) => showRailTip(event, item.label)}
                    onMouseLeave={() => setRailTip(null)}
                    onFocus={(event) => showRailTip(event, item.label)}
                    onBlur={() => setRailTip(null)}
                    aria-label={'Abrir ' + item.label}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => activate(item)}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className={styles.railFooter}>
          <button type="button" className={styles.railButton} aria-label={collapsed ? 'Abrir explorador' : 'Ocultar explorador'} onMouseEnter={(event) => showRailTip(event, collapsed ? 'Abrir menú' : 'Contraer menú')} onMouseLeave={() => setRailTip(null)} onFocus={(event) => showRailTip(event, collapsed ? 'Abrir menú' : 'Contraer menú')} onBlur={() => setRailTip(null)} onClick={() => {setRailTip(null); onToggle?.();}}>
            {collapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}
          </button>
          <span className={styles.avatar} title={companyName}>{initials}</span>
        </div>
      </div>

      {railTip ? <span className={styles.railTip} role="tooltip" style={{top: railTip.top}}>{railTip.label}</span> : null}

      <div className={styles.context}>
        <div className={styles.contextHeader}>
          <NavLink to="/" className={styles.workspaceHome} title="Volver al inicio" onClick={onCloseMobile}>
            <ArrowLeft size={15} aria-hidden="true"/>
            <span>{activeModule?.label || 'Inicio'}</span>
          </NavLink>
          <button ref={mobileCloseRef} type="button" className={styles.mobileClose} onClick={onCloseMobile} aria-label="Cerrar menú"><X size={20}/></button>
          <button type="button" className={styles.desktopClose} onClick={onToggle} aria-label="Contraer explorador" title="Contraer explorador"><ChevronLeft size={17}/></button>
        </div>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true"/>
          <input
            ref={searchInputRef}
            aria-label="Buscar módulo"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              // First Escape clears a search; a second Escape can close the mobile drawer.
              if (event.key === 'Escape' && query) {
                event.preventDefault();
                event.stopPropagation();
                setQuery('');
              }
            }}
            placeholder="Buscar módulos..."
          />
          {query ? <button type="button" aria-label="Limpiar búsqueda" onClick={() => {setQuery(''); searchInputRef.current?.focus();}}><X size={14}/></button> : null}
        </label>
        <div className={styles.contextScroll}>
          <p className={styles.searchStatus} role="status" aria-live="polite" aria-atomic="true">
            {normalizedQuery ? `${searchResultCount} resultado${searchResultCount === 1 ? '' : 's'} de búsqueda` : ''}
          </p>
          {!normalizedQuery && visibleFavorites.length > 0 ? (
            <section className={styles.section}>
              <h3><Star size={13}/> Favoritos</h3>
              <LinkList entries={visibleFavorites} icon={Star} onNavigate={onCloseMobile}/>
            </section>
          ) : null}
          {!normalizedQuery && visibleRecents.length > 0 ? (
            <section className={styles.section}>
              <h3><Clock3 size={13}/> Recientes</h3>
              <LinkList entries={visibleRecents} icon={Clock3} onNavigate={onCloseMobile}/>
            </section>
          ) : null}
          <section className={styles.section}>
            <h3>Espacio de trabajo</h3>
            {filteredGroups.map((group) => (
              <div key={group.label} className={styles.group}>
                <span className={styles.groupTitle}>{group.label}</span>
                {group.children.map((item) => {
                  const Icon = item.icon || Home;
                  const isOpen = Boolean(normalizedQuery) || currentExpanded === item.label;
                  const isActive = moduleMatches(location.pathname, item);
                  return (
                    <div key={item.moduleKey || item.label}>
                      <button
                        type="button"
                        className={[styles.moduleButton, isActive ? styles.moduleActive : ''].filter(Boolean).join(' ')}
                        aria-expanded={item.children?.length ? isOpen : undefined}
                        onClick={() => {
                          if (item.children?.length && isActive && !normalizedQuery) {
                            setExpansion({label: isOpen ? '__none__' : item.label, path: location.pathname});
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
                        <div className={styles.tree} role="group" aria-label={'Secciones de ' + item.label}>
                          {item.children.filter((child) => !normalizedQuery
                            || normalizeSearch(item.label).includes(normalizedQuery)
                            || normalizeSearch(child.label).includes(normalizedQuery)).map((child, index) => (
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
            {!filteredGroups.length && !filteredAdminItems.length ? <p className={styles.empty}>No encontramos módulos con ese nombre.</p> : null}
          </section>
          {filteredAdminItems.length ? (
            <section className={styles.section}>
              <h3>Preferencias</h3>
              {filteredAdminItems.map((item) => (
                <AccessibleLink key={item.to} to={item.to} label={item.label} icon={item.icon || Settings2} className={styles.quickLink} onNavigate={onCloseMobile}/>
              ))}
            </section>
          ) : null}
        </div>
        <div className={styles.bottom}>
          <AccessibleLink to="/ayuda" label="Centro de ayuda" icon={CircleHelp} className={styles.quickLink} onNavigate={onCloseMobile}/>
          <div className={styles.capacity}>
            <div className={styles.capacityHeader}>
              <span><Boxes size={15} aria-hidden="true"/> Módulos visibles</span>
              <strong>{modules.length} / {totalModuleCount}</strong>
            </div>
            <div className={styles.capacityTrack} role="progressbar" aria-label="Módulos visibles" aria-valuemin={0} aria-valuemax={Math.max(1, totalModuleCount)} aria-valuenow={modules.length}>
              <span className={styles.capacityFill} style={{width: `${moduleUsage}%`}} />
            </div>
            <small title={companyName}>{companyName}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
