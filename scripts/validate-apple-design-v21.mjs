import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=(p)=>fs.readFileSync(new URL(p,root),'utf8');
const css=read('apps/web/src/design-system/styles/apple-design-v21.css');
const main=read('apps/web/src/main.jsx');
const checks=[
 ['global layer imported',main.includes("apple-design-v21.css")],
 ['pointer-down feedback',css.includes(':active')&&css.includes('--bb-apple-press-scale')],
 ['fluid response token',css.includes('--bb-apple-response')],
 ['translucent materials',css.includes('backdrop-filter:blur(24px)')],
 ['floating depth',css.includes('--bb-apple-shadow-float')],
 ['optical typography',css.includes('font-optical-sizing:auto')],
 ['size-specific tracking',css.includes('letter-spacing:-.03em')],
 ['workspace overscroll',css.includes('overscroll-behavior:contain')],
 ['reduced motion',css.includes('prefers-reduced-motion:reduce')],
 ['reduced transparency',css.includes('prefers-reduced-transparency:reduce')],
 ['increased contrast',css.includes('prefers-contrast:more')],
 ['dark depth',css.includes('[data-theme="dark"]')],
 ['keyboard focus',css.includes(':focus-visible')],
 ['table feedback',css.includes('tbody tr:hover')],
 ['mobile targets',css.includes('min-height:40px')],
];
let fail=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} Apple Design · ${name}`);if(!ok)fail++;}
console.log(`\nApple Design v21: ${checks.length-fail} PASS / ${fail} FAIL`); process.exitCode=fail?1:0;
