import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHoneycombLayout} from '../apps/web/src/components/honeycombLayout.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const check=(name,condition)=>{assert.ok(condition,name);console.log('PASS · '+name);};
const EPS=1.2;

for(const container of [265,320,390,520,620,760,980,1440]){
  for(let count=1;count<=11;count++){
    for(const compact of [false,true]){
      const layout=createHoneycombLayout({width:container,count,compact});
      assert.equal(layout.positions.length,count,`Missing cell on ${container} / ${count}`);
      assert.ok(layout.height>0 && layout.width===container,'Invalid container geometry');
      for(const [i,cell] of layout.positions.entries()){
        assert.ok(cell.left>=-EPS,`Cell ${i} leaves left boundary at ${container}`);
        assert.ok(cell.left+cell.width<=container+EPS,
          `Cell ${i} leaves right boundary at ${container}`);
        assert.ok(cell.top>=-EPS,`Cell ${i} leaves top boundary at ${container}`);
        assert.ok(cell.top+cell.height<=layout.height+EPS,
          `Cell ${i} leaves bottom boundary at ${container}`);
        assert.ok(Math.abs(cell.height/cell.width-Math.sqrt(3)/2)<.008,
          'Flat-top hex width/height ratio must remain regular');
      }
      // Hexagon center distance must give every tile a neighbour sharing an
      // edge; edge-sharing distance = height of the flat-top hexagon.
      if(count>1){
        for(let i=0;i<count;i++){
          const a=layout.positions[i];
          const ax=a.left+a.width/2,ay=a.top+a.height/2;
          const minimum=Math.min(...layout.positions.filter((_,j)=>j!==i).map(b=>
            Math.hypot(ax-(b.left+b.width/2),ay-(b.top+b.height/2))));
          assert.ok(Math.abs(minimum-layout.tileHeight)<1.5,
            `Detached tile ${i} at ${container} / ${count} (gap ${minimum})`);
        }
      }
    }
  }
  console.log('PASS · Geometry has connected adjacent tiles and no overflow at '+container+'px');
}

const nine=createHoneycombLayout({count:9,width:1200});
check('Desktop 9-cell pattern matches a centred 1–2–3–2–1 honeycomb',
  nine.mode==='flower' &&
  JSON.stringify(
    [...new Set(nine.positions.map(p=>p.left))].sort((a,b)=>a-b)
      .map(x=>nine.positions.filter(p=>p.left===x).length)
  )===JSON.stringify([1,2,3,2,1]));
check('Mobile layout retains adjacent interleaved columns',
  createHoneycombLayout({count:11,width:390}).mode==='mobile' &&
  createHoneycombLayout({count:11,width:390}).columns===2);
check('Tablet layout uses three interlocking columns',
  createHoneycombLayout({count:9,width:620}).mode==='tablet' &&
  createHoneycombLayout({count:9,width:620}).columns===3);
check('Compact mode scales without changing metric order',
  createHoneycombLayout({count:9,width:900,compact:true}).tileWidth <
  createHoneycombLayout({count:9,width:900,compact:false}).tileWidth);

const jsx=read('apps/web/src/components/HoneycombKpis.jsx');
const css=read('apps/web/src/components/HoneycombKpis.module.css');
check('React observes actual container width',jsx.includes('ResizeObserver(resize)')&&jsx.includes('ref={rootRef}'));
check('All KPI tiles and add controls use coordinate positions',
  jsx.includes('style={position(index)}')&&jsx.includes('style={position(items.length)}'));
check('Flat-top six-sided geometry not pointy cards',
  css.includes('clip-path:polygon(25% 0,75% 0,100% 50%'));
check('No alternating nth-child card transforms',
  !css.includes('.cell:nth-child(even)') && !css.includes('.addCell:nth-child(even)'));
check('Keyboard edit controls retained',
  jsx.includes('onMove?.(item.id, -1)') && jsx.includes('onRemove?.(item.id)') &&
  css.includes('.editTools button:focus-visible'));
console.log('PASS · Connected BuzzBee honeycomb layout geometry and accessibility');
