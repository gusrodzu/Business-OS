import {useCallback,useEffect,useRef,useState} from 'react';
import {
  Activity,AlertCircle,ArrowUpRight,CheckCircle2,Clock3,ExternalLink,
  GitPullRequest,Layers3,PauseCircle,PlayCircle,RefreshCw,ShieldCheck,
  Wifi,WifiOff,
} from 'lucide-react';
import {useAuth} from '../../../../auth/AuthContext';
import {AGENT_TEAMS,REFRESH_INTERVAL_MS,fetchAgentOffice} from '../../services/agentOfficeFeed';
import styles from './AgentOffice.module.css';

const statusLabels={ci:'CI en ejecución',queued:'CI en cola',review:'PR pendiente',idle:'En espera'};
const statusDescriptions={
  ci:'GitHub confirma una verificación en curso. No implica que el agente de ChatGPT esté ejecutándose.',
  queued:'GitHub confirma una verificación en cola.',
  review:'Hay un PR abierto relacionado con este equipo; no hay ejecución confirmada.',
  idle:'GitHub no reporta ejecución activa ni PR reciente abierto de este equipo.',
};
const timeFormat=new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});

function relativeTime(date){
  if(!date)return 'Sin registro';
  const elapsed=Math.max(0,Date.now()-new Date(date).getTime());
  if(!Number.isFinite(elapsed))return 'Fecha no disponible';
  const min=Math.floor(elapsed/60000);
  if(min<1)return 'Hace menos de 1 min';
  if(min<60)return 'Hace '+min+' min';
  const hrs=Math.floor(min/60);
  if(hrs<24)return 'Hace '+hrs+' h';
  return 'Hace '+Math.floor(hrs/24)+' d';
}

function Avatar({team,active}){
  return <svg className={styles.avatarPixel} data-active={active?'true':'false'}
    viewBox="0 0 72 88" shapeRendering="crispEdges" aria-hidden="true">
    <rect x="21" y="10" width="36" height="35" fill={team.hair}/>
    <rect x="16" y="19" width="46" height="19" fill={team.hair}/>
    <rect x="22" y="25" width="35" height="30" fill="#f3c6a9"/>
    <rect x="23" y="16" width="34" height="12" fill={team.hair}/>
    <rect x="29" y="39" width="5" height="5" fill="#332b39"/>
    <rect x="46" y="39" width="5" height="5" fill="#332b39"/>
    <rect x="23" y="33" width="7" height="5" fill={team.hair}/>
    <rect x="50" y="33" width="7" height="5" fill={team.hair}/>
    <rect x="34" y="51" width="11" height="5" fill="#d49a83"/>
    <rect x="15" y="56" width="52" height="24" fill={team.shirt}/>
    <rect x="10" y="62" width="10" height="14" fill="#edbfa2"/>
    <rect x="62" y="62" width="9" height="14" fill="#edbfa2"/>
    <rect x="27" y="78" width="12" height="9" fill="#313b58"/>
    <rect x="46" y="78" width="12" height="9" fill="#313b58"/>
    <rect x="36" y="57" width="8" height="20" fill="rgba(255,255,255,.22)"/>
    <rect x="9" y="29" width="9" height="20" fill={team.color}/>
    <rect x="62" y="29" width="8" height="20" fill={team.color}/>
    <rect x="13" y="25" width="50" height="5" fill={team.color}/>
  </svg>;
}

function Cubicle({team,onSelect,selected}){
  const active=team.status==='ci';
  const status=statusLabels[team.status]||'En espera';
  return <button type="button" className={styles.cubicle}
    data-selected={selected?'true':'false'} data-state={team.status}
    onClick={onSelect} aria-pressed={selected}
    aria-label={team.name+'. '+status+'. Ver actividad'}>
    <div className={styles.cubicleHead}>
      <span className={styles.roleIcon} aria-hidden="true">{team.id==='frontend'?'▣':team.id==='backend'?'▤':team.id==='security'?'♢':team.id==='qa'?'✦':team.id==='director'?'♛':'☁'}</span>
      <strong>{team.name}</strong>
      <span className={styles.state}><i aria-hidden="true"/>{status}</span>
    </div>
    <div className={styles.scene} style={{'--agent-accent':team.color}}>
      <div className={styles.wallTexture} aria-hidden="true"/>
      <div className={styles.wallArt} aria-hidden="true">
        {team.id==='frontend'?'UI / UX':team.id==='backend'?'API / DB':team.id==='security'?'SECURITY':team.id==='qa'?'TEST / QA':team.id==='director'?'ROADMAP':'CLOUD / CI'}
        <span>{team.id==='frontend'?'▦ ▥ ▤':team.id==='backend'?'<>  { }':team.id==='security'?'✓  ✓  ✓':team.id==='qa'?'○  ✓  ○':team.id==='director'?'◈ → ◈':'☁  ↑  ☁'}</span>
      </div>
      <div className={styles.plant} aria-hidden="true">✿</div>
      <div className={styles.monitor} aria-hidden="true">
        <span className={styles.screenDots}>● ● ●</span>
        <span className={styles.screenCode}>▰ ▰ ▰</span>
        <span className={styles.screenCode}>▰ ▰</span>
        <span className={styles.screenCode}>▰ ▰ ▰ ▰</span>
      </div>
      <div className={styles.keyboard} aria-hidden="true">···········</div>
      <div className={styles.desk} aria-hidden="true"/>
      <div className={styles.character}><Avatar team={team} active={active}/></div>
      <div className={styles.chair} aria-hidden="true"/>
      <span className={styles.floorTiles} aria-hidden="true"/>
    </div>
    <div className={styles.cubicleFoot}>
      <span>{team.specialty}</span>
      <span>{team.prCount?team.prCount+' PR abierto(s)':'Ver detalle'} <ArrowUpRight size={14} aria-hidden="true"/></span>
    </div>
  </button>;
}

function ActivityLink({item}){
  const label=item.kind==='pr'
    ? '#'+item.id+' · '+item.title
    :item.title+' · '+(item.status==='in_progress'?'En ejecución':item.status==='queued'?'En cola':item.conclusion||item.status);
  return <li className={styles.activityItem}>
    <span className={styles.activitySymbol} aria-hidden="true">{item.kind==='pr'?<GitPullRequest size={17}/>:<Activity size={17}/>}</span>
    <div className={styles.activityCopy}>
      <strong>{label}</strong>
      <small>{relativeTime(item.at)}{item.team?' · '+(AGENT_TEAMS.find(t=>t.id===item.team)?.name||item.team):' · Sin equipo asignado'}</small>
    </div>
    {item.url?<a href={item.url} target="_blank" rel="noopener noreferrer"
      aria-label={'Abrir actividad en GitHub: '+label}><ExternalLink size={16}/></a>:null}
  </li>;
}

export default function AgentOffice(){
  const {platformSession,user}=useAuth();
  const permitted=Boolean(platformSession&&user?.permissions?.includes('platform.manage'));
  const [snapshot,setSnapshot]=useState(null);
  const [selectedId,setSelectedId]=useState('frontend');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const lastFetch=useRef(0);
  const currentRequest=useRef(null);
  const load=useCallback(async(force=false)=>{
    if(!permitted)return;
    const now=Date.now();
    if(!force&&now-lastFetch.current<REFRESH_INTERVAL_MS)return;
    if(now-lastFetch.current<25_000)return;
    lastFetch.current=now;
    currentRequest.current?.abort();
    const controller=new AbortController();
    currentRequest.current=controller;
    setBusy(true);
    try{
      const data=await fetchAgentOffice(controller.signal);
      if(!controller.signal.aborted){setSnapshot(data);setError('');}
    }catch(e){
      if(!controller.signal.aborted)setError(e?.message||'No se pudo sincronizar con GitHub.');
    }finally{
      if(!controller.signal.aborted)setBusy(false);
    }
  },[permitted]);
  useEffect(()=>{
    if(!permitted)return undefined;
    load();
    const tick=setInterval(()=>{if(document.visibilityState==='visible')load();},REFRESH_INTERVAL_MS);
    const onVisible=()=>{if(document.visibilityState==='visible')load();};
    document.addEventListener('visibilitychange',onVisible);
    return ()=>{currentRequest.current?.abort();clearInterval(tick);document.removeEventListener('visibilitychange',onVisible);};
  },[permitted,load]);

  if(!permitted)return <section className={styles.denied}><ShieldCheck size={32}/><h1>Acceso restringido</h1><p>Agent Office requiere una sesión Super Admin con permiso de administración de plataforma.</p></section>;
  const teams=snapshot?.teams||AGENT_TEAMS.map(team=>({...team,status:'idle',prCount:0,recentPr:null,latestCheck:null}));
  const selected=teams.find(t=>t.id===selectedId)||teams[0];
  const known=Boolean(snapshot&&!error);
  const teamActivity=snapshot?.activity.filter(item=>item.team===selected.id).slice(0,5)||[];

  return <div className={styles.page} data-agent-office="true">
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}><Layers3 size={16}/> BUSINESS OS · SUPER ADMIN</p>
        <h1>Agent Office</h1>
        <p>Oficina interactiva de los equipos. Sus estados se basan en eventos públicos verificados de GitHub.</p>
      </div>
      <div className={styles.headerActions}>
        <span className={styles.connection} data-live={known?'true':'false'}>
          {known?<Wifi size={17}/>:<WifiOff size={17}/>}
          {known?'GitHub sincronizado':busy?'Conectando…':'Sin señal verificada'}
        </span>
        <button type="button" className={styles.refresh} onClick={()=>load(true)} disabled={busy}
          title="Actualización manual limitada para respetar la API de GitHub">
          <RefreshCw size={16} className={busy?styles.spin:''}/>{busy?'Actualizando…':'Actualizar'}
        </button>
      </div>
    </header>
    <section className={styles.stats} aria-label="Resumen de actividad GitHub">
      <div><GitPullRequest size={20}/><strong>{known?snapshot.openPRs:'—'}</strong><span>PR abiertos entre los recientes</span></div>
      <div><PlayCircle size={20}/><strong>{known?snapshot.runningChecks:'—'}</strong><span>Workflows ejecutándose</span></div>
      <div><AlertCircle size={20}/><strong>{known?snapshot.failedChecks:'—'}</strong><span>Fallos en últimas ejecuciones</span></div>
      <div><Clock3 size={20}/><strong>{known?timeFormat.format(new Date(snapshot.observedAt)):'—'}</strong><span>Última sincronización</span></div>
    </section>
    {error?<div role="alert" className={styles.error}><AlertCircle size={18}/>{error} {snapshot?'La información anterior es histórica, no un estado en vivo.':''}</div>:null}
    <section className={styles.officeSection} aria-labelledby="agent-office-title">
      <div className={styles.sectionHead}>
        <div><span className={styles.eyebrow}>PLANO INTERACTIVO</span><h2 id="agent-office-title">Sala de operaciones</h2></div>
        <span className={styles.legend}><i/> Solo se anima trabajo con CI confirmado</span>
      </div>
      <div className={styles.office} data-feed-active={known?'true':'false'}>
        <div className={styles.officeWindow} aria-hidden="true"><span>✦</span><span>☁</span><span>✦</span></div>
        <div className={styles.officeGrid}>
          {teams.map(team=><Cubicle key={team.id} team={known?team:{...team,status:'idle'}} selected={selected.id===team.id} onSelect={()=>setSelectedId(team.id)}/>)}
        </div>
        <div className={styles.officeFloor} aria-hidden="true"/>
      </div>
      <p className={styles.disclaimer}><PauseCircle size={16}/> Los personajes representan señales verificadas de GitHub; no muestran la actividad interna de ChatGPT. Las automatizaciones todavía no están conectadas. La vista consulta datos cada 3 minutos cuando está visible.</p>
    </section>
    <div className={styles.lower}>
      <section className={styles.detail} aria-labelledby="agent-detail-title">
        <div className={styles.detailHead}><span className={styles.detailDot} style={{background:selected.color}}/><div><span>ESTACIÓN SELECCIONADA</span><h2 id="agent-detail-title">{selected.name}</h2><p>{selected.specialty}</p></div></div>
        <div className={styles.detailState}>
          {known?(selected.status==='ci'?<PlayCircle size={18}/>:selected.status==='queued'?<Clock3 size={18}/>:<PauseCircle size={18}/>):<WifiOff size={18}/>}
          <div><strong>{known?statusLabels[selected.status]:'Sin datos actuales'}</strong><p>{known?statusDescriptions[selected.status]:'Conecta GitHub para conocer sus PRs y verificaciones.'}</p></div>
        </div>
        <h3>Actividad de esta estación</h3>
        {teamActivity.length?<ul className={styles.activityList}>{teamActivity.map(item=><ActivityLink key={item.kind+'-'+item.id} item={item}/>)}</ul>:<p className={styles.empty}>No se encontraron eventos atribuibles a este equipo dentro de los últimos registros consultados.</p>}
      </section>
      <section className={styles.timeline} aria-labelledby="agent-timeline-title">
        <div className={styles.timelineHead}><div><span>GITHUB · LECTURA</span><h2 id="agent-timeline-title">Actividad reciente</h2></div><CheckCircle2 size={21}/></div>
        {snapshot?.activity.length?<ul className={styles.activityList}>{snapshot.activity.slice(0,9).map(item=><ActivityLink key={item.kind+'-'+item.id} item={item}/>)}</ul>:<p className={styles.empty}>Aún no hay eventos sincronizados para mostrar.</p>}
        <p className={styles.sourceNote}>Fuente: GitHub API pública · repositorio gusrodzu/Business-OS. Se consultan los últimos 40 PRs y las últimas 40 ejecuciones, sin credenciales ni acciones de escritura.</p>
      </section>
    </div>
  </div>;
}
