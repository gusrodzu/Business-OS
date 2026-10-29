import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  DEMO_INDUSTRIES,DEMO_PORTFOLIO_EXAMPLES,DEMO_PORTFOLIO_STORAGE_KEY,
  createDemoCompany,normalizeDemoCompany,readDemoCompanies,writeDemoCompanies,
} from '../apps/web/src/modules/operations/ui/pages/demoCompanyPortfolio.js';

const root=new URL('../',import.meta.url);
const read=(path)=>readFileSync(new URL(path,root),'utf8');
const pass=(label,check)=>{assert.ok(check,label);console.log('PASS · '+label);};
const memory=new Map();
const storage={
  getItem:key=>memory.get(key)??null,
  setItem:(key,value)=>memory.set(key,value),
};

pass('Industry presets include distinct per-sector dashboards',
  Object.keys(DEMO_INDUSTRIES).length>=8
  && Object.values(DEMO_INDUSTRIES).every(profile=>profile.metrics.length>=4 && profile.modules.length>=3
    && new Set(profile.metrics.map(metric=>metric.id)).size===profile.metrics.length
    && profile.metrics.every(metric=>metric.label && metric.value && metric.hint)));
const examples=readDemoCompanies(storage);
pass('Sample companies are explicit and initially separate',examples.length>=4
  && examples.every(company=>company.source==='example') && DEMO_PORTFOLIO_EXAMPLES.length===examples.length);
const refacciones=createDemoCompany({name:'Comercial de muestra A',industry:'refaccionaria',note:'Stock'});
const restaurante=createDemoCompany({name:'Restaurante de muestra B',industry:'restaurante'});
pass('Custom demo companies have distinct IDs and sector-specific metric keys',Boolean(refacciones&&restaurante)
  && refacciones.id!==restaurante.id
  && refacciones.metricIds.includes('stock')
  && restaurante.metricIds.includes('mesas')
  && !restaurante.metricIds.includes('stock'));
pass('Persisted demo portfolio keeps companies isolated',writeDemoCompanies([...examples,refacciones,restaurante],storage)
  && memory.has(DEMO_PORTFOLIO_STORAGE_KEY)
  && readDemoCompanies(storage).length===examples.length+2);
const changed=readDemoCompanies(storage).map(company=>company.id===refacciones.id?{...company,metricIds:['ventas'],modules:['pos']}:company);
writeDemoCompanies(changed,storage);
const restored=readDemoCompanies(storage);
pass('Metric and module preferences belong to the selected company only',
  restored.find(c=>c.id===refacciones.id)?.metricIds.join(',')==='ventas'
  && restored.find(c=>c.id===refacciones.id)?.modules.join(',')==='pos'
  && restored.find(c=>c.id===restaurante.id)?.metricIds.includes('mesas')
  && restored.find(c=>c.id===restaurante.id)?.modules.includes('inventario'));
pass('Unknown industries and invalid records cannot enter demo portfolio',
  !createDemoCompany({name:'Invalid',industry:'__proto__'})
  && !normalizeDemoCompany({id:'../../other-company',name:'Nope',industry:'clinica'})
  && !writeDemoCompanies([...examples,{id:'bad',name:'Bad',industry:'unknown'}],storage));
const inaccessibleStorage={getItem(){throw new Error('Storage blocked');},setItem(){throw new Error('Storage blocked');}};
pass('Storage-denied environments recover without changing authentication',
  readDemoCompanies(inaccessibleStorage).length===examples.length
  && writeDemoCompanies(examples,inaccessibleStorage)===false);

const routes=read('apps/web/src/modules/operations/routes.jsx');
const list=read('apps/web/src/modules/operations/ui/pages/DemoCompanies.jsx');
const workspace=read('apps/web/src/modules/operations/ui/pages/DemoCompanyWorkspace.jsx');
const shell=read('apps/web/src/layout/AppShell.jsx');
const css=read('apps/web/src/modules/operations/ui/pages/DemoCompanies.module.css');
pass('Company list and detail use registered, non-conflicting ERP routes',
  routes.includes("path: 'demo/empresas'")
  && routes.includes("path: 'demo/empresas/:companyId'")
  && routes.includes("Component: DemoCompanies")
  && routes.includes("Component: DemoCompanyWorkspace"));
pass('Company portfolio and dashboards are gated to Demo Local only',
  list.includes('if(!offlineDemo)return <Navigate to="/" replace/>')
  && workspace.includes('if(!offlineDemo)return <Navigate to="/" replace/>')
  && shell.includes("navigate('/demo/empresas')"));
pass('Demo labels distinguish previews from real ERP tenants and licensed modules',
  list.includes('No son tenants activos') && list.includes('sus KPI son ficticios')
  && workspace.includes('Todos los valores son ficticios')
  && workspace.includes('no cambia la empresa activa'));
pass('Company dashboards retain rectangular KPI cards and separate scoped settings',
  workspace.includes('data-dashboard-kpi-grid="cards"')
  && workspace.includes('company.metricIds.includes(')
  && workspace.includes('company.modules.includes(')
  && workspace.includes('company.id===companyId')
  && !css.includes('!important'));
console.log('PASS · Demo Local company portfolio architecture and isolation');
