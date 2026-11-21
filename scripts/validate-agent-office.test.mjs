import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AGENT_TEAMS,REFRESH_INTERVAL_MS,buildAgentOfficeSnapshot} from '../apps/web/src/modules/platform/services/agentOfficeFeed.js';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const pr=(id,branch,state='open')=>({
  number:id,title:'Validación #'+id,head:{ref:branch},state,updated_at:'2026-11-21T12:00:00Z',
  html_url:'https://github.com/gusrodzu/Business-OS/pull/'+id,
});
const run=(id,name,status='completed',conclusion='success')=>({
  id,name,status,conclusion,updated_at:'2026-11-21T12:05:00Z',
  html_url:'https://github.com/gusrodzu/Business-OS/actions/runs/'+id,
});

test('six stable specialized cubicles, no fabricated active team state',()=>{
  assert.deepEqual(AGENT_TEAMS.map(team=>team.id),['frontend','backend','security','qa','director','devops']);
  const snapshot=buildAgentOfficeSnapshot([],[]);
  assert.equal(snapshot.teams.length,6);
  assert.equal(snapshot.runningChecks,0);
  assert.equal(snapshot.openPRs,0);
  assert.ok(snapshot.teams.every(team=>team.status==='idle'&&!team.ongoing));
  assert.ok(REFRESH_INTERVAL_MS>=120000);
});

test('open PR is review work, not evidence of ongoing agent execution',()=>{
  const snapshot=buildAgentOfficeSnapshot([pr(900,'agent/frontend/menus')],[]);
  assert.equal(snapshot.teams.find(team=>team.id==='frontend').status,'review');
  assert.equal(snapshot.teams.find(team=>team.id==='backend').status,'idle');
  assert.equal(snapshot.runningChecks,0);
  assert.equal(snapshot.openPRs,1);
});

test('only a Github workflow in progress animates its assigned cubicle',()=>{
  const snapshot=buildAgentOfficeSnapshot(
    [pr(900,'agent/frontend/menus')],
    [run(41,'Frontend QA','in_progress',null),run(42,'Backend Integration','queued',null),run(43,'Dependency Security Triage')],
  );
  assert.equal(snapshot.teams.find(team=>team.id==='qa').status,'ci');
  assert.equal(snapshot.teams.find(team=>team.id==='backend').status,'queued');
  assert.equal(snapshot.teams.find(team=>team.id==='frontend').status,'review');
  assert.equal(snapshot.teams.find(team=>team.id==='security').status,'idle');
  assert.equal(snapshot.runningChecks,1);
  assert.equal(snapshot.failedChecks,0);
});

test('completed failure is a real failure but not an active job',()=>{
  const snapshot=buildAgentOfficeSnapshot([],[
    run(41,'Smartphone Browser Review','completed','failure'),
    run(42,'Cloudflare Deploy','completed','success'),
  ]);
  assert.equal(snapshot.failedChecks,1);
  assert.equal(snapshot.runningChecks,0);
  assert.ok(snapshot.teams.every(team=>team.status==='idle'));
});

test('only official GitHub repo URLs can be linked',()=>{
  const bad=pr(901,'agent/security/patch');
  bad.html_url='https://attacker.invalid/?token=123';
  const snapshot=buildAgentOfficeSnapshot([bad],[]);
  assert.equal(snapshot.activity[0].url,null);
});

test('Super Admin permission and verified telemetry restrictions remain in the UI',()=>{
  const page=read('apps/web/src/modules/platform/ui/pages/AgentOffice.jsx');
  const routes=read('apps/web/src/modules/platform/routes.jsx');
  const shell=read('apps/web/src/layout/PlatformShell.jsx');
  assert.match(page,/platformSession&&user\?\.permissions\?\.includes\('platform.manage'\)/);
  assert.match(page,/if\(!permitted\)/);
  assert.match(page,/data-agent-office="true"/);
  assert.match(page,/document.visibilityState==='visible'/);
  assert.match(page,/Las automatizaciones todavía no están conectadas/);
  assert.match(routes,/path:'agent-office'/);
  assert.match(shell,/to:'\/agent-office'/);
});
