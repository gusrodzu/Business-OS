import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.module.css',import.meta.url),'utf8');
test('desktop floating window resize target is at least 44 by 44 pixels',()=>{
 const handle=css.match(/\.resizeHandle\{([^}]*)\}/)?.[1];
 assert.ok(handle,'resize handle must exist');
 const width=Number(handle.match(/(?:^|;)width:(\d+)px/)?.[1]);
 const height=Number(handle.match(/(?:^|;)height:(\d+)px/)?.[1]);
 assert.ok(width>=44&&height>=44,`resize target is ${width}x${height}`);
 assert.match(css,/\.resizeHandle::after\{[^}]*width:10px;height:10px/);
 assert.match(css,/\.resizeHandle:focus-visible\{/);
});
