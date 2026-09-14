import fs from 'node:fs';

const checks=[];
const pass=(name, ok, detail='')=>checks.push({name,ok:Boolean(ok),detail});
const read=(file)=>fs.readFileSync(file,'utf8');

const main=read('apps/web/src/main.jsx');
const colors=read('apps/web/src/design-system/tokens/color.css');
const workspace=read('apps/web/src/design-system/styles/workspace.css');
const polish=read('apps/web/src/design-system/styles/dark-mode-polish.css');
const settingsHome=read('apps/web/src/modules/settings/ui/pages/SettingsHome.module.css');
const pkg=JSON.parse(read('package.json'));
const apiPkg=JSON.parse(read('apps/api/package.json'));
const webPkg=JSON.parse(read('apps/web/package.json'));

pass('Versión raíz 18.3.3', pkg.version==='18.3.3', pkg.version);
pass('Versión API 18.3.3', apiPkg.version==='18.3.3', apiPkg.version);
pass('Versión WEB 18.3.3', webPkg.version==='18.3.3', webPkg.version);
pass('Dark polish importado', main.includes("dark-mode-polish.css"));
pass('Dark polish se carga después de unified-ui', main.indexOf('dark-mode-polish.css') > main.indexOf('unified-ui.css'));
pass('Paleta dark carbón', colors.includes('--md-sys-color-background: #0B0F14'));
pass('Primary dark BuzzBee', colors.includes('--md-sys-color-primary: #8FB5FF'));
pass('Workspace dark alineado', workspace.includes('--bb-workspace-bg:#0B0F14'));
pass('Superficies dark diferenciadas', polish.includes('--bb-ui-surface:#10161D') && polish.includes('--bb-ui-soft:#151C25'));
pass('Tablas dark', polish.includes('table thead th') && polish.includes('table tbody tr:hover td'));
pass('Inputs dark', polish.includes('input:not([type="checkbox"]') && polish.includes('caret-color:#8FB5FF'));
pass('Autofill dark', polish.includes('input:-webkit-autofill'));
pass('Modales/drawers dark', polish.includes('[class*="_modal_"]') && polish.includes('[class*="_drawer_"]'));
pass('Popovers dark', polish.includes('[class*="_popover_"]'));
pass('Estados semánticos dark', polish.includes('--bb-status-fg:#BFF3D2') && polish.includes('--bb-status-fg:#FFE3A0') && polish.includes('--bb-status-fg:#FFD1CC'));
pass('Focus visible dark', polish.includes(':focus-visible') && polish.includes('outline:2px solid #8FB5FF'));
pass('Scrollbars dark', polish.includes('scrollbar-color:#3A4656'));
pass('SettingsHome usa tokens', !settingsHome.includes('background:#fff') && settingsHome.includes('var(--color-surface)'));

const failures=checks.filter((c)=>!c.ok);
for(const c of checks) console.log(`${c.ok?'PASS':'FAIL'}  ${c.name}${c.detail?` · ${c.detail}`:''}`);
console.log(`\nDark Mode v18.3.3: ${checks.length-failures.length}/${checks.length} PASS`);
if(failures.length) process.exit(1);
