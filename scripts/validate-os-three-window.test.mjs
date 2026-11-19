import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindowState,windowManagerReducer} from '../apps/web/src/layout/os/windowManagerState.js';

const action=(state,type,values={})=>windowManagerReducer(state,{type,scope:state.scope,...values});
const visit=(state,key,path)=>action(state,'VISIT',{app:{key},path});

test('three business windows keep independent routes through focus, snap, minimize and restore',()=>{
  let state=createWindowState('tenant-a');
  state=visit(state,'sales','/ventas/pedidos');
  state=visit(state,'inventory','/inventario/productos');
  state=visit(state,'finance','/finanzas/tesoreria');
  assert.equal(state.windows.length,3);
  state=action(state,'SNAP',{key:'sales',layout:'left'});
  state=action(state,'SNAP',{key:'inventory',layout:'right'});
  state=action(state,'FOCUS',{key:'sales'});
  assert.equal(state.activeKey,'sales');
  state=action(state,'MINIMIZE',{key:'sales'});
  assert.equal(state.windows.find(w=>w.key==='sales').minimized,true);
  assert.equal(state.windows.length,3);
  state=action(state,'FOCUS',{key:'sales'});
  assert.equal(state.windows.find(w=>w.key==='sales').minimized,false);
  state=action(state,'MAXIMIZE',{key:'finance'});
  assert.equal(state.windows.find(w=>w.key==='finance').maximized,false);
  state=action(state,'MAXIMIZE',{key:'finance'});
  assert.equal(state.windows.find(w=>w.key==='finance').maximized,true);
  assert.deepEqual(Object.fromEntries(state.windows.map(w=>[w.key,w.path])),{
    sales:'/ventas/pedidos',inventory:'/inventario/productos',finance:'/finanzas/tesoreria'
  });
});

test('show desktop preserves three windows; tenant switch clears all window metadata',()=>{
  let state=createWindowState('tenant-a');
  state=visit(state,'sales','/ventas');
  state=visit(state,'inventory','/inventario');
  state=visit(state,'finance','/finanzas');
  state=action(state,'SHOW_DESKTOP');
  assert.equal(state.showDesktop,true);
  assert.equal(state.windows.length,3);
  state=action(state,'FOCUS',{key:'inventory'});
  assert.equal(state.showDesktop,false);
  assert.equal(state.activeKey,'inventory');
  state=action(state,'RESET_SCOPE',{scope:'tenant-b'});
  assert.deepEqual(state,createWindowState('tenant-b'));
});

test('Snap Layouts restores a snapped window to floating without changing its route',()=>{
  let state=createWindowState('tenant-a');
  state=visit(state,'sales','/ventas/pedidos');
  state=action(state,'SNAP',{key:'sales',layout:'left'});
  assert.equal(state.windows[0].snap,'left');
  state=action(state,'SNAP',{key:'sales',layout:'float'});
  assert.equal(state.windows[0].snap,null);
  assert.equal(state.windows[0].maximized,false);
  assert.equal(state.windows[0].path,'/ventas/pedidos');
});

test('closing the active window activates the most recent visible window without reviving minimized windows',()=>{
  let state=createWindowState('tenant-a');
  state=visit(state,'sales','/ventas');
  state=visit(state,'inventory','/inventario');
  state=visit(state,'finance','/finanzas');
  state=action(state,'MINIMIZE',{key:'inventory'});
  state=action(state,'CLOSE',{key:'finance'});
  assert.equal(state.activeKey,'sales');
  assert.equal(state.windows.length,2);
  assert.equal(state.windows.find(w=>w.key==='inventory').minimized,true);
  state=action(state,'CLOSE',{key:'sales'});
  assert.equal(state.activeKey,null);
  assert.equal(state.showDesktop,true);
  assert.equal(state.windows.length,1);
  state=action(state,'FOCUS',{key:'inventory'});
  assert.equal(state.windows[0].minimized,false);
  assert.equal(state.showDesktop,false);
});

test('actions from a previous tenant cannot mutate windows in the new tenant',()=>{
  let state=createWindowState('tenant-a');
  state=visit(state,'sales','/ventas');
  state=action(state,'RESET_SCOPE',{scope:'tenant-b'});
  state=visit(state,'finance','/finanzas');
  state=windowManagerReducer(state,{type:'MOVE',scope:'tenant-a',key:'sales',x:99,y:99});
  assert.equal(state.scope,'tenant-b');
  assert.equal(state.windows.length,1);
  assert.equal(state.windows[0].key,'finance');
  assert.equal(state.windows[0].x,0);
  const snapshot=state;
  // Delayed route navigation and focus events must not resurrect a previous tenant.
  state=windowManagerReducer(state,{type:'VISIT',scope:'tenant-a',app:{key:'sales'},path:'/ventas/privado'});
  assert.strictEqual(state,snapshot);
  state=windowManagerReducer(state,{type:'FOCUS',scope:'tenant-a',key:'sales'});
  assert.strictEqual(state,snapshot);
  assert.deepEqual(state.windows.map(window=>window.path),['/finanzas']);
});
