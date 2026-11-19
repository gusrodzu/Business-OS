import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWindowState,windowManagerReducer} from '../apps/web/src/layout/os/windowManagerState.js';

const stage=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.jsx',import.meta.url),'utf8');

test('floating resize handle supports keyboard arrows and accessible focus',()=>{
  assert.match(stage,/aria-label=\{'Redimensionar ventana de '\+app\.title\+'\. Usa las flechas del teclado'\}/);
  assert.match(stage,/aria-orientation="vertical" tabIndex=\{0\}/);
  assert.match(stage,/\['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'\]\.includes\(event\.key\)/);
  assert.match(stage,/event\.preventDefault\(\);event\.stopPropagation\(\)/);
  assert.match(stage,/const step=event\.shiftKey\?50:20/);
});

test('resize handle stays unavailable on maximized and snapped windows',()=>{
  assert.match(stage,/!window\.maximized&&!window\.snap&&!hidden\?<div className=\{styles\.resizeHandle\}/);
});

test('resizing preserves window identity, path and focus',()=>{
  let state=createWindowState('tenant-a');
  state=windowManagerReducer(state,{type:'VISIT',scope:'tenant-a',app:{key:'sales'},path:'/ventas'});
  state=windowManagerReducer(state,{type:'RESIZE',scope:'tenant-a',key:'sales',width:820,height:560});
  assert.equal(state.windows[0].width,820);
  assert.equal(state.windows[0].height,560);
  assert.equal(state.windows[0].path,'/ventas');
  assert.equal(state.activeKey,'sales');
});
