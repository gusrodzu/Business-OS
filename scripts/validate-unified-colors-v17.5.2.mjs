import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const color=read('apps/web/src/design-system/tokens/color.css');
const unified=read('apps/web/src/design-system/styles/unified-ui.css');
const light=read('apps/web/src/design-system/theme/light.css');
const tests=[
 ['primary #2F6BFF', color.includes('--md-sys-color-primary: #2F6BFF')],
 ['primary soft #EAF2FF', color.includes('#EAF2FF')],
 ['page #F5F7FC', light.includes('#F5F7FC')],
 ['surface #FFFFFF', light.includes('#FFFFFF')],
 ['text #0F172A', light.includes('#0F172A')],
 ['secondary #667085', light.includes('#667085')],
 ['border #D9E2F2', light.includes('#D9E2F2')],
 ['focus uses primary', unified.includes('var(--bb-ui-primary) 14%')],
 ['tables use unified neutral header', unified.includes('background:#F1F4F9!important')],
 ['semantic success remains', color.includes('--bb-color-success: #22C55E')],
 ['semantic warning remains', color.includes('--bb-color-warning: #F4B740')],
 ['semantic danger remains', color.includes('--bb-color-danger: #EF4444')],
 ['legacy purple alias retired', color.includes('--bb-brand-purple: #2F6BFF')],
];
let pass=0;
for (const [name,ok] of tests){ console.log(`${ok?'PASS':'FAIL'} · ${name}`); if(ok)pass++; }
console.log(`\nUnified colors v17.5.2: ${pass}/${tests.length} PASS`);
process.exit(pass===tests.length?0:1);
