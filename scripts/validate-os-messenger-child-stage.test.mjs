import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const stage=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.jsx',import.meta.url),'utf8');
test('Messenger child window has separate chrome and does not duplicate parent route',()=>{
 assert.match(stage,/window\.parentKey==='messages'/);
 assert.match(stage,/\{title:'Conversación',subtitle:window\.childId,Icon:MessagesSquare\}/);
 assert.match(stage,/window\.parentKey==='messages'[\s\S]*?<OSWindowRouteContent pathname=\{window\.path\}/);
});
