import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drawAgentScene,drawAgentPortrait} from '../sites/agent-office/public/agentArtwork.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('sites/agent-office/public/app.js');
const art=read('sites/agent-office/public/agentArtwork.js');
const css=read('sites/agent-office/public/styles.css');
const root='sites/agent-office/public';
const teams=['frontend','backend','security','qa','director','devops'];

function mockElement(tag){
  return {tag,attributes:{},children:[],textContent:'',
    setAttribute(key,value){this.attributes[key]=String(value)},
    append(child){this.children.push(child)},
  };
}
globalThis.document={createElementNS:(_namespace,tag)=>mockElement(tag)};
function all(node){return [node,...node.children.flatMap(all)]}

test('all six pixel-art agents have a distinct pastel palette, scene and face',()=>{
  const seenColors=new Set();
  for(const id of teams){
    const scene=drawAgentScene({id});
    assert.equal(scene.tag,'svg');
    assert.equal(scene.attributes['data-art-id'],id);
    assert.equal(scene.attributes['aria-hidden'],'true');
    assert.equal(scene.attributes.viewBox,'0 0 320 320');
    const elements=all(scene);
    assert.ok(elements.length>50,id+' must have substantial artwork');
    assert.ok(elements.some(x=>x.attributes.class==='art-character'),id+' needs a body group');
    assert.ok(elements.some(x=>x.attributes.class==='art-face'),id+' needs a face');
    assert.ok(elements.some(x=>x.attributes.class==='art-hands'),id+' needs hands to animate');
    assert.ok(elements.some(x=>x.attributes.class==='art-laptop'),id+' needs a laptop');
    assert.ok(elements.some(x=>x.attributes.class==='art-desk'),id+' needs a desk');
    assert.ok(elements.some(x=>x.attributes.class==='art-role-props'),id+' needs distinct props');
    assert.ok(elements.some(x=>x.attributes.class==='art-signal-screen'),id+' needs animated screen');
    const tone=elements.find(x=>x.tag==='rect'&&x.attributes.x==='0'&&x.attributes.y==='0')?.attributes.fill;
    assert.match(tone,/^#[a-fA-F0-9]{6}$/);
    seenColors.add(tone);
    const portrait=drawAgentPortrait({id});
    assert.equal(portrait.attributes['data-art-id'],id);
    assert.equal(portrait.attributes.viewBox,'52 44 189 184');
    assert.equal(portrait.attributes.class,'agent-portrait-art');
  }
  assert.equal(seenColors.size,6,'Every role has a distinct backdrop');
});

test('role props follow approved character directions',()=>{
  for(const id of teams)assert.match(art,new RegExp("kind==='"+id+"'"),id+' specialized prop styling missing');
  assert.ok(art.includes("headphones(svg,p)"),'Frontend/security headphones');
  assert.ok(art.includes("svg.setAttribute('viewBox','52 44 189 184')"),'Portrait framing missing');
  assert.doesNotMatch(art,/fetch\s*\(|XMLHttpRequest|innerHTML|document\.cookie|localStorage|sessionStorage/);
  assert.ok(!art.includes('<image')&&!art.includes('https://'));
});

test('office cards and roster both use the SVG character system',()=>{
  assert.match(app,/import \{drawAgentScene,drawAgentPortrait\} from '\.\/agentArtwork\.js'/);
  assert.match(app,/scene\.append\(drawAgentScene\(team\)\)/);
  assert.match(app,/portrait\.append\(drawAgentPortrait\(team\)\)/);
  assert.doesNotMatch(app,/function avatar\(team\)/);
  assert.match(css,/\.scene\.scene-v2/);
  assert.match(css,/\.agent-scene-art/);
  assert.match(css,/\.roster-portrait \.agent-portrait-art/);
  for(const state of ['typing','waiting','reading','celebrating','alert','idle','offline'])
    assert.ok(css.includes('data-motion='+state+']'),state+' style missing');
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/\.office-paused \.art-character/);
});

test('the graphic is self-contained for independent Cloudflare deployment',()=>{
  for(const id of teams)assert.ok(css.includes('data-team='+id+']'),id+' team selector missing');
  assert.match(read(root+'/index.html'),/src="\.\/app\.js"/);
  assert.match(read(root+'/index.html'),/href="\.\/styles\.css"/);
  assert.match(read(root+'/officeMotion.js'),/export function chooseMotion/);
  assert.match(read(root+'/agentArtwork.js'),/export function drawAgentScene/);
});
