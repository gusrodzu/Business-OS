import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.module.css',import.meta.url),'utf8');
test('split divider has a generous centered pointer target with a thin visual line',()=>{
 const divider=css.match(/\.splitDivider\{([^}]*)\}/)?.[1];
 const line=css.match(/\.splitDivider::after\{([^}]*)\}/)?.[1];
 const hover=css.match(/\.splitDivider:hover::after,\.splitDivider:focus-visible::after\{([^}]*)\}/)?.[1];
 assert.ok(divider&&line&&hover);
 assert.match(divider,/width:24px/);
 assert.match(divider,/transform:translateX\(-50%\)/);
 assert.match(divider,/touch-action:none/);
 assert.match(line,/left:11px/);
 assert.match(line,/width:2px/);
 assert.match(hover,/left:10px;width:4px/);
 assert.match(css,/\.splitDivider:focus-visible\{/);
});
