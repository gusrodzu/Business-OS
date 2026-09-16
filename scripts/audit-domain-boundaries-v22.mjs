import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd();
const domains=['sales','procurement','inventory','pos','crm','finance','hr','projects','production','settings','operations','platform'];
let fail=0, pages=0;
console.log('BuzzBee v22 · Domain Boundary Audit');
for(const domain of domains){
 const base=path.join(root,'apps/web/src/modules',domain); if(!fs.existsSync(base)) continue;
 const service=path.join(base,'services',`${domain}Api.js`); const index=path.join(base,'index.js');
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 const jsx=walk(base).filter(f=>f.endsWith('.jsx')); pages+=jsx.length;
 const leaks=jsx.filter(f=>/from ['\"](?:\.\.\/){2,}api['\"]/.test(fs.readFileSync(f,'utf8')));
 const ok=fs.existsSync(service)&&fs.existsSync(index)&&leaks.length===0;
 console.log(`${ok?'PASS':'FAIL'} ${domain.padEnd(12)} · ${jsx.length} JSX · ${leaks.length} transport leaks`);
 if(!ok){ fail++; for(const f of leaks) console.log('  -',path.relative(root,f)); }
}
console.log(`\n${pages} module JSX checked · ${fail} domain failures`); process.exitCode=fail?1:0;
