import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[];
const check=(name,ok)=>checks.push([name,!!ok]);
const unified=read('apps/web/src/design-system/styles/unified-ui.css');
const dash=read('apps/web/src/modules/core/ui/pages/Dashboard.module.css');
check('Embedded tables remove nested side/bottom borders', unified.includes('embedded tables inside cards') && unified.includes('border-left:0!important'));
check('Home requests card owns overflow', dash.includes('.requestsWidget{overflow:hidden;padding:0!important}'));
check('Home table wrapper has no nested radius', dash.includes('border-radius:0!important'));
check('Home table flushes to card edges', dash.includes('.requestsWidget .tableWrap{margin:0'));
check('Home header padding preserved', dash.includes('padding:20px 20px 16px 34px'));
check('Home table stays horizontal-only when narrow', dash.includes('overflow-x:auto'));
let pass=0; for (const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`); if(ok) pass++;}
console.log(`\n${pass}/${checks.length} PASS`);
if(pass!==checks.length) process.exit(1);
