import styles from './Textarea.module.css';
export function Textarea({label,hint,error,id,className='',...props}) {
  const controlId=id||props.name;
  return <label className={`${styles.field} ${className}`.trim()} htmlFor={controlId} data-bb-textarea-field>
    {label?<span className={styles.label}>{label}</span>:null}
    <textarea id={controlId} className={`${styles.control} ${error?styles.hasError:''}`.trim()} aria-invalid={Boolean(error)} {...props}/>
    {error?<span className={styles.error}>{error}</span>:hint?<span className={styles.hint}>{hint}</span>:null}
  </label>;
}
