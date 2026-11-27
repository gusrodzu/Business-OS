import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.module.css',import.meta.url),'utf8');
const stage=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.jsx',import.meta.url),'utf8');
test('maximized windows use all available stage space above the dock',()=>{
  assert.match(css,/bottom:calc\(var\(--ws-desktop-dock-clearance,120px\) \+ env\(safe-area-inset-bottom,0px\)\)/);
  assert.match(css,/\.maximized\{inset:0!important/);
  assert.match(css,/\.maximized :global\(\[data-os-application-window='true'\]\)\{\s*border-radius:0/);
});
test('window controls keep maximize and snap connected',()=>{
  assert.match(stage,/onMaximize/);
  assert.match(stage,/onSnap/);
  assert.match(stage,/styles\.maximized/);
  assert.match(stage,/styles\.snapped/);
});
