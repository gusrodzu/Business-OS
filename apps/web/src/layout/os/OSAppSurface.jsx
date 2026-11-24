import {useEffect,useId,useRef,useState} from 'react';
import {ChevronDown, ChevronRight, Layers3} from 'lucide-react';
import {Link} from 'react-router-dom';
import {navigationGroups} from '../../data/navigation';
import {getActiveOSAppSection,getOSAppIdentity,getOSAppSections} from './workspaceAppIdentity';
import styles from './OSAppSurface.module.css';

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
          <span className={styles.area}>{identity.group}</span>
          <ChevronRight size={13} aria-hidden="true"/>
          <strong className={styles.appName}>{identity.label}</strong>
          <ChevronRight size={13} aria-hidden="true"/>
          {hasSections?<button ref={triggerRef} type="button" className={styles.crumbTrigger} aria-controls={sectionsId} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)} title={sectionName}><span>{sectionName}</span><ChevronDown size={15} aria-hidden="true"/></button>:<span className={styles.currentSection}>{sectionName}</span>}
        </div>
      </div>
      {hasSections ? <button type="button" className={styles.sectionToggle}
        aria-label={`Mostrar secciones de ${identity.label}`}
        aria-controls={sectionsId}
        aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>
        Secciones <span className={styles.count}>{sections.length}</span>
        <ChevronDown size={15} aria-hidden="true"/>
      </button> : null}
    {hasSections && expanded ? <nav id={sectionsId}
      className={`${styles.sections} ${expanded ? styles.sectionsExpanded : ''}`}
      aria-label={`Secciones de ${identity.label}`} data-os-sections-count={sections.length}>
      {sections.map(section=>{
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
    <div className={styles.body} data-os-app-page="true" data-messenger-workspace={pathname.split(/[?#]/)[0]==='/mensajes'?'true':undefined}>
      {children}
    </div>
  </section>;
}
