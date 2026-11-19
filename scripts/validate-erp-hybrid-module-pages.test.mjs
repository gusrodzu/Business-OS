import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const paths=['sales/ui/pages/Sales.module.css','procurement/ui/pages/PurchaseOrders.module.css','inventory/ui/pages/Inventory.module.css','finance/ui/pages/CashFlow.module.css'];
for(const path of paths){
 test(path+' inherits hybrid OS page tokens and keyboard affordances',()=>{
  const css=readFileSync(new URL('../apps/web/src/modules/'+path,import.meta.url),'utf8');
  for(const token of ['--workspace-foreground','--workspace-divider','--workspace-surface','--workspace-accent','--workspace-touch-target'])assert.ok(css.includes(token),token);
  assert.match(css,/\.page :is\(button,a,input,select,textarea\):focus-visible/);
  assert.match(css,/prefers-reduced-motion:reduce/);
 });
}
