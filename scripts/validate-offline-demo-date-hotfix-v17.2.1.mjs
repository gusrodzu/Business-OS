import fs from 'node:fs';
const fixture = fs.readFileSync('apps/web/src/offlineDemo.js','utf8');
const dashboard = fs.readFileSync('apps/web/src/modules/core/ui/pages/Dashboard.jsx','utf8');
const checks = [
  ['fixture uses numeric year/month', /year:2026,month:4/.test(fixture)],
  ['fixture has stable month keys', /key:'2026-04'/.test(fixture)],
  ['dashboard has safeDate guard', /Number\.isNaN\(date\.getTime\(\)\)/.test(dashboard)],
  ['dashboard normalizes purchase month', /purchaseMonthDate/.test(dashboard)],
  ['old unsafe Date.UTC inline removed', !/shortMonth\(new Date\(Date\.UTC\(item\.year, item\.month - 1, 1\)\)\)/.test(dashboard)],
  ['offline dashboard includes criticalProducts', /criticalProducts:\[/.test(fixture)],
  ['offline dashboard includes agenda', /agenda:\[\{id:'u1'/.test(fixture)],
  ['offline dashboard includes categorySpend', /categorySpend:\[/.test(fixture)],
];
let pass=0;
for (const [label,ok] of checks){ console.log(`${ok?'PASS':'FAIL'}  ${label}`); if(ok) pass++; }
console.log(`\nOffline Demo Date Hotfix: ${pass}/${checks.length} PASS`);
if(pass!==checks.length) process.exit(1);
