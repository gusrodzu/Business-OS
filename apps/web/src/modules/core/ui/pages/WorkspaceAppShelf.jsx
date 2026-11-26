import {useEffect, useMemo, useState} from 'react';
import {ChevronDown, ChevronRight, Grid2X2, Layers3, List, Plus, RefreshCw, Search, Star, Clock3} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {apiRequest} from '../../../../api';
import {useAuth} from '../../../../auth/AuthContext';
import {isProfileVisible, navigationGroups} from '../../../../data/navigation';
import {getOSAppIdentityForModule} from '../../../../layout/os/workspaceAppIdentity';
import OSSystemAppIcon from '../../../../layout/os/OSSystemAppIcon';
import {dashboardPreferencesKey} from '../../../../components/honeycombPreferences';
import styles from './WorkspaceAppShelf.module.css';

const INITIAL_VISIBLE = 8;
const RECENT_LIMIT = 5;
const MODULE_HELP = {
  ventas:'Cotizaciones, pedidos y facturación', compras:'Solicitudes, órdenes y proveedores',
  inventario:'Productos, existencias y movimientos', pos:'Cobros y ventas en mostrador',
  crm:'Clientes, contactos y oportunidades', proyectos:'Actividades, equipos y entregables',
  produccion:'Órdenes y procesos de fabricación', marketing:'Campañas y comunicación',
  finanzas:'Ingresos, gastos y tesorería', reportes:'Indicadores y resultados del negocio',
  rrhh:'Colaboradores y gestión de personal', configuracion:'Preferencias y administración',
};
const normalizeSearch = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
const destination = (item) => item.moduleKey === 'compras' ? '/compras/solicitudes'
  : item.to || item.children?.find((child) => child.to)?.to;
const appId = (item) => item.moduleKey || destination(item);

function readFavorites(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value)
      ? [...new Set(value.filter((id) => typeof id === 'string' && id.length <= 100))].slice(0, 80)
      : [];
  } catch {
    return [];
  }
}

function readRecents(key) { return readFavorites(key).slice(0, RECENT_LIMIT); }

function saveFavorites(key, values) {
  try { window.localStorage.setItem(key, JSON.stringify(values)); } catch {
    // Blocked storage must never prevent navigation.
  }
}

export default function WorkspaceAppShelf({variant = 'standard', onLaunch}) {
  const navigate = useNavigate();
  const {user, offlineDemo} = useAuth();
  const favoritesKey = `business-os.workspace.favorites.v1:${dashboardPreferencesKey(user, offlineDemo)}`;
  const [favoriteState, setFavoriteState] = useState(() => ({
    key: favoritesKey, values: readFavorites(favoritesKey),
  }));
  const favorites = favoriteState.key === favoritesKey
    ? favoriteState.values : readFavorites(favoritesKey);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const recentsKey = `business-os.workspace.recents.v1:${dashboardPreferencesKey(user, offlineDemo)}`;
  const [recentState, setRecentState] = useState(() => ({key: recentsKey, values: readRecents(recentsKey)}));
  const recents = recentState.key === recentsKey ? recentState.values : readRecents(recentsKey);
  function launchApp(app) {
    const id = appId(app);
    setRecentState((previous) => {
      const active = previous.key === recentsKey ? previous.values : readRecents(recentsKey);
      return {key: recentsKey, values: [id, ...active.filter((value) => value !== id)].slice(0, RECENT_LIMIT)};
    });
    onLaunch?.();
    navigate(destination(app));
  }
  useEffect(() => {
    if (recentState.key === recentsKey) saveFavorites(recentsKey, recentState.values);
  }, [recentState, recentsKey]);

  function toggleFavorite(id) {
    setFavoriteState((previous) => {
      const active = previous.key === favoritesKey ? previous.values : readFavorites(favoritesKey);
      return {
        key: favoritesKey,
        values: active.includes(id) ? active.filter((item) => item !== id) : [id, ...active].slice(0, 80),
      };
    });
  }

  useEffect(() => {
    const sync = (event) => {
      if (event.type === 'storage' ? event.key !== favoritesKey : event.detail !== favoritesKey) return;
      const values = readFavorites(favoritesKey);
      setFavoriteState(previous => previous.key === favoritesKey && JSON.stringify(previous.values) === JSON.stringify(values)
        ? previous : {key:favoritesKey,values});
    };
    window.addEventListener('business-os:favorites-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('business-os:favorites-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, [favoritesKey]);
  useEffect(() => {
    if (favoriteState.key === favoritesKey) {
      saveFavorites(favoritesKey, favoriteState.values);
      if (JSON.stringify(readFavorites(favoritesKey)) !== JSON.stringify(favoriteState.values)) return;
      window.dispatchEvent(new CustomEvent('business-os:favorites-changed',{detail:favoritesKey}));
    }
  }, [favoriteState, favoritesKey]);
  const companyScope = String(user?.companyId || user?.company?.id || 'none');
  const [moduleState, setModuleState] = useState(null);
  const [industryState, setIndustryState] = useState(null);
  const industryScope = `${companyScope}:${offlineDemo ? 'offline' : 'online'}`;
  const [refreshId, setRefreshId] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [osView, setOsView] = useState('grid');
  const [editingFavorites, setEditingFavorites] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest('/modules/dashboard')
      .then((result) => {
        if (!active) return;
        const enabled = new Map((result?.companyModules || []).map((row) => [
          row.module?.key || row.moduleId, row.enabled,
        ]));
        setModuleState({companyScope, enabled, error: false});
      })
      .catch(() => {
        if (active) setModuleState({companyScope, enabled: null, error: true});
      });
    return () => { active = false; };
  }, [companyScope, refreshId]);

  // Industry recommendations come from the configured company and only change
  // app ordering: they never enable a license, module or permission.
  useEffect(() => {
    let active = true;
    const empty = () => {
      if (active) setIndustryState({scope: industryScope, suggestions: [], configured: false});
    };
    if (offlineDemo) {
      empty();
      return () => { active = false; };
    }
    apiRequest('/industries/company')
      .then((result) => {
        if (!active) return null;
        const activities = (result?.activities || [])
          .map((item) => item?.activityKey).filter((key) => typeof key === 'string');
        if (!activities.length) return null;
        return apiRequest('/industries/recommend', {
          method: 'POST', body: {activities},
        });
      })
      .then((result) => {
        if (!active) return;
        if (!result) return empty();
        setIndustryState({
          scope: industryScope, configured: true,
          suggestions: Array.isArray(result.recommendation?.suggestedModules)
            ? result.recommendation.suggestedModules : [],
        });
      })
      .catch(empty);
    return () => { active = false; };
  }, [industryScope, offlineDemo]);

  // Never display a previous company's entitlements during a tenant switch.
  const currentState = moduleState?.companyScope === companyScope ? moduleState : null;
  const recommended = useMemo(
    () => new Set(industryState?.scope === industryScope ? industryState.suggestions : []),
    [industryState, industryScope],
  );
  const industryConfigured = industryState?.scope === industryScope && industryState.configured;
  const apps = useMemo(() => {
    if (!currentState || currentState.error) return [];
    return navigationGroups
      .filter((group) => group.label !== 'Principal')
      .flatMap((group) => group.children.map((item) => ({...item, category: group.label})))
      .filter((item) => {
        if (!isProfileVisible(item) || !destination(item)) return false;
        const enabled = currentState.enabled.get(item.moduleKey);
        return enabled === undefined ? item.defaultVisible !== false : enabled !== false;
      })
      .sort((a, b) =>
        Number(favoriteSet.has(appId(b))) - Number(favoriteSet.has(appId(a)))
        || Number(recommended.has(b.moduleKey)) - Number(recommended.has(a.moduleKey))
      );
  }, [currentState, favoriteSet, recommended]);

  const categories = useMemo(() => [...new Set(apps.map((app) => app.category))], [apps]);
  const quickFavorites = apps.filter((app) => favoriteSet.has(appId(app))).slice(0, RECENT_LIMIT);
  const quickRecents = recents.map((id) => apps.find((app) => appId(app) === id)).filter(Boolean);
  // A tenant switch or module-license change can remove a category.
  // Fall back to "Todas" rather than keeping a stale empty selection.
  const favoriteAppsCount = apps.filter((app) => favoriteSet.has(appId(app))).length;
  const activeCategory = selectedCategory === 'all'
    || selectedCategory === 'favorites'
    || categories.includes(selectedCategory)
    ? selectedCategory : 'all';
  const categoryFilteredApps = activeCategory === 'all'
    ? apps
    : selectedCategory === 'favorites'
      ? apps.filter((app) => favoriteSet.has(appId(app)))
      : apps.filter((app) => app.category === activeCategory);
  const searchTerm = normalizeSearch(search).trim();
  const filteredApps = (variant === 'drawer' || variant === 'os') && searchTerm
    ? categoryFilteredApps.filter((item) => normalizeSearch(`${item.label} ${item.category} ${MODULE_HELP[item.moduleKey] || ''}`)
      .includes(searchTerm))
    : categoryFilteredApps;
  const visible = variant === 'drawer' || expanded ? filteredApps : filteredApps.slice(0, INITIAL_VISIBLE);
  const shelfId = variant === 'drawer' ? 'business-os-app-drawer-shelf' : 'business-os-mobile-apps';
  const titleId = variant === 'drawer' ? 'workspace-apps-title-drawer' : 'workspace-apps-title';
  const gridId = variant === 'drawer' ? 'workspace-app-grid-drawer' : 'workspace-app-grid';

  function selectCategory(category) {
    setSelectedCategory(category);
    setExpanded(false);
  }

  return (
    <section id={shelfId} className={styles.shelf} data-workspace-app-shelf="true" data-variant={variant} aria-labelledby={titleId}>
      <div className={styles.heading}>
        <div className={styles.headingCopy}>
          {variant === 'standard' ? <span className={styles.eyebrow}><Layers3 size={14} aria-hidden="true"/> TU WORKSPACE</span> : null}
          <h2 id={titleId} className={variant === 'drawer' ? styles.srOnly : undefined}>{variant === 'os' ? 'Mis aplicaciones' : 'Tus aplicaciones'}</h2>
          <p>{variant === 'os' ? 'Accede a todos los módulos de tu negocio' : industryConfigured
            ? 'Tus favoritas primero; después, aplicaciones sugeridas según el giro configurado.'
            : 'Abre tus aplicaciones o consulta tus favoritas.'}</p>
        </div>
        {variant === 'os' ? <div className={styles.osTools}><label className={styles.osSearch}><Search size={20} aria-hidden="true"/><span className={styles.srOnly}>Buscar aplicaciones</span><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Buscar aplicación..." autoComplete="off"/><kbd>⌘ K</kbd></label><div className={styles.osViewSwitch} role="group" aria-label="Vista de aplicaciones"><button type="button" className={osView === 'grid' ? styles.osViewActive : ''} aria-label="Vista de cuadrícula" aria-pressed={osView === 'grid'} onClick={() => setOsView('grid')}><Grid2X2 size={19}/></button><button type="button" className={osView === 'list' ? styles.osViewActive : ''} aria-label="Vista de lista" aria-pressed={osView === 'list'} onClick={() => setOsView('list')}><List size={20}/></button></div></div> : null}
        {!currentState ? <span className={styles.count} role="status">Cargando aplicaciones…</span> : null}
        {currentState && !currentState.error ? <span className={styles.count}>{apps.length} aplicaciones</span> : null}
        {variant !== 'drawer' && variant !== 'os' && filteredApps.length > INITIAL_VISIBLE ? (
          <button type="button" className={styles.mobileViewAll}
            aria-expanded={expanded} aria-controls={gridId}
            onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Ver menos' : 'Ver todas'}
            <ChevronRight size={15} aria-hidden="true"/>
          </button>
        ) : null}
      </div>

      {currentState?.error ? (
        <div className={styles.message} role="status">
          <span>No se pudo consultar el catálogo de aplicaciones.</span>
          <button type="button" onClick={() => setRefreshId((id) => id + 1)}>
            <RefreshCw size={16} aria-hidden="true"/> Reintentar
          </button>
        </div>
      ) : null}
      {!currentState ? <div className={styles.message} aria-busy="true">Consultando módulos habilitados…</div> : null}
      {currentState && !currentState.error && !apps.length ? (
        <p className={styles.message}>No hay aplicaciones habilitadas para este espacio.</p>
      ) : null}

      {variant === 'drawer' ? (
        <label className={styles.drawerSearch}>
          <span className={styles.srOnly}>Buscar aplicación</span>
          <Search size={20} aria-hidden="true"/>
          <input value={search} onChange={(event) => setSearch(event.target.value)}
            type="search" placeholder="Buscar por nombre o área…" autoComplete="off"/>
        </label>
      ) : null}

      {categories.length > 1 || favoriteAppsCount > 0 ? (
        <div className={styles.categories} role="group" aria-label="Filtrar aplicaciones por área">
          <button type="button" className={`${styles.category} ${activeCategory === 'all' ? styles.categoryActive : ''}`}
            aria-pressed={activeCategory === 'all'} onClick={() => selectCategory('all')}>
            Todas <span>{apps.length}</span>
          </button>
          {favoriteAppsCount > 0 ? (
            <button type="button"
              className={`${styles.category} ${activeCategory === 'favorites' ? styles.categoryActive : ''}`}
              aria-pressed={activeCategory === 'favorites'} onClick={() => selectCategory('favorites')}>
              <Star size={14} aria-hidden="true"/> Favoritas <span>{favoriteAppsCount}</span>
            </button>
          ) : null}
          {categories.map((category) => (
            <button type="button" key={category}
              className={`${styles.category} ${activeCategory === category ? styles.categoryActive : ''}`}
              aria-pressed={activeCategory === category} onClick={() => selectCategory(category)}>
              {category} <span>{apps.filter((app) => app.category === category).length}</span>
            </button>
          ))}
        </div>
      ) : null}

      {currentState && !currentState.error && activeCategory === 'favorites' && !filteredApps.length ? (
        <p className={styles.message} role="status">No tienes aplicaciones favoritas habilitadas en esta empresa.</p>
      ) : null}

      {currentState && !currentState.error && !filteredApps.length && apps.length ? (
        <p className={styles.message} role="status">No hay aplicaciones que coincidan con los filtros.</p>
      ) : null}

      {filteredApps.length ? (
        <nav id={gridId} className={`${styles.apps} ${variant === 'os' && osView === 'list' ? styles.osList : ''}`} aria-label="Aplicaciones disponibles">
          {visible.map((app) => {
            const Icon = app.icon;
            const id = appId(app);
            const appearance = getOSAppIdentityForModule(app.moduleKey);
            return (
              <div className={styles.appTile} key={id}>
                <button type="button"
                  className={styles.app} onClick={() => launchApp(app)}
                  aria-label={`Abrir ${app.label}${recommended.has(app.moduleKey) ? ', sugerida para tu giro' : ''}`}>
                  <span className={styles.appIcon} data-os-app-icon={appearance.key} aria-hidden="true"
                    style={{'--os-app-accent':appearance.accent,
                      '--os-app-accent-ink':appearance.accentInk,
                      '--os-app-tint':appearance.tint}}>
                    <OSSystemAppIcon appKey={appearance.key} size={variant === 'os' ? 58 : variant === 'drawer' ? 52 : 38} fallback={Icon || Layers3}/>
                  </span>
                  <span className={styles.appName}>{app.label}</span>
                  {variant === 'os' ? <span className={styles.appDescription}>{MODULE_HELP[app.moduleKey] || `Herramientas de ${app.label.toLocaleLowerCase('es')}`}</span> : null}
                  <span className={styles.appCategory}>{app.category}</span>
                  {recommended.has(app.moduleKey) ? (
                    <span className={styles.industryTag}>Sugerida para tu giro</span>
                  ) : null}
                  <ChevronRight className={styles.appArrow} size={15} aria-hidden="true"/>
                </button>

              </div>
            );
          })}
        </nav>
      ) : null}

      {variant === 'os' && filteredApps.length > INITIAL_VISIBLE ? (
        <button type="button" className={styles.expand} aria-expanded={expanded} aria-controls={gridId}
          onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Mostrar menos aplicaciones' : `Ver todas las ${filteredApps.length} aplicaciones`}
          <ChevronDown size={16} className={expanded ? styles.flipped : ''} aria-hidden="true"/>
        </button>
      ) : null}

      {(variant === 'os' || (variant === 'drawer' && !searchTerm && activeCategory === 'all')) && currentState && !currentState.error && apps.length ? (
        <div className={styles.quickAccess} aria-label="Accesos rápidos del escritorio">
          <section className={styles.quickSection} aria-labelledby={`${shelfId}-quick-favorites`}>
            <div className={styles.favoriteHeading}><h3 id={`${shelfId}-quick-favorites`}><Star size={21} aria-hidden="true"/> Tus favoritas</h3>
              <button type="button" className={styles.favoriteEdit} data-launcher-favorite-edit="true" aria-expanded={editingFavorites} aria-controls={editingFavorites?`${shelfId}-favorite-editor`:undefined} onClick={()=>setEditingFavorites(value=>!value)}>{editingFavorites?'Listo':'Editar'}</button></div>
            {quickFavorites.length ? (
              <div className={styles.quickLinks}>
                {quickFavorites.map((app) => (
                  <button key={appId(app)} type="button" onClick={() => launchApp(app)}>
                    <OSSystemAppIcon appKey={getOSAppIdentityForModule(app.moduleKey).key} size={34} fallback={app.icon || Layers3}/>{app.label}
                  </button>
                ))}
              </div>
            ) : <button type="button" className={styles.quickAdd} onClick={() => setEditingFavorites(true)}><Plus size={17}/> Agregar</button>}
            {editingFavorites ? <fieldset id={`${shelfId}-favorite-editor`} className={styles.favoriteEditor}>
              <legend>Selecciona tus aplicaciones favoritas</legend>
              {apps.map(app=><label key={appId(app)} className={styles.favoriteOption}>
                <input type="checkbox" data-launcher-favorite={appId(app)} checked={favoriteSet.has(appId(app))} onChange={()=>toggleFavorite(appId(app))}/>
                <span>{app.label}</span>
              </label>)}
            </fieldset> : null}
          </section>
          <section className={styles.quickSection} aria-labelledby={`${shelfId}-quick-recents`}>
            <h3 id={`${shelfId}-quick-recents`}><Clock3 size={21} aria-hidden="true"/> Recientes</h3>
            {quickRecents.length ? (
              <div className={styles.quickLinks}>
                {quickRecents.map((app) => (
                  <button key={appId(app)} type="button" onClick={() => launchApp(app)}>
                    {app.label}<ChevronRight size={14} aria-hidden="true"/>
                  </button>
                ))}
              </div>
            ) : <p>Las aplicaciones que abras aparecerán aquí.</p>}
          </section>
        </div>
      ) : null}

      {variant !== 'os' && variant !== 'drawer' && filteredApps.length > INITIAL_VISIBLE ? (
        <button type="button" className={styles.expand}
          aria-expanded={expanded} aria-controls={gridId}
          onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Mostrar menos aplicaciones' : `Ver todas las ${filteredApps.length} aplicaciones`}
          <ChevronDown size={16} className={expanded ? styles.flipped : ''} aria-hidden="true"/>
        </button>
      ) : null}
    </section>
  );
}
