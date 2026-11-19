import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const jsx=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.module.css',import.meta.url),'utf8');
test('maximized window titlebar supports pointer drag to restore',()=>{
 assert.match(jsx,/const wasDocked=Boolean\(window\.maximized/);
 assert.match(jsx,/if\(window\.maximized&&!window\.snap\)onMaximize\(window\.key\)/);
 assert.doesNotMatch(jsx,/\(window\.maximized&&!window\.snap\)\|\|event\.target/);
 assert.match(jsx,/Math\.hypot\(pointer\.clientX-sx,pointer\.clientY-sy\)<5/);
});
test('maximized titlebar advertises grab affordance',()=>{
 assert.match(css,/\.slot :global\(\[data-os-application-window='true'\]\)>header\{/);
 assert.match(css,/cursor:grab/);
});
