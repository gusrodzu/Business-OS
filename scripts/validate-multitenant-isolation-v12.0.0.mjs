import fs from 'node:fs';
import path from 'node:path';

const root='apps/api/src/modules';
const files=[];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(entry.isFile() && entry.name.endsWith('.js') && full.includes(`${path.sep}api${path.sep}`)) files.push(full);
  }
}
walk(root);

const exemptPatterns=[
  /modules[\\/]core[\\/]api[\\/]auth\.js$/,
  /modules[\\/]platform[\\/]api[\\/]platformAdmin\.js$/,
  /modules[\\/]platform[\\/]api[\\/]publicApi\.js$/,
];
let protectedFiles=0,tenantAware=0;
const warnings=[];

for(const file of files){
  const rel=file.replaceAll('\\','/');
  if(exemptPatterns.some((pattern)=>pattern.test(file))) continue;
  const s=fs.readFileSync(file,'utf8');
  if(!(s.includes('requireAuth')||s.includes('requireApiKeyScope'))) continue;
  protectedFiles++;

  const explicitTenant=
    s.includes('req.auth.companyId')||
    s.includes('request.auth.companyId')||
    s.includes('req.apiAuth.companyId')||
    s.includes('request.apiAuth.companyId')||
    s.includes('companyId = req.auth.companyId')||
    s.includes('companyId = request.auth.companyId');

  if(explicitTenant) tenantAware++;
  else warnings.push(rel);
}

const pct=protectedFiles?Math.round(tenantAware/protectedFiles*100):0;
console.log('\nMulti-company Isolation Audit — v15.0.3');
console.log('========================================');
console.log(`Protected tenant route files: ${protectedFiles}`);
console.log(`Tenant-aware route files: ${tenantAware}`);
console.log(`Coverage: ${pct}%`);
warnings.forEach((x)=>console.log(`WARN  ${x}`));
if(!protectedFiles || pct<98){
  console.error('FAIL  Tenant scoping coverage < 98% or no modular routes were inspected.');
  process.exit(1);
}
console.log('PASS  Modular tenant scoping coverage >= 98%.');
