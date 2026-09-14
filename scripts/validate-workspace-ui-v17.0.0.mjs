import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const main=read('apps/web/src/main.jsx');
const shell=read('apps/web/src/layout/AppShell.jsx');
const shellCss=read('apps/web/src/layout/AppShell.module.css');
const side=read('apps/web/src/layout/Sidebar.module.css');
const top=read('apps/web/src/layout/Topbar.module.css');
const tabs=read('apps/web/src/layout/ModuleTabBar.module.css');
const rail=read('apps/web/src/framework/BuzzBeeRightRail.module.css');
const workspace=read('apps/web/src/design-system/styles/workspace.css');
const pkg=JSON.parse(read('package.json'));
const checks=[
 ['Workspace layer loaded',main.includes("workspace.css")],
 ['Workspace layer feeds final UI contract',main.includes("import './design-system/styles/workspace.css';")&&main.includes("import './design-system/styles/unified-ui.css';")],
 ['Power banner removed from shell',!shell.includes('PowerBanner')&&!shellCss.includes('powerBannerSlot')],
 ['Collapsible Workspace tools',shell.includes('buzzbee.workspace.tools-open')&&shell.includes('data-tools-open')],
 ['Tool strip includes Agenda, Apps and AI',shell.includes('<CalendarDays')&&shell.includes('<Grid2X2')&&shell.includes('<Bot')],
 ['Right panel closed by default',shell.includes("localStorage.getItem('buzzbee.workspace.tools-open') === 'true'")],
 ['Workspace content maximizes width when panel closed',shellCss.includes("grid-template-columns:minmax(0,1fr) 52px")],
 ['Google-style wide search surface',/minmax\(3\d{2}px,6\d{2}px\)/.test(top)&&top.includes('border-radius:24px')],
 ['Topbar no historical version override blocks',!top.includes('v10.5.0')&&!top.includes('v7.4.9')],
 ['Sidebar uses quiet rounded navigation',side.includes('border-radius:21px')&&side.includes('--md-sys-color-secondary-container')],
 ['Sidebar no historical override blocks',!side.includes('v10.5.0')&&!side.includes('v7.4.9')],
 ['Module tabs are quiet 48px strip',tabs.includes('min-height:48px')&&tabs.includes('background:var(--md-sys-color-surface-container-lowest)')],
 ['Module tabs no historical override blocks',!tabs.includes('v10.5.0')&&!tabs.includes('v16 —')],
 ['Right rail rewritten as lightweight panel',rail.includes('.appsCard,.agendaCard')&&rail.includes('box-shadow:none')],
 ['Workspace cards are flat',workspace.includes('box-shadow:none!important')],
 ['Workspace tables use file-list treatment',workspace.includes('Tables follow the Drive file-list feel')&&workspace.includes('text-transform:none!important')],
 ['Workspace form controls use quiet surfaces',workspace.includes('Inputs/forms are low-noise Workspace controls')],
 ['Dark Workspace tokens included',workspace.includes("[data-theme='dark']")],
 ['Responsive shell still supported',shellCss.includes('@media(max-width:1180px)')],
 ['Project version is supported (>=17)',Number(pkg.version.split('.')[0])>=17],
];
let fail=0;
console.log('\nBuzzBee Workspace UI v17.0.0');
console.log('=============================');
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`);if(!ok)fail++;}
console.log(`\n${checks.length-fail}/${checks.length} PASS`);
process.exit(fail?1:0);
