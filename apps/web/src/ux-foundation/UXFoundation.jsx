import {useEffect, useState} from 'react';
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Inbox,
  Search,
  Star,
  X,
} from 'lucide-react';
import styles from './UXFoundation.module.css';

const FAVORITES_KEY = 'buzzbee.ux.favorites';

function readFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch { return []; }
}

function writeFavorites(items) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('buzzbee:favorites-changed', {detail: items}));
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  actions,
  status,
  favorite,
}) {
  const [isFavorite, setIsFavorite] = useState(() => favorite?.path ? readFavorites().some((item) => item.path === favorite.path) : false);

  useEffect(() => {
    setIsFavorite(favorite?.path ? readFavorites().some((item) => item.path === favorite.path) : false);
  }, [favorite?.path]);

  function toggleFavorite() {
    if (!favorite?.path) return;
    const current = readFavorites();
    const exists = current.some((item) => item.path === favorite.path);
    const next = exists
      ? current.filter((item) => item.path !== favorite.path)
      : [{label: favorite.label || title, path: favorite.path, icon: favorite.icon || null}, ...current].slice(0, 8);
    writeFavorites(next);
    setIsFavorite(!exists);
  }

  return (
    <header className={styles.pageHeader} data-ux-v19="page-header">
      <div className={styles.pageHeaderMain}>
        {breadcrumbs.length ? (
          <nav className={styles.breadcrumbs} aria-label="Ruta de navegación">
            {breadcrumbs.map((item, index) => (
              <span key={`${item}-${index}`}>{index ? <ChevronRight size={12}/> : null}{item}</span>
            ))}
          </nav>
        ) : eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <div className={styles.titleRow}>
          <h1>{title}</h1>
          {favorite?.path ? (
            <button type="button" className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`} onClick={toggleFavorite} title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'} aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
              <Star size={17} fill={isFavorite ? 'currentColor' : 'none'}/>
            </button>
          ) : null}
        </div>
        {description ? <p>{description}</p> : null}
      </div>
      <div className={styles.pageHeaderSide}>
        {status ? <div className={styles.headerStatus}>{status}</div> : null}
        {actions ? <div className={styles.headerActions}>{actions}</div> : null}
      </div>
    </header>
  );
}

export function FilterBar({query, onQueryChange, placeholder='Buscar…', chips=[], children, onClear}) {
  const active = chips.filter((chip) => chip.active);
  return (
    <section className={styles.filterBar} data-ux-v19="filter-bar">
      <label className={styles.searchBox}>
        <Search size={17}/>
        <input value={query ?? ''} onChange={(event) => onQueryChange?.(event.target.value)} placeholder={placeholder}/>
        {query ? <button type="button" onClick={() => onQueryChange?.('')} aria-label="Limpiar búsqueda"><X size={15}/></button> : null}
      </label>
      <div className={styles.filterControls}>{children}</div>
      {active.length ? (
        <div className={styles.activeFilters}>
          {active.map((chip) => (
            <button type="button" key={chip.id} onClick={chip.onRemove} className={styles.filterChip}>
              <span>{chip.label}</span><X size={13}/>
            </button>
          ))}
          {onClear ? <button type="button" className={styles.clearFilters} onClick={onClear}>Limpiar filtros</button> : null}
        </div>
      ) : null}
    </section>
  );
}

export function SavedViews({items=[], active, onChange}) {
  return (
    <div className={styles.savedViews} role="tablist" aria-label="Vistas guardadas">
      {items.map((item) => (
        <button type="button" role="tab" aria-selected={active === item.id} className={active === item.id ? styles.savedViewActive : styles.savedView} key={item.id} onClick={() => onChange?.(item.id)}>
          {item.icon ? <item.icon size={14}/> : null}<span>{item.label}</span>{item.count != null ? <b>{item.count}</b> : null}
        </button>
      ))}
    </div>
  );
}

export function BulkActionsBar({count=0, children, onClear}) {
  if (!count) return null;
  return (
    <div className={styles.bulkBar} data-ux-v19="bulk-actions">
      <strong>{count} seleccionado{count === 1 ? '' : 's'}</strong>
      <div>{children}</div>
      {onClear ? <button type="button" onClick={onClear}>Cancelar</button> : null}
    </div>
  );
}

export function SmartTable({children, selectedCount=0, footer, empty}) {
  return (
    <section className={styles.smartTable} data-ux-v19="smart-table" data-selected={selectedCount ? 'true' : 'false'}>
      <div className={styles.tableScroller} tabIndex={0} role="region" aria-label="Tabla de datos; desliza horizontalmente para ver todas las columnas">{children}</div>
      {empty ? <EmptyState compact title={empty} /> : null}
      {footer ? <footer className={styles.smartTableFooter}>{footer}</footer> : null}
    </section>
  );
}

export function EntityDrawer({open, onClose, title, subtitle, eyebrow='Detalle', status, actions, tabs=[], activeTab, onTabChange, children, footer}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.drawerLayer} data-ux-v19="entity-drawer">
      <button type="button" className={styles.drawerBackdrop} onClick={onClose} aria-label="Cerrar detalle"/>
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={title || 'Detalle'}>
        <header className={styles.drawerHeader}>
          <div>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <div className={styles.drawerHeaderActions}>{status}{actions}<button type="button" onClick={onClose} aria-label="Cerrar"><X size={19}/></button></div>
        </header>
        {tabs.length ? <nav className={styles.drawerTabs}>{tabs.map((tab) => <button type="button" key={tab.id} className={activeTab === tab.id ? styles.drawerTabActive : ''} onClick={() => onTabChange?.(tab.id)}>{tab.label}{tab.count != null ? <b>{tab.count}</b> : null}</button>)}</nav> : null}
        <div className={styles.drawerBody}>{children}</div>
        {footer ? <footer className={styles.drawerFooter}>{footer}</footer> : null}
      </aside>
    </div>
  );
}

export function PageSkeleton({rows=4}) {
  return <div className={styles.skeleton} aria-label="Cargando" role="status"><span/><span/><div>{Array.from({length: rows}).map((_, i) => <i key={i}/>)}</div></div>;
}

export function EmptyState({title='Todavía no hay información', description='Cuando haya datos aparecerán aquí.', action, compact=false, icon:Icon=Inbox}) {
  return <div className={`${styles.emptyState} ${compact ? styles.emptyCompact : ''}`}><span><Icon size={compact ? 20 : 26}/></span><div><strong>{title}</strong>{description ? <p>{description}</p> : null}</div>{action ? <button type="button" onClick={action.onClick}>{action.label}<ArrowRight size={14}/></button> : null}</div>;
}

export function NoResultsState({query, onClear}) {
  return <EmptyState title="No encontramos resultados" description={query ? `No hay coincidencias para “${query}”.` : 'Prueba con otros filtros.'} action={onClear ? {label:'Limpiar búsqueda', onClick:onClear} : null} icon={Search}/>;
}

export function InlineErrorState({message='Ocurrió un error.', onRetry}) {
  return <div className={styles.errorState}><AlertCircle size={20}/><div><strong>No pudimos completar esta acción</strong><p>{message}</p></div>{onRetry ? <button type="button" onClick={onRetry}>Reintentar</button> : null}</div>;
}


export function FormSection({title,description,children,actions}) {
  return <section className={styles.formSection} data-ux-v19="form-section"><header><div><h3>{title}</h3>{description?<p>{description}</p>:null}</div>{actions?<div>{actions}</div>:null}</header><div className={styles.formSectionBody}>{children}</div></section>;
}

export function StickyFormActions({children,status}) {
  return <footer className={styles.stickyFormActions} data-ux-v19="sticky-form-actions">{status?<span>{status}</span>:<span/>}<div>{children}</div></footer>;
}

export function ActivityTimeline({items=[],empty='Sin actividad registrada'}) {
  if(!items.length) return <EmptyState compact title={empty} description="Los cambios y eventos aparecerán aquí."/>;
  return <ol className={styles.timeline} data-ux-v19="activity-timeline">{items.map((item,index)=><li key={item.id||index}><span className={styles.timelineDot}/><div><strong>{item.title||item.action||'Actividad'}</strong>{item.description?<p>{item.description}</p>:null}<small>{item.meta||item.date||item.createdAt||''}</small></div></li>)}</ol>;
}

export function RelatedRecords({items=[],onOpen}) {
  return <div className={styles.relatedRecords} data-ux-v19="related-records">{items.length?items.map((item,index)=><button type="button" key={item.id||index} onClick={()=>onOpen?.(item)}><span>{item.type||'Relacionado'}</span><strong>{item.label||item.name||item.folio||item.id}</strong><ChevronRight size={15}/></button>):<EmptyState compact title="Sin registros relacionados" description="Las relaciones entre módulos aparecerán aquí."/>}</div>;
}
