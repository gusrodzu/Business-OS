import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drawRearAgentPortrait,drawRearAgentScene,drawOfficePanorama} from '../sites/agent-office/public/officePanorama.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const js=read('sites/agent-office/public/app.js');
const css=read('sites/agent-office/public/styles.css');
const panorama=read('sites/agent-office/public/officePanorama.js');
const roles=['frontend','backend','security','qa','director','devops'];
function element(tag){
  return {tag,attributes:{},children:[],textContent:'',
    setAttribute(k,v){this.attributes[k]=String(v)},
    append(n){this.children.push(n)},
  };
}
globalThis.document={createElementNS:(_ns,tag)=>element(tag)};
const all=node=>[node,...node.children.flatMap(all)];

test('six roster portraits reuse the same rear-facing programmer geometry and identity',()=>{
  for(const id of roles){
    const portrait=drawRearAgentPortrait({id});
    assert.equal(portrait.tag,'svg');
    assert.equal(portrait.attributes.class,'agent-rear-portrait-art');
    assert.equal(portrait.attributes['aria-hidden'],'true');
    assert.equal(portrait.attributes['data-view'],'rear');
    assert.equal(portrait.attributes['data-art-id'],id);
    assert.equal(portrait.attributes.viewBox,'0 0 160 160');
    const desk=all(portrait).find(el=>el.attributes.class==='office-station-art');
    assert.equal(desk.attributes['data-team'],id);
    assert.ok(all(desk).some(el=>el.attributes.class==='rear-character'));
    assert.ok(all(desk).some(el=>el.attributes.class==='rear-arms'));
  }
});
test('individual card uses back-facing scene with recognizable desk and two screens',()=>{
  for(const id of roles){
    const scene=drawRearAgentScene({id});
    assert.equal(scene.attributes.viewBox,'0 0 320 300');
    assert.equal(scene.attributes.class,'agent-rear-scene-art');
    assert.equal(scene.attributes['data-art-id'],id);
    const desk=all(scene).find(el=>el.attributes.class==='office-station-art');
    assert.equal(desk.attributes['data-team'],id);
    assert.ok(all(desk).filter(el=>el.tag==='rect').length>35);
  }
});
test('panorama and all portraits share one station implementation, no independent duplicated face art',()=>{
  assert.match(panorama,/function station\(root,id,cx,dy,scale=1\)/);
  assert.match(panorama,/station\(svg,id,80,119,\.74\)/);
  assert.match(panorama,/station\(svg,id,160,149,\.94\)/);
  const desks=all(drawOfficePanorama()).filter(el=>el.attributes.class==='office-station-art');
  assert.equal(desks.length,6);
  assert.match(js,/portrait\.append\(drawRearAgentPortrait\(team\)\)/);
  assert.match(js,/scene\.append\(drawRearAgentScene\(team\)\)/);
  assert.match(js,/portrait\.append\(drawRearAgentPortrait\(team\)\);\s*append\(identity,portrait/);
});
test('rear-view art follows compact responsive UI, pixel rendering and public-only data',()=>{
  assert.match(css,/\.agent-rear-portrait-art/);
  assert.match(css,/\.agent-rear-scene-art/);
  assert.match(css,/\.detail-team-portrait/);
  assert.match(css,/\.scene\.scene-rear/);
  assert.match(css,/@media\(max-width:360px\)/);
  assert.doesNotMatch(panorama,/fetch\s*\(|localStorage|sessionStorage|document\.cookie|innerHTML/);
  assert.deepEqual(panorama.match(/https?:\/\/[^'"\s]+/g),['http://www.w3.org/2000/svg']);
});
