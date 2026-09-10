import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const main=read('apps/web/src/main.jsx');
const uniform=read('apps/web/src/design-system/styles/unified-ui.css');
const moduleCss=read('apps/web/src/components/module-system/ModuleSystem.module.css');
const kpi=read('apps/web/src/components/KpiCard.module.css');
const button=read('apps/web/src/design-system/components/Button.module.css');
const input=read('apps/web/src/design-system/components/Input.module.css');
const table=read('apps/web/src/design-system/components/DataTable.module.css');
const checks=[
 ['unified layer loaded last', /workspace\.css';\s*\nimport '.\/design-system\/styles\/unified-ui\.css';/.test(main)],
 ['legacy modal global layer inactive', !main.includes('detail-drawer-global.css') && !main.includes('modal-centered-global.css')],
 ['single control height contract', uniform.includes('--bb-ui-control-h:40px')],
 ['single card radius contract', uniform.includes('--bb-ui-radius-card:16px')],
 ['single table row contract', uniform.includes('--bb-ui-row-h:52px')],
 ['single table header contract', uniform.includes('--bb-ui-table-head-h:42px')],
 ['search double-focus protection', /inner inputs must never draw a second box/.test(uniform) && /box-shadow:none!important/.test(uniform)],
 ['shared module toolbar standardized', /min-height:64px/.test(moduleCss) && /\.search\{/.test(moduleCss)],
 ['module system legacy override blocks removed', !/v9\.2\.0|v9\.4\.0|v10\.5\.3|v16\.0\.0/.test(moduleCss)],
 ['KPI legacy override blocks removed', !/v16/.test(kpi) && /min-height:116px/.test(kpi)],
 ['button geometry canonical', /\.md\{min-height:40px/.test(button) && /border-radius:999px/.test(button)],
 ['input geometry canonical', /min-height:40px/.test(input) && /border-radius:10px/.test(input)],
 ['data table geometry canonical', /height:52px/.test(table) && /height:42px/.test(table)],
 ['dashboard cards do not stretch', /grid-auto-rows:max-content/.test(uniform) && /align-self:start/.test(uniform)],
 ['form grids canonical', /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/.test(uniform)],
 ['chips protected from clipping', /Status pills\/chips should never be clipped/.test(uniform)],
 ['modal contract consolidated', /Canonical modal geometry replaces v9/.test(uniform)],
 ['dark-safe modal surfaces', /surface-container-high/.test(uniform) && !/background:#fff!important/.test(uniform)],
];
let pass=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`);if(ok)pass++;}
console.log(`\nUnified UI Contract: ${pass}/${checks.length}`);
if(pass!==checks.length) process.exit(1);
