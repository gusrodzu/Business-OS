import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const css=read('apps/web/src/design-system/styles/foldable-adaptive.css');
const foundation=read('apps/web/src/design-system/styles/foundation.css');
const contract=read('docs/ui-ux/FOLDABLE_ADAPTIVE_CONTRACT.md');
assert.equal(foundation.split("@import './foldable-adaptive.css';").length-1,1);
assert.ok(foundation.indexOf('workspace-hybrid-global.css')<foundation.indexOf('foldable-adaptive.css'));
for (const token of ['container-type: inline-size','@container (max-width: 359px)','@container (min-width: 360px)','@media (pointer: coarse)','horizontal-viewport-segments: 2','viewport-segment-width','data-fold-spanning','safe-area-inset']) {
  assert.ok(css.includes(token),'Missing foldable rule: '+token);
}
assert.ok(contract.includes('QA') && contract.includes('bisagra') && contract.includes('iPhone'));
console.log('PASS: foldable adaptive foundation static contract');
console.log('PENDING: browser, interactive route, actual hinge and physical-device QA');
