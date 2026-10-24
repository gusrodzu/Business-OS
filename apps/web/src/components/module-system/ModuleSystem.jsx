import {X, Search, SlidersHorizontal, Columns3, FileText, Info, CheckCircle2} from 'lucide-react';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {Link,useLocation} from 'react-router-dom';
import {EntityDrawer, PageHeader, SmartTable} from '../../ux-foundation/UXFoundation';
import styles from './ModuleSystem.module.css';

export function ModuleHeader({eyebrow,title,description,status,actions,children}){
  const location=useLocation();
  return <div className={styles.moduleHeaderV19} data-ux-v19="module-header">
    <PageHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
      status={status}
      actions={actions}
      favorite={{path:location.pathname,label:title}}
    />
    {children?<div className={styles.headerChildren}>{children}</div>:null}
  </div>;
}

export function ModuleTabs({items=[],active,onChange,inline=false,label='Navegación interna'}){
  const [target,setTarget]=useState(null);

  useEffect(()=>{
    if(inline)return undefined;
    // The tabs slot belongs to the page shell (an external DOM surface).
    // Subscribe to its appearance instead of synchronously setting state
    // during the effect, which triggers cascading renders in React 19.
    let active=true;
    const findTarget=()=>document.getElementById('module-local-tabs');
    const observer=new MutationObserver(()=>{
      const next=findTarget();
      setTarget(current=>current===next?current:next);
    });
    observer.observe(document.body,{childList:true,subtree:true});
    // The observer callback handles late-mounted page shells too.
    queueMicrotask(()=>{
      if(!active)return;
      const next=findTarget();
      setTarget(current=>current===next?current:next);
    });
    return ()=>{active=false;observer.disconnect();};
  },[inline]);

  const content=<nav className={styles.tabs} aria-label={label} data-module-local-tabs="true" data-ux-v19="module-tabs" role="tablist">
    {items.map(item=>{
      const Icon=item.icon;
      const selected=item.id===active;
      if(item.to){
        return <Link key={item.id} to={item.to} className={selected?styles.tabActive:styles.tab} aria-current={selected?'page':undefined} role="tab" aria-selected={selected}>
          {Icon?<Icon size={16}/>:null}<span>{item.label}</span>
          {item.count!==undefined?<b>{item.count}</b>:null}
        </Link>;
      }
      return <button type="button" key={item.id} onClick={()=>onChange?.(item.id)} className={selected?styles.tabActive:styles.tab} aria-current={selected?'page':undefined} role="tab" aria-selected={selected}>
        {Icon?<Icon size={16}/>:null}<span>{item.label}</span>
        {item.count!==undefined?<b>{item.count}</b>:null}
      </button>;
    })}
  </nav>;

  if(inline)return content;
  return target?createPortal(content,target):null;
}

export function ModuleToolbar({
  title,description,query,onQueryChange,placeholder='Buscar…',
  filtersLabel='Filtros',columnsLabel='Columnas',actions,children
}){
  return <div className={styles.toolbar} data-ux-v19="module-toolbar">
    <div className={styles.toolbarCopy}>
      {title?<h2>{title}</h2>:null}
      {description?<p>{description}</p>:null}
    </div>
    <div className={styles.toolbarActions}>
      {query!==undefined?<label className={styles.search}>
        <Search size={16}/>
        <input value={query} onChange={e=>onQueryChange?.(e.target.value)} placeholder={placeholder}/>
      </label>:null}
      {children}
      {filtersLabel?<button type="button" className={styles.utilityButton} disabled title="Los filtros avanzados se habilitan cuando el módulo los define"><SlidersHorizontal size={15}/>{filtersLabel}</button>:null}
      {columnsLabel?<button type="button" className={styles.utilityButton} disabled title="La selección de columnas se habilita cuando la tabla la define"><Columns3 size={15}/>{columnsLabel}</button>:null}
      {actions}
    </div>
  </div>;
}

export function DataTableFrame({children,empty,footer}){
  return <div className={styles.tableBridgeV19} data-bb-table-frame data-ux-v19="smart-table-bridge">
    <div className={styles.tableBridgeScrollerV19} data-bb-table-scroller>
      <SmartTable empty={typeof empty==='string'?empty:undefined} footer={footer}>
        {children}
        {empty&&typeof empty!=='string'?<div className={styles.empty}>{empty}</div>:null}
      </SmartTable>
    </div>
  </div>;
}

export function AttentionPanel({title='Requiere atención',description,icon:Icon,children,className=''}) {
  return <section className={`${styles.attentionPanel} ${className}`}>
    <header>
      <div><h2>{title}</h2>{description?<p>{description}</p>:null}</div>
      {Icon?<Icon size={20}/>:null}
    </header>
    <div className={styles.attentionBody}>{children}</div>
  </section>;
}

export function RecordModal({
  open,onClose,title,subtitle,tabs=[],activeTab,onTabChange,children,footer,size='md',
  eyebrow='Detalle',icon:Icon=FileText,status,meta=[]
}){
  if(!open)return null;
  return <div className={styles.drawerLayer}>
    <button type="button" className={styles.drawerBackdrop} aria-label="Cerrar modal" onClick={onClose}/>
    <section
      className={`${styles.drawer} ${size==='lg'?styles.modalLarge:size==='sm'?styles.modalSmall:''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title||'Detalle'}
    >
      <header className={styles.recordModalHeader}>
        <div className={styles.recordModalIdentity}>
          <span className={styles.recordModalIcon}><Icon size={23}/></span>
          <div className={styles.recordModalCopy}>
            <span className={styles.recordModalEyebrow}>{eyebrow}</span>
            <strong>{title}</strong>
            {subtitle?<span className={styles.recordModalSubtitle}>{subtitle}</span>:null}
            {meta?.length?<div className={styles.recordModalMeta}>{meta.filter(Boolean).map((item,index)=><span key={`${item}-${index}`}>{item}</span>)}</div>:null}
          </div>
        </div>
        <div className={styles.recordModalHeaderActions}>
          {status?<div className={styles.recordModalStatus}>{status}</div>:null}
          <button type="button" className={styles.recordModalClose} onClick={onClose} aria-label="Cerrar"><X size={19}/></button>
        </div>
      </header>
      {tabs.length?<ModuleTabs items={tabs} active={activeTab} onChange={onTabChange} inline label="Pestañas del modal"/>:null}
      <div className={styles.drawerBody}>{children}</div>
      {footer?<footer className={styles.drawerFooter}>{footer}</footer>:null}
    </section>
  </div>;
}


export function ModalSection({title,icon:Icon=Info,description,children,className=''}) {
  return <section className={`${styles.modalSection} ${className}`}>
    {(title||description)?<header className={styles.modalSectionHeader}>
      {Icon?<span className={styles.modalSectionIcon}><Icon size={17}/></span>:null}
      <div>{title?<h3>{title}</h3>:null}{description?<p>{description}</p>:null}</div>
    </header>:null}
    <div className={styles.modalSectionBody}>{children}</div>
  </section>;
}

export function ModalInfoGrid({items=[],columns=2}) {
  return <dl className={styles.modalInfoGrid} style={{'--modal-info-columns':columns}}>
    {items.filter(Boolean).map((item,index)=><div key={item.key||item.label||index}>
      <dt>{item.label}</dt>
      <dd>{item.value??'—'}</dd>
    </div>)}
  </dl>;
}

export function ModalNote({title,children,tone='neutral',icon:Icon}) {
  return <div className={`${styles.modalNote} ${styles[`modalNote_${tone}`]||''}`}>
    {Icon?<Icon size={18}/>:tone==='success'?<CheckCircle2 size={18}/>:null}
    <div>{title?<strong>{title}</strong>:null}<p>{children}</p></div>
  </div>;
}

export function ModalFormSection({title,description,children}) {
  return <section className={styles.modalFormSection}>
    {(title||description)?<header><div>{title?<h3>{title}</h3>:null}{description?<p>{description}</p>:null}</div></header>:null}
    <div className={styles.modalFormSectionBody}>{children}</div>
  </section>;
}

/* v19.2 compatibility bridge:
   Existing modules keep the DetailDrawer API while rendering the canonical
   contextual EntityDrawer. Form modals continue using RecordModal. */
export function DetailDrawer({meta=[],icon:Icon,size:_size,...props}){
  return <EntityDrawer {...props}>
    {meta?.length?<div className={styles.drawerMetaV19}>{meta.filter(Boolean).map((item,index)=><span key={`${item}-${index}`}>{item}</span>)}</div>:null}
    {props.children}
  </EntityDrawer>;
}
