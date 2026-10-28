import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>readFileSync(path.join(root,p),'utf8');
const test=(name,pass)=>{assert.ok(pass,name);console.log('PASS · '+name);};
const style='apps/web/src/';
const tokens=read(style+'design-system/styles/enterprise-ui-v26.css');
for(const token of ['--bb28-space-inline','--bb28-page-gap','--bb28-panel-gap','--bb28-panel-padding','--bb28-control-gap','--bb28-row-pad-y']){
  test('Shared spacing token '+token,tokens.includes(token+':'));
}
const shell=read(style+'layout/AppShell.module.css');
test('Workspace rail gap remains intact',shell.includes('--bb-workspace-rail-gap:clamp(16px,1.35vw,22px)'));
test('Desktop safe-area padding and untouched mobile layout',shell.includes('padding-inline:var(--bb28-space-inline')
  && shell.includes('@media(min-width:1181px)')
  && shell.includes('padding:16px 12px calc(96px + env(safe-area-inset-bottom,0px))!important'));
const ux=read(style+'ux-foundation/UXFoundation.module.css');
test('Shared filter and table spacing',ux.includes('.filterBar{gap:var(--bb28-control-gap,12px)')
  && ux.includes('.smartTable tbody td{padding:var(--bb28-row-pad-y,14px)'));
test('Responsive table remains locally scrollable',ux.includes('.tableScroller{max-width:100%;overflow:auto}'));
const header=read(style+'design-system/components/PageHeader.module.css');
const kpi=read(style+'components/KpiGrid.module.css');
test('Shared page headers and KPI grid use rhythm',header.includes('--bb28-panel-gap')&&kpi.includes('--bb28-panel-gap'));
const cases=[
  ['sales/ui/pages/SalesFulfillment.module.css','.toolbar{min-width:0;','Historial'],
  ['procurement/ui/pages/GoodsReceipts.module.css','.orderGrid{min-width:0;','Recepciones'],
  ['pos/ui/pages/Pos.module.css','.posWorkspace{min-width:0;','Punto de venta'],
  ['production/ui/pages/Production.module.css','.overviewGrid{min-width:0;','Producción'],
  ['crm/ui/pages/Marketing.module.css','.performanceTable{min-width:0;','Marketing'],
];
for(const [file,marker,label] of cases){
  const css=read(style+'modules/'+file);
  test(label+' has scoped panel spacing',css.includes('Rhythm v2')&&css.includes(marker)&&css.includes('--bb28-'));
  test(label+' keeps responsive control',css.includes('@media(max-width:760px)'));
}
// Shared responsive primitives: four ERP domains reuse the same scoped CSS Module.
const sharedResponsive=read(style+'design-system/components/ErpModuleResponsive.module.css');
test('Shared ERP responsive primitives retain desktop/tablet/mobile contracts',
  sharedResponsive.includes('@media (max-width:1180px)')
  && sharedResponsive.includes('@media (max-width:760px)')
  && sharedResponsive.includes('.headerStack')
  && sharedResponsive.includes('.searchFluid')
  && sharedResponsive.includes('.tableScroll')
  && sharedResponsive.includes('.twoThenSingle')
  && sharedResponsive.includes('.mobileSingle')
  && sharedResponsive.includes('.overlayBound'));
const responsiveModules=[
  ['sales/ui/pages/Sales.module.css',['page','header','toolbar','search','metrics','tableWrap']],
  ['procurement/ui/pages/PurchaseRequests.module.css',['page','header','toolbar','search','metrics','tableWrap']],
  ['inventory/ui/pages/Inventory.module.css',['page','header','toolbar','search','metrics','tableWrap']],
  ['finance/ui/pages/CashFlow.module.css',['page','header','toolbar','search','metrics','tableWrap']],
];
for(const [file,classes] of responsiveModules){
  const css=read(style+'modules/'+file);
  const source='../../../../design-system/components/ErpModuleResponsive.module.css';
  test('Scoped responsive CSS composition in '+file,
    classes.every(name=>new RegExp('\\\\.'+name+'\\\\{composes:[^}]+ErpModuleResponsive\\\\.module\\\\.css').test(css))
    && css.includes(source)
    && !css.includes('/* v8.1.1 — Vertical split-screen responsiveness */')
    && !css.includes('  .paymentModal,'));
}

const pos=read(style+'modules/pos/ui/pages/Pos.jsx');
const sales=read(style+'modules/sales/ui/pages/SalesFulfillment.jsx');
const purchases=read(style+'modules/procurement/ui/pages/GoodsReceipts.jsx');
test('Transactional UIs remain intact',
  pos.includes('Ticket actual')&&sales.includes('Historial de entregas')&&purchases.includes('Órdenes por recibir'));
console.log('PASS · Shared spacing v2 — desktop, tablet, mobile, cards and modules');
