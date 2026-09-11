import fs from 'node:fs';
const jsx=fs.readFileSync('apps/web/src/modules/pos/ui/pages/Pos.jsx','utf8');
const css=fs.readFileSync('apps/web/src/modules/pos/ui/pages/Pos.module.css','utf8');
const unified=fs.readFileSync('apps/web/src/design-system/styles/unified-ui.css','utf8');
const checks=[
 ['category cards opt out of pill', jsx.includes('data-ui-surface="card"')],
 ['global buttons exclude surfaces', unified.includes('button:not([data-ui-surface])')],
 ['product card rectangular', css.includes('border-radius:14px!important')],
 ['ticket has no viewport max height', css.includes('max-height:none;min-height:640px')],
 ['desktop grid tuned', css.includes('@media(min-width:1181px) and (max-width:1440px)')],
 ['payment controls 40px', css.includes('min-height:40px!important')],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} · ${name}`); if(ok) pass++;}
console.log(`\n${pass}/${checks.length} PASS`); process.exit(pass===checks.length?0:1);
