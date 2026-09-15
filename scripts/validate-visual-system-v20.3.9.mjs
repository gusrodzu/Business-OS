import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const css=read('apps/web/src/design-system/styles/buzzbee-visual-v22.css');
const main=read('apps/web/src/main.jsx');
const checks=[
 ['global stylesheet imported',main.includes("buzzbee-visual-v22.css")],
 ['workspace page surface',css.includes('--bb-v22-page')],
 ['unified cards',css.includes('Card_card')],
 ['compact KPI pattern',css.includes('KpiCard_card')],
 ['40px controls',css.includes('--bb-v22-control-h:40px')],
 ['ERP table normalization',css.includes('DataTable_frame')],
 ['semantic badges',css.includes('Badge_badge')],
 ['sidebar normalization',css.includes('Sidebar_sidebar')],
 ['dialog/drawer hierarchy',css.includes('[role="dialog"]')],
 ['dark hierarchy',css.includes('[data-theme="dark"]')],
 ['responsive',css.includes('@media(max-width:640px)')],
 ['reduced motion',css.includes('prefers-reduced-motion')]
];
let fail=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} · ${n}`);if(!ok)fail++;}
console.log(`\nBuzzBee Visual v20.3.9: ${checks.length-fail} PASS / ${fail} FAIL`);process.exitCode=fail?1:0;
