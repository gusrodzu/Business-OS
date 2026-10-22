import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');
const main = read('apps/web/src/main.jsx');
const foundation = read('apps/web/src/design-system/styles/foundation.css');
const css = read('apps/web/src/design-system/styles/buzzbee-visual-v23.css');

const checks = [
  ['global foundation imported', main.includes("import './design-system/styles/foundation.css'")],
  ['current visual stylesheet imported once via foundation', foundation.includes("@import './buzzbee-visual-v23.css';") && !main.includes('buzzbee-visual-v23.css')],
  ['workspace page surface', css.includes('--bb23-canvas')],
  ['unified cards', css.includes('Card_card')],
  ['compact KPI pattern', css.includes('KpiCard_card')],
  ['40px controls', css.includes('--bb23-control:40px')],
  ['ERP table normalization', css.includes('DataTable_frame')],
  ['semantic badges', css.includes('Badge_badge')],
  ['sidebar defined through CSS Modules', fs.existsSync(new URL('apps/web/src/layout/Sidebar.module.css', root))],
  ['dialog/drawer hierarchy', css.includes('[role="dialog"]')],
  ['dark hierarchy', css.includes('[data-theme="dark"]')],
  ['responsive', css.includes('@media(max-width:640px)')],
  ['reduced motion', css.includes('prefers-reduced-motion')],
];
let fail = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} · ${name}`);
  if (!ok) fail++;
}
console.log(`\nBuzzBee Visual v23: ${checks.length - fail} PASS / ${fail} FAIL`);
process.exitCode = fail ? 1 : 0;
