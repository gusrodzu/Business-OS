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
    // Preserve the first saved shortcut for each route without mutating storage.
    // Duplicate paths would otherwise create repeated links and React keys.
    const seenPaths = new Set();
    return Array.isArray(value) ? value.filter((row) => {
      if (!row || typeof row.label !== 'string' || typeof row.path !== 'string'
        || !row.path.startsWith('/') || row.path.startsWith('//')
        || seenPaths.has(row.path)) return false;
      seenPaths.add(row.path);
      return true;
    }) : [];
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
  const railTipTargetRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileCloseRef = useRef(null);
  const drawerRef = useRef(null);
  const contextScrollRef = useRef(null);
  const pendingExplorerFocusRef = useRef(false);
  const [moduleState, setModuleState] = useState(null);
  const [moduleSelection, setModuleSelection] = useState(null);
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
    // Direct links, browser history and in-app navigation follow the route's module.
    setModuleSelection(null);
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
        // A different dialog may have taken focus; only dismiss this drawer
        // when Escape comes from its own keyboard context.
        if (!drawerRef.current?.contains(document.activeElement)) return;
        onCloseMobile?.();
        return;
      }
      if (event.key !== 'Tab') return;

      // Another dialog or overlay may own focus while the explorer remains open.
      // Never steal its Tab/Shift+Tab navigation.
      const drawer = drawerRef.current;
      if (!drawer?.contains(document.activeElement)) return;
      const focusable = Array.from(drawer.querySelectorAll(
        'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ) || []).filter((node) => node.getClientRects().length && window.getComputedStyle(node).visibility !== 'hidden');
      if (!focusable.length) {
        event.preventDefault();
        drawer?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
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
  const routeModule = modules.find((item) => moduleMatches(location.pathname, item));
  // The rail selects one module's menu without changing the active page.
  // The full explorer is available only when explicitly requested.
  const focusedModule = moduleSelection === '__all__'
    ? null
    : modules.find((item) => item.moduleKey === moduleSelection)
      || (moduleSelection ? null : routeModule);
  // A full-explorer module button unmounts when its contextual options open.
  // Move keyboard focus into the new options instead of dropping it to <body>.
  // Rail activation deliberately keeps focus on the rail button.
  useEffect(() => {
    if (!pendingExplorerFocusRef.current || !focusedModule) return;
    pendingExplorerFocusRef.current = false;
    const firstOption = contextScrollRef.current?.querySelector('#buzzbee-focused-module nav a[href]');
    (firstOption || drawerRef.current?.querySelector('button[aria-label="Ver todos los módulos"]'))?.focus();
  }, [focusedModule]);

  const normalizedQuery = normalizeSearch(query);
  const focusedEntries = focusedModule
    ? (focusedModule.children?.length
      ? focusedModule.children
      : [{label: focusedModule.label, to: navigateTo(focusedModule)}])
      .filter((child) => !normalizedQuery
        || normalizeSearch(focusedModule.label).includes(normalizedQuery)
        || normalizeSearch(child.label).includes(normalizedQuery))
    : [];
  const filteredAdminItems = normalizedQuery
    ? adminItems.filter((item) => normalizeSearch(item.label).includes(normalizedQuery))
    : adminItems;

  // Keep the selected module visible when navigation changes or the mobile drawer opens.
  useEffect(() => {
    const rail = railNavRef.current;
    const active = rail?.querySelector('button[aria-current="location"]');
    if (!rail || !active) return;
    const viewport = rail.getBoundingClientRect();
    if (!viewport.height) return;
    const selected = active.getBoundingClientRect();
    if (selected.top < viewport.top) rail.scrollTop += selected.top - viewport.top;
    else if (selected.bottom > viewport.bottom) rail.scrollTop += selected.bottom - viewport.bottom;
  }, [location.pathname, mobileOpen, modules]);

  // Keep the floating label aligned after keyboard focus scrolls the rail.
  function positionRailTip(target, label) {
    const rect = target.getBoundingClientRect();
    const rail = railNavRef.current;
    if (rail?.contains(target)) {
      const viewport = rail.getBoundingClientRect();
      if (rect.bottom <= viewport.top || rect.top >= viewport.bottom) {
        setRailTip(null);
        return;
      }
    }
    const center = rect.top + rect.height / 2;
    setRailTip({label, top: Math.max(30, Math.min(window.innerHeight - 30, center))});
  }

  function showRailTip(event, label) {
    const target = event.currentTarget;
    railTipTargetRef.current = {target, label};
    positionRailTip(target, label);
    // Focus may trigger native scrolling after the focus event.
    requestAnimationFrame(() => {
      if (railTipTargetRef.current?.target === target) positionRailTip(target, label);
    });
  }

  function hideRailTip(event) {
    if (railTipTargetRef.current?.target !== event.currentTarget) return;
    railTipTargetRef.current = null;
    setRailTip(null);
  }

  function handleRailScroll() {
    const current = railTipTargetRef.current;
    if (!current) return;
    requestAnimationFrame(() => {
      if (railTipTargetRef.current?.target === current.target) {
        positionRailTip(current.target, current.label);
      }
    });
  }

  // Arrow keys move focus within the icon rail; Enter/Space still activate a module.
  function handleRailKeyDown(event) {
    const {key} = event;
    // WCAG 1.4.13: a keyboard-focused rail tooltip must be dismissible
    // without changing focus or activating a module. On mobile the tooltip
    // is hidden by CSS, so Escape must still close the explorer drawer.
    if (key === 'Escape' && railTip && window.innerWidth > 1180) {
      event.preventDefault();
      event.stopPropagation();
      railTipTargetRef.current = null;
      setRailTip(null);
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return;
    // The footer toggle also receives arrow keys: navigate the rail, not its empty subtree.
    const buttons = Array.from(railNavRef.current?.querySelectorAll('button:not(:disabled)') || []);
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

  function activate(item, fromExplorer = false) {
    const to = navigateTo(item);
    setRailTip(null);
    setQuery('');
    if (fromExplorer && item.children?.length) pendingExplorerFocusRef.current = true;
    setModuleSelection(item.moduleKey);
    if (contextScrollRef.current) contextScrollRef.current.scrollTop = 0;
    if (collapsed && !mobileOpen) onToggle?.();

    // A module with children opens just its own options. The page changes
    // only after the user selects an option inside that menu.
    if (item.children?.length) return;

    if (to !== location.pathname) navigate(to);
    if (mobileOpen) onCloseMobile?.();
  }

  function showAllModules() {
    setModuleSelection('__all__');
    setQuery('');
    if (contextScrollRef.current) contextScrollRef.current.scrollTop = 0;
  }

  const filteredGroups = visibleGroups.map((group) => ({
    ...group,
    children: group.children.filter((item) => {
      if (!normalizedQuery) return true;
      return normalizeSearch(item.label).includes(normalizedQuery)
        || item.children?.some((child) => normalizeSearch(child.label).includes(normalizedQuery));
    }),
  })).filter((group) => group.children.length);
  const searchResultCount = focusedModule ? focusedEntries.length
    : filteredGroups.reduce((count, group) => count + group.children.length, 0) + filteredAdminItems.length;

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
        <NavLink to="/" className={styles.brand} title="BuzzBee Business OS" aria-label="Ir al inicio de BuzzBee Business OS" onClick={onCloseMobile}>B</NavLink>
        <nav ref={railNavRef} className={styles.railNav} aria-label="Módulos principales" onKeyDown={handleRailKeyDown} onScroll={handleRailScroll}>
          {visibleGroups.map((group) => (
            <div key={group.label} className={styles.railGroup} role="group" aria-label={group.label}>
              {group.children.map((item) => {
                const Icon = item.icon || Home;
                const active = moduleMatches(location.pathname, item);
                const selected = focusedModule?.moduleKey === item.moduleKey;
                return (
                  <button
                    key={item.moduleKey || item.label}
                    type="button"
                    className={[styles.railButton, selected ? styles.railActive : '', active ? styles.railRouteCurrent : ''].filter(Boolean).join(' ')}
                    onMouseEnter={(event) => showRailTip(event, item.label)}
                    onMouseLeave={hideRailTip}
                    onFocus={(event) => showRailTip(event, item.label)}
                    onBlur={hideRailTip}
                    aria-label={item.children?.length ? 'Ver opciones de ' + item.label : 'Ir a ' + item.label}
                    aria-current={active ? 'location' : undefined}
                    aria-expanded={item.children?.length ? (selected && (!collapsed || mobileOpen) && !normalizedQuery) : undefined}
                    aria-controls={item.children?.length && selected && !normalizedQuery ? 'buzzbee-focused-module' : undefined}
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
          <button type="button" className={styles.railButton} aria-label={collapsed ? 'Abrir explorador' : 'Ocultar explorador'} aria-expanded={!collapsed || mobileOpen} aria-controls="buzzbee-module-context" onMouseEnter={(event) => showRailTip(event, collapsed ? 'Abrir menú' : 'Contraer menú')} onMouseLeave={hideRailTip} onFocus={(event) => showRailTip(event, collapsed ? 'Abrir menú' : 'Contraer menú')} onBlur={hideRailTip} onKeyDown={handleRailKeyDown} onClick={() => {setRailTip(null); onToggle?.();}}>
            {collapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}
          </button>
          <span className={styles.avatar} title={companyName}>{initials}</span>
        </div>
      </div>

      {railTip ? <span className={styles.railTip} role="tooltip" style={{top: railTip.top}}>{railTip.label}</span> : null}

      <div id="buzzbee-module-context" className={styles.context}>
        <div className={styles.contextHeader}>
          <button type="button" className={styles.workspaceHome} title="Ver todos los módulos" aria-label="Ver todos los módulos" onClick={showAllModules}>
            <ArrowLeft size={15} aria-hidden="true"/>
            <span>{focusedModule?.label || 'Todos los módulos'}</span>
          </button>
          <button ref={mobileCloseRef} type="button" className={styles.mobileClose} onClick={onCloseMobile} aria-label="Cerrar menú"><X size={20}/></button>
          <button type="button" className={styles.desktopClose} onClick={onToggle} aria-label="Contraer explorador" title="Contraer explorador"><ChevronLeft size={17}/></button>
        </div>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true"/>
          <input
            ref={searchInputRef}
            aria-label={focusedModule ? 'Buscar opciones de ' + focusedModule.label : 'Buscar módulos'}
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
            placeholder={focusedModule ? 'Buscar en ' + focusedModule.label + '...' : 'Buscar módulos u opciones...'}
          />
          {query ? <button type="button" aria-label="Limpiar búsqueda" onClick={() => {setQuery(''); searchInputRef.current?.focus();}}><X size={14}/></button> : null}
        </label>
        <div ref={contextScrollRef} className={styles.contextScroll}>
          <p className={styles.searchStatus} role="status" aria-live="polite" aria-atomic="true">
            {normalizedQuery ? `${searchResultCount} resultado${searchResultCount === 1 ? '' : 's'} de búsqueda` : ''}
          </p>
          {focusedModule ? (
            <section className={styles.section} id="buzzbee-focused-module" aria-labelledby="buzzbee-focused-module-heading">
              <h3 id="buzzbee-focused-module-heading">Opciones de {focusedModule.label}</h3>
              <nav className={styles.focusedNav} aria-label={'Opciones de ' + focusedModule.label}>
                {focusedEntries.map((child, index) => (
                  <AccessibleLink
                    key={child.to}
                    to={child.to}
                    label={child.label}
                    className={styles.focusedLink}
                    end={index === 0}
                    onNavigate={onCloseMobile}
                  />
                ))}
              </nav>
              {!focusedEntries.length ? <p className={styles.empty}>No encontramos opciones en este módulo.</p> : null}
            </section>
          ) : (
            <>
          {!normalizedQuery && visibleFavorites.length > 0 ? (
            <section className={styles.section}>
              <h3 id="buzzbee-favorites-heading"><Star size={13} aria-hidden="true"/> Favoritos</h3>
              <nav aria-labelledby="buzzbee-favorites-heading">
                <LinkList entries={visibleFavorites} icon={Star} onNavigate={onCloseMobile}/>
              </nav>
            </section>
          ) : null}
          {!normalizedQuery && visibleRecents.length > 0 ? (
            <section className={styles.section}>
              <h3 id="buzzbee-recents-heading"><Clock3 size={13} aria-hidden="true"/> Recientes</h3>
              <nav aria-labelledby="buzzbee-recents-heading">
                <LinkList entries={visibleRecents} icon={Clock3} onNavigate={onCloseMobile}/>
              </nav>
            </section>
          ) : null}
          <section className={styles.section}>
            <h3>Espacio de trabajo</h3>
            {filteredGroups.map((group, groupIndex) => (
              <div key={group.label} className={styles.group} role="group" aria-labelledby={`buzzbee-explorer-group-${groupIndex}`}>
                <h4 id={`buzzbee-explorer-group-${groupIndex}`} className={styles.groupTitle}>{group.label}</h4>
                {group.children.map((item, itemIndex) => {
                  const sectionsId = `buzzbee-explorer-sections-${groupIndex}-${itemIndex}`;
                  const Icon = item.icon || Home;
                  const isOpen = Boolean(normalizedQuery) && Boolean(item.children?.length);
                  const isActive = moduleMatches(location.pathname, item);
                  return (
                    <div key={item.moduleKey || item.label}>
                      <button
                        type="button"
                        className={[styles.moduleButton, isActive ? styles.moduleActive : ''].filter(Boolean).join(' ')}
                        aria-expanded={item.children?.length ? isOpen : undefined}
                        aria-controls={item.children?.length && isOpen ? sectionsId : undefined}
                        onClick={() => activate(item, true)}
                      >
                        <Icon size={16} aria-hidden="true"/>
                        <span>{item.label}</span>
                        {item.children?.length ? (isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>) : null}
                      </button>
                      {item.children?.length && isOpen ? (
                        <div id={sectionsId} className={styles.tree} role="group" aria-label={'Secciones de ' + item.label}>
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
            </>
          )}
        </div>
        <div className={styles.bottom}>
          <AccessibleLink to="/ayuda" label="Centro de ayuda" icon={CircleHelp} className={styles.quickLink} onNavigate={onCloseMobile}/>
          <div className={styles.capacity}>
            <div className={styles.capacityHeader}>
              <span><Boxes size={15} aria-hidden="true"/> Módulos visibles</span>
              <strong>{modules.length} / {totalModuleCount}</strong>
            </div>
            <div className={styles.capacityTrack} role="meter" aria-label="Módulos visibles" aria-valuemin={0} aria-valuemax={Math.max(1, totalModuleCount)} aria-valuenow={modules.length} aria-valuetext={`${modules.length} de ${totalModuleCount} módulos mostrados`}>
              <span className={styles.capacityFill} style={{width: `${moduleUsage}%`}} />
            </div>
            <small title={companyName}>{companyName}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
