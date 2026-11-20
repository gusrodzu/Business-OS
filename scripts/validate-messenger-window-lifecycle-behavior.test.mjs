import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindowState,windowManagerReducer as reduce} from '../apps/web/src/layout/os/windowManagerState.js';

const scope='user:company-a:online';
const visit=(state)=>reduce(state,{type:'VISIT',scope,app:{key:'messages'},path:'/mensajes'});
const child=(state,id)=>reduce(state,{type:'OPEN_CHILD',scope,parentKey:'messages',childId:id});
const act=(state,type,key)=>reduce(state,{type,scope,key});
test('two conversations open independently, deduplicate and restore from dock focus',()=>{
 let state=visit(createWindowState(scope));
 state=child(state,'ana');
 state=child(state,'carlos');
 assert.deepEqual(state.windows.map(w=>w.key),['messages','messages:ana','messages:carlos']);
 assert.equal(state.activeKey,'messages:carlos');
 state=child(state,'ana');
 assert.equal(state.windows.length,3);
 assert.equal(state.activeKey,'messages:ana');
 state=act(state,'MINIMIZE','messages:ana');
 assert.equal(state.windows.find(w=>w.key==='messages:ana').minimized,true);
 state=act(state,'FOCUS','messages:ana');
 assert.equal(state.windows.find(w=>w.key==='messages:ana').minimized,false);
 assert.equal(state.activeKey,'messages:ana');
});
test('closing a child preserves parent and other conversation',()=>{
 let state=child(child(visit(createWindowState(scope)),'ana'),'carlos');
 state=act(state,'CLOSE','messages:ana');
 assert.deepEqual(state.windows.map(w=>w.key),['messages','messages:carlos']);
 state=act(state,'CLOSE','messages');
 assert.deepEqual(state.windows,[]);
});
test('maximize, snap and resize affect only selected conversation',()=>{
 let state=child(child(visit(createWindowState(scope)),'ana'),'carlos');
 state=act(state,'MAXIMIZE','messages:ana');
 assert.equal(state.windows.find(w=>w.key==='messages:ana').maximized,true);
 assert.equal(state.windows.find(w=>w.key==='messages:carlos').maximized,false);
 state=reduce(state,{type:'SNAP',scope,key:'messages:carlos',layout:'right'});
 assert.equal(state.windows.find(w=>w.key==='messages:carlos').snap,'right');
 state=reduce(state,{type:'RESIZE',scope,key:'messages:ana',width:600,height:640});
 assert.equal(state.windows.find(w=>w.key==='messages:ana').width,600);
 assert.equal(state.windows.find(w=>w.key==='messages:carlos').width,420);
});
test('tenant scope changes clear windows and stale events cannot reopen them',()=>{
 let state=child(visit(createWindowState(scope)),'ana');
 state=reduce(state,{type:'RESET_SCOPE',scope:'user:company-b:online'});
 assert.equal(state.windows.length,0);
 assert.equal(child(state,'ana'),state);
 assert.equal(visit(state),state);
});
test('reject invalid child ids and missing parents',()=>{
 const initial=createWindowState(scope);
 assert.equal(child(initial,'ana'),initial);
 const state=visit(initial);
 for(const id of ['../../admin','', 'a'.repeat(65),'ana:other'])assert.equal(child(state,id),state);
});
