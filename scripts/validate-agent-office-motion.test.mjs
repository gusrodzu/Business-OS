import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseMotion,findVerifiedHandoffs} from '../sites/agent-office/public/officeMotion.js';

const NOW=Date.parse('2026-11-21T19:00:00Z');
const sha='a'.repeat(40);
const teams=[
  {id:'frontend',name:'Frontend',branch:'agent/frontend/'},
  {id:'qa',name:'QA',branch:'agent/qa/'},
  {id:'backend',name:'Backend',branch:'agent/backend/'},
];
const pr=(overrides={})=>({id:812,status:'open',headSha:sha,title:'Mejora visual',branch:'agent/frontend/update',url:'https://github.com/gusrodzu/Business-OS/pull/812',...overrides});
const workflow=(overrides={})=>({id:99,team:'qa',headSha:sha,status:'in_progress',title:'Frontend QA',url:'https://github.com/gusrodzu/Business-OS/actions/runs/99',...overrides});

test('motion is disabled while data is missing or stale',()=>{
  assert.equal(chooseMotion({status:'ci'},{fresh:false,now:NOW}).mode,'offline');
  assert.equal(chooseMotion(null,{fresh:true,now:NOW}).mode,'offline');
  assert.equal(chooseMotion({status:'ci'},{fresh:true,now:NOW}).mode,'typing');
  assert.equal(chooseMotion({status:'queued'},{fresh:true,now:NOW}).mode,'waiting');
  assert.equal(chooseMotion({status:'review'},{fresh:true,now:NOW}).mode,'reading');
  assert.equal(chooseMotion({status:'idle'},{fresh:true,now:NOW}).mode,'idle');
});

test('success and warning actions require recently verified completed checks',()=>{
  const make=(status,conclusion,at)=>({status:'idle',latestCheck:{status,conclusion,at}});
  assert.equal(chooseMotion(make('completed','success','2026-11-21T18:59:00Z'),{fresh:true,now:NOW}).mode,'celebrating');
  assert.equal(chooseMotion(make('completed','failure','2026-11-21T18:59:00Z'),{fresh:true,now:NOW}).mode,'alert');
  assert.equal(chooseMotion(make('completed','success','2026-11-21T18:45:00Z'),{fresh:true,now:NOW}).mode,'idle');
  assert.equal(chooseMotion(make('completed','failure','2026-11-21T19:05:00Z'),{fresh:true,now:NOW}).mode,'idle');
  assert.equal(chooseMotion(make('queued','success','2026-11-21T18:59:00Z'),{fresh:true,now:NOW}).mode,'idle');
});

test('active CI has priority over a recent success and stale signals never celebrate',()=>{
  const station={status:'ci',latestCheck:{status:'completed',conclusion:'success',at:'2026-11-21T18:59:00Z'}};
  assert.equal(chooseMotion(station,{fresh:true,now:NOW}).mode,'typing');
  assert.equal(chooseMotion(station,{fresh:false,now:NOW}).mode,'offline');
});

test('cross-team handoffs need a matching SHA, open PR, active CI and different teams',()=>{
  const found=findVerifiedHandoffs([pr()],[workflow()],teams);
  assert.equal(found.length,1);
  assert.deepEqual([found[0].from,found[0].to,found[0].prNumber],['frontend','qa',812]);
  assert.deepEqual(findVerifiedHandoffs([pr({headSha:'b'.repeat(40)})],[workflow()],teams),[]);
  assert.deepEqual(findVerifiedHandoffs([pr({headSha:'short'})],[workflow()],teams),[]);
  assert.deepEqual(findVerifiedHandoffs([pr({status:'closed'})],[workflow()],teams),[]);
  assert.deepEqual(findVerifiedHandoffs([pr()],[workflow({status:'completed'})],teams),[]);
  assert.deepEqual(findVerifiedHandoffs([pr()],[workflow({team:'frontend'})],teams),[]);
  assert.deepEqual(findVerifiedHandoffs([pr()],[workflow({headSha:'b'.repeat(40)})],teams),[]);
});

test('one PR + repeated QA runs is one handoff; results are bounded',()=>{
  const list=findVerifiedHandoffs([pr()],[workflow(),workflow({id:100})],teams);
  assert.equal(list.length,1);
  assert.equal(list[0].status,'in_progress');
  assert.equal(findVerifiedHandoffs([pr()],[workflow()],teams,{limit:1}).length,1);
  assert.deepEqual(findVerifiedHandoffs(null,[],teams),[]);
  assert.deepEqual(findVerifiedHandoffs([],null,teams),[]);
});
