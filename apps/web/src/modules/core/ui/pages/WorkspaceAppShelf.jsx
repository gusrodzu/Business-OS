import {useEffect, useMemo, useState} from 'react';
import {ChevronDown, ChevronRight, Layers3, RefreshCw} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {apiRequest} from '../../../../api';
import {useAuth} from '../../../../auth/AuthContext';
import {isProfileVisible, navigationGroups} from '../../../../data/navigation';
import styles from './WorkspaceAppShelf.module.css';

const INITIAL_VISIBLE = 8;
const destination = (item) => item.to || item.children?.find((child) => child.to)?.to;

export default function WorkspaceAppShelf() {
  const navigate = useNavigate();
  const {user} = useAuth();
  const companyScope = String(user?.companyId || user?.company?.id || 'none');
  const [moduleState, setModuleState] = useState(null);
  const [refreshId, setRefreshId] = useState(0);
  const [expanded, setExpanded] = useState(false);

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

  // Never display a previous company's entitlements during a tenant switch.
  const currentState = moduleState?.companyScope === companyScope ? moduleState : null;
  const apps = useMemo(() => {
    if (!currentState || currentState.error) return [];
    return navigationGroups
      .filter((group) => group.label !== 'Principal')
      .flatMap((group) => group.children.map((item) => ({...item, category: group.label})))
      .filter((item) => {
        if (!isProfileVisible(item) || !destination(item)) return false;
        const enabled = currentState.enabled.get(item.moduleKey);
        return enabled === undefined ? item.defaultVisible !== false : enabled !== false;
      });
  }, [currentState]);

  const visible = expanded ? apps : apps.slice(0, INITIAL_VISIBLE);

  return (
    <section className={styles.shelf} data-workspace-app-shelf="true" aria-labelledby="workspace-apps-title">
      <div className={styles.heading}>
        <div className={styles.headingCopy}>
          <span className={styles.eyebrow}><Layers3 size={14} aria-hidden="true"/> TU WORKSPACE</span>
          <h2 id="workspace-apps-title">Tus aplicaciones</h2>
          <p>Abre un espacio de trabajo de la empresa activa.</p>
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

      {apps.length ? (
        <nav className={styles.apps} aria-label="Aplicaciones disponibles">
          {visible.map((app) => {
            const Icon = app.icon;
            return (
              <button type="button" key={app.moduleKey || destination(app)}
                className={styles.app} onClick={() => navigate(destination(app))}
                aria-label={`Abrir ${app.label}`}>
                <span className={styles.appIcon} aria-hidden="true">{Icon ? <Icon size={23}/> : <Layers3 size={23}/>}</span>
                <span className={styles.appName}>{app.label}</span>
                <span className={styles.appCategory}>{app.category}</span>
                <ChevronRight className={styles.appArrow} size={15} aria-hidden="true"/>
              </button>
            );
          })}
        </nav>
      ) : null}

      {apps.length > INITIAL_VISIBLE ? (
        <button type="button" className={styles.expand}
          aria-expanded={expanded} aria-controls="workspace-apps-title"
          onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Mostrar menos aplicaciones' : `Ver las ${apps.length} aplicaciones`}
          <ChevronDown size={16} className={expanded ? styles.flipped : ''} aria-hidden="true"/>
        </button>
      ) : null}
    </section>
  );
}
