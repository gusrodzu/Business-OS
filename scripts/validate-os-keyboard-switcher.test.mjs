import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWindowState,windowManagerReducer} from '../apps/web/src/layout/os/windowManagerState.js';

const source=readFileSync(new URL('../apps/web/src/layout/os/useOSWindowManager.js',import.meta.url),'utf8');
const visit=(state,key)=>windowManagerReducer(state,{type:'VISIT',scope:'tenant-a',app:{key},path:'/'+key});
const focus=(state,key)=>windowManagerReducer(state,{type:'FOCUS',scope:'tenant-a',key});

test('keyboard switcher preserves native Tab and editable controls',()=>{
  assert.match(source,/const tab=event\.key==='Tab'/);
  assert.match(source,/if\(!event\.ctrlKey\|\|event\.altKey\|\|event\.metaKey\|\|event\.repeat\)return/);
  assert.match(source,/target\?\.closest\?\.\('input,textarea,select,\[contenteditable="true"\]'\)/);
  assert.match(source,/if\(available\.length<2\)return/);
  assert.match(source,/event\.preventDefault\(\)/);
});

test('cycling follows launch order even when focus changes z-order',()=>{
  let state=createWindowState('tenant-a');
  for(const key of ['sales','inventory','finance'])state=visit(state,key);
  for(const key of ['sales','inventory','finance','sales']){
    const available=state.windows.filter(item=>!item.minimized);
    const current=available.findIndex(item=>item.key===state.activeKey);
    const next=available[(current+1)%available.length];
    state=focus(state,next.key);
  }
  assert.equal(state.activeKey,'sales');
  assert.deepEqual(state.windows.map(item=>item.key),['sales','inventory','finance']);
});

test('minimized windows are excluded from forward and reverse switching',()=>{
  let state=visit(visit(visit(createWindowState('tenant-a'),'sales'),'inventory'),'finance');
  state=windowManagerReducer(state,{type:'MINIMIZE',scope:'tenant-a',key:'inventory'});
  const available=state.windows.filter(item=>!item.minimized);
  assert.deepEqual(available.map(item=>item.key),['sales','finance']);
  const current=available.findIndex(item=>item.key===state.activeKey);
  assert.equal(available[(current+1)%available.length].key,'sales');
  assert.equal(available[(current-1+available.length)%available.length].key,'sales');
});
