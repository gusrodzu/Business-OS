import {X} from 'lucide-react';
import styles from './Chip.module.css';

export function Chip({children, selected=false, tone='assist', icon:Icon, onRemove, className='', ...props}) {
  return <span className={`${styles.chip} ${styles[tone]||''} ${selected?styles.selected:''} ${className}`.trim()} {...props}>
    {Icon?<Icon size={16} aria-hidden="true"/>:null}<span>{children}</span>
    {onRemove?<button type="button" className={styles.remove} onClick={onRemove} aria-label={`Quitar ${typeof children==='string'?children:'elemento'}`}><X size={15}/></button>:null}
  </span>;
}
