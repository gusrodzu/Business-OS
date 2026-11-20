import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.jsx',import.meta.url),'utf8');
test('double clicking split divider restores a balanced 50/50 layout',()=>{
 assert.match(source,/const \[splitRatio,setSplitRatio\]=useState\(50\)/);
 assert.match(source,/className=\{styles\.splitDivider\}[\s\S]*?onPointerDown=\{startSplitResize\} onDoubleClick=\{\(\)=>setSplitRatio\(50\)\}/);
 assert.match(source,/aria-valuenow=\{Math\.round\(splitRatio\)\}/);
});
