import {useMemo,useState} from 'react';
import {Building2,CheckCircle2,ClipboardList,Search,ShieldCheck,SlidersHorizontal} from 'lucide-react';
import {companyReadiness} from '../../domain/companyReadiness';
import styles from './CompanyReadinessBoard.module.css';

/**
 * Super Admin only: the parent PlatformAdmin verifies platform session + platform.manage
 * and receives tenants from the protected /platform-admin/companies endpoint.
 */
export default function CompanyReadinessBoard({companies=[]}){
  const [query,setQuery]=useState('');
  const [state,setState]=useState('all');
  const [selected,setSelected]=useState(null);
  const rows=useMemo(()=>companies.filter(c=>c&&c.id).map(companyReadiness),[companies]);
  const filtered=useMemo(()=>rows.filter(row=>{
    const matchesText=row.name.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'));
    const matchesState=state==='all'
      ||(state==='pending'&&row.complete<row.total)
      ||(state==='documented'&&row.complete===row.total)
      ||(state==='suspended'&&!row.active);
    return matchesText&&matchesState;
  }),[rows,query,state]);
  const current=rows.find(row=>row.id===selected)||null;
  const documented=rows.filter(row=>row.complete===row.total).length;
  const needsReview=rows.length-documented;

  return <section className={styles.board} aria-labelledby="readiness-board-title" data-company-readiness-board="real-tenant">
    <header className={styles.heading}>
      <div><span className={styles.eyebrow}>FASE 2 · SUPER ADMIN</span><h2 id="readiness-board-title">Preparación de empresas</h2><p>Datos reales de configuración existentes en la plataforma. Esta vista es de consulta: no crea tenants ni habilita módulos.</p></div>
      <span className={styles.readOnly}><ShieldCheck size={16} aria-hidden="true"/> Solo lectura</span>
    </header>
    <div className={styles.summary} aria-label="Cobertura del portafolio registrado">
      <div><Building2 size={20} aria-hidden="true"/><strong>{rows.length}</strong><span>Empresas registradas</span></div>
      <div><CheckCircle2 size={20} aria-hidden="true"/><strong>{documented}</strong><span>Con cuatro elementos documentados</span></div>
      <div><ClipboardList size={20} aria-hidden="true"/><strong>{needsReview}</strong><span>Con elementos por revisar</span></div>
    </div>
    <div className={styles.toolbar}>
      <label className={styles.search}><Search size={17} aria-hidden="true"/><span className={styles.visuallyHidden}>Buscar empresa</span><input type="search" placeholder="Buscar empresa registrada" value={query} onChange={e=>setQuery(e.target.value)} /></label>
      <label className={styles.filter}><SlidersHorizontal size={16} aria-hidden="true"/><span className={styles.visuallyHidden}>Estado de configuración</span><select value={state} onChange={e=>setState(e.target.value)}><option value="all">Todas las empresas</option><option value="pending">Configuración pendiente</option><option value="documented">Base documentada</option><option value="suspended">Empresas suspendidas</option></select></label>
      <span className={styles.resultCount} role="status">{filtered.length} resultados</span>
    </div>
    <div className={styles.companyGrid}>
      {filtered.map(row=><article className={styles.companyCard} key={row.id}>
        <div className={styles.companyTop}><strong>{row.name}</strong><span className={row.active?styles.active:styles.inactive}>{row.active?'Habilitada':'Suspendida'}</span></div>
        <p>{row.summary} · {row.complete}/{row.total} elementos</p>
        <div className={styles.progress} role="progressbar" aria-label={'Configuración registrada de '+row.name} aria-valuemin={0} aria-valuemax={row.total} aria-valuenow={row.complete}><span style={{width:String(row.complete/row.total*100)+'%'}}/></div>
        <button type="button" className={styles.inspect} onClick={()=>setSelected(row.id===selected?null:row.id)} aria-expanded={current?.id===row.id} aria-controls="company-readiness-detail">{current?.id===row.id?'Cerrar detalle':'Revisar configuración'}</button>
      </article>)}
    </div>
    {!filtered.length?<div className={styles.empty} role="status">No se encontraron empresas con esos filtros.</div>:null}
    {current?<section className={styles.details} id="company-readiness-detail" aria-label={'Configuración de '+current.name}>
      <div className={styles.detailHeading}><div><h3>{current.name}</h3><p>Verificaciones descriptivas, no un estado formal de onboarding ni autorización para acceder al ERP de la empresa.</p></div><button type="button" onClick={()=>setSelected(null)} aria-label={'Cerrar detalle de '+current.name}>Cerrar</button></div>
      <div className={styles.checkList}>
        {current.checks.map(check=><div key={check.id} className={styles.checkRow}>
          <span className={check.ready?styles.checkReady:styles.checkPending}>{check.ready?'Registrado':'Pendiente'}</span>
          <div><strong>{check.label}</strong><small>{check.detail}</small></div>
        </div>)}
      </div>
      {current.subscriptionStatus?<p className={styles.note}>Estado de suscripción existente: <strong>{current.subscriptionStatus}</strong>. No representa la fase de implementación.</p>:null}
    </section>:null}
    <p className={styles.footnote}>Importante: contar usuarios o módulos vinculados no confirma acceso, licencias efectivas, pruebas ni lanzamiento. El flujo formal prospecto → configuración → pruebas → activo se implementará por separado, con autorizaciones y auditoría.</p>
  </section>;
}
