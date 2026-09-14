import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8');
let pass=0, fail=0;
function check(name,ok,detail=''){if(ok){pass++;console.log(`PASS ${name}`)}else{fail++;console.log(`FAIL ${name}${detail?` · ${detail}`:''}`)}}

const root=JSON.parse(read('package.json'));
const api=JSON.parse(read('apps/api/package.json'));
const web=JSON.parse(read('apps/web/package.json'));
const version=read('apps/api/src/lib/version.js');
const ux=read('apps/web/src/ux-foundation/UXFoundation.jsx');
const uxCss=read('apps/web/src/ux-foundation/UXFoundation.module.css');
const tasks=read('apps/web/src/modules/operations/ui/pages/TaskCenter.jsx');
const operations=read('apps/web/src/modules/operations/routes.jsx');
const nav=read('apps/web/src/data/navigation.js');
const sidebar=read('apps/web/src/layout/Sidebar.jsx');
const palette=read('apps/web/src/framework/CommandPalette.jsx');
const dashboard=read('apps/web/src/modules/core/ui/pages/Dashboard.jsx');
const requests=read('apps/web/src/modules/procurement/ui/pages/PurchaseRequests.jsx');
const offline=read('apps/web/src/offlineBusinessData.js')+read('apps/web/src/offlineDemo.js');

check('Versión raíz compatible v19.x',root.version.startsWith('19.'),root.version);
check('Versión API compatible v19.x',api.version.startsWith('19.'),api.version);
check('Versión Web compatible v19.x',web.version.startsWith('19.'),web.version);
check('APP_VERSION compatible v19.x',/APP_VERSION = '19\.[0-9]+\.[0-9]+'/.test(version));

for(const name of ['PageHeader','FilterBar','SavedViews','BulkActionsBar','SmartTable','EntityDrawer','PageSkeleton','EmptyState','NoResultsState','InlineErrorState']) check(`Foundation exporta ${name}`,ux.includes(`export function ${name}`));
check('EntityDrawer cierra con Escape',ux.includes("event.key === 'Escape'"));
check('SmartTable tiene cabecera sticky',uxCss.includes('position:sticky'));
check('Foundation soporta responsive',uxCss.includes('@media(max-width:760px)'));

check('Ruta /tareas registrada',operations.includes("path: 'tareas'")&&operations.includes('TaskCenter'));
check('Sidebar Tareas usa /tareas',nav.includes("label: 'Tareas'")&&nav.includes("to: '/tareas'"));
check('Task Center usa PageHeader',tasks.includes('<PageHeader'));
check('Task Center usa bandeja unificada',tasks.includes('Trabajo que requiere atención'));
check('Task Center usa EntityDrawer',tasks.includes('<EntityDrawer'));
check('Task Center permite aprobar',tasks.includes("decide('approve')"));
check('Task Center permite rechazar',tasks.includes("decide('reject')"));
check('Task Center combina inventario crítico',tasks.includes('criticalProducts'));

check('Home contextual por rol',dashboard.includes('roleActions')&&dashboard.includes('data-ux-v19="role-home"'));
check('Home dirige atención a /tareas',dashboard.includes("navigate('/tareas')"));
check('Compras usa PageHeader v19',requests.includes('<PageHeader'));
check('Compras usa vistas guardadas',requests.includes('<SavedViews'));
check('Compras usa FilterBar',requests.includes('<FilterBar'));
check('Compras usa SmartTable',requests.includes('<SmartTable'));
check('Compras usa acciones masivas',requests.includes('<BulkActionsBar'));
check('Compras permite filtros por estado/prioridad',requests.includes('statusFilter')&&requests.includes('priorityFilter'));

check('Sidebar recuerda recientes',sidebar.includes('buzzbee.ux.recents')&&sidebar.includes('rememberRecent'));
check('Sidebar muestra favoritos',sidebar.includes('buzzbee.ux.favorites')&&sidebar.includes('quickAccess'));
check('Command Palette soporta ArrowDown',palette.includes("event.key === 'ArrowDown'"));
check('Command Palette soporta ArrowUp',palette.includes("event.key === 'ArrowUp'"));
check('Command Palette soporta Enter',palette.includes("event.key === 'Enter'"));
check('Command Palette integra recientes',palette.includes("group:'Recientes'"));

check('Offline soporta /approvals/dashboard',offline.includes("'/approvals/dashboard'"));
check('Offline soporta /dashboard',offline.includes("'/dashboard'"));
check('Offline soporta /purchase-requests',offline.includes("'/purchase-requests'"));

console.log(`\nBuzzBee UX Foundation · v19.x compatible`);
console.log(`${pass}/${pass+fail} PASS · ${fail} FAIL`);
process.exit(fail?1:0);
