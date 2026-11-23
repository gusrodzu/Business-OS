import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(file)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const html=read('sites/agent-office/public/index.html');
const js=read('sites/agent-office/public/app.js');
const motion=read('sites/agent-office/public/officeMotion.js');
const css=read('sites/agent-office/public/styles.css');
const config=read('sites/agent-office/wrangler.toml');
const headers=read('sites/agent-office/public/_headers');

test('Agent Office is an independent site, not a Business OS route or shell',()=>{
  assert.match(html,/<title>Agent Office/);
  assert.match(html,/src="\.\/app\.js"/);
  assert.match(html,/href="\.\/styles\.css"/);
  assert.doesNotMatch(html,/\/admin-saas|\/agent-office|\/platform-entry|AuthContext|AppShell|PlatformShell|ERP/i);
  assert.doesNotMatch(js,/\/auth\/|\/platform-admin\/|\/tenants\/|localStorage|sessionStorage|document\.cookie|credentials:/i);
  assert.deepEqual([...js.matchAll(/^\s*import\s+(.+)$/gm)].map(match=>match[0].trim()),["import {chooseMotion,findVerifiedHandoffs} from './officeMotion.js';","import {drawOfficePanorama,drawRearAgentPortrait,drawRearAgentScene} from './officePanorama.js';","import {createAgentStatus} from './agentStatusChip.js';"]);
  assert.doesNotMatch(motion,/\/auth\/|\/platform-admin\/|\/tenants\/|localStorage|sessionStorage|document\.cookie|fetch\(/i);
  assert.match(config,/name\s*=\s*"business-os-agent-office"/);
  assert.match(config,/directory\s*=\s*"\.\/public"/);
  assert.doesNotMatch(config,/name\s*=\s*"business-os"/);
  assert.ok(!js.includes('innerHTML'), 'Do not interpolate GitHub response text as HTML');
});

test('the six stations have stable identity and verified state semantics',()=>{
  for(const id of ['frontend','backend','security','qa','director','devops']){
    assert.ok(js.includes("id:'"+id+"'"),'missing '+id);
    assert.match(css,new RegExp("data-team="+id));
    assert.match(js,new RegExp("id:'"+id+"'"));
  }
  assert.match(js,/current\.status==='in_progress'/);
  assert.match(js,/status==='in_progress'\?'ci'/);
  assert.match(js,/pending\?'review':'idle'/);
  assert.match(js,/no hay un workflow activo|No hay un workflow activo/);
  assert.match(js,/No significa que un agente esté ejecutándose/);
  assert.match(html,/Las automatizaciones de ChatGPT todavía no tienen conexión/);
  assert.match(js,/status==='completed'&&w\.conclusion==='failure'/);
  assert.match(html,/id="handoff-lane"/);
  assert.match(js,/handoffs:findVerifiedHandoffs/);
  assert.match(js,/state\.fresh=false/);
  assert.match(css,/\.office-paused/);
  assert.match(css,/@keyframes pace/);
  assert.match(js,/if\(!handoffs\.length\)/);
  assert.match(js,/handoff\.fromName\),track,node\('strong','handoff-team',handoff\.toName/);
  assert.match(css,/\.handoff-walker/);
  assert.match(css,/@keyframes courierWalk/);
});

test('GitHub data is read-only and hostile links are filtered',()=>{
  assert.match(js,/https:\/\/api\.github\.com\/repos\//);
  assert.match(js,/\/pulls\?state=all/);
  assert.match(js,/\/actions\/runs\?per_page=/);
  assert.match(js,/cache:'no-store'/);
  assert.match(js,/safeLink\(p\.html_url,'pr'\)/);
  assert.match(js,/safeLink\(r\.html_url,'run'\)/);
  assert.ok(!/\bPOST\b|\bPATCH\b|\bDELETE\b|Authorization:\s*['"`]/i.test(js));
  assert.ok(!/fetch\(['"]https?:\/\/(?!api\.github\.com)/.test(js));
});

test('polling, failure state and accessibility are explicit',()=>{
  assert.match(js,/REFRESH_MS\s*=\s*180000/);
  assert.match(js,/MIN_MANUAL_REFRESH_MS\s*=\s*30000/);
  assert.match(js,/document\.hidden/);
  assert.match(js,/state\.inFlight/);
  assert.match(js,/response\.status===403/);
  assert.match(js,/setAttribute\('aria-pressed'/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/role="alert"/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/@media\(max-width:460px\)/);
});

test('separate Cloudflare Worker has a browser security policy',()=>{
  for(const text of ["default-src 'none'","script-src 'self'","style-src 'self'","connect-src https://api.github.com","frame-ancestors 'none'","X-Content-Type-Options: nosniff"]){
    assert.ok(headers.includes(text),'missing '+text);
  }
  assert.match(config,/compatibility_date/);
  assert.doesNotMatch(config,/route\s*=|custom_domain|vars\.|secrets\./);
});
