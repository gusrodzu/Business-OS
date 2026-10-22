import test from 'node:test';
import assert from 'node:assert/strict';
import {PROFILES} from './catalog.js';
import {CAPABILITY_RULES,resolveIndustryRules} from './rules.js';

test('every declared capability has a rule',()=>{
 const missing=PROFILES.flatMap(p=>p.capabilities||[]).filter(key=>!CAPABILITY_RULES[key]);
 assert.deepEqual(missing,[]);
});

test('multigiro deduplicates shared rules and tracks origin',()=>{
 const result=resolveIndustryRules(['refaccionaria','ferreteria','taller_automotriz']);
 assert.equal(result.primaryActivity,'refaccionaria');
 assert.deepEqual(result.secondaryActivities,['ferreteria','taller_automotriz']);
 assert.equal(result.rules.find(rule=>rule.key==='multi_warehouse').sourceActivities.length,2);
 assert.equal(result.autoEnabled,false);
});

test('rejects unknown and empty activities',()=>{
 assert.throws(()=>resolveIndustryRules([]),/Selecciona/);
 assert.throws(()=>resolveIndustryRules(['inexistente']),/Actividad no reconocida/);
});
