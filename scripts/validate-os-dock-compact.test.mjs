import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../apps/web/src/layout/os/OSDock.module.css',import.meta.url),'utf8');
const dock=readFileSync(new URL('../apps/web/src/layout/os/OSDock.jsx',import.meta.url),'utf8');
test('compact mode does not override the dock centering transform',()=>{
 assert.match(css,/transform:translateX\(-50%\)/);
 assert.doesNotMatch(css,/transform:scale\(\.88\)/);
 assert.match(css,/data-os-dock-size='compact'/);
 assert.match(css,/min-height:62px/);
});
test('compact preference is read per user and company',()=>{
 assert.match(dock,/business-os-display:/);
 assert.match(dock,/dataset\.osDockSize/);
});
test('mobile dock remains a separate navigation surface',()=>{
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/\.mobileDock/);
});
