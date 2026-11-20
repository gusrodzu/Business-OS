import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const dock=readFileSync(new URL('../apps/web/src/layout/os/OSDock.jsx',import.meta.url),'utf8');
test('running Messenger child windows display the contact instead of the parent app',()=>{
 assert.match(dock,/window\.parentKey==='messages'&&demoContacts\.find/);
 assert.match(dock,/title:contact\.name,subtitle:'Messenger',Icon:MessagesSquare/);
 assert.match(dock,/additionalRunning = running\.filter/);
});
test('dock keeps focus, minimize and force close actions for child windows',()=>{
 assert.match(dock,/onActivateWindow\?\.\(key\)/);
 assert.match(dock,/onMinimizeWindow\?\.\(key\)/);
 assert.match(dock,/onForceCloseWindow\?\.\(menu\.key\)/);
});
