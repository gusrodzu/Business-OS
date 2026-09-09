import {Check} from 'lucide-react';
import styles from './Checkbox.module.css';

export function Checkbox({checked = false, onChange, label, description, disabled = false, id, className = '', ...props}) {
  const inputId = id || props.name;
  return (
    <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className}`.trim()} htmlFor={inputId}>
      <span className={`${styles.box} ${checked ? styles.checked : ''}`} aria-hidden="true">
        {checked ? <Check size={16} strokeWidth={3} /> : null}
      </span>
      <input
        id={inputId}
        className={styles.native}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked, event)}
        {...props}
      />
      {label || description ? <span className={styles.copy}>{label ? <strong>{label}</strong> : null}{description ? <small>{description}</small> : null}</span> : null}
    </label>
  );
}
