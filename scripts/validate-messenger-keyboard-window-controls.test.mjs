import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../apps/web/src/modules/core/ui/pages/BusinessMessenger.jsx',import.meta.url),'utf8');
test('Escape closes only the focused floating conversation',()=>{
 assert.match(source,/data-messenger-popout=\{id\} onKeyDown=\{event=>\{if\(event\.key==='Escape'/);
 assert.match(source,/event\.stopPropagation\(\);closeChat\(id\)/);
});
test('closing a chat clears its layout state without erasing message drafts',()=>{
 assert.match(source,/function closeChat\(id\)/);
 assert.match(source,/delete next\[id\]/);
 assert.match(source,/setFrontChat\(current=>current===id\?null:current\)/);
});
