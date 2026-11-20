import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=new URL('../apps/web/src/modules/core/ui/pages/',import.meta.url);
const jsx=readFileSync(new URL('BusinessMessenger.jsx',base),'utf8');
const css=readFileSync(new URL('BusinessMessenger.module.css',base),'utf8');
test('dragging panels is bounded and cleans up pointer handlers',()=>{
 assert.match(jsx,/function startChatDrag\(event,id\)/);
 assert.match(jsx,/bounds\.width-rect\.width/);
 assert.match(jsx,/bounds\.height-rect\.height/);
 assert.match(jsx,/removeEventListener\('pointercancel',stop\)/);
});
test('panel drag does not steal button clicks and remains inside Messenger',()=>{
 assert.match(jsx,/event\.target\.closest\('button'\)/);
 assert.match(css,/\.popoutTray\{position:absolute;inset:0/);
 assert.match(css,/\.popoutHeader\{cursor:grab/);
});
