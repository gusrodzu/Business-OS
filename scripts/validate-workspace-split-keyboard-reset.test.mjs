import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.jsx',import.meta.url),'utf8');
test('split divider supports Enter and Space to restore equal columns',()=>{
 assert.match(source,/role="separator" aria-label="Ajustar ancho de las ventanas"/);
 assert.match(source,/event\.key==='Enter'\|\|event\.key===' '/);
 assert.match(source,/event\.preventDefault\(\);setSplitRatio\(50\)/);
 assert.match(source,/onDoubleClick=\{\(\)=>setSplitRatio\(50\)\}/);
});
