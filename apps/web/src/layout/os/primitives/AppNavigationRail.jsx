import {Link} from 'react-router-dom';
import styles from './AppNavigationRail.module.css';

/** App-local navigation. Route authorization and view state stay with the owner. */
export default function AppNavigationRail({items,active,onChange,onNavigate,label='Navegación de la aplicación'}){
  if(!items?.length)return null;
  return <nav className={styles.rail} data-app-navigation-rail="true" aria-label={label}>
    {items.map(({id,label:text,Icon,to,disabled})=>{
      const selected=active===id;
      const content=<><Icon size={22} aria-hidden="true"/><span>{text}</span></>;
      return to&&!disabled?<Link key={id} to={to} title={text} aria-label={text} aria-current={selected?'page':undefined} onClick={onNavigate} className={styles.item}>{content}</Link>:<button key={id} type="button" title={text} aria-label={text} aria-pressed={selected} disabled={disabled} onClick={()=>onChange?.(id)} className={styles.item}>{content}</button>;
    })}
  </nav>;
}

/** Local views with existing page markup, including forms and dialogs. */
export function AppNavigationLayout({items,active,onChange,onNavigate,label,children}){
 return <div className={styles.layout} data-app-navigation-layout="true">
  <AppNavigationRail items={items} active={active} onChange={onChange} onNavigate={onNavigate} label={label}/>
  <div className={styles.content}>{children}</div>
 </div>;
}
