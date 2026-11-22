import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drawAgentScene,drawAgentPortrait} from '../sites/agent-office/public/agentArtwork.js';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const artSource=read('sites/agent-office/public/agentArtwork.js');
const styles=read('sites/agent-office/public/styles.css');
const app=read('sites/agent-office/public/app.js');
const ids=['frontend','backend','security','qa','director','devops'];
function element(tag){
  return {tag,attributes:{},children:[],textContent:'',
    setAttribute(key,value){this.attributes[key]=String(value)},
    append(child){this.children.push(child)},
  };
}
globalThis.document={createElementNS:(_ns,tag)=>element(tag)};
function walk(n){return [n,...n.children.flatMap(walk)];}

test('six approved characters have versioned 16-bit scene and matching portrait',()=>{
  for(const id of ids){
    const scene=drawAgentScene({id});
    assert.equal(scene.attributes['data-art-id'],id);
    assert.equal(scene.attributes['data-sprite-style'],'16-bit-v2');
    assert.equal(scene.attributes['aria-hidden'],'true');
    const nodes=walk(scene);
    for(const layer of ['art-head','art-eye','art-eyes','art-hair-details','art-16bit-props','art-role-props','art-laptop','art-desk','art-hands'])
      assert.ok(nodes.some(n=>n.attributes.class===layer),id+' missing '+layer);
    assert.ok(nodes.length>=100,id+' must be detailed pixel art');
    const portrait=drawAgentPortrait({id});
    assert.equal(portrait.attributes['data-art-id'],id);
    assert.equal(portrait.attributes['data-sprite-style'],'16-bit-v2');
  }
});

test('face and environment have deliberate shading and 16-bit role differences',()=>{
  assert.match(artSource,/Four-tone stepped wall and floor shading/);
  assert.match(artSource,/SNES-inspired 4-tone skin shading/);
  assert.match(artSource,/function foreheadDetails/);
  assert.match(artSource,/function detailedRoleProps/);
  for(const role of ids)assert.match(artSource,new RegExp("kind==='"+role+"'"));
  assert.match(artSource,/function eye\(parent,x,y,glasses=false\)/);
  assert.match(artSource,/function drawAgentPortrait|export function drawAgentPortrait/);
});

test('heads stay proportional, animation-safe and connected to the torso',()=>{
  for(const id of ids){
    const nodes=walk(drawAgentScene({id}));
    const character=nodes.find(n=>n.attributes.class==='art-character');
    const position=character?.children.find(n=>n.attributes.class==='art-head-position');
    assert.ok(position,id+' must anchor its head inside the character');
    assert.equal(position.attributes.transform,'translate(-14 -8) scale(1.1)');
    const head=position.children.find(n=>n.attributes.class==='art-head');
    assert.ok(head,id+' must animate within the fixed geometry container');
    assert.equal(head.attributes.transform,undefined,'animated head must not contain the positioning transform');
    const face=walk(head).find(n=>n.attributes.class==='art-face');
    assert.ok(face,'head must include a face');
  }
  assert.doesNotMatch(artSource,/scale\(1\.4\)/);
});

test('neck headphones never cross facial features',()=>{
  for(const id of ['frontend','security']){
    const nodes=walk(drawAgentScene({id}));
    const headphones=nodes.find(n=>n.attributes.class==='art-neck-headphones');
    assert.ok(headphones,id+' must render neck accessories');
    assert.ok(headphones.children.length>4,'headphone cups must be detailed');
    for(const rect of headphones.children.filter(n=>n.tag==='rect')){
      assert.ok(Number(rect.attributes.y)>=180,'neck headphone above the neckline: '+JSON.stringify(rect.attributes));
    }
  }
  for(const id of ['backend','qa','director','devops'])
    assert.equal(walk(drawAgentScene({id})).some(n=>n.attributes.class==='art-neck-headphones'),false);
});

test('animation corresponds to known GitHub states; stale signals do not imply activity',()=>{
  for(const mode of ['idle','reading','waiting','celebrating','typing','offline']){
    assert.ok(styles.includes('data-motion='+mode+']'),mode);
  }
  assert.match(styles,/\[data-sprite-style="16-bit-v2"\]/);
  assert.match(styles,/@keyframes pixelBlink16/);
  assert.match(styles,/@keyframes pixelRead16/);
  assert.match(styles,/\.office-paused \.art-head/);
  assert.match(styles,/prefers-reduced-motion:reduce/);
  assert.match(app,/chooseMotion\(team,\{fresh:state\.fresh\}\)/);
});

test('the sprite system is standalone and does not read private endpoints',()=>{
  assert.doesNotMatch(artSource,/innerHTML|fetch\s*\(|XMLHttpRequest|document\.cookie|localStorage|sessionStorage/);
  assert.deepEqual(artSource.match(/https?:\/\/[^'\"\s]+/g),['http://www.w3.org/2000/svg']);
  assert.match(artSource,/createElementNS/);
  assert.doesNotMatch(artSource,/<image|<foreignObject/);
});
