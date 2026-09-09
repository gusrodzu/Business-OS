import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const api=read('apps/api/src/modules/operations/api/dataHub.js');
const ops=read('apps/api/src/modules/operations/index.js');
const platform=read('apps/api/src/modules/platform/index.js');
const ui=read('apps/web/src/modules/operations/ui/pages/DataHub.jsx');
const nav=read('apps/web/src/data/navigation.js');
const hr=read('apps/web/src/modules/hr/ui/pages/HumanResources.jsx');
const inv=read('apps/web/src/modules/inventory/ui/pages/Products.jsx');
const sup=read('apps/web/src/modules/procurement/ui/pages/Suppliers.jsx');
const crm=read('apps/web/src/modules/crm/ui/pages/BusinessParties.jsx');
const checks=[
 ['Data Hub pertenece a Operations',ops.includes("'/api/data-hub'")&&!platform.includes("'/api/data-hub'")],
 ['Aislamiento tenant en jobs',api.includes('companyId:req.auth.companyId')],
 ['Permiso de lectura',api.includes("requirePermission('data_hub.read')")],
 ['Permiso de importación',api.includes("requirePermission('data_hub.import')")],
 ['Permiso de rollback',api.includes("requirePermission('data_hub.rollback')")],
 ['Excel CSV XLS',api.includes('/\\.(csv|xlsx|xls)$/i')],
 ['Detección automática',api.includes('function detectEntity(headers)')&&api.includes("entityType==='AUTO'")],
 ['Mapeo inteligente/fuzzy',api.includes('function similarity(a,b)')&&api.includes('suggestMapping')],
 ['Múltiples hojas',api.includes('workbookSheets(file)')&&api.includes('req.body.sheetName')],
 ['Duplicados dentro del archivo',api.includes('seenFingerprints')&&api.includes('Duplicado dentro del archivo')],
 ['Límite masivo 5000',api.includes('rows.length>5000')],
 ['Rollback persiste snapshot',api.includes('beforeData')&&api.includes('ROLLING_BACK')],
 ['UI por módulos',ui.includes('moduleCards')&&ui.includes('Importación por módulo')],
 ['UI muestra confianza',ui.includes('Confianza de interpretación')],
 ['UI previsualiza archivo',ui.includes('Vista previa del archivo')],
 ['Data Hub visible para tenant',nav.includes("{label: 'Importar datos', icon: FileText, to: '/data-hub'}")],
 ['RRHH importa plantilla',hr.includes('/data-hub?entity=EMPLOYEE')],
 ['Inventario importa productos',inv.includes('/data-hub?entity=PRODUCT')],
 ['Compras importa proveedores',sup.includes('/data-hub?entity=SUPPLIER')],
 ['CRM importa clientes',crm.includes('/data-hub?entity=CUSTOMER')],
];
let fail=0; console.log('\nBuzzBee Smart Import Audit v15.1.0\n================================');
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`); if(!ok)fail++;}
console.log(`\n${checks.length-fail}/${checks.length} PASS${fail?` · ${fail} FAIL`:''}`); process.exitCode=fail?1:0;
