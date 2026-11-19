import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindowState,windowManagerReducer} from '../apps/web/src/layout/os/windowManagerState.js';

const app={key:'sales'};
const visit=(state,key,path='/ventas')=>windowManagerReducer(state,{type:'VISIT',scope:'tenant-a',app:{key},path});
const act=(state,type,key,extra={})=>windowManagerReducer(state,{type,scope:'tenant-a',key,...extra});

test('open two apps, focus and minimize: keeps background app mounted',()=>{
  let state=visit(createWindowState('tenant-a'),'sales');
  state=visit(state,'inventory','/inventario');
  assert.equal(state.windows.length,2);
  state=act(state,'FOCUS','sales');
  assert.equal(state.activeKey,'sales');
  state=act(state,'MINIMIZE','sales');
  assert.equal(state.activeKey,'inventory');
  assert.equal(state.windows.find(w=>w.key==='sales').minimized,true);
  state=act(state,'FOCUS','sales');
  assert.equal(state.windows.find(w=>w.key==='sales').minimized,false);
  assert.equal(state.activeKey,'sales');
});

test('snap, maximize, restore and resize preserve floating dimensions',()=>{
  let state=visit(createWindowState('tenant-a'),'sales');
  state=act(state,'MAXIMIZE','sales');
  state=act(state,'RESIZE','sales',{width:720,height:540});
  state=act(state,'SNAP','sales',{layout:'left'});
  assert.equal(state.windows[0].snap,'left');
  state=act(state,'MAXIMIZE','sales');
  assert.equal(state.windows[0].maximized,true);
  assert.equal(state.windows[0].snap,null);
  state=act(state,'MAXIMIZE','sales');
  assert.equal(state.windows[0].maximized,false);
  assert.equal(state.windows[0].width,720);
  assert.equal(state.windows[0].height,540);
});

test('close foreground selects visible next window and does not resurrect closed app',()=>{
  let state=visit(createWindowState('tenant-a'),'sales');
  state=visit(state,'inventory','/inventario');
  state=act(state,'CLOSE','inventory');
  assert.equal(state.activeKey,'sales');
  assert.deepEqual(state.windows.map(w=>w.key),['sales']);
  state=act(state,'CLOSE','sales');
  assert.equal(state.showDesktop,true);
  assert.equal(state.activeKey,null);
});

test('tenant scope switch removes all windows and focus',()=>{
  let state=visit(createWindowState('tenant-a'),'sales');
  state=windowManagerReducer(state,{type:'RESET_SCOPE',scope:'tenant-b'});
  assert.equal(state.windows.length,0);
  assert.equal(state.activeKey,null);
  assert.equal(state.scope,'tenant-b');
});
