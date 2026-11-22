/**
 * Agent Office pixel-art character workshop.
 * Characters, desks, laptop and individual props are separate SVG groups:
 * this keeps the visual language consistent with the approved six-agent
 * illustration while allowing GitHub-verified motion states to animate safely.
 * No external images, HTML injection, requests or Business OS dependencies.
 */
const NS='http://www.w3.org/2000/svg';
const PALETTES=Object.freeze({
  frontend:{wall:'#f1ddf7',wall2:'#e2c7ef',floor:'#ccb2e3',hair:'#704256',hairLight:'#9c6270',shirt:'#bf7ccd',shirtDark:'#955eb3',pants:'#456d89',shoes:'#ffffff',skin:'#ffd0b5',accent:'#a06bc8',icon:'</>',frame:'UI / UX'},
  backend:{wall:'#d4e6fc',wall2:'#bfdbf5',floor:'#a1bedc',hair:'#3d2931',hairLight:'#65453d',shirt:'#4278b2',shirtDark:'#315785',pants:'#36556f',shoes:'#ffffff',skin:'#f1c5a6',accent:'#438bc9',icon:'DB',frame:'API'},
  security:{wall:'#d9f2e5',wall2:'#bee8d3',floor:'#a8d3bb',hair:'#382c32',hairLight:'#68412e',shirt:'#34383f',shirtDark:'#23272e',pants:'#34383f',shoes:'#ffffff',skin:'#f6c4a4',accent:'#45b47e',icon:'◎',frame:'SEC'},
  qa:{wall:'#ffeadc',wall2:'#f9d7bd',floor:'#e2bea8',hair:'#81513b',hairLight:'#b17650',shirt:'#f3a444',shirtDark:'#d47d2d',pants:'#44657a',shoes:'#ffffff',skin:'#f8c5a7',accent:'#ed8d35',icon:'✓',frame:'TEST'},
  director:{wall:'#eddef7',wall2:'#dbc5ed',floor:'#b7a0d2',hair:'#4b302d',hairLight:'#7a4634',shirt:'#563471',shirtDark:'#3e295a',pants:'#363048',shoes:'#393039',skin:'#facaaa',accent:'#ad83ca',icon:'♛',frame:'PLAN'},
  devops:{wall:'#d7f5f2',wall2:'#b9e9e4',floor:'#9bcbca',hair:'#44394d',hairLight:'#6c5674',shirt:'#477b85',shirtDark:'#325b66',pants:'#405e74',shoes:'#ffffff',skin:'#f6c9af',accent:'#39a7ac',icon:'☁',frame:'CLOUD'},
});

function el(tag,attributes={},parent){
  const element=document.createElementNS(NS,tag);
  for(const [key,value] of Object.entries(attributes))element.setAttribute(key,String(value));
  if(parent)parent.append(element);
  return element;
}
function rectangle(parent,x,y,width,height,fill,other={}){
  return el('rect',{x,y,width,height,fill,...other},parent);
}
function rects(parent,items){
  for(const [x,y,w,h,color] of items)rectangle(parent,x,y,w,h,color);
}
function words(parent,x,y,text,color,size=11,weight=800){
  const e=el('text',{x,y,fill:color,'font-size':size,'font-weight':weight,'font-family':'ui-monospace,monospace','text-anchor':'middle'},parent);
  e.textContent=text;
  return e;
}
function sparkle(parent,x,y,color){
  rectangle(parent,x+5,y,4,17,color);
  rectangle(parent,x,y+6,14,5,color);
}
function eye(parent,x,y,glasses=false){
  const e=el('g',{'class':'art-eye'},parent);
  rectangle(e,x-1,y-5,10,4,'#65443c'); // eyebrow
  rectangle(e,x,y,7,12,'#ffffff');
  rectangle(e,x+1,y+1,5,9,'#376957');
  rectangle(e,x+2,y+2,3,6,'#263b38');
  rectangle(e,x+2,y+1,2,2,'#a4dcca');
  rectangle(e,x,y+12,7,2,'#e1ad96');
  if(glasses){
    rects(e,[[x-5,y-7,19,3,'#25334b'],[x-5,y+12,19,3,'#25334b'],[x-5,y-7,3,22,'#25334b'],[x+11,y-7,3,22,'#25334b'],[x-3,y-4,2,9,'#b8e2ed']]);
  }
  return e;
}
function frame(svg,p,kind){
  rectangle(svg,0,0,320,320,p.wall);
  rectangle(svg,0,235,320,85,p.floor);
  rectangle(svg,0,0,320,90,p.wall2,{opacity:'.45'});
  // Four-tone stepped wall and floor shading, instead of flat 8-bit fills.
  rectangle(svg,0,180,320,9,p.wall2,{opacity:'.5'});
  rectangle(svg,0,224,320,11,p.wall2,{opacity:'.85'});
  rectangle(svg,0,237,320,6,'#ffffff',{opacity:'.25'});
  rectangle(svg,0,299,320,11,p.wall2,{opacity:'.24'});
  rects(svg,[[21,270,27,4,'#ffffff33'],[268,280,27,4,'#ffffff33'],[10,256,46,3,'#ffffff44'],[243,258,39,3,'#ffffff44']]);
  rectangle(svg,79,298,169,7,'#33334b',{opacity:'.15'});
  rectangle(svg,30,300,260,6,p.accent,{opacity:'.3'});
  // Pinned, bevelled station board in the approved 16-bit style.
  rectangle(svg,210,47,84,67,'#806d91');
  rectangle(svg,213,50,80,62,'#a995a8');
  rectangle(svg,247,43,12,8,'#d4ad5b');
  rectangle(svg,250,44,5,5,'#fff2ac');
  rectangle(svg,216,53,74,56,'#fff6e9');
  rectangle(svg,221,58,64,46,p.wall2);
  // Role-specific board matches the character's work environment.
  if(kind==='frontend'){
    rectangle(svg,229,62,45,25,'#ffffff');rectangle(svg,233,66,37,4,p.accent);
    rectangle(svg,234,74,15,12,'#cbb3e8');rectangle(svg,251,74,17,12,'#e9ddf5');
  }else if(kind==='backend'){
    rectangle(svg,237,63,28,23,'#ffffff');rectangle(svg,237,64,28,4,p.accent);
    rectangle(svg,240,72,22,4,p.accent);rectangle(svg,240,79,22,4,p.accent);
  }else if(kind==='security'){
    rectangle(svg,239,63,26,26,p.accent);rectangle(svg,244,68,16,15,'#ffffff');
    rectangle(svg,249,74,6,10,'#6abb90');
  }else if(kind==='qa'){
    for(let i=0;i<3;i++){
      rectangle(svg,229,64+i*8,7,7,'#55ac73');
      rectangle(svg,240,66+i*8,33,3,p.accent);
    }
  }else if(kind==='director'){
    rectangle(svg,227,64,26,6,p.accent);rectangle(svg,243,74,31,6,'#bb9ed3');
    rectangle(svg,253,84,23,5,p.accent);
  }else{
    rectangle(svg,242,62,21,8,p.accent);
    rectangle(svg,229,76,14,9,'#5ac6c7');rectangle(svg,252,76,14,9,'#5ac6c7');
    rectangle(svg,270,76,10,9,'#5ac6c7');
  }
  words(svg,252,100,p.frame,'#61576d',11);
  rectangle(svg,23,15,58,49,'#ffffff70',{rx:8});
  rectangle(svg,26,18,52,43,p.accent,{rx:8});
  rectangle(svg,30,21,44,4,'#ffffff',{opacity:'.3'});
  words(svg,52,46,p.icon,'#ffffff',p.icon.length>2?16:23);
}
function chair(svg){
  rectangle(svg,97,180,99,72,'#2c2e3d',{rx:6});
  rectangle(svg,101,183,91,66,'#41404a',{rx:6});
  rectangle(svg,106,188,79,60,'#35353f');
  rectangle(svg,110,191,6,51,'#747580');
  rectangle(svg,177,194,4,46,'#272936');
  rectangle(svg,110,241,9,55,'#41404a');
  rectangle(svg,106,290,91,6,'#35353f');
  rectangle(svg,111,293,12,12,'#34343d');
  rectangle(svg,173,293,12,12,'#34343d');
}
function hair(svg,kind,p){
  const head=p.hair,h=p.hairLight;
  if(kind==='frontend'){
    rects(svg,[[75,78,52,70,head],[72,88,15,55,head],[60,104,22,34,head],[68,76,29,17,h],[85,70,16,13,head],[96,64,63,17,head],[115,74,76,27,head],[165,86,28,16,head],[156,100,22,15,head],[77,75,13,11,p.accent],[88,70,12,10,p.accent]]);
  } else if(kind==='backend'){
    rects(svg,[[75,87,113,44,head],[80,72,82,29,head],[90,64,18,24,h],[112,62,24,22,head],[143,68,22,20,head],[168,77,18,20,head],[65,98,20,26,head],[181,93,14,14,head]]);
  } else if(kind==='security'){
    rects(svg,[[73,73,122,53,'#2b3432'],[83,64,98,18,'#2d3833'],[95,58,58,17,'#24332d'],[71,84,18,55,'#2b3432'],[183,84,18,54,'#2b3432'],[85,77,104,13,p.accent],[91,86,17,9,p.accent],[166,86,17,9,p.accent],[96,95,76,19,h]]);
  } else if(kind==='qa'){
    rects(svg,[[68,77,45,79,head],[76,67,78,30,head],[88,60,70,20,h],[126,69,50,34,head],[174,81,24,57,head],[59,110,22,36,head],[71,135,26,15,h],[165,137,31,18,h],[102,69,70,10,h]]);
    rectangle(svg,110,78,64,11,'#384d69');
    rectangle(svg,118,72,19,11,'#a9d2e4');rectangle(svg,145,72,19,11,'#a9d2e4');
  } else if(kind==='director'){
    rects(svg,[[74,80,115,43,head],[88,69,75,18,head],[97,58,19,24,head],[123,61,23,21,h],[153,66,21,20,head],[180,77,15,22,head],[70,99,18,26,head]]);
  } else {
    rects(svg,[[71,83,45,73,head],[74,74,92,34,head],[91,66,24,20,head],[121,62,44,21,head],[162,77,36,38,head],[177,102,28,49,head],[68,129,34,22,head],[177,130,25,26,h],[88,76,13,13,p.accent],[101,71,12,12,p.accent]]);
  }
}
function face(svg,kind,p){
  const g=el('g',{'class':'art-face'},svg);
  // SNES-inspired 4-tone skin shading, lit from upper-left.
  rectangle(g,88,101,93,84,'#b88173');
  rectangle(g,92,101,87,79,p.skin);
  rects(g,[[94,106,21,5,'#ffe8cd'],[100,112,17,6,'#ffdfca'],[89,127,9,22,p.skin],[181,121,9,24,p.skin],[174,118,5,42,'#e3a48e'],[98,168,69,12,'#e8a38e'],[103,176,64,8,'#c98e7d'],[159,149,10,18,'#f3b59c'],[106,152,11,5,'#ffbbac'],[160,154,11,5,'#ffbdad']]);
  const eyes=el('g',{'class':'art-eyes'},g);
  eye(eyes,111,134,['backend','devops'].includes(kind));
  eye(eyes,155,134,['backend','devops'].includes(kind));
  // 16-bit smile with lip shading and clean, chunky white pixels.
  rectangle(g,123,158,34,13,'#a56e63');
  rectangle(g,125,159,30,9,'#ffffff');
  rectangle(g,128,168,25,3,'#db9883');
  rectangle(g,132,157,14,2,'#f2b99d');
  rectangle(g,137,149,6,4,'#e1a08e');
  if(kind==='security'){
    rectangle(g,98,102,76,12,p.hairLight);
  }
  if(kind==='frontend'){
    rectangle(g,87,164,6,13,p.hair);rectangle(g,178,166,7,16,p.hair);
  }
  if(kind==='director'){
    rectangle(g,120,174,29,4,'#c98a7c');
  }
  return g;
}
function foreheadDetails(svg,kind,p){
  const g=el('g',{'class':'art-hair-details'},svg);
  const d=p.hairLight, dark=p.hair;
  if(kind==='frontend'){
    rects(g,[[69,72,31,12,d],[79,63,21,10,d],[87,88,41,10,d],[94,96,32,7,d],[74,101,15,31,d],[56,95,17,33,d],[65,112,12,17,d],[86,74,9,10,p.accent],[95,73,12,6,p.accent]]);
  }else if(kind==='backend'){
    rects(g,[[87,78,18,9,d],[113,71,12,7,d],[141,77,21,8,d],[102,89,38,7,d],[70,101,18,10,d],[165,95,14,8,d]]);
  }else if(kind==='security'){
    rects(g,[[78,76,101,10,d],[82,68,83,10,'#353c3d'],[79,85,97,7,p.accent],[91,99,55,8,d],[68,109,16,26,d],[169,109,18,26,d]]);
    rectangle(g,93,64,13,8,'#75dc94');
  }else if(kind==='qa'){
    rects(g,[[71,82,18,15,d],[86,70,27,12,d],[108,66,23,12,d],[139,71,31,14,d],[168,83,19,16,d],[62,113,15,24,d],[171,125,24,22,d],[83,94,21,13,d]]);
    rects(g,[[112,74,25,7,'#344b66'],[115,68,19,5,'#cee3e7'],[139,74,25,7,'#344b66'],[141,68,19,5,'#cee3e7']]);
  }else if(kind==='director'){
    rects(g,[[96,68,22,7,d],[122,62,15,7,d],[145,74,18,8,d],[86,86,74,9,d],[91,95,18,5,d]]);
  }else if(kind==='devops'){
    rects(g,[[69,79,27,18,d],[76,66,26,14,d],[89,60,31,11,d],[93,94,16,13,d],[166,78,24,14,d],[180,99,17,25,d],[88,73,7,12,p.accent],[103,74,11,7,p.accent]]);
  }
  rectangle(g,93,89,7,4,d,{opacity:'.6'});
  return g;
}

function body(svg,kind,p){
  const g=el('g',{'class':'art-body'},svg);
  rectangle(g,95,180,86,57,p.shirt);
  rectangle(g,98,184,7,43,'#ffffff',{opacity:'.16'});
  rectangle(g,169,185,8,43,p.shirtDark);
  rectangle(g,107,185,54,7,'#ffffff',{opacity:'.18'});
  rectangle(g,86,189,19,49,p.shirtDark);
  rectangle(g,172,188,20,48,p.shirtDark);
  rectangle(g,114,181,40,12,'#ffffff');
  rectangle(g,120,194,8,22,p.shirtDark);
  rectangle(g,148,194,8,21,p.shirtDark);
  rectangle(g,135,193,4,36,'#e4ccdb');
  rectangle(g,137,195,2,27,'#ffffff');
  if(kind==='director'){
    rectangle(g,128,191,9,30,'#e8cc91');rectangle(g,133,187,8,9,p.shirtDark);
  }
  if(kind==='frontend'||kind==='security'){
    rectangle(g,95,196,17,13,p.accent,{opacity:'.75'});
    rectangle(g,172,195,11,13,p.accent,{opacity:'.75'});
  }
  rectangle(g,99,233,39,44,p.pants);
  rectangle(g,143,233,40,44,p.pants);
  rectangle(g,105,244,6,27,'#ffffff',{opacity:'.17'});
  rectangle(g,150,245,7,26,'#ffffff',{opacity:'.14'});
  rectangle(g,99,272,40,22,p.pants);
  rectangle(g,146,272,37,22,p.pants);
  rectangle(g,91,289,48,14,p.shoes);
  rectangle(g,141,289,49,14,p.shoes);
  rectangle(g,95,292,20,4,'#ffffff');
  rectangle(g,91,301,48,4,'#404052');
  rectangle(g,148,292,24,4,'#ffffff');
  rectangle(g,141,301,49,4,'#404052');
  const hands=el('g',{'class':'art-hands'},g);
  rectangle(hands,98,210,26,18,p.skin);
  rectangle(hands,150,210,24,18,p.skin);
  rectangle(hands,98,225,26,4,'#c9917b');
  rectangle(hands,150,225,24,4,'#c9917b');
  rectangle(hands,102,211,8,3,'#ffdfc4');
  rectangle(hands,155,211,8,3,'#ffdfc4');
}
function headphones(svg,p){
  // Ear cups rest around the NECK, never over the eyes or mouth.
  // This is drawn after the body; the old 81–168px headband crossed the face.
  const g=el('g',{'class':'art-neck-headphones'},svg);
  rects(g,[
    [107,185,54,7,'#3b3c53'],
    [113,187,42,3,p.accent],
    [92,181,22,27,'#414159'],[95,184,17,22,p.accent],
    [98,187,11,15,'#e2daea'],[100,190,7,9,'#5d5374'],
    [159,181,22,27,'#414159'],[162,184,17,22,p.accent],
    [165,187,11,15,'#e2daea'],[168,190,7,9,'#5d5374'],
  ]);
}
function laptop(svg){
  const laptop=el('g',{'class':'art-laptop'},svg);
  rectangle(laptop,164,182,106,59,'#272f3a');
  rectangle(laptop,167,184,101,56,'#373c48');
  rectangle(laptop,172,190,91,43,'#555a67');
  rectangle(laptop,175,192,84,5,'#7d8291');
  rectangle(laptop,175,226,84,4,'#434959');
  rectangle(laptop,212,207,11,10,'#343741');
  rectangle(laptop,216,209,5,5,'#858c9c');
  rectangle(laptop,153,236,125,7,'#2e3239');
}
function desk(svg){
  const g=el('g',{'class':'art-desk'},svg);
  rectangle(g,24,238,273,12,'#a7673e');
  rectangle(g,33,244,245,3,'#7d442a');
  rectangle(g,24,238,273,5,'#c58755');
  rectangle(g,29,239,259,2,'#f1b17b');
  rectangle(g,30,250,8,65,'#343b3f');
  rectangle(g,285,250,8,65,'#343b3f');
  rectangle(g,32,254,3,55,'#6c7475');
  rectangle(g,287,254,3,55,'#6c7475');
}
function props(svg,kind,p){
  const g=el('g',{'class':'art-role-props'},svg);
  if(kind==='frontend'){
    rectangle(g,41,207,18,33,'#eee3d7');rectangle(g,47,192,8,17,'#4ca669');
    rectangle(g,34,199,8,6,'#4ca669');rectangle(g,55,198,9,6,'#4ca669');
    rectangle(g,276,220,19,17,'#844db6');words(g,285,232,'♥','#fff',12);
    headphones(g,p);
  }
  if(kind==='backend'){
    rectangle(g,37,189,34,23,'#303e4c');
    rectangle(g,37,213,34,23,'#303e4c');
    rectangle(g,42,198,6,5,'#69dcfc');
    rectangle(g,42,222,6,5,'#69dcfc');
    rectangle(g,62,200,5,4,'#6ca0a8');
    rectangle(g,62,224,5,4,'#6ca0a8');
    rectangle(g,270,219,22,19,'#3386af');words(g,281,232,'{}','#fff',11);
  }
  if(kind==='security'){
    rectangle(g,38,184,40,44,'#4caf7c');
    rectangle(g,44,191,28,30,'#e7fae4');
    words(g,58,213,'▣','#3c916a',21);
    rectangle(g,270,202,22,37,'#ffffff');rectangle(g,275,192,11,14,'#5bbd79');
    headphones(svg,p);
  }
  if(kind==='qa'){
    rectangle(g,38,220,29,5,'#a24d33');
    rectangle(g,41,209,22,16,'#da5b39');
    rectangle(g,43,211,5,5,'#2a2931');
    rectangle(g,55,216,5,5,'#2a2931');
    rectangle(g,273,217,22,22,p.accent);
    words(g,284,233,'✓','#ffffff',17);
  }
  if(kind==='director'){
    rectangle(g,37,194,37,6,'#af742c');
    rectangle(g,53,158,6,38,'#a98537');
    rectangle(g,43,165,25,3,'#e9ba56');
    rectangle(g,40,173,30,3,'#e9ba56');
    rectangle(g,43,181,25,3,'#e9ba56');
    rectangle(g,270,209,23,7,'#77558f');
    rectangle(g,270,217,23,7,'#c49e63');
    rectangle(g,270,225,23,7,'#77558f');
  }
  if(kind==='devops'){
    rectangle(g,38,185,36,22,'#2a4e5a');
    rectangle(g,38,210,36,22,'#2a4e5a');
    rectangle(g,45,192,6,6,'#4de2ee');
    rectangle(g,45,217,6,6,'#4de2ee');
    rectangle(g,273,214,24,23,'#47c1c4');
    words(g,284,232,'↑','#ffffff',20);
  }
}
function detailedRoleProps(svg,kind,p){
  const g=el('g',{'class':'art-16bit-props'},svg);
  if(kind==='frontend'){
    rects(g,[[41,208,14,4,'#f4faf2'],[44,195,4,12,'#237a54'],[50,191,4,17,'#42ad79'],[33,202,8,5,'#268d63'],[58,199,8,5,'#4ebd87'],[280,219,12,3,'#d9a8f7'],[280,231,12,3,'#623989']]);
    sparkle(g,270,158,'#fff0ab');
  }else if(kind==='backend'){
    for(let j=0;j<2;j++){
      const y=191+j*24;rects(g,[[37,y,34,3,'#566b86'],[42,y+8,7,5,'#63d9f4'],[55,y+9,10,3,'#68889b'],[41,y+17,24,2,'#192b3e']]);
    }
    rectangle(g,276,221,12,4,'#d0f4ff');
  }else if(kind==='security'){
    rects(g,[[46,188,22,4,'#8dedb2'],[45,194,5,20,'#20814b'],[53,204,11,9,'#52b978'],[55,200,6,7,'#d8ffd8'],[272,205,20,4,'#d5e9dd'],[276,194,8,5,'#307c4f']]);
    sparkle(g,29,174,'#d7ffd3');
  }else if(kind==='qa'){
    rects(g,[[43,211,16,4,'#ff997b'],[46,215,3,3,'#222330'],[55,215,3,3,'#222330'],[50,218,3,5,'#28252a'],[49,201,7,7,'#372d38'],[277,221,13,3,'#ffe7a4']]);
    sparkle(g,264,161,'#ffe2b5');
  }else if(kind==='director'){
    rects(g,[[53,159,7,6,'#f7d46f'],[42,171,27,3,'#c78937'],[44,179,24,3,'#c78937'],[53,164,4,24,'#63496a'],[270,209,23,2,'#d7c1f1'],[270,225,23,2,'#efcf8d']]);
    sparkle(g,28,149,'#fee39f');
  }else if(kind==='devops'){
    rects(g,[[38,189,36,3,'#496f7f'],[41,200,30,3,'#163947'],[38,213,36,3,'#496f7f'],[41,225,30,3,'#163947'],[49,195,4,3,'#b8fffa'],[49,220,4,3,'#b8fffa'],[276,220,14,5,'#a3f1f0']]);
    sparkle(g,265,161,'#d3fffa');
  }
}
function statusScreen(svg,p){
  const g=el('g',{'class':'art-signal-screen'},svg);
  rectangle(g,188,199,58,23,'#343b4e');
  rectangle(g,194,207,22,4,p.accent,{opacity:'.85'});
  rectangle(g,220,207,18,4,p.accent,{opacity:'.6'});
  rectangle(g,194,215,37,3,p.accent,{opacity:'.5'});
}
export function drawAgentScene(team){
  const kind=Object.hasOwn(PALETTES,team?.id)?team.id:'frontend';
  const p=PALETTES[kind];
  const svg=el('svg',{
    viewBox:'0 0 320 320',
    preserveAspectRatio:'xMidYMid meet',
    'shape-rendering':'crispEdges',
    class:'agent-scene-art',
    role:'presentation',
    'aria-hidden':'true',
    'data-art-id':kind,
    'data-sprite-style':'16-bit-v2',
  });
  frame(svg,p,kind);chair(svg);
  const character=el('g',{'class':'art-character'},svg);
  body(character,kind,p);
  // Keep all six heads proportionate to the torso (1.1x, not 1.4x).
  // Geometry and animation use different nested groups. Otherwise CSS
  // animations override SVG's transform attribute and detach the head.
  const headPosition=el('g',{'class':'art-head-position',transform:'translate(-14 -8) scale(1.1)'},character);
  const head=el('g',{'class':'art-head'},headPosition);
  hair(head,kind,p);face(head,kind,p);foreheadDetails(head,kind,p);
  props(svg,kind,p);detailedRoleProps(svg,kind,p);desk(svg);laptop(svg);statusScreen(svg,p);
  return svg;
}

export function drawAgentPortrait(team){
  const svg=drawAgentScene(team);
  svg.setAttribute('viewBox','52 44 189 184');
  svg.setAttribute('class','agent-portrait-art');
  return svg;
}
