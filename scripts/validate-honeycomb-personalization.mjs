import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  DEFAULT_METRICS,
  METRIC_CATALOG,
  dashboardPreferencesKey,
  defaultDashboardPreferences,
  normalizeDashboardPreferences,
  readDashboardPreferences,
  reorderDashboardMetric,
  writeDashboardPreferences,
} from '../apps/web/src/components/honeycombPreferences.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>readFileSync(path.join(root,p),'utf8');
const check=(name,condition)=>{assert.ok(condition,name);console.log('PASS · '+name);};

check('Dashboard has at least ten real-data metric choices',METRIC_CATALOG.length>=10);
check('Metric IDs are unique',new Set(METRIC_CATALOG.map(m=>m.id)).size===METRIC_CATALOG.length);
check('Four dashboard default metrics preserved',DEFAULT_METRICS.length===4);
check('Defaults can be reset independently',defaultDashboardPreferences().selectedMetrics!==defaultDashboardPreferences().selectedMetrics);
const normalized=normalizeDashboardPreferences({
  selectedMetrics:['inventoryValue','inventoryValue','not-permitted','activeUsers'],
  hiddenWidgets:['stock','not-a-widget','stock'],compact:true,
});
check('Invalid, duplicate and unknown metric IDs are discarded',
  JSON.stringify(normalized.selectedMetrics)===JSON.stringify(['inventoryValue','activeUsers']));
check('Unknown widgets cannot enter preferences',
  normalized.hiddenWidgets.length===1&&normalized.hiddenWidgets[0]==='stock');
check('Reordering is immutable and bounds-safe',
  JSON.stringify(reorderDashboardMetric(['a','b','c'],'b',-1))===JSON.stringify(['b','a','c'])
  && JSON.stringify(reorderDashboardMetric(['a','b','c'],'a',-1))===JSON.stringify(['a','b','c']));
const store=new Map();
const browserStore={
  getItem(key){return store.get(key)||null;},
  setItem(key,value){store.set(key,value);},
};
const userA=dashboardPreferencesKey({id:'user-a',companyId:'company-1'},true);
const userB=dashboardPreferencesKey({id:'user-b',companyId:'company-1'},true);
const userC=dashboardPreferencesKey({id:'user-a',companyId:'company-2'},true);
check('User and company scopes are distinct',new Set([userA,userB,userC]).size===3);
store.set('erp-dashboard-preferences',JSON.stringify({compact:true,hiddenWidgets:['stock']}));
const migrated=readDashboardPreferences(userA,browserStore);
check('Legacy layout migrated for first user',migrated.compact&&migrated.hiddenWidgets.includes('stock'));
const second=readDashboardPreferences(userB,browserStore);
check('Legacy layout is not copied into second account',!second.compact&&!second.hiddenWidgets.length);
check('Can persist independent metric arrangement',
  writeDashboardPreferences(userA,{selectedMetrics:['activeUsers','criticalStock'],compact:true},browserStore)
  && readDashboardPreferences(userA,browserStore).selectedMetrics[0]==='activeUsers'
  && readDashboardPreferences(userB,browserStore).selectedMetrics.length===4);
check('Blocked storage leaves a usable default',
  !writeDashboardPreferences(userA,defaultDashboardPreferences(),{setItem(){throw Error('denied')}})
  && readDashboardPreferences(userA,{getItem(){throw Error('denied')}}).selectedMetrics.length===4);

for(const page of ['apps/web/src/modules/core/ui/pages/Dashboard.jsx','apps/web/src/pages/Dashboard.jsx']){
  const jsx=read(page);
  check(page+' preserves dashboard sources and personalized metrics',
    jsx.includes("apiRequest('/dashboard')")
    && jsx.includes('selectedMetrics')
    && jsx.includes('<HoneycombKpis items={kpis}')
    && jsx.includes('onMove={moveMetric}')
    && jsx.includes('onToggleWidget={toggleWidget}')
    && jsx.includes('onToggleMetric={toggleMetric}')
    && jsx.includes('dashboardPreferencesKey(user, offlineDemo)'));
}
const component=read('apps/web/src/components/HoneycombKpis.jsx');
const css=read('apps/web/src/components/HoneycombKpis.module.css');
check('Accessible add, reorder and remove controls',
  component.includes('data-honeycomb-add="true"')
  && component.includes('aria-label={`Mover ${item.label} a la izquierda`}')
  && component.includes('aria-label={`Quitar ${item.label} del panal`}')
  && css.includes('.editTools button:focus-visible'));
check('Flat-top geometry and responsive honeycomb preserved',
  css.includes('clip-path:polygon(25% 0,75% 0,100% 50%')
  && css.includes('@media(max-width:620px)')
  && component.includes('data-honeycomb-layout={layout.mode}')
  && component.includes('ResizeObserver(resize)'));
console.log('PASS · Per-user editable honeycomb, data catalog and offline preference safety');
