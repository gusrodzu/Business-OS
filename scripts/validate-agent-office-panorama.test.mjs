import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drawOfficePanorama} from '../sites/agent-office/public/officePanorama.js';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('sites/agent-office/public/officePanorama.js');
const js=read('sites/agent-office/public/app.js');
const html=read('sites/agent-office/public/index.html');
const css=read('sites/agent-office/public/styles.css');
const ids=['frontend','backend','security','qa','director','devops'];
function element(tag){
 return {tag,attributes:{},children:[],textContent:'',
  setAttribute(key,val){this.attributes[key]=String(val)},
  append(n){this.children.push(n)},
 };
}
globalThis.document={createElementNS:(_namespace,tag)=>element(tag)};
const walk=(root)=>[root,...root.children.flatMap(walk)];

test('office is a single panoramic game room with exactly six rear-facing stations',()=>{
 const art=drawOfficePanorama();
 assert.equal(art.tag,'svg');
 assert.equal(art.attributes.viewBox,'0 0 1536 864');
 assert.equal(art.attributes['aria-hidden'],'true');
 const desks=walk(art).filter(n=>n.attributes.class==='office-station-art');
 assert.equal(desks.length,6);
 assert.deepEqual(desks.map(n=>n.attributes['data-team']),ids);
 for(const desk of desks){
  assert.ok(walk(desk).some(n=>n.attributes.class==='rear-character'),desk.attributes['data-team']+' missing back-facing character');
  assert.ok(walk(desk).some(n=>n.attributes.class==='rear-arms'),desk.attributes['data-team']+' missing animation layers');
  assert.ok(walk(desk).filter(n=>n.tag==='rect').length>20,desk.attributes['data-team']+' needs desk, chairs and screens');
 }
});

test('scene includes decor but never invents real agent activity',()=>{
 for(const decor of ['shelves','windowCity','memorabilia','lights','props','pots'])
  assert.ok(source.includes('function '+decor+'('),decor+' missing');
 assert.ok(!/\bTrabajando\b|\bMonitoreando\b|\bDesplegando\b|\bPlanificando\b|\bProbando\b/.test(source));
 assert.doesNotMatch(source,/fetch\s*\(|localStorage|sessionStorage|document\.cookie|innerHTML/i);
 assert.deepEqual(source.match(/https?:\/\/[^'\"\s]+/g),['http://www.w3.org/2000/svg']);
});

test('every role gets a keyboard-accessible hotspot and verified GitHub state',()=>{
 assert.match(html,/id="office-scroll"[^>]+tabindex="0"/);
 assert.match(html,/id="office-stage"/);
 assert.match(html,/id="office-hotspots"/);
 assert.match(html,/id="office-jump"/);
 assert.match(html,/Ver agentes en tarjetas individuales/);
 assert.match(js,/import \{drawOfficePanorama\} from '\.\/officePanorama\.js';/);
 assert.match(js,/function renderPanorama\(\)/);
 assert.match(js,/chooseMotion\(current,\{fresh:state\.fresh\}\)/);
 assert.match(js,/hit\.setAttribute\('aria-label',team\.name/);
 assert.match(js,/hit\.setAttribute\('aria-pressed'/);
 assert.match(js,/hit\.addEventListener\('click',\(\)=>chooseDesk\(team\.id\)\)/);
 for(const id of ids)assert.match(js,new RegExp(id+":\\{x:"));
});

test('phone panorama is swipeable and status-dependent, never a static fake live picture',()=>{
 assert.match(css,/\.pixel-office-scroll\{width:100%;overflow-x:auto/);
 assert.match(css,/\.pixel-office-stage\{/);
 assert.match(css,/@media\(max-width:900px\)/);
 assert.match(css,/\.office-live-chip/);
 assert.match(css,/\.office-hotspot\[data-motion=typing\]/);
 assert.match(css,/\.office-station-art\[data-motion=typing\]/);
 assert.match(css,/\.office-paused \.rear-arms/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(js,/setMobileView\('teams'\)/);
 assert.match(js,/renderStations\(\);renderPanorama\(\);renderHandoffs\(\);renderRoster\(\);renderDetail\(\)/);
});
