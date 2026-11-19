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
