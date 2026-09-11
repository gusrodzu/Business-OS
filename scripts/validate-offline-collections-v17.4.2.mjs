import fs from 'node:fs';
const page=fs.readFileSync('apps/web/src/modules/sales/ui/pages/Collections.jsx','utf8');
const offline=fs.readFileSync('apps/web/src/offlineDemo.js','utf8');
const checks=[
 ['route fixture has collections', offline.includes("'/collections': {")],
 ['fixture has customers', /'\/collections':[\s\S]*?customers,/.test(offline)],
 ['fixture has receivables', /'\/collections':[\s\S]*?receivables:/.test(offline)],
 ['fixture has accounts', /'\/collections':[\s\S]*?accounts:/.test(offline)],
 ['payments have applications', /applications:\[/.test(offline)],
 ['payments have treasuryAccount', /treasuryAccount:/.test(offline)],
 ['page guards customer actor', page.includes("item?.customer?.commercialName")],
 ['page guards treasury account', page.includes("item?.treasuryAccount?.name")],
 ['page guards applications reduce', page.includes("Array.isArray(item?.applications)")],
 ['offline POST collection payment persisted', offline.includes("normalized === '/collections/payments' && method === 'POST'")],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok) pass++;}
console.log(`\nOffline Collections v17.4.2: ${pass}/${checks.length} PASS`);
if(pass!==checks.length) process.exit(1);
