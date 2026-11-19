import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../apps/web/src/design-system/components/',import.meta.url);
for(const component of ['Input','Select','Button']){
 test(component+' inherits shared hybrid OS control tokens',()=>{
  const css=readFileSync(new URL(component+'.module.css',root),'utf8');
  assert.match(css,/--workspace-radius-control/);
  assert.match(css,/--workspace-control-min-height/);
  assert.match(css,/--workspace-touch-target/);
  assert.match(css,/prefers-reduced-motion:reduce/);
 });
}
test('Input and Select have matching shared focus tokens',()=>{
 for(const component of ['Input','Select']){
  const css=readFileSync(new URL(component+'.module.css',root),'utf8');
  assert.match(css,/--workspace-divider/);
  assert.match(css,/--workspace-focus/);
  assert.match(css,/--workspace-accent/);
 }
});
