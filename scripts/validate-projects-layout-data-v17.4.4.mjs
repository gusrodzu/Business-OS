import fs from 'node:fs';
const jsx=fs.readFileSync('apps/web/src/modules/projects/ui/pages/Projects.jsx','utf8');
const css=fs.readFileSync('apps/web/src/modules/projects/ui/pages/Projects.module.css','utf8');
const offline=fs.readFileSync('apps/web/src/offlineDemo.js','utf8');
const checks=[
 ['project list marked card surface',jsx.includes('data-ui-surface="card"')],
 ['safe project metric defaults',jsx.includes('tasksDone: doneTasks') && jsx.includes('tasksTotal: tasks.length')],
 ['safe members array',jsx.includes('Array.isArray(project?.members)')],
 ['safe subprojects array',jsx.includes('Array.isArray(project?.subprojects)')],
 ['portfolio prevents grid stretch',css.includes('.portfolioGrid>*{align-self:start;height:auto;min-width:0}')],
 ['project rail buttons not pill',css.includes('border-radius:0;background:transparent')],
 ['offline metrics include task counts',offline.includes('tasksDone:0') && offline.includes('tasksTotal:')],
 ['offline metrics include financial fields',offline.includes('actualCost:0') && offline.includes('laborHours:0')],
];
let pass=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok) pass++;}
console.log(`
Projects Layout & Data Hotfix ${pass}/${checks.length} PASS`);
if(pass!==checks.length) process.exit(1);
