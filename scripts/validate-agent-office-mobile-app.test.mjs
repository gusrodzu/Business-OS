import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('sites/agent-office/public/index.html');
const css=read('sites/agent-office/public/styles.css');
const js=read('sites/agent-office/public/app.js');

test('Android-inspired mobile shell has accessible app navigation with three views',()=>{
  assert.match(html,/<nav class="mobile-bottom-nav" aria-label="Navegación de Agent Office">/);
  const buttons=[...html.matchAll(/data-mobile-tab="(office|activity|teams)" (?:aria-current="page" )?aria-controls="([^"]+)"/g)];
  assert.equal(buttons.length,3);
  assert.deepEqual(buttons.map(x=>x[1]),['office','activity','teams']);
  for(const button of buttons){assert.ok(html.includes('id="'+button[2]+'"'),button[1]+' target missing');}
  assert.match(html,/data-mobile-view="office"/);
  assert.match(js,/mobileViews=new Set\(\['office','activity','teams'\]\)/);
  assert.match(js,/setAttribute\('aria-current','page'\)/);
  assert.match(js,/removeAttribute\('aria-current'\)/);
});

test('mobile office uses bottom navigation, compact grid, safe-area and no scroll-wide layout',()=>{
  assert.match(css,/\.mobile-team-roster,\.mobile-bottom-nav\{display:none\}/);
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(css,/\.mobile-bottom-nav\{position:fixed/);
  assert.match(css,/env\(safe-area-inset-bottom,0px\)/);
  assert.match(css,/\.agent-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:375px\)/);
  assert.match(css,/\.masthead\{position:sticky/);
  assert.match(css,/@media\(max-width:900px\) and \(orientation:landscape\)/);
  assert.match(css,/\.site-shell\[data-mobile-view=office\] \.mobile-team-roster/);
  assert.match(css,/\.site-shell\[data-mobile-view=activity\] \.overview/);
  assert.match(css,/\.site-shell\[data-mobile-view=teams\] \.overview/);
});

test('tapping a cubicle opens its accessible team view and roster stays interactive',()=>{
  assert.match(html,/id="team-roster-list"/);
  assert.match(js,/function renderRoster\(\)/);
  assert.match(js,/button\.setAttribute\('aria-pressed'/);
  assert.match(js,/button\.setAttribute\('aria-label','Ver '\+team\.name/);
  assert.match(js,/if\(window\.matchMedia\('\(max-width: 900px\)'\)\.matches\)setMobileView\('teams'\)/);
  assert.match(js,/renderStations\(\);renderHandoffs\(\);renderRoster\(\);renderDetail\(\)/);
  assert.match(js,/tab\.addEventListener\('click',\(\)=>setMobileView\(tab\.dataset\.mobileTab\)\)/);
  assert.ok(!js.includes('innerHTML'));
});

test('visual shell remains a standalone public-GitHub-only site',()=>{
  assert.doesNotMatch(html,/\/login|\/admin-saas|\/platform-entry|AppShell|PlatformShell/);
  assert.doesNotMatch(js,/localStorage|sessionStorage|document\.cookie|\/platform-admin|\/auth\/login/);
  assert.match(js,/const API = 'https:\/\/api\.github\.com\/repos\/'/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
