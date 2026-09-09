import {ChevronDown} from 'lucide-react';
import styles from './Select.module.css';

export function Select({label, hint, error, id, className = '', children, ...props}) {
  const selectId = id || props.name;
  return (
    <label className={`${styles.field} ${className}`.trim()} htmlFor={selectId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={`${styles.control} ${error ? styles.hasError : ''}`}>
        <select id={selectId} {...props}>{children}</select>
        <ChevronDown size={18} aria-hidden="true" />
      </span>
      {error ? <span className={styles.error}>{error}</span> : hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
}
