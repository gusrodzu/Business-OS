/* Standalone Agent Office: no imports from Business OS, no cookies, API keys or tenant data.
   Motion illustrates public GitHub signals; it never claims internal ChatGPT activity. */
import {chooseMotion,findVerifiedHandoffs} from './officeMotion.js';
import {drawAgentScene,drawAgentPortrait} from './agentArtwork.js';
import {drawOfficePanorama} from './officePanorama.js';
import {createAgentStatus} from './agentStatusChip.js';
const REPOSITORY = 'gusrodzu/Business-OS';
const API = 'https://api.github.com/repos/' + REPOSITORY;
const REPO_URL = 'https://github.com/' + REPOSITORY;
const REFRESH_MS = 180000;
const MIN_MANUAL_REFRESH_MS = 30000;
const LIMIT = 40;

const teams = Object.freeze([
  {id:'frontend',name:'Frontend',specialty:'Interfaces · React · UX',tag:'UI / UX',icon:'▦',branch:'agent/frontend/',hair:'#59415f',shirt:'#aa8deb',ear:'#f3c3a2'},
  {id:'backend',name:'Backend',specialty:'APIs · Datos · Procesos',tag:'API / DB',icon:'▤',branch:'agent/backend/',hair:'#453d58',shirt:'#84bce9',ear:'#dca782'},
  {id:'security',name:'Ciberseguridad',specialty:'Defensa · Autorización',tag:'SECURITY',icon:'♜',branch:'agent/security/',hair:'#575368',shirt:'#79dbb1',ear:'#f1c6ac'},
  {id:'qa',name:'QA',specialty:'Pruebas · Accesibilidad',tag:'QA / TEST',icon:'✦',branch:'agent/qa/',hair:'#79546b',shirt:'#f5b37a',ear:'#f0c1a0'},
  {id:'director',name:'Director Técnico',specialty:'Estrategia · Arquitectura',tag:'ROADMAP',icon:'♛',branch:'agent/architecture/',hair:'#39364e',shirt:'#d2a1e5',ear:'#ebc3a9'},
  {id:'devops',name:'DevOps / SRE',specialty:'Pipelines · Cloudflare',tag:'CLOUD / CI',icon:'☁',branch:'agent/devops/',hair:'#786057',shirt:'#80d0d1',ear:'#e1b291'},
]);

const $ = (id) => document.getElementById(id);
const mobileViews=new Set(['office','activity','teams']);
function setMobileView(view){
  if(!mobileViews.has(view))return;
  document.querySelector('.site-shell').dataset.mobileView=view;
  for(const tab of document.querySelectorAll('[data-mobile-tab]')){
    if(tab.dataset.mobileTab===view)tab.setAttribute('aria-current','page');
    else tab.removeAttribute('aria-current');
  }
  if(window.matchMedia('(max-width: 900px)').matches){window.scrollTo({top:0,behavior:'auto'});}
}

const state = {snapshot:null,selected:'frontend',fresh:false,inFlight:false,lastRequest:0,controller:null};
const dateFormat = new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
const clockFormat = new Intl.DateTimeFormat('es-MX',{hour:'2-digit',minute:'2-digit'});

function node(tag,cls,text) {
  const el = document.createElement(tag);
  if (cls) el.className=cls;
  if (text!==undefined) el.textContent=String(text);
  return el;
}
function append(parent,...children){parent.append(...children);return parent;}
function safeLink(url,kind) {
  if(typeof url!=='string') return null;
  const prefix=REPO_URL+'/';
  const tail=url.startsWith(prefix)?url.slice(prefix.length):'';
  return (kind==='pr'?/^pull\/\d+$/:/^actions\/runs\/\d+$/).test(tail)?url:null;
}
function classifyWorkflow(name) {
  const n=String(name||'').toLowerCase();
  if(/security|dependency|vulnerab|audit/.test(n))return 'security';
  if(/prisma|database|backend|api integration/.test(n))return 'backend';
  if(/devops|cloudflare|deploy|release|workers/.test(n))return 'devops';
  if(/frontend qa|smartphone|browser|route.*sweep|quality|test|qa/.test(n))return 'qa';
  if(/frontend|mobile|ui|web/.test(n))return 'frontend';
  if(/architecture|director|planning/.test(n))return 'director';
  return null;
}
function chronology(a,b){return new Date(b.at||0).getTime()-new Date(a.at||0).getTime();}
function normalize(pulls,runs) {
  const prs=(Array.isArray(pulls)?pulls:[]).filter(p=>Number.isInteger(p?.number)).map(p=>({
    kind:'pr',id:p.number,at:p.updated_at||p.created_at,title:String(p.title||'Solicitud de cambios').slice(0,180),
    branch:String(p.head?.ref||''),headSha:String(p.head?.sha||''),status:p.draft?'draft':p.state==='open'?'open':p.merged_at?'merged':'closed',
    url:safeLink(p.html_url,'pr'),
  }));
  const workflows=(Array.isArray(runs)?runs:[]).filter(r=>Number.isInteger(r?.id)).map(r=>({
    kind:'workflow',id:r.id,team:classifyWorkflow(r.name),at:r.updated_at||r.created_at,headSha:String(r.head_sha||''),
    title:String(r.name||'GitHub Actions').slice(0,140),
    status:['queued','in_progress','completed'].includes(r.status)?r.status:'unknown',
    conclusion:['success','failure','cancelled','timed_out','skipped','action_required'].includes(r.conclusion)?r.conclusion:null,
    url:safeLink(r.html_url,'run'),
  }));
  const stations=teams.map(t=>{
    const teamPrs=prs.filter(p=>p.branch.startsWith(t.branch)).sort(chronology);
    const teamFlows=workflows.filter(w=>w.team===t.id).sort(chronology);
    const current=teamFlows.find(w=>w.status==='in_progress'||w.status==='queued');
    const pending=teamPrs.filter(p=>p.status==='open'||p.status==='draft').length;
    const status=current?(current.status==='in_progress'?'ci':'queued'):pending?'review':'idle';
    return {...t,status,pending,current:current||null,latestCheck:teamFlows[0]||null,activity:[...teamPrs,...teamFlows].sort(chronology).slice(0,6)};
  });
  return {
    stations,handoffs:findVerifiedHandoffs(prs,workflows,teams),activity:[...prs.map(p=>({...p,team:teams.find(t=>p.branch.startsWith(t.branch))?.id||null})),...workflows].filter(x=>x.at).sort(chronology).slice(0,20),
    openPRs:prs.filter(p=>['open','draft'].includes(p.status)).length,
    active:workflows.filter(w=>w.status==='in_progress').length,
    failed:workflows.filter(w=>w.status==='completed'&&w.conclusion==='failure').length,
    observedAt:new Date().toISOString(),
  };
}

const labels={ci:'CI activo',queued:'En cola',review:'PR pendiente',idle:'En espera'};
const notes={
  ci:'GitHub confirma una verificación en ejecución. Esto no acredita actividad interna de ChatGPT.',
  queued:'GitHub indica que una verificación está esperando turno.',
  review:'Hay una propuesta de cambios pendiente. No significa que un agente esté ejecutándose.',
  idle:'No hay un workflow activo ni un PR abierto entre los registros recientes de este equipo.',
};
function stationCard(team) {
  const motion=chooseMotion(team,{fresh:state.fresh});
  const b=node('button','cubicle');b.type='button';b.dataset.team=team.id;b.dataset.state=state.fresh?team.status:'offline';
  b.dataset.motion=motion.mode;
  b.setAttribute('aria-pressed',String(state.selected===team.id));
  b.setAttribute('aria-label',team.name+'. '+motion.label+'. Consultar actividad');
  const title=node('div','cubicle-top');
  append(title,node('span','symbol',team.icon),node('strong','role',team.name),createAgentStatus(team,motion,{variant:'pill',showName:false}));
  const scene=node('div','scene');
  scene.classList.add('scene-v2');
  scene.append(drawAgentScene(team));
  const speech=node('div','agent-speech');
  speech.setAttribute('aria-hidden','true');
  const mobileMotionLabel={typing:'Trabajando',waiting:'En cola',reading:'Revisando',celebrating:'Aprobado',alert:'Alerta',idle:'En pausa',offline:'Sin señal'};
  append(speech,node('span','speech-glyph',motion.glyph),node('span','speech-copy',motion.label),node('span','speech-copy-mobile',mobileMotionLabel[motion.mode]));
  const prop=node('span','activity-prop',motion.mode==='reading'?'▤':motion.mode==='waiting'?'⌛':motion.mode==='celebrating'?'✧':motion.mode==='alert'?'!':motion.mode==='idle'?'☕':'▰');
  prop.setAttribute('aria-hidden','true');
  append(scene,speech,prop);
  const foot=node('div','cubicle-bottom');
  append(foot,node('span','',team.specialty),node('b','',state.fresh&&team.pending?team.pending+' PR abierto(s)':'Ver actividad ↗'));
  append(b,title,scene,foot);
  b.addEventListener('click',()=>{
    state.selected=team.id;
    renderStations();renderPanorama();renderRoster();renderDetail();
    if(window.matchMedia('(max-width: 900px)').matches)setMobileView('teams');
  });
  return b;
}
function ago(date){
  const t=new Date(date).getTime(),delta=Date.now()-t;
  if(!Number.isFinite(t))return 'Sin fecha';
  const minutes=Math.max(0,Math.floor(delta/60000));
  if(minutes<1)return 'Hace menos de 1 minuto';
  if(minutes<60)return 'Hace '+minutes+' min';
  if(minutes<1440)return 'Hace '+Math.floor(minutes/60)+' h';
  return 'Hace '+Math.floor(minutes/1440)+' d';
}
function eventRow(e){
  const row=node('div','event');
  const glyph=node('span','glyph',e.kind==='pr'?'⑂':'▣');
  const copy=node('div','copy');
  const title=e.kind==='pr'?'PR #'+e.id+' · '+e.title:
    e.title+' · '+(e.status==='in_progress'?'En ejecución':e.status==='queued'?'En cola':e.conclusion||'Sin conclusión');
  const extra=e.team?teams.find(t=>t.id===e.team)?.name:'GitHub';
  append(copy,node('strong','',title),node('small','',ago(e.at)+' · '+(extra||'Sin equipo asignado')));
  append(row,glyph,copy);
  if(e.url){
    const a=node('a','','↗');a.href=e.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Abrir en GitHub: '+title);row.append(a);
  }
  return row;
}
function renderHandoffs(){
  const lane=$('handoff-lane');
  if(!lane)return;
  lane.replaceChildren();
  const handoffs=state.fresh?state.snapshot?.handoffs||[]:[];
  const heading=node('div','handoff-heading');
  append(heading,node('strong','','Pasillo de colaboración'),node('span','',handoffs.length?handoffs.length+' conexión(es) verificadas':'Sin conexiones verificadas en este momento'));
  lane.append(heading);
  if(!handoffs.length){lane.append(node('p','handoff-empty','Aparecerán entregas animadas solo si un PR y una verificación de otro equipo comparten el mismo commit en GitHub.'));return;}
  const list=node('div','handoff-list');
  for(const handoff of handoffs){
    const item=node('div','handoff');
    const track=node('span','handoff-track');track.setAttribute('aria-hidden','true');track.append(node('span','handoff-walker'));
    append(item,node('strong','handoff-team',handoff.fromName),track,node('strong','handoff-team',handoff.toName));
    const detail=node('span','handoff-detail','PR #'+handoff.prNumber+' · '+(handoff.status==='in_progress'?'CI en ejecución':'CI en cola'));
    item.append(detail);
    if(handoff.prUrl){const a=node('a','handoff-link','Ver PR ↗');a.href=handoff.prUrl;a.target='_blank';a.rel='noopener noreferrer';item.append(a);}
    list.append(item);
  }
  lane.append(list);
}
const panoramaPositions=Object.freeze({
  frontend:{x:25.2,y:34,width:19.7,height:27},
  backend:{x:50.4,y:34,width:19.7,height:27},
  security:{x:76.0,y:34,width:19.7,height:27},
  qa:{x:24.5,y:62,width:20.5,height:29},
  director:{x:50.1,y:62,width:20.5,height:29},
  devops:{x:76.0,y:62,width:20.5,height:29},
});
let panoramaMounted=false;
function jumpToDesk(id){
  const position=panoramaPositions[id],scroller=$('office-scroll'),stage=$('office-stage');
  if(!position||!scroller||!stage)return;
  const center=stage.clientWidth*position.x/100;
  const left=Math.max(0,center-scroller.clientWidth/2);
  scroller.scrollTo({left,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function chooseDesk(id){
  if(!teams.some(team=>team.id===id))return;
  state.selected=id;
  renderStations();renderPanorama();renderRoster();renderDetail();
  if(window.matchMedia('(max-width: 900px)').matches)setMobileView('teams');
  else document.querySelector('.detail')?.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function renderPanorama(){
  const stage=$('office-scene'),zone=$('office-hotspots'),jump=$('office-jump');
  if(!stage||!zone||!jump)return;
  if(!panoramaMounted){
    stage.append(drawOfficePanorama());
    for(const team of teams){
      const chip=node('button','office-jump-chip',team.name);
      chip.type='button';chip.dataset.team=team.id;
      chip.addEventListener('click',()=>jumpToDesk(team.id));
      jump.append(chip);
    }
    panoramaMounted=true;
    // Center the initial mobile viewport on the first programmer, not the coffee counter.
    if(window.matchMedia('(max-width: 900px)').matches){
      requestAnimationFrame(()=>jumpToDesk('frontend'));
    }
  }
  const stations=state.snapshot?.stations||teams.map(t=>({...t,status:'idle',pending:0}));
  const normalized=new Map(stations.map(team=>[team.id,team]));
  zone.replaceChildren();
  for(const team of teams){
    const current=normalized.get(team.id)||team,motion=chooseMotion(current,{fresh:state.fresh});
    const pos=panoramaPositions[team.id];
    const hit=node('button','office-hotspot');
    hit.type='button';hit.dataset.team=team.id;hit.dataset.motion=motion.mode;
    hit.style.left=(pos.x-pos.width/2)+'%';hit.style.top=pos.y+'%';
    hit.style.width=pos.width+'%';hit.style.height=(pos.height-10)+'%';
    hit.setAttribute('aria-label',team.name+'. '+motion.label+'. Ver actividad del equipo');
    hit.setAttribute('aria-pressed',String(state.selected===team.id));
    hit.append(createAgentStatus(current,motion,{variant:'floating'}));
    hit.addEventListener('click',()=>chooseDesk(team.id));
    zone.append(hit);
    const svgStation=stage.querySelector('.office-station-art[data-team="'+team.id+'"]');
    if(svgStation)svgStation.setAttribute('data-motion',motion.mode);
  }
}
function renderStations(){
  const el=$('agent-grid');el.replaceChildren();
  const stations=state.snapshot?.stations||teams.map(t=>({...t,status:'idle',pending:0}));
  stations.forEach(t=>el.append(stationCard(t)));
}
function renderRoster(){
  const list=$('team-roster-list');if(!list)return;
  list.replaceChildren();
  const stations=state.snapshot?.stations||teams.map(t=>({...t,status:'idle',pending:0}));
  for(const team of stations){
    const motion=chooseMotion(team,{fresh:state.fresh});
    const button=node('button','roster-row');button.type='button';
    button.dataset.selected=String(state.selected===team.id);
    button.setAttribute('aria-pressed',String(state.selected===team.id));
    button.setAttribute('aria-label','Ver '+team.name+'. '+motion.label);
    const portrait=node('span','roster-portrait');portrait.append(drawAgentPortrait(team));
    const copy=node('span','roster-copy');
    append(copy,node('strong','',team.name),node('small','',team.specialty));
    const info=node('span','roster-right');
    append(info,createAgentStatus(team,motion,{variant:'pill',showName:false}),node('span','roster-chevron','›'));
    append(button,portrait,copy,info);
    button.addEventListener('click',()=>{state.selected=team.id;renderStations();renderPanorama();renderRoster();renderDetail();});
    list.append(button);
  }
}
function renderEvents(element,activity){
  element.replaceChildren();
  if(!activity.length){element.append(node('p','empty','Todavía no hay actividad verificada en los registros consultados.'));return;}
  activity.forEach(e=>element.append(eventRow(e)));
}
function renderDetail(){
  const stations=state.snapshot?.stations||teams.map(t=>({...t,status:'idle',pending:0,activity:[]}));
  const team=stations.find(t=>t.id===state.selected)||stations[0];
  const motion=chooseMotion(team,{fresh:state.fresh});
  $('detail-heading').textContent=team.name;
  const box=node('div','detail-state');
  append(box,createAgentStatus(team,motion,{variant:'detail',showName:false}),node('p','',motion.description),node('p','motion-note',
    'Movimiento ilustrativo basado en GitHub. No muestra la ejecución privada de agentes ChatGPT.'));
  if(state.fresh&&team.current?.url){const link=node('a','detail-proof','Abrir verificación ↗');link.href=team.current.url;link.target='_blank';link.rel='noopener noreferrer';box.append(link);}
  $('detail-state').replaceChildren(box);
  renderEvents($('detail-events'),team.activity||[]);
}
function render(){
  $('metric-pr').textContent=state.snapshot?state.snapshot.openPRs:'—';
  $('metric-active').textContent=state.snapshot?state.snapshot.active:'—';
  $('metric-failed').textContent=state.snapshot?state.snapshot.failed:'—';
  $('metric-updated').textContent=state.snapshot?clockFormat.format(new Date(state.snapshot.observedAt)):'—';
  renderStations();renderPanorama();renderHandoffs();renderRoster();renderDetail();renderEvents($('events'),state.snapshot?.activity||[]);
}
async function fetchJson(path,signal){
  const response=await fetch(API+path,{signal,cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
  if(!response.ok){
    if(response.status===403||response.status===429)throw Error('GitHub alcanzó su límite de consultas. Se conservarán los últimos datos disponibles.');
    throw Error('No fue posible consultar GitHub (HTTP '+response.status+').');
  }
  return response.json();
}
async function refresh(force=false){
  if(state.inFlight)return;
  const now=Date.now();
  if(now-state.lastRequest<(force?MIN_MANUAL_REFRESH_MS:REFRESH_MS))return;
  state.inFlight=true;state.lastRequest=now;
  $('refresh').disabled=true;
  const controller=new AbortController();state.controller=controller;
  $('sync-state').textContent='◌ Sincronizando…';
  try{
    const [pulls,result]=await Promise.all([
      fetchJson('/pulls?state=all&sort=updated&direction=desc&per_page='+LIMIT,controller.signal),
      fetchJson('/actions/runs?per_page='+LIMIT,controller.signal),
    ]);
    state.snapshot=normalize(pulls,result?.workflow_runs);
    state.fresh=true;
    $('sync-state').textContent='● GitHub sincronizado';
    $('sync-state').dataset.state='live';
    $('message').hidden=true;
    render();
  }catch(err){
    if(!controller.signal.aborted){
      state.fresh=false;
      render();
      $('sync-state').textContent='◌ Sin actualización';
      $('sync-state').dataset.state='error';
      $('message').textContent=(err?.message||'Error de conexión')+' Los indicadores no representan datos actuales.';
      $('message').hidden=false;
    }
  }finally{state.inFlight=false;$('refresh').disabled=false;}
}
$('refresh').addEventListener('click',()=>refresh(true));
for(const tab of document.querySelectorAll('[data-mobile-tab]')){
  tab.addEventListener('click',()=>setMobileView(tab.dataset.mobileTab));
}
document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('office-paused',document.hidden);if(!document.hidden)refresh();});
window.addEventListener('pagehide',()=>state.controller?.abort());
setInterval(()=>{if(!document.hidden)refresh();},30000);
render();refresh();
