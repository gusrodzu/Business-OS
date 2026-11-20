import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../apps/web/src/modules/core/ui/pages/',import.meta.url);
const jsx=readFileSync(new URL('BusinessMessenger.jsx',root),'utf8');
const css=readFileSync(new URL('BusinessMessenger.module.css',root),'utf8');

test('minimized expanded chats never retain the expanded CSS class',()=>{
 assert.match(jsx,/expandedChats\.includes\(id\)&&!minimizedChats\.includes\(id\)\?styles\.popoutExpanded/);
 assert.match(css,/\.popoutCollapsed\{height:58px/);
 assert.match(css,/\.popoutExpanded\{width:100%;height:100%/);
});
test('expanded chats disable dragging and offer a restore control',()=>{
 assert.match(jsx,/if\(!expandedChats\.includes\(id\)\)startChatDrag\(event,id\)/);
 assert.match(jsx,/function toggleExpand\(id\)/);
 assert.match(jsx,/Restaurar tamaño de /);
});
test('contact drafts remain isolated',()=>{
 assert.match(jsx,/const draft=drafts\[selected\]\|\|''/);
 assert.match(jsx,/setDrafts\(current=>\(\{\.\.\.current,\[selected\]:''\}\)\)/);
});
