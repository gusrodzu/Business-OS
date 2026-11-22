/**
 * Standalone pixel office panorama. All six programmers are viewed from behind.
 * Pure client SVG, no remote images, authentication or Business OS dependencies.
 * Decorative art does NOT imply GitHub/ChatGPT activity.
 */
const OFFICE_NS='http://www.w3.org/2000/svg';
const P={
  frontend:{accent:'#ad76fc',shirt:'#6843b3',hair:'#714b48',headset:'#b887ff',monitor:'#aa72ff'},
  backend:{accent:'#53b8ff',shirt:'#2561b9',hair:'#332e40',headset:'#50c9fe',monitor:'#65bbfa'},
  security:{accent:'#70e7a6',shirt:'#272f39',hair:'#302c39',headset:'#67e895',monitor:'#74f9b8'},
  qa:{accent:'#ffb955',shirt:'#d27b21',hair:'#9a5d38',headset:'#ffba46',monitor:'#ffc36b'},
  director:{accent:'#d29cff',shirt:'#70419d',hair:'#553a37',headset:'#b887ff',monitor:'#d6a5f0'},
  devops:{accent:'#59e1ea',shirt:'#287a8c',hair:'#332d48',headset:'#5de1f1',monitor:'#58e3e6'},
};
const ns=(tag,attrs={},parent)=>{
  const n=document.createElementNS(OFFICE_NS,tag);
  for(const [key,value] of Object.entries(attrs))n.setAttribute(key,String(value));
  if(parent)parent.append(n);
  return n;
};
const r=(p,x,y,w,h,fill,extras={})=>ns('rect',{x,y,width:w,height:h,fill,...extras},p);
const line=(p,x1,y1,x2,y2,color,sw=3)=>ns('line',{x1,y1,x2,y2,stroke:color,'stroke-width':sw,'stroke-linecap':'square'},p);
const t=(p,x,y,text,color,size=13,anchor='middle')=>{
 const a=ns('text',{x,y,fill:color,'font-size':size,'font-weight':800,'font-family':'ui-monospace,monospace','text-anchor':anchor},p);a.textContent=text;return a;
};
const pix=(p,x,y,fill,size=6)=>r(p,x,y,size,size,fill);

function pots(root,x,y,scale=1){
 const g=ns('g',{transform:`translate(${x} ${y}) scale(${scale})`},root);
 r(g,-13,14,26,21,'#5d3d60');r(g,-16,14,32,4,'#b9809a');
 r(g,-4,-4,8,22,'#509970');r(g,-17,-16,10,14,'#4da575');
 r(g,-27,-7,17,11,'#5abe81');r(g,10,-12,20,11,'#38866e');
 r(g,-20,-29,12,14,'#88d794');r(g,7,-27,10,19,'#75cc84');
 pix(g,-24,-14,'#b5f4a7',5);pix(g,14,-24,'#bcf4a6',5);
}
function lights(root){
 for(const x of [360,720,1100]) {
  r(root,x-45,0,90,8,'#312344');
  r(root,x-3,0,6,30,'#655370');
  r(root,x-45,27,90,16,'#482e45');
  r(root,x-38,43,76,5,'#d28051');
  r(root,x-26,48,52,5,'#ffcd80');
 }
}
function brickWall(root){
 r(root,0,0,1536,710,'#231b3e');
 for(let row=0;row<33;row++){
  const y=row*21+13;
  line(root,0,y,1536,y,row%3===0?'#473358':'#3a2a51',2);
  for(let col=-1;col<22;col++){
   const x=col*74+((row%2)*37);
   line(root,x,y,x,y+19,'#3a284e',2);
  }
 }
 r(root,0,0,1536,78,'#1a172c',{opacity:'.55'});
 r(root,0,450,1536,250,'#3b2b50',{opacity:'.3'});
}
function shelves(root){
 for(const [sx,sy,w] of [[300,106,352],[742,100,288],[1090,126,235]]){
   r(root,sx,sy,w,210,'#2a223c');
   r(root,sx+5,sy+9,w-10,190,'#392846');
   for(let y=sy+44;y<sy+208;y+=47){
    r(root,sx,y,w,12,'#583749');r(root,sx,y,w,4,'#965e52');
   }
   for(let x=sx+22;x<sx+w-20;x+=18){
    for(let y=sy+17;y<sy+195;y+=47){
      const color=['#8a4d7c','#c18b64','#4e5989','#905e65','#71886e'][(x/18+y/47|0)%5];
      r(root,x,y,12,21,color);r(root,x+3,y+4,4,4,'#d5afac',{opacity:'.65'});
    }
   }
 }
}
function memorabilia(root){
 // Pixel fantasy/scifi memorabilia: starship, glowing blades, robot helmets and game collectables.
 const sign=r(root,51,94,203,74,'#130f26',{stroke:'#b89054','stroke-width':5});sign.setAttribute('rx','3');
 t(root,152,128,'STAR','#edc278',31);t(root,152,156,'WARS','#edc278',31);
 for(const [x,c] of [[90,'#8cd7ff'],[120,'#f87083'],[150,'#9ce5ac']]){
  r(root,x,188,6,86,c);r(root,x-4,269,14,9,'#d2c8c4');
 }
 r(root,680,55,150,43,'#2e1749');t(root,755,87,'</>','#a979ff',52);
 r(root,1334,123,113,87,'#271a3e');r(root,1349,135,84,6,'#ff6cba');
 t(root,1391,186,'◉','#fa70b7',48);
 // Fantasy planetary station, golden triangle, sword and sky fighters.
 ns('circle',{cx:570,cy:85,r:52,fill:'#8e8ba8',stroke:'#c1b6ce','stroke-width':6},root);
 for(const [x,y] of [[535,60],[577,49],[598,90],[547,102]])r(root,x,y,17,15,'#5e5b7f');
 t(root,708,240,'▲','#f6b54c',58);
 r(root,809,143,8,112,'#83a5d3');r(root,800,156,27,13,'#d7b76e');r(root,807,137,11,21,'#e9d6cc');
 t(root,1178,108,'✦','#bdd7ff',45);t(root,1265,89,'◈','#e3bb93',39);
 // Plush figurines, deliberately abstract (no false claims of being real objects).
 for(const [x,y,c] of [[900,175,'#f6c04d'],[950,175,'#75bd8c'],[996,175,'#e9a264'],[1195,175,'#96bbdd'],[1237,175,'#ef9f70']]){
  r(root,x,y,27,30,c);r(root,x+7,y+8,4,4,'#342942');r(root,x+18,y+8,4,4,'#342942');r(root,x+6,y+23,15,4,'#f7dfb5');
 }
}
function windowCity(root){
 r(root,1342,35,176,465,'#11182e',{stroke:'#635775','stroke-width':8});
 r(root,1353,46,154,446,'#19243f');
 for(let i=0;i<24;i++){
  const x=1358+(i*47)%149, y=57+(i*33)%206;pix(root,x,y,'#d5d8ef',2);
 }
 for(let i=0;i<10;i++){
  const x=1358+i*16,h=80+(i*29)%124;
  r(root,x,485-h,15,h,'#293454');
  for(let yy=485-h+14;yy<478;yy+=13){
   r(root,x+4,yy,4,5,i%3?'#e5a36d':'#7bb5e8');
  }
 }
 r(root,1418,40,8,450,'#4d466a');r(root,1344,262,169,8,'#4d466a');
}
function props(root){
 // Coffee counter, sofa, cushions and sleeping dog.
 r(root,0,404,225,180,'#383048');
 r(root,15,418,195,18,'#aa674f');
 r(root,40,358,72,72,'#29253b');r(root,49,371,53,43,'#77758a');
 r(root,126,398,52,25,'#995d48');
 r(root,23,686,230,116,'#382a4e');r(root,29,681,203,21,'#53406b');
 r(root,49,711,68,48,'#b54457');r(root,145,716,66,49,'#6c6190');
 t(root,166,748,'✦','#e3c56a',25);
 r(root,1290,723,219,96,'#694053');r(root,1302,729,191,13,'#bb7d62');
 for(let i=0;i<10;i++){line(root,1318+i*16,748,1318+i*16,804,i%2?'#e8d6be':'#b34853',2);}
 // Central napping dog: cozy rounded pixel-art silhouette.
 r(root,633,753,242,40,'#44344f');r(root,654,746,197,31,'#806074');
 r(root,687,716,134,65,'#d39a68');r(root,712,708,103,43,'#e4b177');
 r(root,690,731,28,31,'#8c573a');r(root,776,732,30,25,'#8c573a');
 r(root,725,754,60,21,'#f6e8cf');r(root,714,744,5,6,'#2d2531');
 r(root,778,743,5,6,'#2d2531');r(root,750,752,14,7,'#393043');
 r(root,870,781,61,9,'#e8d3bb');r(root,861,774,13,17,'#e8d3bb');
 // Small plants at corners.
 pots(root,1401,599,2.3);pots(root,75,589,2.0);pots(root,1112,773,1.6);
}
function monitor(group,x,y,color,mode='code'){
 r(group,x,y,129,88,'#161829');r(group,x+5,y+5,119,72,'#2c3451');
 r(group,x+9,y+9,110,62,'#121b32');
 r(group,x+60,y+77,8,17,'#5c5672');r(group,x+44,y+91,42,5,'#54506a');
 if(mode==='secure'){t(group,x+65,y+54,'▣','#83ecc4',43);} else if(mode==='charts'){
  for(let i=0;i<5;i++)r(group,x+18+i*18,y+61-(i*11)%34,11,(i*11)%34+4,color);
 } else {
  for(let i=0;i<5;i++){
   r(group,x+13,y+18+i*10,25+(i*37)%54,3,i%2?color:'#7294ba');
   r(group,x+70,y+18+i*10,17+(i*7)%29,3,'#787bb4');
  }
 }
}
function station(root,id,cx,dy,scale=1){
 const p=P[id],g=ns('g',{class:'office-station-art','data-team':id,transform:`translate(${cx} ${dy}) scale(${scale})`},root);
 // Laptop panels and monitors sit behind the character, screens face towards the person.
 monitor(g,-143,-132,p.monitor,id==='security'?'secure':'code');
 monitor(g,29,-132,p.monitor,id==='director'||id==='devops'?'charts':'code');
 r(g,-156,-29,310,95,'#38334d',{stroke:'#695373','stroke-width':5});
 r(g,-146,-27,292,25,'#744458');r(g,-141,-23,280,5,'#e0a479');
 for(const dx of [-141,131]){r(g,dx,58,13,92,'#3e3248');r(g,dx+2,66,3,77,'#77546d');}
 // Chair behind shoulders, with a pixel leather back.
 r(g,-63,-32,126,119,'#181926');r(g,-57,-27,114,110,'#29283b');
 r(g,-51,-23,101,8,'#414257');r(g,-55,79,109,13,'#29283b');
 r(g,-4,84,10,53,'#3d3c4e');
 // Character facing away: hair shape, headphones and back panel.
 const person=ns('g',{class:'rear-character'},g);
 r(person,-38,-95,76,72,p.hair);r(person,-41,-82,12,41,'#211c2c');
 r(person,-27,-106,54,16,p.hair);
 r(person,-19,-110,38,10,'#302438');
 for(let i=0;i<5;i++)r(person,-32+i*13,-104+(i%3)*3,10,8,i%2?p.hair:'#986b58');
 r(person,-51,-27,102,101,p.shirt);r(person,-41,-22,85,13,'#ffffff',{opacity:'.16'});
 r(person,-40,62,80,17,'#29283d');
 r(person,-54,-35,13,61,'#373545');r(person,42,-35,13,61,'#373545');
 const arms=ns('g',{class:'rear-arms'},person);
 r(arms,-67,-14,18,46,p.shirt);r(arms,48,-14,18,46,p.shirt);
 r(arms,-71,22,20,12,'#cf987c');r(arms,51,22,20,12,'#cf987c');
 // Headphone arch and cups visible at the ears, never across face.
 r(person,-40,-88,10,52,p.headset);r(person,30,-88,10,52,p.headset);
 r(person,-40,-93,80,7,p.headset);r(person,-47,-57,12,27,'#372c50');
 r(person,35,-57,12,27,'#372c50');
 // Colored logo on back of chair, not a fake current status.
 r(g,-24,11,48,36,'#211e37');r(g,-19,17,37,23,p.accent);
 t(g,0,35,id==='frontend'?'<>':id==='backend'?'DB':id==='security'?'◆':id==='qa'?'✓':id==='director'?'◈':'☁','#20172e',17);
 // Workstation ornaments.
 pots(g,-123,-42,.8);
 r(g,108,-32,26,31,'#dfd8df');r(g,112,-24,17,16,p.accent);
 return g;
}
export function drawOfficePanorama(){
 const svg=ns('svg',{viewBox:'0 0 1536 864',preserveAspectRatio:'xMidYMid meet',class:'pixel-office-art','aria-hidden':'true','shape-rendering':'crispEdges',role:'presentation'});
 brickWall(svg);shelves(svg);windowCity(svg);memorabilia(svg);lights(svg);
 // Carpeted foreground in subtle perspective tiles.
 r(svg,0,695,1536,169,'#40304f');
 for(let i=0;i<24;i++)line(svg,i*70,695,i*70+((i-12)*8),864,'#66506c',1);
 for(let y=713;y<864;y+=42)line(svg,0,y,1536,y,'#5d4964',1);
 // Upper three seats and lower three seats, in the approved back-facing order.
 station(svg,'frontend',387,370,.94);
 station(svg,'backend',777,370,.94);
 station(svg,'security',1168,370,.94);
 station(svg,'qa',377,608,1.0);
 station(svg,'director',772,608,1.0);
 station(svg,'devops',1169,608,1.0);
 props(svg);
 return svg;
}
