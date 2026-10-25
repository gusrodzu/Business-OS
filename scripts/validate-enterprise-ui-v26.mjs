import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>readFileSync(path.join(root,relative),'utf8');
const foundation=read('apps/web/src/design-system/styles/foundation.css');
const system=read('apps/web/src/design-system/styles/enterprise-ux-v26.css');
const buttonCss=read('apps/web/src/design-system/components/Button.module.css');
const inputCss=read('apps/web/src/design-system/components/Input.module.css');
const selectCss=read('apps/web/src/design-system/components/Select.module.css');
const tableCss=read('apps/web/src/design-system/components/DataTable.module.css');
const input=read('apps/web/src/design-system/components/Input.jsx');
const select=read('apps/web/src/design-system/components/Select.jsx');
const button=read('apps/web/src/design-system/components/Button.jsx');
const doc=read('docs/design/BUSINESS_OS_UI_SYSTEM_V26.md');
const manifest=read('apps/web/src/design-system/styles/mobile-adaptive-v25.css');

const count=(value,substring)=>value.split(substring).length-1;
assert.equal(count(foundation,"@import './enterprise-ux-v26.css';"),1,'Design system v26 must be imported only once');
assert.ok(foundation.trimEnd().endsWith("@import './enterprise-ux-v26.css';"),'v26 is the final bounded layer');
assert.ok(!system.includes('[class*='),'Do not add broad class-substring CSS selectors to v26');
assert.match(system,/data-theme='dark'/,'dark theme tokens must stay isolated');
for(const key of ['--bb26-charcoal','--bb26-lime','--bb26-on-lime','--bb26-action','--bb26-focus','--bb26-control','--bb26-row']){
  assert.ok(system.includes(key),'Missing semantic token: '+key);
}
for(const [name,source,match] of [
  ['Button target',buttonCss,/\.md\{min-height:44px\}/],
  ['Input target',inputCss,/\.control\{min-height:44px/],
  ['Select target',selectCss,/\.control\{min-height:44px/],
  ['Data table focus',tableCss,/\.frame tbody tr:focus-within/],
  ['Input error',input,/"aria-invalid"|aria-invalid=/],
  ['Input guidance',input,/aria-describedby=/],
  ['Select error',select,/aria-invalid=/],
  ['Select guidance',select,/aria-describedby=/],
  ['Button loading feedback',button,/aria-busy=/],
  ['Previous mobile layout',manifest,/overflow-x:auto/],
])assert.match(source,match,'Missing v26 contract: '+name);
for(const word of ['Ventas','Cobranza','Inventario','Compras','Punto de Venta','CRM','Recursos Humanos','Producción','Proyectos','Marketing','Facturación']){
  assert.ok(doc.includes(word),'Unmapped workstream: '+word);
}
assert.ok(doc.includes('NO todas concluidas'),'Roadmap must distinguish design coverage from completion');

// WCAG 2.2: ≥4.5:1 contrast for normal text, ≥3:1 for large text.
// Only checks approved immutable identity samples; run axe/device QA for dynamic themes.
function rgb(hex){assert.match(hex,/^#[\da-f]{6}$/i);return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);}
function luminance(hex){const [r,g,b]=rgb(hex);return .2126*r+.7152*g+.0722*b;}
function contrast(a,b){const aa=luminance(a),bb=luminance(b);return (Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05);}
for(const [name,a,b] of [
  ['Charcoal/white','#252628','#ffffff'],
  ['Lime/charcoal','#dcfb60','#252628'],
  ['On-lime/lime','#283211','#dcfb60'],
  ['Muted text/white','#51615c','#ffffff'],
  ['Primary action/white','#405419','#ffffff'],
  ['Dark muted/dark surface','#c0cdc5','#17201d'],
])assert.ok(contrast(a,b)>=4.5,name+' normal text contrast is below 4.5:1');
console.log('PASS enterprise UX v26: tokens, contrast, dark mode, accessibility, 44px controls, responsive contract, module roadmap');
console.log('NOTE visual audits and workflow tests remain required for each module before claiming full redesign.');
