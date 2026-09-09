import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const css=fs.readFileSync(path.join(root,'apps/web/src/design-system/components/Switch.module.css'),'utf8');
const globalCss=fs.readFileSync(path.join(root,'apps/web/src/design-system/styles/global-ui-v12.3.css'),'utf8');
const jsx=fs.readFileSync(path.join(root,'apps/web/src/design-system/components/Switch.jsx'),'utf8');
const checks=[
  ['Switch compartido usa 52px MD3 de ancho',/width:\s*52px/.test(css)],
  ['Switch compartido usa 32px MD3 de alto',/height:\s*32px/.test(css)],
  ['Thumb activo usa 24px MD3',/width:\s*24px[\s\S]*height:\s*24px/.test(css)],
  ['Recorrido del thumb es 20px MD3',/translate\(20px,\s*-50%\)/.test(css)],
  ['Mantiene role switch accesible',/role="switch"/.test(jsx)],
  ['Mantiene aria-checked',/aria-checked/.test(jsx)],
  ['Token global de ancho MD3',/--bb-switch-w:52px/.test(globalCss)],
  ['Token global de alto MD3',/--bb-switch-h:32px/.test(globalCss)],
  ['Fallback global role=switch',/button\[role="switch"\]/.test(globalCss)],
  ['Hover no cambia tamaño/posición',/button\[role="switch"\]:not\(:disabled\):hover\{transform:none!important;\}/.test(globalCss)],
];
let fail=0;
for(const [name,ok] of checks){ console.log(`${ok?'PASS':'FAIL'}  ${name}`); if(!ok) fail++; }
console.log(`\n${checks.length-fail} PASS / ${fail} FAIL`);
process.exitCode=fail?1:0;
