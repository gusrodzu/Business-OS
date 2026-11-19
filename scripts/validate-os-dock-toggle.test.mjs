import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWindowState,windowManagerReducer} from '../apps/web/src/layout/os/windowManagerState.js';

const source=readFileSync(new URL('../apps/web/src/layout/os/OSDock.jsx',import.meta.url),'utf8');
const act=(state,type,key)=>windowManagerReducer(state,{type,key,scope:'tenant-a'});
const visit=(state,key,path)=>windowManagerReducer(state,{type:'VISIT',scope:'tenant-a',app:{key},path});

test('dock uses the same toggle for pinned and running applications',()=>{
  assert.match(source,/function toggleDockWindow\(key,foreground\)/);
  assert.match(source,/if\(foreground\)onMinimizeWindow\?\.\(key\)/);
  assert.match(source,/else onActivateWindow\?\.\(key\)/);
  assert.match(source,/toggleDockWindow\(app\.key,foreground\)/);
  assert.match(source,/toggleDockWindow\(window\.key,foreground\)/);
});

test('dock foreground minimize and restore retains app path and other windows',()=>{
  let state=visit(createWindowState('tenant-a'),'sales','/ventas/cobranza');
  state=visit(state,'inventory','/inventario/existencias');
  state=act(state,'FOCUS','sales');
  const original=state.windows.find(w=>w.key==='sales');
  state=act(state,'MINIMIZE','sales');
  assert.equal(state.activeKey,'inventory');
  assert.equal(state.windows.find(w=>w.key==='sales').minimized,true);
  state=act(state,'FOCUS','sales');
  assert.equal(state.activeKey,'sales');
  assert.equal(state.windows.find(w=>w.key==='sales').minimized,false);
  assert.equal(state.windows.find(w=>w.key==='sales').path,original.path);
  assert.equal(state.windows.length,2);
});

test('minimizing the only app reveals desktop without closing it',()=>{
  let state=visit(createWindowState('tenant-a'),'sales','/ventas');
  state=act(state,'MINIMIZE','sales');
  assert.equal(state.showDesktop,true);
  assert.equal(state.windows.length,1);
  state=act(state,'FOCUS','sales');
  assert.equal(state.showDesktop,false);
  assert.equal(state.activeKey,'sales');
});
