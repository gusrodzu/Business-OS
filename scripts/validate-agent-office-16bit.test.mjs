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
  assert.doesNotMatch(artSource,/innerHTML|fetch\s*\(|XMLHttpRequest|document\.cookie|localStorage|sessionStorage|https?:\/\//);
  assert.match(artSource,/createElementNS/);
  assert.doesNotMatch(artSource,/<image|<foreignObject/);
});
