import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=(p)=>fs.readFileSync(new URL(p,root),'utf8');
const offline=read('apps/web/src/offlineDemo.js');
const sales=read('apps/web/src/modules/sales/ui/pages/SalesEnterprise.jsx');
const checks=[
 ['Sales fixture has createdBy', /createdBy:offlineDemoUser/.test(offline)],
 ['Sales activities normalized', /result\.activities = .*createdBy: offlineDemoUser/.test(offline)],
 ['Sales UI has safe firstName', /createdBy\?\.firstName/.test(sales)],
 ['Sales UI has safe lastName', /createdBy\?\.lastName/.test(sales)],
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(ok) pass++;}
console.log(`\n${pass}/${checks.length} PASS`); if(pass!==checks.length) process.exit(1);
