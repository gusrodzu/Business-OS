import fs from 'node:fs';
import path from 'node:path';

const srcRoot = path.resolve('apps/web/src');
const sources = [{dir:path.join(srcRoot,'pages'), legacy:true}];
const modulesRoot = path.join(srcRoot,'modules');
if (fs.existsSync(modulesRoot)) {
  for (const name of fs.readdirSync(modulesRoot)) {
    const dir=path.join(modulesRoot,name,'ui','pages');
    if(fs.existsSync(dir)) sources.push({dir,legacy:false});
  }
}
const excluded = new Set(['Login.jsx','AdminLogin.jsx','ModulePlaceholder.jsx','NotFound.jsx','SettingsHome.jsx']);
const rows=[];
for(const source of sources){
 for(const file of fs.readdirSync(source.dir).filter(n=>n.endsWith('.jsx'))){
  const fullPath=path.join(source.dir,file); const code=fs.readFileSync(fullPath,'utf8');
  if(source.legacy && code.includes('Compatibility shim. Canonical UI lives in modules/')) continue;
  const connected=/apiRequest\s*\(|api\.(get|post|put|patch|delete)\s*\(|enterDemoLive\s*\(/.test(code);
  rows.push({file:path.relative(process.cwd(),fullPath),connected,excluded:excluded.has(file)});
 }
}
const functional=rows.filter(r=>!r.excluded); const disconnected=functional.filter(r=>!r.connected);
console.log(`Pantallas funcionales revisadas: ${functional.length}`);
console.log(`Conectadas a API: ${functional.length-disconnected.length}`);
console.log(`Sin consumo de API: ${disconnected.length}`);
if(disconnected.length){disconnected.forEach(r=>console.log(`- ${r.file}`));process.exitCode=1;}else console.log('OK: todas las pantallas funcionales consumen la API.');
