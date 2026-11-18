import {execFileSync} from 'node:child_process';

// Restrictive policy. Runs only from main. Never checks out PR code.
const repo=process.env.GITHUB_REPOSITORY;
const owner=repo?.split('/')[0];
const dryRun=process.env.DRY_RUN!=='false';
const required=['Frontend QA','Smartphone Browser Review','ERP Route Render Sweep',
  'Dependency Security Triage','Prisma Database Smoke QA','ERP Backend Integration Smoke',
  'MotorNorte Transactional QA'];
const safeCss=/^apps\/web\/src\/modules\/(core|sales|crm|inventory)\/ui\/(pages|components)\/[\w.-]+\.module\.css$/;
const safeUi=/^apps\/web\/src\/modules\/(core|sales|crm|inventory|settings)\/ui\/(pages|components)\/[\w.-]+\.(jsx|js|module\.css)$/;
const restricted=/(^\.github\/|(^|\/)(api|auth|security|permissions|prisma|migrations|database|finance|billing|payments|checkout|pos|platform-admin|secrets)(\/|$)|(^|\/)(package(-lock)?\.json|Dockerfile|wrangler\.[^/]+)$)/i;
const gh=args=>execFileSync('gh',args,{encoding:'utf8',timeout:25000}).trim();
const api=path=>JSON.parse(gh(['api',path]));
const log=(pr,message)=>console.log('PR #'+pr.number+': '+message);
if(!repo||!owner)throw Error('Missing GITHUB_REPOSITORY');

// Fail closed without enforced status checks on main. Without protection
// gh pr merge --auto could merge immediately.
let protectedBranch=false;
try{
  const p=api('repos/'+repo+'/branches/main/protection');
  protectedBranch=Boolean(p.required_status_checks?.contexts?.length||p.required_status_checks?.checks?.length);
}catch{}
if(!protectedBranch){
  try{
    const rules=api('repos/'+repo+'/rules/branches/main');
    protectedBranch=Array.isArray(rules)&&rules.some(r=>r.type==='required_status_checks'
      && r.parameters?.required_status_checks?.length);
  }catch{}
}
if(!protectedBranch){
  console.log('SAFE STOP: cannot verify enforced status checks on main.');
  process.exit(0);
}

const prs=api('repos/'+repo+'/pulls?state=open&per_page=100');
for(const item of prs){
  const pr=api('repos/'+repo+'/pulls/'+item.number);
  if(pr.draft||pr.base.ref!=='main')continue;
  if(pr.head.repo?.full_name!==repo||pr.user?.login!==owner){
    log(pr,'manual review: untrusted author or fork');continue;
  }
  if(pr.mergeable!==true||!['clean','blocked'].includes(pr.mergeable_state)){
    log(pr,'skip: conflict/unknown mergeability');continue;
  }
  const files=[];
  for(let page=1;page<=2;page++){
    const batch=api('repos/'+repo+'/pulls/'+pr.number+'/files?per_page=100&page='+page);
    files.push(...batch.map(f=>f.filename));
    if(batch.length<100)break;
  }
  if(!files.length||files.length>100||files.some(f=>restricted.test(f))){
    log(pr,'manual review: sensitive or large diff');continue;
  }
  const labels=new Set((pr.labels||[]).map(l=>l.name));
  const cssOnly=files.every(f=>safeCss.test(f));
  const explicitlySafe=labels.has('automerge-safe')&&files.every(f=>safeUi.test(f));
  if(!cssOnly&&!explicitlySafe){
    log(pr,'manual review: not eligible CSS or labeled UI');continue;
  }
  const runs=api('repos/'+repo+'/actions/runs?event=pull_request&head_sha='
    +encodeURIComponent(pr.head.sha)+'&per_page=100').workflow_runs||[];
  const latest=new Map();
  for(const run of runs){
    if(run.head_sha!==pr.head.sha)continue;
    const old=latest.get(run.name);
    if(!old||run.id>old.id||(run.id===old.id&&run.run_attempt>old.run_attempt))
      latest.set(run.name,run);
  }
  const incomplete=required.filter(name=>{
    const run=latest.get(name);
    return !run||run.status!=='completed'||run.conclusion!=='success';
  });
  if(incomplete.length){log(pr,'waiting/failed checks: '+incomplete.join(', '));continue;}
  if([...latest.values()].some(run=>run.status!=='completed'||run.conclusion!=='success')){
    log(pr,'waiting/failed additional CI checks');continue;
  }
  if(dryRun){log(pr,'ELIGIBLE (dry-run), '+files.length+' files');continue;}
  try{
    gh(['pr','merge',String(pr.number),'--repo',repo,'--auto','--squash']);
    log(pr,'Auto-merge enabled with GitHub protections');
  }catch(e){log(pr,'GitHub rejected auto-merge: '+String(e.stderr||e.message).slice(0,400));}
}
