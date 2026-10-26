import {useId, useMemo, useState} from 'react';
import {ArrowUpRight, Check, ChevronsUpDown, Search, SlidersHorizontal, X} from 'lucide-react';
import styles from './HexQuickActions.module.css';

const MODULE_LABELS = {
  ventas: 'Ventas',
  compras: 'Compras',
  inventario: 'Inventario',
  finanzas: 'Finanzas',
  crm: 'CRM',
  reportes: 'Reportes',
};

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

/**
 * Contextual hexagon controls for existing quick actions.
 *
 * Visual presentation is isolated in this CSS Module. Navigation is delegated
 * to the caller; no routes, entitlements or offline data are changed.
 */
export default function HexQuickActions({actions = [], onNavigate}) {
  const searchId = useId();
  const moduleId = useId();
  const rangeId = useId();
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('all');
  const [frequentOnly, setFrequentOnly] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(() => actions.length || 1);

  const modules = useMemo(() => [...new Set(actions.map((action) => action.moduleKey).filter(Boolean))], [actions]);
  const filtered = useMemo(() => actions.filter((action, index) => {
    if (frequentOnly && index >= 4) return false;
    if (module !== 'all' && action.moduleKey !== module) return false;
    return !normalize(query) || normalize(action.label).includes(normalize(query));
  }), [actions, frequentOnly, module, query]);
  const visible = filtered.slice(0, visibleLimit);

  function clearFilters() {
    setQuery('');
    setModule('all');
    setFrequentOnly(false);
    setVisibleLimit(Math.max(1, actions.length));
  }

  return (
    <section className={styles.root} data-bb-hex-ui="true" aria-label="Acciones rápidas con controles hexagonales">
      <div className={styles.modeSwitch} role="group" aria-label="Filtrar accesos directos">
        <button type="button" className={`${styles.mode} ${!frequentOnly ? styles.selected : ''}`}
          aria-pressed={!frequentOnly} onClick={() => setFrequentOnly(false)}>
          <span className={styles.miniHex} aria-hidden="true">{!frequentOnly ? <Check size={12}/> : null}</span>
          Todas
        </button>
        <button type="button" className={`${styles.mode} ${frequentOnly ? styles.selected : ''}`}
          aria-pressed={frequentOnly} onClick={() => setFrequentOnly(true)}>
          <span className={styles.miniHex} aria-hidden="true">{frequentOnly ? <Check size={12}/> : null}</span>
          Frecuentes
        </button>
      </div>

      <div className={styles.controls}>
        <label className={styles.field} htmlFor={searchId}>
          <span className={styles.fieldLabel}>Buscar acción</span>
          <span className={styles.controlShell}>
            <input id={searchId} type="search" value={query}
              onChange={(event) => setQuery(event.target.value)} placeholder="Buscar aquí…" />
            <span className={styles.controlHex} aria-hidden="true"><Search size={17}/></span>
          </span>
        </label>

        <label className={styles.field} htmlFor={moduleId}>
          <span className={styles.fieldLabel}>Módulo</span>
          <span className={styles.controlShell}>
            <select id={moduleId} value={module} onChange={(event) => setModule(event.target.value)}>
              <option value="all">Todos los módulos</option>
              {modules.map((key) => <option value={key} key={key}>{MODULE_LABELS[key] || key}</option>)}
            </select>
            <span className={styles.controlHex} aria-hidden="true"><ChevronsUpDown size={18}/></span>
          </span>
        </label>
      </div>

      <nav className={styles.actions} aria-label="Accesos rápidos">
        {visible.map((action, index) => {
          const Icon = action.icon;
          return (
            <button type="button" key={`${action.label}-${action.to}`}
              className={`${styles.action} ${index === 0 ? styles.actionAccent : ''}`}
              onClick={() => action.to && onNavigate?.(action.to)}
              aria-label={action.label}>
              <span className={styles.actionHex} aria-hidden="true">{Icon ? <Icon size={18}/> : null}</span>
              <span className={styles.actionLabel}>{action.label}</span>
              <ArrowUpRight size={17} className={styles.actionArrow} aria-hidden="true"/>
            </button>
          );
        })}
        {!visible.length ? (
          <div className={styles.empty} role="status">
            <strong>No encontramos acciones</strong>
            <span>Prueba con otro término o módulo.</span>
            <button type="button" onClick={clearFilters}>Limpiar filtros <X size={13} aria-hidden="true"/></button>
          </div>
        ) : null}
      </nav>

      <div className={styles.rangeArea}>
        <div className={styles.rangeLabel}>
          <label htmlFor={rangeId}><SlidersHorizontal size={14} aria-hidden="true"/> Acciones visibles</label>
          <output htmlFor={rangeId}>{visible.length} de {filtered.length}</output>
        </div>
        <input
          id={rangeId} className={styles.range} type="range"
          min="1" max={Math.max(1, actions.length)} step="1"
          value={Math.min(visibleLimit, Math.max(1, actions.length))}
          onChange={(event) => setVisibleLimit(Number(event.target.value))}
          aria-label="Número máximo de acciones visibles"
          style={{'--hex-progress': `${(Math.min(visibleLimit, Math.max(1, actions.length)) - 1) / Math.max(1, actions.length - 1) * 100}%`}}
        />
      </div>
    </section>
  );
}
