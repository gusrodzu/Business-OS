import fs from "node:fs";
const jsx=fs.readFileSync("apps/web/src/modules/pos/ui/pages/Pos.jsx","utf8");
const css=fs.readFileSync("apps/web/src/modules/pos/ui/pages/Pos.module.css","utf8");
const checks=[
 ["toolbar marker",jsx.includes('data-ui-pos-toolbar="true"')],
 ["category chevron down",jsx.includes("<ChevronDown")],
 ["search aria",jsx.includes('aria-label="Buscar productos"')],
 ["clear search",jsx.includes("clearSearch")&&jsx.includes("setProductQuery('')")],
 ["44px controls",css.includes("height:44px")],
 ["single focus ring",css.includes("box-shadow:none!important")&&css.includes("rgba(47,107,255,.12)")],
 ["search input reset",css.includes("border:0!important")&&css.includes("background:transparent!important")],
 ["unified colors",css.includes("#2F6BFF")&&css.includes("#C9DBFF")],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} · ${name}`); if(ok)pass++;}
console.log(`\nPOS Catalog Toolbar: ${pass}/${checks.length} PASS`);
if(pass!==checks.length)process.exit(1);
