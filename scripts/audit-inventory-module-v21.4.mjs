import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const mod=path.join(root,'apps/web/src/modules/inventory');
const required=['routes.jsx','index.js','services/inventoryApi.js','hooks/useInventoryResource.js','domain/contracts.js'];
const failures=[];
for(const file of required) if(!fs.existsSync(path.join(mod,file))) failures.push(`missing ${file}`);
const pages=path.join(mod,'ui/pages');
const jsx=fs.readdirSync(pages).filter(f=>f.endsWith('.jsx'));
for(const file of jsx){
 const text=fs.readFileSync(path.join(pages,file),'utf8');
 if(text.includes("from '../../../../api'")) failures.push(`${file}: direct global api import`);
 if(text.includes('apiRequest(') && !text.includes("inventoryRequest as apiRequest")) failures.push(`${file}: API use bypasses inventory boundary`);
 if(!/from ['"]\.\/[^'"]+\.module\.css['"]/.test(text)) failures.push(`${file}: no CSS Module imported`);
}
const routes=fs.readFileSync(path.join(mod,'routes.jsx'),'utf8');
for(const route of ['inventario/productos','inventario/existencias','inventario/movimientos','inventario/operaciones','almacenes']) if(!routes.includes(`path: '${route}'`)) failures.push(`missing route ${route}`);
console.log('BuzzBee v21.4 Inventory module architecture');
console.log(`Canonical JSX: ${jsx.length}`);
console.log(`Checks: ${failures.length ? 'FAIL' : 'PASS'}`);
if(failures.length){for(const f of failures) console.error(' - '+f); process.exit(1)}
