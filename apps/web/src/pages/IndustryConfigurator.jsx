import {useEffect,useState} from 'react';
import {apiRequest} from '../api';
import styles from './IndustryConfigurator.module.css';

export default function IndustryConfigurator(){
 const [profiles,setProfiles]=useState([]);
 const [selected,setSelected]=useState([]);
 const [result,setResult]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState('');
 const [offline,setOffline]=useState(false);
 useEffect(()=>{
  let active=true;
  Promise.all([apiRequest('/industries/profiles'),apiRequest('/industries/company')])
   .then(([catalog,current])=>{if(!active)return;setProfiles(catalog.profiles||[]);setSelected((current.activities||[]).map(x=>x.activityKey));})
   .catch(()=>{if(active){setMessage('No se pudo cargar el catálogo. Comprueba tu sesión o conexión.');setOffline(true)}})
   .finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[]);
 const toggle=(slug)=>{setResult(null);setMessage('');setSelected(current=>current.includes(slug)?current.filter(x=>x!==slug):[...current,slug])};
 async function recommend(){
  try{setMessage('');const response=await apiRequest('/industries/recommend',{method:'POST',body:{activities:selected}});setResult(response.recommendation)}
  catch(error){setMessage(error.message||'No se pudieron obtener recomendaciones')}
 }
 async function save(){
  setSaving(true);setMessage('');
  try{await apiRequest('/industries/company',{method:'PUT',body:{activities:selected}});setMessage('Giros guardados. Los módulos no se activaron automáticamente.')}
  catch(error){setMessage(error.message||'No se pudo guardar la selección')}
  finally{setSaving(false)}
 }
 return <section className={styles.page}>
  <header className={styles.header}><div><span className={styles.eyebrow}>BUSINESS OS / INDUSTRIAS</span><h1>Configura los giros de tu empresa</h1><p>Selecciona varias actividades. Los módulos se recomiendan, pero las licencias se administran por separado.</p></div></header>
  {message&&<p role="status" className={styles.notice}>{message}</p>}
  {loading?<p>Cargando catálogo…</p>:<>
   <div className={styles.grid}>{profiles.map(profile=><label key={profile.slug} className={styles.card}><input type="checkbox" checked={selected.includes(profile.slug)} onChange={()=>toggle(profile.slug)}/><strong>{profile.name}</strong><span>Sector {profile.sector}</span></label>)}</div>
   <div className={styles.actions}><button type="button" onClick={recommend} disabled={!selected.length||offline}>Ver recomendaciones</button><button type="button" onClick={save} disabled={!selected.length||saving||offline}>{saving?'Guardando…':'Guardar giros'}</button></div>
   {result&&<div className={styles.panel}><h2>Módulos sugeridos</h2><div className={styles.chips}>{result.suggestedModules.map(key=><span key={key}>{key}</span>)}</div>{result.unavailableModules.length>0&&<p>No registrados en este entorno: {result.unavailableModules.join(', ')}</p>}<h3>Capacidades especializadas</h3><div className={styles.chips}>{result.capabilities.map(key=><span key={key}>{key}</span>)}</div><p>Recomendación informativa. No modifica plan, módulos ni permisos.</p></div>}
  </>}
 </section>;
}
