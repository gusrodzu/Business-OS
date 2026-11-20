import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const stage=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.jsx',import.meta.url),'utf8');
const child=readFileSync(new URL('../apps/web/src/modules/core/ui/pages/MessengerDemoChild.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../apps/web/src/modules/core/ui/pages/BusinessMessenger.module.css',import.meta.url),'utf8');
test('Messenger child window title resolves contact name instead of raw identifier',()=>{
 assert.match(stage,/demoContacts\.find\(item=>item\.id===window\.childId\)/);
 assert.match(stage,/title:contact\?\.name\|\|'Conversación'/);
 assert.match(stage,/subtitle:'Messenger · Demostración local'/);
});
test('child window CSS module classes exist',()=>{
 const classes=[...child.matchAll(/styles\.([A-Za-z][A-Za-z0-9]*)/g)].map(m=>m[1]);
 for(const name of classes)assert.match(css,new RegExp('\\.'+name+'(?=[\\s{:.])'),name+' missing in CSS module');
});
