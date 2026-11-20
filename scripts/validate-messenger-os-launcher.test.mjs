import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../apps/web/src/layout/AppShell.jsx',import.meta.url),'utf8');
const messenger=readFileSync(new URL('../apps/web/src/modules/core/ui/pages/BusinessMessenger.jsx',import.meta.url),'utf8');
test('desktop Messenger launches a child window via scoped OS manager',()=>{
 assert.match(app,/addEventListener\('business-os:open-messenger-chat',openConversation\)/);
 assert.match(app,/windowManager\.openChild\('messages',id\)/);
 assert.match(app,/removeEventListener\('business-os:open-messenger-chat',openConversation\)/);
 assert.match(messenger,/dispatchEvent\(new CustomEvent\('business-os:open-messenger-chat'/);
});
test('only demo contacts can be opened through launcher',()=>{
 assert.match(app,/\['ana','carlos','sofia','equipo'\]\.includes\(id\)/);
 assert.match(messenger,/setFrontChat\(id\)/);
});
