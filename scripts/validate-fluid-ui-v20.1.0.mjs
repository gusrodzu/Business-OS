import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const main=read('apps/web/src/main.jsx');
const frame=read('apps/web/src/ux-foundation/UXRouteFrame.jsx');
const css=read('apps/web/src/design-system/styles/fluid-module-rollout.css');
const checks=[
 ['Fluid layer imported',main.includes("fluid-module-rollout.css")],
 ['Apple layer imported',main.includes("apple-fluid.css")],
 ['Route semantic module mapping',frame.includes('data-fluid-module={fluidModule(routeId)}')],
 ['Sales rollout',css.includes("data-fluid-module='sales'" )],
 ['Inventory rollout',css.includes("data-fluid-module='inventory'" )],
 ['Finance rollout',css.includes("data-fluid-module='finance'" )],
 ['CRM rollout',css.includes("data-fluid-module='crm'" )],
 ['HR rollout',css.includes("data-fluid-module='hr'" )],
 ['Projects rollout',css.includes("data-fluid-module='projects'" )],
 ['POS rollout',css.includes("data-fluid-module='pos'" )],
 ['Production rollout',css.includes("data-fluid-module='production'" )],
 ['Reduced motion',css.includes('prefers-reduced-motion:reduce')],
 ['Reduced transparency',css.includes('prefers-reduced-transparency:reduce')],
];
let fail=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(!ok) fail++;}
console.log(`\nFluid UI v20.1: ${checks.length-fail} PASS / ${fail} FAIL`); process.exitCode=fail?1:0;
