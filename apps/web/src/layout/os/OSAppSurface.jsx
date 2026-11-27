import {useEffect,useId,useRef,useState} from 'react';
import {ChevronDown, ChevronRight, Layers3, LayoutDashboard, ClipboardList, ShoppingCart, Truck, Users, Package, Wallet, FileText, BarChart3, Settings, ArrowLeftRight, CalendarDays, History, Factory, CreditCard, Receipt, Boxes} from 'lucide-react';
import {Link} from 'react-router-dom';
import {apiRequest} from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {SYSTEM_DOCK_APPS} from '../workspace-os/systemDockApps';
import {isProfileVisible,navigationGroups} from '../../data/navigation';
import {getActiveOSAppSection,getOSAppIdentity,getOSAppSections} from './workspaceAppIdentity';
import styles from './OSAppSurface.module.css';
import AppNavigationRail from './primitives/AppNavigationRail';

function sectionIcon(label){
 const key=label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const icons=[[/resumen|inicio|general/,LayoutDashboard],[/solicitud|tarea|orden/,ClipboardList],[/recepcion|entrega|envio/,Truck],[/proveedor|cliente|contacto|empleado|equipo/,Users],[/producto|catalogo/,Package],[/almacen|existencia/,Boxes],[/cobranza|tesoreria|presupuesto/,Wallet],[/pago|cobrar|caja/,CreditCard],[/factur|fiscal/,Receipt],[/reporte|indicador|inteligencia/,BarChart3],[/configuracion|preferencia/,Settings],[/devolucion|movimiento|transferencia/,ArrowLeftRight],[/agenda|calendario/,CalendarDays],[/historial|actividad/,History],[/produccion|manufactura/,Factory],[/compra|venta/,ShoppingCart]];
 return icons.find(([pattern])=>pattern.test(key))?.[1]||FileText;
}

/**
 * Module-local application chrome (level 1 area > level 2 application >
 * level 3 section > existing level 4 business page/list/detail).
 *
 * Uses the existing navigationGroups: no parallel route registry, no data
 * fetching and no authorization bypass. Business pages keep their CRUD/state.
 * Only rendered inside desktop OS windows; tablet/Pocket navigation is intact.
 */
export default function OSAppSurface({appKey,pathname,Icon,subtitle,children}){
  const [expanded,setExpanded]=useState(false);
  const [level,setLevel]=useState('section');
  const {user,offlineDemo}=useAuth();
  const scope=JSON.stringify([user?.id,user?.companyId||user?.company?.id,Boolean(offlineDemo)]);
  const [catalog,setCatalog]=useState(null);
  const catalogOpen=expanded&&level!=='section';
  useEffect(()=>{if(!catalogOpen)return;let alive=true;setCatalog(null);apiRequest('/modules/dashboard').then(result=>{if(alive)setCatalog({scope,enabled:new Map((result?.companyModules||[]).map(row=>[row.module?.key||row.moduleId,row.enabled]))});}).catch(()=>{if(alive)setCatalog({scope,error:true});});return()=>{alive=false;};},[scope,catalogOpen]);
  useEffect(()=>{setExpanded(false);},[scope]);
  const sectionsId=useId();
  const headerRef=useRef(null);
  const triggerRef=useRef(null);
  useEffect(()=>{setExpanded(false);},[pathname]);
  useEffect(()=>{if(!expanded)return;const close=e=>{if(!headerRef.current?.contains(e.target))setExpanded(false);};const escape=e=>{if(e.key==='Escape'){setExpanded(false);triggerRef.current?.focus();}};document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);};},[expanded]);
  const identity=getOSAppIdentity(appKey);
  const sections=getOSAppSections(appKey,navigationGroups);
  const active=getActiveOSAppSection(pathname,sections);
  const sectionName=active?.label||subtitle||'Vista general';
  const hasSections=sections.length>1;
  const railItems=hasSections?sections.map(section=>({id:section.to,to:section.to,label:section.label,Icon:sectionIcon(section.label)})):[];
  const available=catalog?.scope===scope&&!catalog.error&&catalog.enabled;
  const appGroups=available?navigationGroups.filter(group=>group.label!=='Principal').map(group=>({label:group.label,apps:group.children.filter(item=>{
    const enabled=catalog.enabled.get(item.moduleKey);
    return isProfileVisible(item)&&enabled!==false&&(enabled!==undefined||item.defaultVisible!==false);
  }).map(item=>({label:item.label,to:item.moduleKey==='compras'?'/compras/solicitudes':item.to||item.children?.[0]?.to})).filter(item=>item.to)})):[];
  const utilityGroups=['Productividad','Sistema'].map(label=>({label,apps:SYSTEM_DOCK_APPS.filter(app=>app.key!=='notifications'&&(label==='Sistema'?app.key==='settings':app.key!=='settings')).map(({label,to})=>({label,to}))}));
  const groups=[...appGroups,...utilityGroups].filter(group=>group.apps.length&&(level==='area'||group.label===identity.group));
  function toggleLevel(event,next){triggerRef.current=event.currentTarget;setExpanded(value=>level===next?!value:true);setLevel(next);}

  const productivityHome=['/agenda','/tareas','/mensajes','/aprobaciones','/directorio'].includes(pathname.split(/[?#]/)[0]);
  const designTokens={
    '--os-app-accent':identity.accent,
    '--os-app-tint':identity.tint,
    '--os-app-accent-ink':identity.accentInk,
  };

  return <section className={styles.surface} data-os-app-surface={identity.key}
    data-os-active-section={active?.to||pathname}
    data-os-surface-version="3"
    aria-label={`Espacio de ${identity.label}`} style={designTokens}>
    {(!productivityHome || hasSections) ? <header ref={headerRef} className={styles.identity}>
      <div className={styles.identityCopy}>
        <div className={styles.appIcon}>
          {Icon ? <Icon size={18} aria-hidden="true"/> : <Layers3 size={18} aria-hidden="true"/>}
        </div>
        <div className={styles.breadcrumb}>
          <button type="button" className={styles.area+' '+styles.crumbTrigger} aria-expanded={expanded&&level==='area'} aria-controls={expanded?sectionsId:undefined} onClick={event=>toggleLevel(event,'area')}><span>{identity.group}</span><ChevronDown size={13} aria-hidden="true"/></button>
          <ChevronRight size={13} aria-hidden="true"/>
          <button type="button" className={styles.appName+' '+styles.crumbTrigger} aria-expanded={expanded&&level==='app'} aria-controls={expanded?sectionsId:undefined} onClick={event=>toggleLevel(event,'app')}><span>{identity.label}</span><ChevronDown size={13} aria-hidden="true"/></button>
          <ChevronRight size={13} aria-hidden="true"/>
          {hasSections?<button type="button" className={styles.crumbTrigger} aria-controls={sectionsId} aria-expanded={expanded&&level==='section'} onClick={event=>toggleLevel(event,'section')} title={sectionName}><span>{sectionName}</span><ChevronDown size={15} aria-hidden="true"/></button>:<span className={styles.currentSection}>{sectionName}</span>}
        </div>
      </div>
      {hasSections ? <button type="button" className={styles.sectionToggle}
        aria-label={`Mostrar secciones de ${identity.label}`}
        aria-controls={sectionsId}
        aria-expanded={expanded&&level==='section'} onClick={event=>toggleLevel(event,'section')}>
        Secciones <span className={styles.count}>{sections.length}</span>
        <ChevronDown size={15} aria-hidden="true"/>
      </button> : null}
    {expanded ? <nav id={sectionsId}
      className={`${styles.sections} ${expanded ? styles.sectionsExpanded : ''}`}
      aria-label={level==='section'?`Secciones de ${identity.label}`:'Aplicaciones disponibles'} data-os-sections-count={sections.length}>
      {level!=='section'?<>
        {!available?<p className={styles.menuStatus} role="status">{catalog?.scope===scope&&catalog.error?'No se pudo consultar el catálogo.':'Consultando aplicaciones…'}</p>:null}
        {groups.map(group=><div key={group.label} className={styles.menuGroup}><strong>{group.label}</strong>{group.apps.map(app=><Link key={app.to} to={app.to} className={styles.sectionLink} onClick={()=>setExpanded(false)}>{app.label}</Link>)}</div>)}
      </>:sections.map(section=>{
        const selected=active?.to===section.to;
        return <Link key={section.to} to={section.to}
          className={`${styles.sectionLink} ${selected ? styles.selected : ''}`}
          aria-current={selected?'page':undefined}
          onClick={()=>setExpanded(false)}>
          {section.label}
        </Link>;
      })}
    </nav> : null}
    </header> : null}
    <div className={styles.appNavigationWorkspace} data-has-app-rail={hasSections?'true':'false'}>
      {hasSections?<AppNavigationRail items={railItems} active={active?.to} label={`Navegación de ${identity.label}`}/>:null}
    <div className={styles.body} data-os-app-page="true" data-messenger-workspace={pathname.split(/[?#]/)[0]==='/mensajes'?'true':undefined}>
      {children}
    </div></div>
  </section>;
}
