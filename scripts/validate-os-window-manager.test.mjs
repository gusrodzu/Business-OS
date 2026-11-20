import assert from 'node:assert/strict';
import test from 'node:test';
import {createWindowState,windowManagerReducer} from '../apps/web/src/layout/os/windowManagerState.js';

const visit=(state,key,path)=>windowManagerReducer(state,{type:'VISIT',app:{key},path});

test('OS windows open by module, keep independent routes and remain mounted while switching',()=>{
  let state=createWindowState('company-a');
  state=visit(state,'sales','/ventas');
  state=visit(state,'finance','/finanzas/cuentas-por-pagar');
  state=visit(state,'sales','/ventas/cobranza');
  assert.equal(state.windows.length,2);
  assert.equal(state.windows.find(w=>w.key==='sales').path,'/ventas/cobranza');
  assert.equal(state.windows.find(w=>w.key==='finance').path,'/finanzas/cuentas-por-pagar');
  assert.equal(state.activeKey,'sales');
});

test('Minimizing one window preserves the rest; restore and maximize do not close pages',()=>{
  let state=visit(visit(createWindowState('a'),'sales','/ventas'),'crm','/crm');
  state=windowManagerReducer(state,{type:'MINIMIZE',key:'crm'});
  assert.equal(state.windows.find(w=>w.key==='crm').minimized,true);
  assert.equal(state.activeKey,'sales');
  state=windowManagerReducer(state,{type:'FOCUS',key:'crm'});
  assert.equal(state.windows.find(w=>w.key==='crm').minimized,false);
  state=windowManagerReducer(state,{type:'MAXIMIZE',key:'crm'});
  assert.equal(state.windows.find(w=>w.key==='crm').maximized,false);
  state=windowManagerReducer(state,{type:'MAXIMIZE',key:'crm'});
  assert.equal(state.windows.find(w=>w.key==='crm').maximized,true);
  state=windowManagerReducer(state,{type:'CLOSE',key:'crm'});
  assert.equal(state.windows.length,1);
  assert.equal(state.activeKey,'sales');
});

test('Home hides windows without destroying the running list',()=>{
  let state=visit(createWindowState('a'),'sales','/ventas');
  state=windowManagerReducer(state,{type:'VISIT',app:null,path:'/'});
  assert.equal(state.showDesktop,true);
  assert.equal(state.windows.length,1);
  state=windowManagerReducer(state,{type:'FOCUS',key:'sales'});
  assert.equal(state.showDesktop,false);
});

test('Switching tenant removes all stale windows and positions',()=>{
  const state=visit(createWindowState('company-a'),'finance','/finanzas/tesoreria');
  assert.deepEqual(windowManagerReducer(state,{type:'RESET_SCOPE',scope:'company-b'}),createWindowState('company-b'));
});


test('Minimizing a background window preserves the active app and its route',()=>{
 let state=visit(visit(createWindowState('tenant-a'),'sales','/ventas'),'finance','/finanzas/flujo-efectivo');
 state=windowManagerReducer(state,{type:'MINIMIZE',key:'sales',scope:'tenant-a'});
 assert.equal(state.activeKey,'finance');
 assert.equal(state.showDesktop,false);
 assert.equal(state.windows.find(w=>w.key==='sales').minimized,true);
 assert.equal(state.windows.find(w=>w.key==='finance').path,'/finanzas/flujo-efectivo');
});
test('Show Desktop remains visible if a running window is closed or minimized',()=>{
 let state=visit(visit(createWindowState('tenant-a'),'sales','/ventas'),'finance','/finanzas');
 state=windowManagerReducer(state,{type:'SHOW_DESKTOP',scope:'tenant-a'});
 state=windowManagerReducer(state,{type:'MINIMIZE',key:'sales',scope:'tenant-a'});
 assert.equal(state.showDesktop,true);
 assert.equal(state.activeKey,null);
 state=windowManagerReducer(state,{type:'CLOSE',key:'finance',scope:'tenant-a'});
 assert.equal(state.showDesktop,true);
 assert.equal(state.activeKey,null);
 assert.equal(state.windows.length,1);
});
test('Tenant changes discard window state and stale tenant actions cannot revive it',()=>{
 let state=visit(createWindowState('tenant-a'),'sales','/ventas');
 state=windowManagerReducer(state,{type:'RESET_SCOPE',scope:'tenant-b'});
 const after=windowManagerReducer(state,{type:'VISIT',scope:'tenant-a',app:{key:'sales'},path:'/ventas'});
 assert.strictEqual(after,state);
 assert.deepEqual(state.windows,[]);
});


test('New desktop apps open in a large floating window, not maximized',()=>{
 const state=visit(createWindowState('company-a'),'settings','/configuracion');
 const window=state.windows[0];
 assert.equal(window.maximized,false);
 assert.equal(window.width,1190);
 assert.equal(window.height,690);
 state.windows.length=1;
});
test('Returning to an open app preserves user-adjusted size and maximize state',()=>{
 let state=visit(createWindowState('company-a'),'settings','/configuracion');
 state=windowManagerReducer(state,{type:'RESIZE',key:'settings',width:940,height:560});
 state=windowManagerReducer(state,{type:'MAXIMIZE',key:'settings'});
 state=visit(state,'settings','/configuracion/seguridad');
 assert.equal(state.windows.length,1);
 assert.equal(state.windows[0].width,940);
 assert.equal(state.windows[0].height,560);
 assert.equal(state.windows[0].maximized,true);
});
