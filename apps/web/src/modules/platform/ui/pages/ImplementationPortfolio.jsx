import {useMemo,useState} from 'react';
import {Building2,CheckCircle2,ClipboardCheck,Search,ShieldAlert} from 'lucide-react';
import styles from './ImplementationPortfolio.module.css';

export default function ImplementationPortfolio({data}){
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState('all');
  const [expanded,setExpanded]=useState(null);
  const companies=Array.isArray(data?.companies)?data.companies:[];
  const filtered=useMemo(()=>companies.filter(company=>{
    const matchesQuery=[company.name,company.industry,company.plan]
      .filter(Boolean).join(' ').toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'));
    const missing=company.readiness.completed < company.readiness.total;
    const matchesStatus=status==='all'
      || (status==='review' && missing)
      || (status==='configured' && !missing)
      || (status==='inactive' && !company.active);
    return matchesQuery && matchesStatus;
  }),[companies,query,status]);
  const toReview=companies.filter(company=>company.readiness.completed < company.readiness.total).length;
  const complete=companies.length-toReview;

  return <div className={styles.page} data-platform-implementation-portfolio="true">
    <div className={styles.notice} role="note">
      <ShieldAlert aria-hidden="true" size={19}/>
      <p><strong>Diagnóstico de empresas registradas.</strong> Este panel muestra información real de la plataforma,
      no prospectos ni empresas de Demo Local. Los indicadores reflejan configuración técnica observable; no representan
      una etapa comercial aprobada ni autorizan entrar a otros tenants. El seguimiento de implementación aún no tiene un estado persistido.</p>
    </div>

    <section className={styles.stats} aria-label="Resumen de preparación de implementaciones">
      <div className={styles.stat}><Building2 size={23} aria-hidden="true"/><strong>{companies.length}</strong><span>Empresas registradas</span></div>
      <div className={styles.stat}><ClipboardCheck size={23} aria-hidden="true"/><strong>{toReview}</strong><span>Con configuración por revisar</span></div>
      <div className={styles.stat}><CheckCircle2 size={23} aria-hidden="true"/><strong>{complete}</strong><span>Con cuatro señales completas</span></div>
    </section>

    <section aria-labelledby="implementation-list-title">
      <div className={styles.sectionHeading}>
        <div><h2 id="implementation-list-title">Preparación por empresa</h2>
          <p>Consulta datos registrados en el backend, asociados a cada tenant.</p></div>
        <span>{filtered.length} resultados</span>
      </div>
      <div className={styles.filters}>
        <label className={styles.search}>
          <Search size={17} aria-hidden="true"/>
          <span className={styles.srOnly}>Buscar por empresa, giro o plan</span>
          <input type="search" value={query} onChange={event=>setQuery(event.target.value)}
            placeholder="Buscar empresa, giro o plan"/>
        </label>
        <label className={styles.select}>
          <span>Revisión</span>
          <select value={status} onChange={event=>setStatus(event.target.value)}>
            <option value="all">Todas las empresas</option>
            <option value="review">Con pendientes técnicos</option>
            <option value="configured">Señales completas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </label>
      </div>

      <div className={styles.grid}>
        {filtered.map(company=>{
          const open=expanded===company.id;
          const missing=company.readiness.completed < company.readiness.total;
          return <article className={styles.company} key={company.id}>
            <div className={styles.companyHeader}>
              <span className={styles.icon}><Building2 aria-hidden="true" size={21}/></span>
              <span className={styles.state} data-review={missing?'needed':'complete'}>
                {missing?'Revisión técnica':'Señales completas'}
              </span>
            </div>
            <div className={styles.identity}>
              <h3>{company.name}</h3>
              <p>{company.industry || 'Sin giro registrado'}</p>
              <small>{company.active?'Cuenta activa':'Cuenta inactiva'} · {company.plan || 'Sin plan asociado'}</small>
            </div>
            <div className={styles.progress}>
              <span>Configuración observada</span>
              <strong>{company.readiness.completed}/{company.readiness.total}</strong>
              <div role="meter" aria-label={'Señales de configuración de '+company.name}
                aria-valuemin={0} aria-valuemax={company.readiness.total} aria-valuenow={company.readiness.completed}>
                <i style={{width:(100*company.readiness.completed/Math.max(1,company.readiness.total))+'%'}}/>
              </div>
            </div>
            <button type="button" className={styles.expand} aria-expanded={open}
              aria-controls={'implementation-detail-'+company.id} onClick={()=>setExpanded(open?null:company.id)}>
              {open?'Ocultar diagnóstico':'Ver diagnóstico'}
            </button>
            {open?<div className={styles.details} id={'implementation-detail-'+company.id}>
              <h4>Verificaciones existentes</h4>
              <ul className={styles.checks}>
                {company.readiness.checks.map(check=><li key={check.id}>
                  <span aria-hidden="true">{check.ready?'✓':'○'}</span>
                  <span>{check.label}</span>
                  <strong>{check.ready?'Registrado':'Pendiente'}</strong>
                </li>)}
              </ul>
              <h4>Módulos efectivamente habilitados ({company.enabledModules.length})</h4>
              <p>{company.enabledModules.length
                ? company.enabledModules.map(module=>module.name).join(' · ')
                : 'No existen módulos habilitados en la plataforma.'}</p>
              <h4>Recomendaciones del giro (no habilitadas por esta pantalla)</h4>
              <p>{company.recommendedModules.length
                ? company.recommendedModules.join(' · ')
                : 'Configurar un perfil de giro para consultar recomendaciones.'}</p>
              <p className={styles.meta}>{company.userCount} usuario(s) registrados ·
                {company.subscriptionStatus?' Suscripción '+company.subscriptionStatus:' Sin suscripción'} ·
                Sin etapa de onboarding persistida</p>
            </div>:null}
          </article>;
        })}
      </div>
      {!filtered.length?<div className={styles.empty} role="status">
        <Building2 size={26} aria-hidden="true"/>
        <h3>Sin empresas para estos filtros</h3>
        <p>{companies.length?'Modifica la búsqueda o el estado.':'La plataforma todavía no tiene empresas registradas.'}</p>
        {companies.length?<button type="button" onClick={()=>{setQuery('');setStatus('all')}}>Limpiar filtros</button>:null}
      </div>:null}
    </section>
  </div>;
}
