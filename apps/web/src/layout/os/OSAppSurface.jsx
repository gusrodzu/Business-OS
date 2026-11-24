import {useState} from 'react';
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
  const identity=getOSAppIdentity(appKey);
  const sections=getOSAppSections(appKey,navigationGroups);
  const active=getActiveOSAppSection(pathname,sections);
  const sectionName=active?.label||subtitle||'Vista general';
  const hasSections=sections.length>1;
  const calendarHome=pathname.split(/[?#]/)[0]==='/agenda';
  const designTokens={
    '--os-app-accent':identity.accent,
    '--os-app-tint':identity.tint,
    '--os-app-accent-ink':identity.accentInk,
  };

  return <section className={styles.surface} data-os-app-surface={identity.key}
    data-os-active-section={active?.to||pathname}
    aria-label={`Espacio de ${identity.label}`} style={designTokens}>
    {!calendarHome ? <header className={styles.identity}>
      <div className={styles.identityCopy}>
        <div className={styles.appIcon}>
          {Icon ? <Icon size={18} aria-hidden="true"/> : <Layers3 size={18} aria-hidden="true"/>}
        </div>
        <div className={styles.breadcrumb}>
          <span className={styles.area}>{identity.group}</span>
          <ChevronRight size={13} aria-hidden="true"/>
          <strong className={styles.appName}>{identity.label}</strong>
          <ChevronRight size={13} aria-hidden="true"/>
          <span className={styles.currentSection}>{sectionName}</span>
        </div>
      </div>
      {hasSections ? <button type="button" className={styles.sectionToggle}
        aria-label={`Mostrar secciones de ${identity.label}`}
        aria-controls={`os-app-sections-${identity.key}`}
        aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>
        Secciones <span className={styles.count}>{sections.length}</span>
        <ChevronDown size={15} aria-hidden="true"/>
      </button> : null}
    </header> : null}
    {hasSections ? <nav id={`os-app-sections-${identity.key}`}
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
    <div className={styles.body} data-os-app-page="true">
      {children}
    </div>
  </section>;
}
