import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PROFILES, SECTORS} from '../apps/api/src/modules/industries/catalog.js';
import {CAPABILITY_RULES,resolveIndustryRules} from '../apps/api/src/modules/industries/rules.js';
import {recommendBusinessModules} from '../apps/api/src/modules/industries/engine.js';

const slugs=PROFILES.map(p=>p.slug);
assert.equal(new Set(slugs).size,slugs.length,'Los giros no deben duplicarse');
const sectors=new Set(SECTORS.map(s=>s.code));
for(const p of PROFILES){
  assert.ok(sectors.has(p.sector),`Sector inválido: ${p.slug}`);
  assert.ok(p.required?.length,`Sin módulos base: ${p.slug}`);
  for(const capability of p.capabilities||[])
    assert.ok(CAPABILITY_RULES[capability],`Capacidad sin regla: ${p.slug}/${capability}`);
  const rules=resolveIndustryRules([p.slug]);
  assert.equal(rules.primaryActivity,p.slug);
  assert.equal(rules.autoEnabled,false,'No permitir activación implícita');
  assert.equal(rules.mode,'SUGGESTED');
  const modules=[...new Set([...(p.required||[]),...(p.optional||[])])].map(key=>({key}));
  const recommendation=recommendBusinessModules([p.slug],modules);
  assert.equal(recommendation.activationRequiresApproval,true);
  assert.equal(recommendation.state,'RECOMMENDATION_ONLY');
  assert.equal(recommendation.unavailableModules.length,0);
}
assert.throws(()=>resolveIndustryRules(['giro_inexistente']),/no reconocida/i);
assert.throws(()=>resolveIndustryRules([]));
assert.throws(()=>resolveIndustryRules(Array(31).fill('tienda')));
const dup=resolveIndustryRules(['refaccionaria','refaccionaria','taller_automotriz']);
assert.equal(dup.primaryActivity,'refaccionaria');
assert.deepEqual(dup.secondaryActivities,['taller_automotriz']);
const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
assert.equal(config.outputDirectory,'apps/web/dist');
assert.equal(config.buildCommand,'npm run build -w apps/web');
assert.equal(config.installCommand,'npm ci');
assert.ok(config.rewrites.some(r=>r.destination==='/index.html'&&r.source.includes('?!assets/')),'SPA fallback no debe interceptar assets');
const npmrc=readFileSync(new URL('../.npmrc',import.meta.url),'utf8');
const configLines=npmrc.split('\n').map(line=>line.trim());
assert.ok(configLines.includes('allow-remote=root'),'npm debe permitir únicamente dependencias remotas directas');
assert.ok(!configLines.includes('allow-remote=all'),'No permitir downloads remotos de cualquier dependencia');
const apiPackage=JSON.parse(readFileSync(new URL('../apps/api/package.json',import.meta.url),'utf8'));
assert.equal(apiPackage.dependencies.xlsx,'https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz','Verifica procedencia del tarball SheetJS');
const fs=await import('node:fs');
for(const file of ['Sales.jsx','SalesEnterprise.jsx','SalesReturns.jsx','SalesFulfillment.jsx']){
  assert.equal(fs.existsSync(new URL(`../apps/web/src/pages/${file}`,import.meta.url)),false,`${file}: duplicado legacy`);
  assert.equal(fs.existsSync(new URL(`../apps/web/src/modules/sales/ui/pages/${file}`,import.meta.url)),true,`${file}: falta el componente canónico`);
}
const companyApi=readFileSync(new URL('../apps/api/src/modules/core/api/company.js',import.meta.url),'utf8');
assert.ok(companyApi.includes('prisma.branch.updateMany({where: {id: existing.id, companyId: request.auth.companyId}'),'Actualización de sucursal debe aplicar tenant scope');
assert.ok(companyApi.includes('prisma.branch.deleteMany({where: {id: branch.id, companyId: request.auth.companyId}'),'Eliminación de sucursal debe aplicar tenant scope');
console.log(`PASS: ${PROFILES.length} giros, reglas, aprobación explícita y configuración Vercel, npm y sucursales multitenant`);
