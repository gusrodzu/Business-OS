import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../apps/web/src/modules/core/ui/pages/',import.meta.url);
const jsx=readFileSync(new URL('BusinessMessenger.jsx',root),'utf8');
const css=readFileSync(new URL('BusinessMessenger.module.css',root),'utf8');
test('Messenger exposes useful contact filters and conversation details',()=>{
 for(const part of ['setOnlyAvailable','aria-pressed={!onlyAvailable}','aria-expanded={showInfo}','setShowInfo'])assert.ok(jsx.includes(part),part);
});
test('Messenger keeps demo status and keyboard/mobile affordances',()=>{
 assert.match(jsx,/no se envían, guardan ni comparten/);
 assert.match(css,/@container \(max-width:620px\)/);
 assert.match(css,/focus-visible/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
