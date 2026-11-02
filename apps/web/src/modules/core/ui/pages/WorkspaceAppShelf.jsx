import {useEffect, useMemo, useState} from 'react';
import {ChevronDown, ChevronRight, Layers3, RefreshCw, Star} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {apiRequest} from '../../../../api';
import {useAuth} from '../../../../auth/AuthContext';
import {isProfileVisible, navigationGroups} from '../../../../data/navigation';
import {dashboardPreferencesKey} from '../../../../components/honeycombPreferences';
import styles from './WorkspaceAppShelf.module.css';

const INITIAL_VISIBLE = 8;
const destination = (item) => item.to || item.children?.find((child) => child.to)?.to;
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

function saveFavorites(key, values) {
  try { window.localStorage.setItem(key, JSON.stringify(values)); } catch {
    // Blocked storage must never prevent navigation.
  }
}

export default function WorkspaceAppShelf() {
  const navigate = useNavigate();
  const {user, offlineDemo} = useAuth();
  const favoritesKey = `business-os.workspace.favorites.v1:${dashboardPreferencesKey(user, offlineDemo)}`;
  const [favoriteState, setFavoriteState] = useState(() => ({
    key: favoritesKey, values: readFavorites(favoritesKey),
  }));
  const favorites = favoriteState.key === favoritesKey
    ? favoriteState.values : readFavorites(favoritesKey);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

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
    if (favoriteState.key === favoritesKey) saveFavorites(favoritesKey, favoriteState.values);
  }, [favoriteState, favoritesKey]);
  const companyScope = String(user?.companyId || user?.company?.id || 'none');
  const [moduleState, setModuleState] = useState(null);
  const [industryState, setIndustryState] = useState(null);
  const industryScope = `${companyScope}:${offlineDemo ? 'offline' : 'online'}`;
  const [refreshId, setRefreshId] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
  // A tenant switch or module-license change can remove a category.
  // Fall back to "Todas" rather than keeping a stale empty selection.
  const activeCategory = selectedCategory === 'all' || categories.includes(selectedCategory)
    ? selectedCategory : 'all';
  const filteredApps = activeCategory === 'all'
    ? apps : apps.filter((app) => app.category === activeCategory);
  const visible = expanded ? filteredApps : filteredApps.slice(0, INITIAL_VISIBLE);

  function selectCategory(category) {
    setSelectedCategory(category);
    setExpanded(false);
  }

  return (
    <section className={styles.shelf} data-workspace-app-shelf="true" aria-labelledby="workspace-apps-title">
      <div className={styles.heading}>
        <div className={styles.headingCopy}>
          <span className={styles.eyebrow}><Layers3 size={14} aria-hidden="true"/> TU WORKSPACE</span>
          <h2 id="workspace-apps-title">Tus aplicaciones</h2>
          <p>{industryConfigured
            ? 'Tus favoritas primero; después, aplicaciones sugeridas según el giro configurado.'
            : 'Abre tus apps o fija las que utilizas con más frecuencia.'}</p>
        </div>
        {!currentState ? <span className={styles.count} role="status">Cargando aplicaciones…</span> : null}
        {currentState && !currentState.error ? <span className={styles.count}>{apps.length} disponibles</span> : null}
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

      {categories.length > 1 ? (
        <div className={styles.categories} role="group" aria-label="Filtrar aplicaciones por área">
          <button type="button" className={`${styles.category} ${activeCategory === 'all' ? styles.categoryActive : ''}`}
            aria-pressed={activeCategory === 'all'} onClick={() => selectCategory('all')}>
            Todas <span>{apps.length}</span>
          </button>
          {categories.map((category) => (
            <button type="button" key={category}
              className={`${styles.category} ${activeCategory === category ? styles.categoryActive : ''}`}
              aria-pressed={activeCategory === category} onClick={() => selectCategory(category)}>
              {category} <span>{apps.filter((app) => app.category === category).length}</span>
            </button>
          ))}
        </div>
      ) : null}

      {filteredApps.length ? (
        <nav id="workspace-app-grid" className={styles.apps} aria-label="Aplicaciones disponibles">
          {visible.map((app) => {
            const Icon = app.icon;
            const id = appId(app);
            const pinned = favoriteSet.has(id);
            return (
              <div className={styles.appTile} key={id}>
                <button type="button"
                  className={styles.app} onClick={() => navigate(destination(app))}
                  aria-label={`Abrir ${app.label}`}>
                  <span className={styles.appIcon} aria-hidden="true">{Icon ? <Icon size={23}/> : <Layers3 size={23}/>}</span>
                  <span className={styles.appName}>{app.label}</span>
                  <span className={styles.appCategory}>{app.category}</span>
                  {recommended.has(app.moduleKey) ? (
                    <span className={styles.industryTag}>Sugerida para tu giro</span>
                  ) : null}
                  <ChevronRight className={styles.appArrow} size={15} aria-hidden="true"/>
                </button>
                <button type="button" className={`${styles.pin} ${pinned ? styles.pinned : ''}`}
                  aria-pressed={pinned} aria-label={`${pinned ? 'Quitar de favoritos' : 'Añadir a favoritos'}: ${app.label}`}
                  title={pinned ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  onClick={() => toggleFavorite(id)}>
                  <Star size={17} fill={pinned ? 'currentColor' : 'none'} aria-hidden="true"/>
                </button>
              </div>
            );
          })}
        </nav>
      ) : null}

      {filteredApps.length > INITIAL_VISIBLE ? (
        <button type="button" className={styles.expand}
          aria-expanded={expanded} aria-controls="workspace-app-grid"
          onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Mostrar menos aplicaciones' : `Ver las ${filteredApps.length} aplicaciones`}
          <ChevronDown size={16} className={expanded ? styles.flipped : ''} aria-hidden="true"/>
        </button>
      ) : null}
    </section>
  );
}
