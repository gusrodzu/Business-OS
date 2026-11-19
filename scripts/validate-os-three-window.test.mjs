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
