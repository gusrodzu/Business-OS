/* Motion is an illustration of VERIFIED public GitHub signals, not a real agent tracker.
   Pure helpers stay isolated from Business OS, cookies and private endpoints. */
const RECENT_RESULT_MS = 4 * 60 * 1000;

const signal = {
  typing: {glyph:'⌨',label:'CI ejecutándose',description:'GitHub confirmó una verificación en curso.'},
  waiting: {glyph:'◷',label:'CI en cola',description:'GitHub indicó que una verificación espera turno.'},
  reading: {glyph:'▤',label:'PR en revisión',description:'Hay una propuesta de cambios abierta; no implica ejecución activa.'},
  celebrating: {glyph:'✓',label:'CI aprobado',description:'GitHub registró una verificación exitosa hace pocos minutos.'},
  alert: {glyph:'!',label:'CI con fallo',description:'GitHub registró una verificación fallida hace pocos minutos.'},
  idle: {glyph:'☕',label:'Sin actividad confirmada',description:'No se detectó una ejecución activa en los registros recientes.'},
  offline: {glyph:'—',label:'Sin datos actuales',description:'Las animaciones se detienen cuando no hay una conexión verificada.'},
};

export function chooseMotion(station, {fresh=false,now=Date.now()}={}) {
  if (!fresh || !station) return {mode:'offline',...signal.offline};
  if (station.status==='ci') return {mode:'typing',...signal.typing};
  if (station.status==='queued') return {mode:'waiting',...signal.waiting};

  const last=station.latestCheck;
  const eventTime=Date.parse(last?.at||'');
  const elapsed=now-eventTime;
  const recent=last?.status==='completed' && Number.isFinite(eventTime)
    && elapsed>=0 && elapsed<=RECENT_RESULT_MS;
  if (recent && last.conclusion==='failure')return {mode:'alert',...signal.alert};
  if (recent && last.conclusion==='success')return {mode:'celebrating',...signal.celebrating};
  if (station.status==='review')return {mode:'reading',...signal.reading};
  return {mode:'idle',...signal.idle};
}

// Only show a handoff if GitHub gives a PR SHA AND a matching CI head_sha.
// Shared SHA establishes association; it does not prove ChatGPT agents conversed.
export function findVerifiedHandoffs(prs,workflows,teams,{limit=4}={}) {
  if (!Array.isArray(prs)||!Array.isArray(workflows)||!Array.isArray(teams))return [];
  const validSha = sha=>typeof sha==='string' && /^[a-f0-9]{40}$/i.test(sha);
  const results=[],seen=new Set();
  for(const run of workflows){
    if (!validSha(run.headSha)||!['in_progress','queued'].includes(run.status)||!run.team)continue;
    for(const pr of prs){
      if(!['open','draft'].includes(pr.status)||!validSha(pr.headSha)||pr.headSha!==run.headSha)continue;
      const source=teams.find(t=>pr.branch.startsWith(t.branch));
      const target=teams.find(t=>t.id===run.team);
      if(!source||!target||source.id===target.id)continue;
      const key=pr.id+':'+target.id;
      if(seen.has(key))continue;
      seen.add(key);
      results.push({
        key,from:source.id,fromName:source.name,to:target.id,toName:target.name,
        prNumber:pr.id,prTitle:pr.title,prUrl:pr.url,
        runName:run.title,runUrl:run.url,
        status:run.status,
      });
      if(results.length>=limit)return results;
    }
  }
  return results;
}
