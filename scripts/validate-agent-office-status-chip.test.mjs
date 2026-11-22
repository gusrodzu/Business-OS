import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createAgentStatus} from '../sites/agent-office/public/agentStatusChip.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const src=read('sites/agent-office/public/agentStatusChip.js');
const app=read('sites/agent-office/public/app.js');
const css=read('sites/agent-office/public/styles.css');
const teams=[
  {id:'frontend',name:'Frontend'},
  {id:'backend',name:'Backend'},
  {id:'security',name:'Ciberseguridad'},
  {id:'qa',name:'QA'},
  {id:'director',name:'Director Técnico'},
  {id:'devops',name:'DevOps / SRE'},
];
function element(tag){
  return {tag,attributes:{},dataset:{},children:[],className:'',textContent:'',
    setAttribute(k,v){this.attributes[k]=String(v)},
    append(...nodes){this.children.push(...nodes)},
  };
}
globalThis.document={createElement:tag=>element(tag)};
const tree=(el)=>[el,...el.children.flatMap(tree)];
const byClass=(el,c)=>tree(el).find(n=>n.className.split(' ').includes(c));

test('shared status renders six identities and every verified GitHub state',()=>{
  const expected={
    typing:'CI activo',waiting:'En cola',reading:'PR abierto',
    celebrating:'CI aprobado',alert:'CI falló',idle:'En espera',offline:'Sin señal',
  };
  for(const team of teams){
    for(const [mode,text] of Object.entries(expected)){
      const chip=createAgentStatus(team,{mode},{variant:'floating'});
      assert.equal(chip.tag,'span');
      assert.equal(chip.dataset.status,mode);
      assert.equal(chip.attributes.role,'group');
      assert.ok(chip.attributes['aria-label'].includes(team.name));
      assert.equal(byClass(chip,'agent-status__name').textContent,team.name);
      assert.equal(byClass(chip,'agent-status__state').textContent,text);
      assert.equal(byClass(chip,'agent-status__badge').attributes['aria-hidden'],'true');
      assert.ok(byClass(chip,'agent-status__icon').textContent.length>0);
      assert.equal(tree(chip).filter(n=>['button','a'].includes(n.tag)).length,0);
    }
  }
});

test('compact status pill and detail share exact mapping without duplicate names',()=>{
  const team=teams[2], motion={mode:'idle'};
  for(const variant of ['pill','detail','card']){
    const chip=createAgentStatus(team,motion,{variant,showName:false});
    assert.ok(chip.className.includes('agent-status--'+variant));
    assert.equal(byClass(chip,'agent-status__name'),undefined);
    assert.equal(byClass(chip,'agent-status__state').textContent,'En espera');
  }
  const invalid=createAgentStatus(team,{mode:'made-up'},{variant:'unknown'});
  assert.equal(invalid.dataset.status,'offline');
  assert.ok(invalid.className.includes('agent-status--pill'));
});

test('untrusted team text cannot be interpolated into HTML',()=>{
  const team={id:'frontend',name:'<img src=x onerror=alert(1)>'};
  const chip=createAgentStatus(team,{mode:'offline'});
  assert.equal(byClass(chip,'agent-status__name').textContent,team.name);
  assert.equal(tree(chip).filter(n=>n.tag==='img').length,0);
  assert.doesNotMatch(src,/innerHTML|insertAdjacentHTML|eval\s*\(|fetch\s*\(|localStorage|sessionStorage|document\.cookie/);
});

test('one component is reused across the panorama, agent roster, cards and details',()=>{
  assert.match(app,/import \{createAgentStatus\} from '\.\/agentStatusChip\.js';/);
  assert.match(app,/append\(title,.*createAgentStatus\(team,motion,\{variant:'pill',showName:false\}\)/);
  assert.match(app,/hit\.append\(createAgentStatus\(current,motion,\{variant:'floating'\}\)\)/);
  assert.match(app,/append\(info,createAgentStatus\(team,motion,\{variant:'pill',showName:false\}\)/);
  assert.match(app,/append\(box,createAgentStatus\(team,motion,\{variant:'detail',showName:false\}\)/);
  assert.match(app,/chooseMotion\(current,\{fresh:state\.fresh\}\)/);
});

test('panorama labels are compact, centered and drawn outside the programmer body',()=>{
  assert.match(app,/hit\.style\.left=\(pos\.x-pos\.width\/2\)/);
  assert.match(app,/hit\.style\.height=\(pos\.height-10\)/);
  assert.match(css,/\.agent-status--floating\{/);
  assert.match(css,/\.agent-status--detail/);
  assert.match(css,/\.roster-row \.agent-status--pill/);
  assert.match(css,/\.agent-status\[data-status=offline\]/);
  assert.match(css,/\.office-hotspot::before/);
  assert.match(css,/\.office-hotspot::after/);
  assert.match(css,/touch-action:pan-x pan-y/);
  assert.match(css,/@media\(max-width:900px\)/);
});
