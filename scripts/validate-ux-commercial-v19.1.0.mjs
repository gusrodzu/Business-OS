import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8');
let pass=0,fail=0;
function check(name,ok,detail=''){if(ok){pass++;console.log(`PASS ${name}`)}else{fail++;console.log(`FAIL ${name}${detail?` · ${detail}`:''}`)}}

const root=JSON.parse(read('package.json'));
const api=JSON.parse(read('apps/api/package.json'));
const web=JSON.parse(read('apps/web/package.json'));
const version=read('apps/api/src/lib/version.js');
const sales=read('apps/web/src/modules/sales/ui/pages/SalesEnterprise.jsx');
const salesCss=read('apps/web/src/modules/sales/ui/pages/SalesEnterprise.module.css');
const products=read('apps/web/src/modules/inventory/ui/pages/Products.jsx');
const productCss=read('apps/web/src/modules/inventory/ui/pages/Catalog.module.css');
const balances=read('apps/web/src/modules/inventory/ui/pages/InventoryBalances.jsx');
const inventoryCss=read('apps/web/src/modules/inventory/ui/pages/Inventory.module.css');
const crm=read('apps/web/src/modules/crm/ui/pages/Crm.jsx');
const crmCss=read('apps/web/src/modules/crm/ui/pages/Crm.module.css');
const offline=read('apps/web/src/offlineBusinessData.js')+read('apps/web/src/offlineDemo.js');

check('Versión raíz compatible >= v19.1.0',/^19\.(?:[1-9]|[1-9]\d+)\.\d+$/.test(root.version),root.version);
check('Versión API alineada',api.version===root.version,api.version);
check('Versión Web alineada',web.version===root.version,web.version);
check('APP_VERSION alineada',version.includes(`APP_VERSION = '${root.version}'`));

for(const [label,source] of [['Ventas',sales],['Productos',products],['Existencias',balances],['CRM',crm]]){
  check(`${label} usa SavedViews`,source.includes('<SavedViews'));
  check(`${label} usa FilterBar`,source.includes('<FilterBar'));
  check(`${label} usa SmartTable`,source.includes('<SmartTable'));
  check(`${label} usa EntityDrawer`,source.includes('<EntityDrawer'));
}

check('Ventas tiene selección múltiple',sales.includes('selectedIds')&&sales.includes('<BulkActionsBar'));
check('Ventas tiene vistas de pipeline',sales.includes("id:'hot'")&&sales.includes("id:'followup'")&&sales.includes("id:'won'"));
check('Ventas alterna lista / kanban',sales.includes("pipelineMode")&&sales.includes("'kanban'"));
check('Ventas permite acción masiva de etapa',sales.includes('bulkChangeStage'));
check('Ventas drawer conserva contexto',sales.includes('drawerTab')&&sales.includes('Crear cotización'));
check('Ventas responsive UX CSS',salesCss.includes('v19.1.0')&&salesCss.includes('@media(max-width:760px)'));

check('Productos usa selección múltiple',products.includes('selectedIds')&&products.includes('<BulkActionsBar'));
check('Productos tiene vistas activas/inactivas',products.includes("id:'active'")&&products.includes("id:'inactive'"));
check('Productos tiene vista margen bajo',products.includes("id:'lowMargin'"));
check('Productos filtra categoría',products.includes('categoryFilter'));
check('Productos permite activar/desactivar en lote',products.includes('bulkStatus(true)')&&products.includes('bulkStatus(false)'));
check('Productos usa PageSkeleton',products.includes('<PageSkeleton'));
check('Productos CSS v19.1',productCss.includes('v19.1.0'));

check('Existencias calcula disponible de forma robusta',balances.includes('availableOf'));
check('Existencias calcula mínimo por posición/producto',balances.includes('minOf'));
check('Existencias tiene vistas de reabasto',balances.includes("id:'low'")&&balances.includes("id:'empty'"));
check('Existencias filtra almacén',balances.includes('warehouseFilter'));
check('Existencias drawer ofrece SOLPED',balances.includes("navigate('/compras/solicitudes')"));
check('Existencias usa PageSkeleton',balances.includes('<PageSkeleton'));
check('Existencias CSS v19.1',inventoryCss.includes('v19.1.0'));

check('CRM usa PageHeader v19',crm.includes('<PageHeader'));
check('CRM conserva ModuleTabs superior',crm.includes('<ModuleTabs'));
check('CRM tiene selección múltiple',crm.includes('selectedIds')&&crm.includes('<BulkActionsBar'));
check('CRM tiene vistas abiertas/hot/seguimiento',crm.includes("id:'open'")&&crm.includes("id:'hot'")&&crm.includes("id:'followup'"));
check('CRM filtra etapa',crm.includes('stageFilter'));
check('CRM permite bulk stage',crm.includes('bulkChangeStage'));
check('CRM drawer muestra actividad',crm.includes("id:'activity'")&&crm.includes('dashboard.activities.filter'));
check('CRM mantiene conversión a cliente',crm.includes('openConversion')&&crm.includes('Convertir a cliente'));
check('CRM CSS v19.1',crmCss.includes('v19.1.0'));

check('Offline expone dashboard ventas',offline.includes("'/sales-enterprise/dashboard'"));
check('Offline expone prospectos',offline.includes("'/sales-enterprise/prospects'"));
check('Offline expone productos',offline.includes("'/products'"));
check('Offline expone existencias',offline.includes("'/inventory/balances'"));
check('Offline expone clientes',offline.includes("'/customers'"));
check('Offline prospectos normalizan estimatedValue',offline.includes('estimatedValue:Number(prospect?.estimatedValue ?? prospect?.value ?? 0)'));

console.log(`\nBuzzBee Commercial + Inventory + CRM UX · v19.1.0`);
console.log(`${pass}/${pass+fail} PASS · ${fail} FAIL`);
process.exit(fail?1:0);
