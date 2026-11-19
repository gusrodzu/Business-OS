import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../apps/web/src/design-system/components/',import.meta.url);
for(const name of ['Card','DataTable','Textarea']){
 test(name+' uses shared hybrid OS surface and divider tokens',()=>{
  const css=readFileSync(new URL(name+'.module.css',root),'utf8');
  assert.match(css,/--workspace-divider/);
  assert.match(css,/--workspace-surface/);
 });
}
test('ERP tables retain horizontal scrolling and keyboard focus',()=>{
 const css=readFileSync(new URL('DataTable.module.css',root),'utf8');
 assert.match(css,/overflow-x:auto/);
 assert.match(css,/\.scroller:focus-visible/);
 assert.match(css,/--workspace-accent/);
});
test('multiline inputs retain error and motion accommodations',()=>{
 const css=readFileSync(new URL('Textarea.module.css',root),'utf8');
 assert.match(css,/\.hasError/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/--workspace-focus/);
});
