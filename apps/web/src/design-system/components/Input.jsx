import {useId} from 'react';
import styles from './Input.module.css';

export function Input({
  label,
  hint,
  error,
  icon: Icon,
  id,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const guidanceId = (hint || error) ? `${inputId}-guidance` : undefined;
  const describedBy = [props['aria-describedby'], guidanceId].filter(Boolean).join(' ') || undefined;

  return (
    <label className={`${styles.field} ${className}`.trim()} htmlFor={inputId} data-bb-input-field>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={`${styles.control} ${error ? styles.hasError : ''}`} data-bb-input-shell>
        {Icon ? <Icon size={18} aria-hidden="true" /> : null}
        <input id={inputId} data-bb-input-control {...props} aria-invalid={props['aria-invalid'] ?? (error ? true : undefined)} aria-describedby={describedBy} />
      </span>
      {error ? (
        <span id={guidanceId} className={styles.error} role="alert">{error}</span>
      ) : hint ? (
        <span id={guidanceId} className={styles.hint}>{hint}</span>
      ) : null}
    </label>
  );
}
