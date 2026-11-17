import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(file)=>readFileSync(path.join(root,file),'utf8');
const pages=['SalesReturns','SalesFulfillment'];
for(const page of pages){
  const css=read('apps/web/src/modules/sales/ui/pages/'+page+'.module.css');
  const jsx=read('apps/web/src/modules/sales/ui/pages/'+page+'.jsx');
  assert.match(css,/Sales documents: flat underlined tabs/);
  assert.match(css,/:global\(\[data-fluid-module='sales'\]\) \.tabs > button/);
  assert.match(css,/border-radius:0!important/);
  assert.match(css,/border-bottom:2px solid transparent!important/);
  assert.match(css,/\.tabs > button\[aria-pressed='true'\]/);
  assert.equal((jsx.match(/aria-pressed=\{tab ===/g)||[]).length,2);
  assert.equal((jsx.match(/type="button"\s+aria-pressed=/g)||[]).length,2);
  console.log('PASS · '+page+' uses flat underline-only accessible tabs');
}
const audit=read('scripts/audit-all-routes-browser.mjs');
assert.match(audit,/TAB_PILL_REGRESSION/);
assert.match(audit,/SALES_TABS_GEOMETRY/);
assert.match(audit,/for\(const width of \[1440,390\]\)/);
assert.match(audit,/\/ventas\/devoluciones/);
assert.match(audit,/\/ventas\/operacion/);
console.log('PASS · Responsive browser geometry guards exist');
