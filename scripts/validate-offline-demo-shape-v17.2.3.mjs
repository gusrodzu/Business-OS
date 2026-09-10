import fs from 'node:fs';
const file='apps/web/src/offlineDemo.js';
const src=fs.readFileSync(file,'utf8');
const checks=[
 ['HR positions fixture', /'\/human-resources': \{employees,departments,positions,branches/],
 ['Offline shape normalizer', /function normalizeOfflineShape\(/],
 ['Employee documents stats', /employeesComplete:0/],
 ['Project nested arrays', /members:\[\],subprojects:\[\],salesOrders:\[\],purchaseOrders:\[\],comments:\[\],documents:\[\]/],
 ['Billing modules array', /name:'Business OS Demo',modules:\[\]/],
 ['Leaves default', /leaves: \[\]/],
 ['Positions default', /positions: \[\]/],
 ['Branches default', /branches: \[\]/],
];
let pass=0;
for (const [name,re] of checks){ const ok=re.test(src); console.log(`${ok?'PASS':'FAIL'}  ${name}`); if(ok) pass++; }
console.log(`\n${pass}/${checks.length} PASS`);
process.exit(pass===checks.length?0:1);
