import fs from 'node:fs';
import path from 'node:path';

function readIfExists(file){return fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';}
function filesUnder(dir, predicate=()=>true){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) return filesUnder(full,predicate);
    return predicate(full)?[full]:[];
  });
}

export function readWebRoutingSource(){
  const files=['apps/web/src/App.jsx',...filesUnder('apps/web/src/modules',f=>/routes\.jsx$|registry\.jsx$/.test(f))];
  return files.map(readIfExists).join('\n');
}

export function readApiMountingSource(){
  const files=['apps/api/src/index.js','apps/api/src/bootstrap/registerApiModules.js',...filesUnder('apps/api/src/modules',f=>f.endsWith('index.js'))];
  return files.map(readIfExists).join('\n');
}

export function readWorkerBootstrapSource(){
  return [readIfExists('apps/api/src/index.js'),readIfExists('apps/api/src/bootstrap/workers.js')].join('\n');
}
