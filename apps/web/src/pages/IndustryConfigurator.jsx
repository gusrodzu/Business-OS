import {useEffect,useMemo,useState} from 'react';
import {apiRequest} from '../api';
import styles from './IndustryConfigurator.module.css';

export default function IndustryConfigurator(){
 const [profiles,setProfiles]=useState([]);
 const [selected,setSelected]=useState([]);
 const [query,setQuery]=useState('');
 const [sector,setSector]=useState('all');
 const [result,setResult]=useState(null);
 const [rules,setRules]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState(false);
 const [offline,setOffline]=useState(false);
 const ordered=useMemo(()=>selected.map(slug=>profiles.find(profile=>profile.slug===slug)).filter(Boolean),[selected,profiles]);
 const sectors=useMemo(()=>[...new Set(profiles.map(profile=>profile.sector))].sort(),[profiles]);
 const filtered=useMemo(()=>profiles.filter(profile=>(sector==='all'||profile.sector===sector)&&`${profile.name} ${profile.slug} ${profile.sector}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'))),[profiles,sector,query]);
 useEffect(()=>{
  let active=true;
  Promise.all([apiRequest('/industries/profiles'),apiRequest('/industries/company')])
   .then(([catalog,current])=>{if(!active)return;setProfiles(catalog.profiles||[]);setSelected((current.activities||[]).map(x=>x.activityKey));})
   .catch(()=>{if(active){setMessage('No se pudo cargar el catálogo. Revisa tu sesión o conexión.');setError(true);setOffline(true);}})
   .finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[]);
 function toggle(slug){
  setResult(null);setRules(null);setMessage('');setError(false);
  setSelected(current=>current.includes(slug)?current.filter(key=>key!==slug):current.length<30?[...current,slug]:current);
 }
 function makePrimary(slug){
  setResult(null);setMessage('');setError(false);
  setSelected(current=>current.includes(slug)?[slug,...current.filter(key=>key!==slug)]:current);
 }
 async function recommend(){
  setBusy(true);setMessage('');setError(false);
  try{const recommendation=await apiRequest('/industries/recommend',{method:'POST',body:{activities:selected}});setResult(recommendation.recommendation);try{const configuration=await apiRequest('/industries/rules/preview',{method:'POST',body:{activities:selected}});setRules(configuration.configuration)}catch{setRules(null);setMessage('Los flujos especializados no están disponibles en este entorno; se muestran las recomendaciones de módulos.')}}
  catch(err){setMessage(err.message||'No se pudieron obtener recomendaciones');setError(true)}
  finally{setBusy(false)}
 }
 async function save(){
  setSaving(true);setMessage('');setError(false);
  try{await apiRequest('/industries/company',{method:'PUT',body:{activities:selected}});setMessage('Giros guardados correctamente. No se activaron módulos ni licencias.')}
  catch(err){setMessage(err.message||'No se pudo guardar la selección');setError(true)}
  finally{setSaving(false)}
 }
 return <section className={styles.page}>
  <header className={styles.header}>
   <span className={styles.eyebrow}>BUSINESS OS / CONFIGURACIÓN EMPRESARIAL</span>
   <h1>Tipos de empresa y actividades</h1>
   <p>Elige el giro principal y agrega todas las actividades secundarias de tu empresa. Las recomendaciones no cambian permisos ni licencias.</p>
  </header>
  {message&&<p role="status" className={error?styles.error:styles.notice}>{message}</p>}
  {loading?<p>Cargando catálogo…</p>:<>
   <div className={styles.layout}>
    <div>
     <div className={styles.toolbar}>
      <label>Buscar giro<input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Ej. refaccionaria, taller, restaurante"/></label>
      <label>Sector<select value={sector} onChange={event=>setSector(event.target.value)}><option value="all">Todos los sectores</option>{sectors.map(code=><option key={code} value={code}>Sector {code}</option>)}</select></label>
     </div>
     <p className={styles.counter}>{filtered.length} giros disponibles · {selected.length} seleccionados (máximo 30)</p>
     <div className={styles.grid}>{filtered.map(profile=><label key={profile.slug} className={styles.card}>
      <input type="checkbox" checked={selected.includes(profile.slug)} disabled={!selected.includes(profile.slug)&&selected.length>=30} onChange={()=>toggle(profile.slug)}/>
      <strong>{profile.name}</strong><span>Sector {profile.sector}</span>
      {selected[0]===profile.slug&&<small className={styles.primaryTag}>Giro principal</small>}
     </label>)}</div>
     {!filtered.length&&<p className={styles.empty}>No encontramos giros con estos filtros.</p>}
    </div>
    <aside className={styles.sidebar}>
     <h2>Configuración de la empresa</h2>
     <p>El primer giro es el principal. Puedes cambiarlo sin perder los secundarios.</p>
     {ordered.length?ordered.map((profile,index)=><div className={styles.selectedItem} key={profile.slug}>
      <div><strong>{profile.name}</strong><small>{index===0?'Principal':'Secundario'}</small></div>
      <div className={styles.itemActions}>{index>0&&<button type="button" onClick={()=>makePrimary(profile.slug)}>Hacer principal</button>}<button type="button" aria-label={`Quitar ${profile.name}`} onClick={()=>toggle(profile.slug)}>Quitar</button></div>
     </div>):<p className={styles.empty}>Selecciona al menos un giro.</p>}
     <div className={styles.actions}><button type="button" onClick={recommend} disabled={!selected.length||offline||busy||saving}>{busy?'Calculando…':'Ver recomendaciones'}</button><button type="button" onClick={save} disabled={!selected.length||offline||saving||busy}>{saving?'Guardando…':'Guardar configuración'}</button></div>
     <p className={styles.hint}>Guardar no activa módulos de pago ni modifica permisos.</p>
     {(selected.includes('refaccionaria')||selected.includes('taller_automotriz'))&&<p><a href="/configuracion/giros/automotriz-demo">Abrir operaciones automotrices (demo offline) →</a></p>}
    </aside>
   </div>
   {result&&<section className={styles.panel} aria-label="Recomendaciones"><h2>Módulos sugeridos</h2>
    <div className={styles.chips}>{result.suggestedModules.length?result.suggestedModules.map(key=><span key={key}>{key}</span>):<p>No hay módulos disponibles para estos giros.</p>}</div>
    {!!result.unavailableModules?.length&&<p>Módulos no registrados: {result.unavailableModules.join(', ')}</p>}
    <h3>Capacidades especializadas</h3><div className={styles.chips}>{result.capabilities?.length?result.capabilities.map(key=><span key={key}>{key.replaceAll('_',' ')}</span>):<p>Sin capacidades adicionales configuradas.</p>}</div>
    <p className={styles.hint}>Esta es una recomendación informativa; no activa licencias, módulos ni permisos.</p>
    {rules&&<><h3>Flujos por industria ({rules.rules.length})</h3><div className={styles.ruleGrid}>{rules.rules.map(rule=><article className={styles.ruleCard} key={rule.key}><strong>{rule.key.replaceAll('_',' ')}</strong><span>Módulo: {rule.module} · Proceso: {rule.workflow.replaceAll('_',' ')}</span>{rule.restricted&&<small>Requiere controles de acceso específicos</small>}<small>Origen: {rule.sourceActivities.join(', ')}</small></article>)}</div></>}
   </section>}
  </>}
 </section>;
}
