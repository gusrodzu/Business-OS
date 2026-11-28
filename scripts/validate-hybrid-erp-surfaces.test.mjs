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

test('Pocket app cards compact padding without changing desktop defaults',()=>{
 const css=readFileSync(new URL('Card.module.css',root),'utf8');
 const scope=":global([data-pocket-os='true'][data-os-app='true'])";
 const compact=css.split('/* Pocket OS workspace cards:')[1];
 assert.ok(compact,'Pocket card styles must be present');
 const phone=compact.split('@media(max-width:760px){')[1]?.split('@media(max-width:380px){')[0];
 const narrow=compact.split('@media(max-width:380px){')[1];
 assert.ok(phone && narrow,'Both phone width tiers must remain');
 for(const rule of ['.sm{padding:12px}', '.md{padding:16px}', '.lg{padding:20px}']){
  assert.ok(phone.includes(scope+' '+rule),rule+' must be scoped to Pocket app windows');
 }
 for(const rule of ['.md{padding:14px}', '.lg{padding:16px}']){
  assert.ok(narrow.includes(scope+' '+rule),rule+' must be scoped to narrow Pocket app windows');
 }
 assert.ok(phone.includes(scope+' .card{'));
 assert.match(phone,/box-sizing:border-box;max-width:100%/);
 assert.ok(css.includes('.sm{padding:16px}.md{padding:20px}.lg{padding:24px}'));
});
