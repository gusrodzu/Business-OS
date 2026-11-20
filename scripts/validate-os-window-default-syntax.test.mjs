import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../apps/web/src/layout/os/windowManagerState.js',import.meta.url),'utf8');
test('window defaults contain valid line breaks, not literal escape sequences',()=>{
 assert.doesNotMatch(source,/reference\.\\n/);
 assert.doesNotMatch(source,/optional\.\\n/);
});
