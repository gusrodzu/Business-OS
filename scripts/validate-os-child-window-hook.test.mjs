import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const hook=readFileSync(new URL('../apps/web/src/layout/os/useOSWindowManager.js',import.meta.url),'utf8');
test('window manager exposes a scoped child launcher',()=>{
 assert.match(hook,/function openChild\(parentKey,childId\)/);
 assert.match(hook,/dispatch\(\{type:'OPEN_CHILD',scope,parentKey,childId\}\)/);
 assert.match(hook,/return \{\.\.\.state,focus,openChild,/);
});
test('closing parent excludes child from next navigation target',()=>{
 assert.match(hook,/row\.parentKey!==key&&!row\.minimized/);
});
