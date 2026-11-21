// Solo datos públicos de GitHub. No introducir tokens ni credenciales en el navegador.
// Datos de lectura pública; la ruta independiente requiere una sesión autenticada.
// No añadir endpoints de clientes, APIs de plataforma ni telemetría privada.
// No inferir que un agente de ChatGPT está ejecutándose a partir de actividad de GitHub.
export const AGENT_TEAMS = Object.freeze([
  {id:'frontend',name:'Frontend',specialty:'Experiencia de usuario',icon:'monitor',color:'#aa75ff',hair:'#513954',shirt:'#c19aff',branch:'agent/frontend/'},
  {id:'backend',name:'Backend',specialty:'API y lógica empresarial',icon:'database',color:'#5ca9f2',hair:'#3c3945',shirt:'#64b5ed',branch:'agent/backend/'},
  {id:'security',name:'Ciberseguridad',specialty:'Defensa y permisos',icon:'shield',color:'#5de3a3',hair:'#6f647d',shirt:'#6bdeab',branch:'agent/security/'},
  {id:'qa',name:'QA',specialty:'Calidad y regresiones',icon:'flask',color:'#f7b56c',hair:'#86677a',shirt:'#ecaa77',branch:'agent/qa/'},
  {id:'director',name:'Director Técnico',specialty:'Arquitectura y coordinación',icon:'network',color:'#db9cf1',hair:'#403950',shirt:'#ce9bf4',branch:'agent/architecture/'},
  {id:'devops',name:'DevOps / SRE',specialty:'CI, Cloudflare y estabilidad',icon:'cloud',color:'#75dfe3',hair:'#69534b',shirt:'#67cdd9',branch:'agent/devops/'},
]);

const API='https://api.github.com/repos/gusrodzu/Business-OS';
const MAX_ITEMS=40;
export const REFRESH_INTERVAL_MS=180_000;

async function readGithub(path,signal){
  const response=await fetch(API+path,{signal,headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
  if(!response.ok){
    if(response.status===403||response.status===429)throw new Error('GitHub limitó temporalmente las consultas. Intenta más tarde.');
    throw new Error('GitHub no respondió correctamente ('+response.status+').');
  }
  return response.json();
}

function classifyWorkflow(name){
  const n=String(name||'').toLowerCase();
  if(/security|dependency|vulnerab|audit/.test(n))return 'security';
  if(/prisma|database|backend|api integration/.test(n))return 'backend';
  if(/devops|cloudflare|deploy|release|workers/.test(n))return 'devops';
  if(/frontend qa|smartphone|browser|route.*sweep|quality|test|qa/.test(n))return 'qa';
  if(/frontend|mobile|ui|web/.test(n))return 'frontend';
  if(/architecture|director|planning/.test(n))return 'director';
  return null;
}
function safeUrl(url,kind){
  if(typeof url!=='string')return null;
  const prefix='https://github.com/gusrodzu/Business-OS/';
  const pattern=kind==='pr'?/^pull\/\d+$/:/^actions\/runs\/\d+$/;
  const rest=url.startsWith(prefix)?url.slice(prefix.length):'';
  return pattern.test(rest)?url:null;
}
function sortLatest(a,b){
  return new Date(b.at||0).getTime()-new Date(a.at||0).getTime();
}
export function buildAgentOfficeSnapshot(pulls,runs,observedAt=new Date().toISOString()){
  const prs=(Array.isArray(pulls)?pulls:[]).filter(pr=>Number.isInteger(pr?.number)).map(pr=>({
    id:pr.number,
    title:String(pr.title||'PR sin título').slice(0,180),
    branch:String(pr.head?.ref||''),
    state:pr.draft?'draft':pr.state==='open'?'open':pr.merged_at?'merged':'closed',
    at:pr.updated_at||pr.created_at||null,
    url:safeUrl(pr.html_url,'pr'),
  }));
  const checks=(Array.isArray(runs)?runs:[]).filter(run=>Number.isInteger(run?.id)).map(run=>({
    id:run.id,
    team:classifyWorkflow(run.name),
    title:String(run.name||'Workflow').slice(0,140),
    status:['queued','in_progress','completed'].includes(run.status)?run.status:'unknown',
    conclusion:['success','failure','cancelled','timed_out','skipped','action_required'].includes(run.conclusion)?run.conclusion:null,
    at:run.updated_at||run.created_at||null,
    url:safeUrl(run.html_url,'run'),
  }));
  const teams=AGENT_TEAMS.map(team=>{
    const teamPrs=prs.filter(pr=>pr.branch.startsWith(team.branch)).sort(sortLatest);
    const teamChecks=checks.filter(check=>check.team===team.id).sort(sortLatest);
    const ongoing=teamChecks.find(check=>check.status==='in_progress'||check.status==='queued');
    const recentPr=teamPrs[0]||null;
    const latestCheck=teamChecks[0]||null;
    const status=ongoing?(ongoing.status==='in_progress'?'ci':'queued')
      :teamPrs.some(pr=>pr.state==='open'||pr.state==='draft')?'review':'idle';
    // Un PR abierto es una revisión pendiente, NO evidencia de una persona trabajando.
    return {...team,status,ongoing:ongoing||null,recentPr,latestCheck,
      prCount:teamPrs.filter(pr=>pr.state==='open'||pr.state==='draft').length};
  });
  const activity=[
    ...prs.map(pr=>({...pr,kind:'pr',team:AGENT_TEAMS.find(t=>pr.branch.startsWith(t.branch))?.id||null})),
    ...checks.map(check=>({...check,kind:'workflow',team:check.team})),
  ].filter(item=>item.at).sort(sortLatest).slice(0,24);
  return {observedAt,teams,activity,
    runningChecks:checks.filter(check=>check.status==='in_progress').length,
    failedChecks:checks.filter(check=>check.status==='completed'&&check.conclusion==='failure').length,
    openPRs:prs.filter(pr=>pr.state==='open'||pr.state==='draft').length};
}

export async function fetchAgentOffice(signal){
  const [pulls,actions]=await Promise.all([
    readGithub('/pulls?state=all&sort=updated&direction=desc&per_page='+MAX_ITEMS,signal),
    readGithub('/actions/runs?per_page='+MAX_ITEMS,signal),
  ]);
  return buildAgentOfficeSnapshot(pulls,actions?.workflow_runs,new Date().toISOString());
}
