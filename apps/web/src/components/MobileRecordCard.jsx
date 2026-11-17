import {ChevronRight} from 'lucide-react';
import styles from './MobileRecordCard.module.css';

/** Reusable, read-only record summary; the parent owns all actions and permissions. */
export default function MobileRecordCard({title,subtitle,status,fields=[],onOpen,openLabel,actions}){
  return <article className={styles.card}>
    <header className={styles.header}>
      <button type="button" className={styles.open} onClick={onOpen} aria-label={openLabel||`Ver detalle de ${title}`}>
        <strong>{title}</strong>
        {subtitle?<span>{subtitle}</span>:null}
        <ChevronRight aria-hidden="true" size={18}/>
      </button>
      {status?<div className={styles.status}>{status}</div>:null}
    </header>
    <dl className={styles.fields}>
      {fields.map(({label,value})=><div key={label} className={styles.field}><dt>{label}</dt><dd>{value??'—'}</dd></div>)}
    </dl>
    {actions?<footer className={styles.actions}>{actions}</footer>:null}
  </article>;
}
