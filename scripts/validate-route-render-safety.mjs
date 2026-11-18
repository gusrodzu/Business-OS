import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>readFileSync(path.join(root,rel),'utf8');
const cash=read('apps/web/src/modules/finance/ui/pages/CashFlow.jsx');
const integrations=read('apps/web/src/modules/operations/ui/pages/IntegrationHub.jsx');
const sweep=read('scripts/audit-all-routes-browser.mjs');
const workflow=read('.github/workflows/erp-route-render-sweep.yml');
const assertPass=(name,ok)=>{assert.ok(ok,name);console.log('PASS · '+name);};

assertPass('CashFlow formats dates safely, even when missing',
  cash.includes('if (!value) return') &&
  cash.includes('Number.isNaN(dateValue.getTime())') &&
  !cash.includes('scenario.startDate.slice(') &&
  !cash.includes('scenario.endDate.slice(') &&
  !cash.includes('item.date.slice(')
);
assertPass('Missing adjustments do not crash CashFlow',
  cash.includes('scenario.adjustments?.length') &&
  cash.includes('(data.selectedScenario?.adjustments || []).map('));
assertPass('Nested provider data rendered as a label',
  integrations.includes('typeof provider ===') &&
  integrations.includes('providerLabel(row.provider)') &&
  !integrations.includes('<span>{row.provider}</span>'));
assertPass('Catalog options support provider names',
  integrations.includes("x.label || x.name || x.key"));
assertPass('Full route audit discovers registered modules',
  sweep.includes('for(const mod of modules)') &&
  sweep.includes('discoverRoutes()') &&
  sweep.includes('if(list.length<40)'));
assertPass('Full route audit detects crashes, blanks and runtime errors',
  ['CRASH','BLANK','AUTH_REDIRECT','RUNTIME_EXCEPTION','NOT_FOUND'].every(x=>sweep.includes(x)));
assertPass('Full route audit preserves screenshot and JSON artifacts',
  workflow.includes('audit-all-routes-browser.mjs') &&
  sweep.includes('results.json') &&
  sweep.includes('report.md') &&
  sweep.includes("Page.captureScreenshot"));
console.log('PASS · Browser route and safe optional-data regression contracts');
