import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const offline=read('apps/web/src/offlineDemo.js');
const projects=read('apps/web/src/modules/projects/ui/pages/Projects.jsx');
const admin=read('apps/web/src/modules/finance/ui/pages/AdministrativeCenter.jsx');
const sales=read('apps/web/src/modules/sales/ui/pages/Sales.jsx');
const checks=[
 ['Administration endpoint has array activity', offline.includes("path === '/administration/dashboard'") && offline.includes('result.activity = Array.isArray(result.activity)')],
 ['Administration upcoming agenda safe', offline.includes('result.upcoming.agenda = Array.isArray(result.upcoming.agenda)')],
 ['Projects metrics contract has taskProgress', offline.includes('metrics:{taskProgress:0')],
 ['Projects UI tolerates missing metrics', projects.includes('project.metrics?.taskProgress ?? 0')],
 ['Administration UI validates activity array', admin.includes('Array.isArray(data.activity)?data.activity:[]')],
 ['Sales offline adds createdBy', offline.includes('createdBy: quote?.createdBy || offlineDemoUser') && offline.includes('createdBy: order?.createdBy || offlineDemoUser')],
 ['Sales UI tolerates missing createdBy', sales.includes("item.createdBy?.firstName || 'Admin'")],
];
let pass=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${n}`);if(ok)pass++;}
console.log(`\n${pass}/${checks.length} PASS`);process.exit(pass===checks.length?0:1);
