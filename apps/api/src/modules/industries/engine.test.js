import test from 'node:test';
import assert from 'node:assert/strict';
import {recommendBusinessModules} from './engine.js';
test('combina giros sin módulos repetidos',()=>{
 const r=recommendBusinessModules(['barberia','tienda','barberia'],[{key:'pos'},{key:'crm'}]);
 assert.deepEqual(r.activities,['barberia','tienda']);
 assert.deepEqual(r.suggestedModules,['crm','pos']);
 assert.equal(new Set(r.required).size,r.required.length);
 assert.equal(r.activationRequiresApproval,true);
});
test('rechaza actividades inexistentes',()=>assert.throws(()=>recommendBusinessModules(['ninguno'])));
test('no activa módulos sin verificar licencias',()=>{
 const r=recommendBusinessModules(['transporte'],[{key:'sales'}]);
 assert.equal(r.state,'RECOMMENDATION_ONLY');
 assert(r.unavailableModules.length>0);
});
