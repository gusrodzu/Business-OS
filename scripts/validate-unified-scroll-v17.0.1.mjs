import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
const checks = [];
const check = (name, ok) => checks.push([name, Boolean(ok)]);

const shellJsx = read('apps/web/src/layout/AppShell.jsx');
const shellCss = read('apps/web/src/layout/AppShell.module.css');
const workspace = read('apps/web/src/design-system/styles/workspace.css');
const table = read('apps/web/src/design-system/components/DataTable.module.css');
const sales = read('apps/web/src/modules/sales/ui/pages/SalesEnterprise.module.css');

check('Workspace main declared as canonical scroll owner', shellJsx.includes('data-scroll-owner="workspace"'));
check('Shell owns vertical scrolling', shellCss.includes('overflow-y:auto'));
check('Shell blocks horizontal page scrolling', shellCss.includes('overflow-x:hidden'));
check('Module page roots cannot create vertical viewport', workspace.includes('overflow:visible!important'));
check('Module page roots cannot impose max-height', workspace.includes('max-height:none!important'));
check('Table wrappers restricted to horizontal scrolling', workspace.includes('[class*="_tableWrap_"]') && workspace.includes('overflow-y:hidden'));
check('Canonical DataTable is horizontal-only', table.includes('overflow-x:auto') && table.includes('overflow-y:hidden'));
check('Sales table no longer uses overflow:auto', !sales.includes('.tableWrap{overflow:auto}'));
check('Scrollbar styling belongs to AppShell', shellCss.includes('.content::-webkit-scrollbar'));
check('No second root page scroll declaration added', !workspace.includes('[class*="_page_"]{overflow-y:auto'));

let passed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`); if(ok) passed++;}
console.log(`\nUnified Scroll Layout v17.0.1: ${passed}/${checks.length} PASS`);
if(passed!==checks.length) process.exit(1);
