import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.module.css',import.meta.url),'utf8');

test('restoring floating layout preserves the resized window geometry',()=>{
 const rule=css.match(/\.snapped\[data-os-snap='float'\]\{([^}]*)\}/)?.[1];
 assert.ok(rule,'floating restore rule must exist');
 assert.match(rule,/width:min\(var\(--os-window-width,990px\),calc\(100% - 30px\)\)/);
 assert.match(rule,/height:min\(var\(--os-window-height,720px\),calc\(100% - 32px\)\)/);
 assert.doesNotMatch(rule,/width:min\(990px/);
});
