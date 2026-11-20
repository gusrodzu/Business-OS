import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../apps/web/src/modules/core/ui/pages/BusinessMessenger.jsx',import.meta.url),'utf8');
test('popout message state update has balanced array closing syntax',()=>{
 assert.doesNotMatch(source,/time:'Ahora'\}\]\]\}\)\)/);
 assert.match(source,/time:'Ahora'\}\]\}\)\)/);
});
