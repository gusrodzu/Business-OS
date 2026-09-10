import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const shell=read('apps/web/src/layout/AppShell.module.css');
const workspace=read('apps/web/src/design-system/styles/workspace.css');
const rail=read('apps/web/src/framework/BuzzBeeRightRail.module.css');
const app=read('apps/web/src/layout/AppShell.jsx');
const checks=[
 ['single main scroll owner', /data-scroll-owner="workspace"/.test(app) && /overflow-y:auto/.test(shell)],
 ['full-width module canvas', /\[data-md3-module\]\{width:100%;max-width:none;margin:0\}/.test(workspace)],
 ['page roots forced full width', /width:100%!important;[\s\S]*max-width:none!important/.test(workspace)],
 ['open tools total width', /data-tools-open='true'\]\{grid-template-columns:minmax\(0,1fr\) 352px\}/.test(shell)],
 ['open tools internal columns', /grid-template-columns:52px minmax\(0,300px\)/.test(shell)],
 ['right column fixed width', /width:300px;[\s\S]*min-width:300px;[\s\S]*max-width:300px/.test(shell)],
 ['right rail no x overflow', /\.rail\{width:100%;min-width:0;max-width:100%;overflow-x:hidden\}/.test(rail)],
 ['dashboard grids full width', /_dashboardGrid_[\s\S]*_mainGrid_[\s\S]*_overviewGrid_/.test(workspace)],
 ['page vertical overflow disabled', /overflow-y:visible!important/.test(workspace)],
 ['wide data remains horizontal', /overflow-x:auto/.test(workspace) && /overflow-y:hidden/.test(workspace)],
];
let pass=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`); if(ok)pass++;}
console.log(`\nDashboard Workspace Layout: ${pass}/${checks.length}`);
if(pass!==checks.length)process.exit(1);
