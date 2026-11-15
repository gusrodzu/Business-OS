import {Search} from 'lucide-react';
import styles from './OSWorkspaceControls.module.css';

/**
 * OS-level presentational controls shared by Ventas, Existencias and Catálogo.
 * Business logic, permissions and filtering stay in each module.
 */
export function OSFilterRail({items = [], value, onChange, label, className = ''}) {
  return (
    <div className={[styles.filterRail, className].filter(Boolean).join(' ')}
      role="group" aria-label={label} data-os-filter-rail="true">
      {items.map(({id, label: text, count}) => (
        <button key={id} type="button" className={styles.filterChip}
          aria-pressed={value === id} onClick={() => onChange(id)}>
          {text}
          {count !== undefined && count !== null ? <span className={styles.filterCount}>{count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function OSWorkspaceSearch({
  value, onChange, placeholder, label, className = '',
}) {
  const accessibleLabel = label?.trim() || 'Buscar registros';
  return (
    <label className={[styles.search, className].filter(Boolean).join(' ')}
      data-os-workspace-search="true">
      <Search size={19} aria-hidden="true"/>
      <span className={styles.srOnly}>{accessibleLabel}</span>
      <input type="search" value={value ?? ''} placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}/>
    </label>
  );
}

export function OSWorkspaceSplit({children, mobileDetail = false, className = ''}) {
  return (
    <div className={[styles.split, className].filter(Boolean).join(' ')}
      data-os-workspace-split="true"
      data-mobile-detail={mobileDetail ? 'true' : 'false'}>
      {children}
    </div>
  );
}
