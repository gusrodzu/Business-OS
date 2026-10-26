import {useId, useMemo, useState} from 'react';
import {ArrowUpRight, Check, ChevronDown, ChevronUp, Search, SlidersHorizontal, X} from 'lucide-react';
import styles from './HexQuickActions.module.css';

const INITIAL_VISIBLE = 4;
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
 * Compact contextual shortcuts for BuzzBee. Source actions and destinations
 * come from the caller; no API, entitlements, routes or demo state is changed.
 */
export default function HexQuickActions({actions = [], onNavigate}) {
  const searchId = useId();
  const moduleId = useId();
  const rangeId = useId();
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('all');
  const [frequentOnly, setFrequentOnly] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_VISIBLE);
  const [customizing, setCustomizing] = useState(false);

  const modules = useMemo(() => [...new Set(actions.map(action => action.moduleKey).filter(Boolean))], [actions]);
  const filtered = useMemo(() => actions.filter((action, index) => {
    if (frequentOnly && index >= INITIAL_VISIBLE) return false;
    if (module !== 'all' && action.moduleKey !== module) return false;
    return !normalize(query) ||
      normalize(action.label + ' ' + (MODULE_LABELS[action.moduleKey] || action.moduleKey || '')).includes(normalize(query));
  }), [actions, frequentOnly, module, query]);

  const visible = filtered.slice(0, Math.max(1, visibleLimit));
  const hiddenCount = Math.max(0, filtered.length - visible.length);
  const isExpanded = visibleLimit > INITIAL_VISIBLE;
  const maxLimit = Math.max(1, actions.length);

  function clearFilters() {
    setQuery('');
    setModule('all');
    setFrequentOnly(false);
    setVisibleLimit(INITIAL_VISIBLE);
  }

  return (
    <section className={styles.root} data-bb-hex-ui="true" aria-label="Acciones rápidas">
      <div className={styles.topRow}>
        <div className={styles.modeSwitch} role="group" aria-label="Filtrar accesos directos">
          <button type="button" data-ui-surface="control"
            className={`${styles.mode} ${!frequentOnly ? styles.selected : ''}`}
            aria-pressed={!frequentOnly} onClick={() => setFrequentOnly(false)}>
            <span className={styles.miniHex} aria-hidden="true">{!frequentOnly ? <Check size={12}/> : null}</span>
            Todas
          </button>
          <button type="button" data-ui-surface="control"
            className={`${styles.mode} ${frequentOnly ? styles.selected : ''}`}
            aria-pressed={frequentOnly} onClick={() => setFrequentOnly(true)}>
            <span className={styles.miniHex} aria-hidden="true">{frequentOnly ? <Check size={12}/> : null}</span>
            Frecuentes
          </button>
        </div>
        <span className={styles.count} aria-live="polite">{filtered.length} {filtered.length === 1 ? 'acceso' : 'accesos'}</span>
      </div>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={searchId}>Buscar acción</label>
          <div className={styles.searchShell}>
            <Search size={17} className={styles.inputIcon} aria-hidden="true"/>
            <input id={searchId} type="search" value={query} autoComplete="off"
              onChange={event => setQuery(event.target.value)} placeholder="Nombre o módulo…"/>
            {query ? (
              <button type="button" data-ui-surface="control" className={styles.clearSearch}
                onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
                <X size={16} aria-hidden="true"/>
              </button>
            ) : null}
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={moduleId}>Módulo</label>
          <div className={styles.selectShell}>
            <select id={moduleId} value={module} onChange={event => setModule(event.target.value)}>
              <option value="all">Todos los módulos</option>
              {modules.map(key => <option value={key} key={key}>{MODULE_LABELS[key] || key}</option>)}
            </select>
            <ChevronDown size={17} aria-hidden="true"/>
          </div>
        </div>
      </div>

      <nav className={styles.actions} aria-label="Accesos rápidos">
        {visible.map((action, index) => {
          const Icon = action.icon;
          return (
            <button type="button" data-ui-surface="control" key={`${action.label}-${action.to}`}
              className={`${styles.action} ${index === 0 && !query && module === 'all' ? styles.actionAccent : ''}`}
              onClick={() => action.to && onNavigate?.(action.to)}
              aria-label={action.label} disabled={!action.to}>
              <span className={styles.actionHex} aria-hidden="true">{Icon ? <Icon size={17}/> : null}</span>
              <span className={styles.actionLabel}>{action.label}</span>
              <ArrowUpRight size={16} className={styles.actionArrow} aria-hidden="true"/>
            </button>
          );
        })}
        {!filtered.length ? (
          <div className={styles.empty} role="status">
            <strong>Sin resultados</strong>
            <span>Prueba otro nombre o restablece los filtros.</span>
            <button type="button" data-ui-surface="control" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        ) : null}
      </nav>

      <div className={styles.footer}>
        <span className={styles.resultCount} role="status">
          Mostrando {visible.length} de {filtered.length}
        </span>
        {filtered.length > INITIAL_VISIBLE ? (
          <button type="button" data-ui-surface="control" className={styles.more}
            aria-expanded={isExpanded}
            onClick={() => setVisibleLimit(isExpanded ? INITIAL_VISIBLE : filtered.length)}>
            {isExpanded ? 'Ver menos' : `Ver ${hiddenCount} más`}
            {isExpanded ? <ChevronUp size={15} aria-hidden="true"/> : <ChevronDown size={15} aria-hidden="true"/>}
          </button>
        ) : null}
      </div>

      <div className={styles.preferences}>
        <button type="button" data-ui-surface="control" className={styles.preferencesToggle}
          aria-expanded={customizing} onClick={() => setCustomizing(previous => !previous)}>
          <SlidersHorizontal size={15} aria-hidden="true"/>
          Personalizar cantidad
          {customizing ? <ChevronUp size={15} aria-hidden="true"/> : <ChevronDown size={15} aria-hidden="true"/>}
        </button>
        {customizing ? (
          <div className={styles.rangeArea}>
            <div className={styles.rangeLabel}>
              <label htmlFor={rangeId}>Acciones visibles</label>
              <output htmlFor={rangeId}>{Math.min(visibleLimit, maxLimit)} de {maxLimit}</output>
            </div>
            <input id={rangeId} className={styles.range} type="range"
              min="1" max={maxLimit} step="1" value={Math.min(visibleLimit, maxLimit)}
              onChange={event => setVisibleLimit(Number(event.target.value))}
              aria-label="Número máximo de acciones visibles"
              style={{'--hex-progress': `${(Math.min(visibleLimit,maxLimit)-1)/Math.max(1,maxLimit-1)*100}%`}}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
