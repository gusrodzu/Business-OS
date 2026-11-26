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

const shell=read('apps/web/src/layout/AppShell.jsx');
const dock=read('apps/web/src/layout/os/OSDock.module.css');
assert.ok(shell.includes('data-passport-mode={passportMode'));
assert.ok(shell.includes('(min-aspect-ratio: 2/3)') && shell.includes('(pointer: coarse)'));
assert.ok(dock.includes("[data-passport-mode='true']") && dock.includes('min-height: 44px'));
assert.ok(css.includes('horizontal-viewport-segments: 3') && css.includes("data-fold-pane='middle'"));
assert.ok(contract.includes('440×660') && contract.includes('540×540') && contract.includes('820×620'));
console.log('PASS: passport profile static contract; real-device QA pending');
