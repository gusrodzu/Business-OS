import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const sales=path.join(root,'apps/web/src/modules/sales');
const required=['routes.jsx','index.js','services/salesApi.js','hooks/useSalesResource.js','domain/contracts.js'];
const failures=[];
for(const file of required){if(!fs.existsSync(path.join(sales,file))) failures.push(`missing ${file}`)}
const pages=path.join(sales,'ui/pages');
for(const file of fs.readdirSync(pages).filter(f=>f.endsWith('.jsx'))){
  const text=fs.readFileSync(path.join(pages,file),'utf8');
  if(text.includes("from '../../../../api'")) failures.push(`${file}: direct global api import`);
  const css=file.replace(/\.jsx$/,'.module.css');
  if(fs.existsSync(path.join(pages,css)) && !text.includes(`./${css}`)) failures.push(`${file}: CSS Module exists but is not imported`);
}
const legacy=['Sales.jsx','SalesEnterprise.jsx','SalesReturns.jsx','SalesFulfillment.jsx'];
for(const file of legacy){if(fs.existsSync(path.join(root,'apps/web/src/pages',file))) failures.push(`${file}: legacy duplicate still exists`)}
console.log('BuzzBee v21.2 Sales module architecture');
console.log(`Canonical JSX: ${fs.readdirSync(pages).filter(f=>f.endsWith('.jsx')).length}`);
console.log(`Checks: ${failures.length ? 'FAIL' : 'PASS'}`);
if(failures.length){for(const f of failures) console.error(' - '+f); process.exit(1)}
