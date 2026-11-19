import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.module.css',import.meta.url),'utf8');

test('keyboard focus shadow applies only to floating windows, never snapped or maximized',()=>{
  assert.match(css,/\\.slot:focus-within:not\\(\\.maximized\\):not\\(\\.snapped\\)\\s*\\{\\s*filter:drop-shadow/);
  assert.match(css,/\\.snapped\\s*\\{[^}]*filter:none/);
  assert.match(css,/\\.maximized\\s*\\{[^}]*filter:none/);
});
