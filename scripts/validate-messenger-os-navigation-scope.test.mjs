import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const hook=readFileSync(new URL('../apps/web/src/layout/os/useOSWindowManager.js',import.meta.url),'utf8');
const shell=readFileSync(new URL('../apps/web/src/layout/AppShell.jsx',import.meta.url),'utf8');
test('closing child does not treat shared parent route as an independent navigation',()=>{
 assert.match(hook,/!target\.parentKey&&pathname===target\.path/);
 assert.match(hook,/target\.parentKey\?state\.windows\.find/);
 assert.match(hook,/next\?\.path\|\|parent\?\.path\|\|'\/'/);
});
test('tenant switch remounts the ephemeral Messenger provider',()=>{
 assert.match(shell,/<OSWindowStage key=\{windowScope\}/);
});
