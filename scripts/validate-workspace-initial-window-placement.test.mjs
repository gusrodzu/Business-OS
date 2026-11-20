import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindowState,initialWindowPosition,windowManagerReducer} from '../apps/web/src/layout/os/windowManagerState.js';
const visit=(state,key)=>windowManagerReducer(state,{type:'VISIT',app:{key},path:`/${key}`});
test('new windows cascade around the center instead of drifting in one direction',()=>{
 let state=createWindowState('tenant');
 for(let i=0;i<6;i++)state=visit(state,`app${i}`);
 assert.deepEqual(state.windows.map(({x,y})=>({x,y})),Array.from({length:6},(_,i)=>initialWindowPosition(i)));
 assert.ok(state.windows.some(w=>w.x<0));
 assert.ok(state.windows.some(w=>w.x>0));
 assert.deepEqual(initialWindowPosition(6),initialWindowPosition(0));
});
test('returning to an existing app retains its manually positioned window',()=>{
 let state=visit(createWindowState('tenant'),'sales');
 state=windowManagerReducer(state,{type:'MOVE',key:'sales',x:123,y:77});
 state=visit(state,'sales');
 assert.equal(state.windows.length,1);
 assert.deepEqual({x:state.windows[0].x,y:state.windows[0].y},{x:123,y:77});
});
