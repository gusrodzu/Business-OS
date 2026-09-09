import styles from './Tabs.module.css';
export function Tabs({items=[], value, onChange, ariaLabel='Pestañas', className=''}){
  return <div className={`${styles.tabs} ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
    {items.map(item=>{const selected=item.id===value; const Icon=item.icon; return <button key={item.id} type="button" role="tab" aria-selected={selected} tabIndex={selected?0:-1} className={selected?styles.active:styles.tab} onClick={()=>onChange?.(item.id)}>{Icon?<Icon size={18} aria-hidden="true"/>:null}<span>{item.label}</span>{item.count!==undefined?<b>{item.count}</b>:null}</button>})}
  </div>
}
