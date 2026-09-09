import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8');
let pass=0, fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'}  ${name}`); ok?pass++:fail++;};

const shell=read('apps/web/src/layout/AppShell.jsx');
const shellCss=read('apps/web/src/layout/AppShell.module.css');
const settingsRoutes=read('apps/web/src/modules/settings/routes.jsx');
const settingsHome=read('apps/web/src/modules/settings/ui/pages/SettingsHome.jsx');
const platform=read('apps/api/src/modules/platform/api/platformAdmin.js');
const agenda=read('apps/api/src/modules/core/api/agenda.js');

check('Demo LIVE is an explicit shell state', shell.includes("data-demo-live={demoLive ? 'true' : 'false'}"));
check('Demo LIVE grid has five explicit rows', shellCss.includes(".workspace[data-demo-live='true']") && shellCss.includes("grid-template-rows:auto auto auto minmax(0,1fr) auto!important"));
check('Demo banner remains outside scrollable content', shell.indexOf('demoLiveBanner') < shell.indexOf('<Topbar') && shell.indexOf('<Topbar') < shell.indexOf('<ModuleTabBar'));
check('Business content remains the minmax scroll row', shellCss.includes('.businessLayout') && shellCss.includes('min-height:0'));
check('Exact /configuracion route exists', settingsRoutes.includes("path: 'configuracion', Component: SettingsHome"));
check('Settings no longer uses Sprint 2 placeholder', !settingsHome.includes('Sprint 2') && !settingsHome.includes('Base del módulo preparada'));
check('Settings explains tenant isolation', settingsHome.includes('Configuración aislada por empresa'));
check('Demo LIVE has dedicated tenant role', platform.includes("name: 'Demo Administrator'"));
check('Demo role excludes platform permissions', platform.includes("startsWith: 'platform.'"));
check('Demo user roles are replaced by isolated demo role', platform.includes('prisma.userRole.deleteMany({where: {userId}})'));
check('Demo role receives current tenant permissions', platform.includes('tenantPermissions.map') && platform.includes('prisma.rolePermission.upsert'));
check('Agenda still requires explicit tenant permission', agenda.includes("requirePermission('agenda.read')"));

console.log(`\nDemo LIVE Layout v15.0.6: ${pass} PASS / ${fail} FAIL`);
process.exitCode=fail?1:0;
