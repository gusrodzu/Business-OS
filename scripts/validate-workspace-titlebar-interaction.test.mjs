import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.jsx',import.meta.url),'utf8');
test('drag and maximize gestures ignore interactive titlebar controls',()=>{
 const selector='button, a, input, textarea, select, [role="button"], [contenteditable="true"], [data-os-no-drag]';
 assert.match(source,/function startDrag\(event,window\)/);
 assert.ok(source.includes(`event.target.closest('${selector}')`));
 assert.ok(source.includes(`onHeaderDoubleClick={event=>{if(!event.target.closest('${selector}'))onMaximize(window.key);}}`));
});
