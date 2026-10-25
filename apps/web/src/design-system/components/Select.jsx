import {useId} from 'react';
import {ChevronDown} from 'lucide-react';
import styles from './Select.module.css';

export function Select({label, hint, error, id, className = '', children, ...props}) {
  const generatedId = useId();
  const selectId = id || props.name || generatedId;
  const guidanceId = (error || hint) ? `${selectId}-guidance` : undefined;
  const describedBy = [props['aria-describedby'], guidanceId].filter(Boolean).join(' ') || undefined;
  return (
    <label className={`${styles.field} ${className}`.trim()} htmlFor={selectId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={`${styles.control} ${error ? styles.hasError : ''}`}>
        <select id={selectId} {...props} aria-invalid={props['aria-invalid'] ?? (error ? true : undefined)} aria-describedby={describedBy}>{children}</select>
        <ChevronDown size={18} aria-hidden="true" />
      </span>
      {error ? <span id={guidanceId} className={styles.error}>{error}</span> : hint ? <span id={guidanceId} className={styles.hint}>{hint}</span> : null}
    </label>
  );
}
