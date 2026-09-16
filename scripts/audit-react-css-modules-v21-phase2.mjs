import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const checks=[
 ['PageHeader React',read('apps/web/src/design-system/components/PageHeader.jsx').includes('data-bb-page-header')],
 ['PageHeader CSS Module',fs.existsSync('apps/web/src/design-system/components/PageHeader.module.css')],
 ['Home consumes PageHeader',read('apps/web/src/modules/core/ui/pages/Dashboard.jsx').includes('<PageHeader')],
 ['AppShell scoped',read('apps/web/src/layout/AppShell.jsx').includes("./AppShell.module.css")],
 ['Sidebar scoped',read('apps/web/src/layout/Sidebar.jsx').includes("./Sidebar.module.css")],
 ['Topbar scoped',read('apps/web/src/layout/Topbar.jsx').includes("./Topbar.module.css")],
 ['No global CSS imported by Home',!read('apps/web/src/modules/core/ui/pages/Dashboard.jsx').match(/import\s+['\"][^'\"]+\.css['\"]/)],
 ['No global CSS imported by shell',!read('apps/web/src/layout/AppShell.jsx').match(/import\s+['\"][^'\"]+\.css['\"]/)],
];
let fail=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(!ok)fail++;}
console.log(`Phase 2: ${checks.length-fail}/${checks.length} PASS`); if(fail)process.exit(1);
