import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindowState,windowManagerReducer as reduce} from '../apps/web/src/layout/os/windowManagerState.js';
const scope='user:tenant';
const visit=reduce(createWindowState(scope),{type:'VISIT',scope,app:{key:'messages'},path:'/mensajes'});
test('child windows require an existing parent and safe identifier',()=>{
 assert.equal(reduce(visit,{type:'OPEN_CHILD',scope,parentKey:'missing',childId:'ana'}),visit);
 assert.equal(reduce(visit,{type:'OPEN_CHILD',scope,parentKey:'messages',childId:'../unsafe'}),visit);
});
test('child window reuses parent route and deduplicates on reopen',()=>{
 const opened=reduce(visit,{type:'OPEN_CHILD',scope,parentKey:'messages',childId:'ana'});
 const child=opened.windows.find(w=>w.childId==='ana');
 assert.equal(child.path,'/mensajes');
 assert.equal(child.parentKey,'messages');
 assert.equal(reduce(opened,{type:'OPEN_CHILD',scope,parentKey:'messages',childId:'ana'}).windows.length,2);
});
test('closing parent closes child and tenant switch clears all windows',()=>{
 const opened=reduce(visit,{type:'OPEN_CHILD',scope,parentKey:'messages',childId:'ana'});
 assert.equal(reduce(opened,{type:'CLOSE',scope,key:'messages'}).windows.length,0);
 assert.equal(reduce(opened,{type:'RESET_SCOPE',scope:'other:tenant'}).windows.length,0);
 assert.equal(reduce(opened,{type:'OPEN_CHILD',scope:'other:tenant',parentKey:'messages',childId:'sofia'}),opened);
});
