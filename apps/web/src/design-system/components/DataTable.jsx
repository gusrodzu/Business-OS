import styles from './DataTable.module.css';
export function DataTable({children,className='',stickyHeader=false,compact=false,ariaLabel}){return <div className={`${styles.frame} ${compact?styles.compact:''} ${className}`.trim()} data-md3-table><div className={styles.scroller}><table className={stickyHeader?styles.sticky:''} aria-label={ariaLabel}>{children}</table></div></div>}
