import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>readFileSync(path.join(root,p),'utf8');
const foundation=read('apps/web/src/design-system/styles/foundation.css');
const ui=read('apps/web/src/design-system/styles/enterprise-ui-v26.css');
const docs=read('docs/design/business-os-enterprise-ui-v26.md');
const registry=read('apps/web/src/modules/registry.jsx');
const componentRoot='apps/web/src/design-system/components/';
const groups=['core','sales','inventory','procurement','finance','pos','crm','projects','production','hr','intelligence','operations','settings'];

const requiredTokens=[
'--bb26-brand-charcoal','--bb26-brand-lime','--bb26-action',
'--bb26-on-action','--bb26-focus','--bb26-radius-control',
'--bb26-radius-card','--bb26-control-height','--bb26-row-height'
];
for(const token of requiredTokens) assert.ok(ui.includes(token+':'),`Falta token enterprise ${token}`);
assert.match(ui,/:root\[data-theme='dark'\]/,'Dark mode token equivalents required');
assert.match(ui, /prefers-reduced-motion:reduce/,'Respect reduced motion');
assert.match(ui, /max-width:760px/,'Smartphone design density must be defined');
assert.ok(foundation.trimEnd().endsWith("@import './enterprise-ui-v26.css';"),'Enterprise UI must be last foundation layer');
for(const [file,patterns]of Object.entries({
  'Button.module.css':['--bb26-action','--bb26-on-action','--bb26-radius-control','--bb26-control-height'],
  'Card.module.css':['--bb26-radius-card','--bb26-shadow-card'],
  'Input.module.css':['--bb26-control-height','--bb26-focus'],
  'Select.module.css':['--bb26-control-height','--bb26-focus'],
  'DataTable.module.css':['--bb26-radius-card','--bb26-row-height'],
})){
  const css=read(componentRoot+file);
  for(const pattern of patterns) assert.ok(css.includes(pattern),`Falta ${pattern} en ${file}`);
}
assert.ok(read(componentRoot+'Badge.module.css').includes('font-size:.75rem'), 'Badge readability baseline missing');
assert.ok(read('apps/web/src/components/KpiCard.module.css').includes('--bb26-radius-card'),'KPI radius not standardized');
for(const key of groups){
  const name=key+'Routes';
  assert.ok(registry.includes(name),`La familia ${key} no está en registry.jsx`);
  assert.ok(existsSync(path.join(root,`apps/web/src/modules/${key}/routes.jsx`)),`Falta archivo de rutas ${key}`);
}
assert.match(docs,/Definición de terminado por módulo/);
assert.ok(docs.includes('MotorNorte'),'Offline regression must remain a design gate');
// Shared-control semantics: dynamic field errors and loading must be exposed to assistive tech.
for (const component of ['Input','Select']) {
  const source=read(componentRoot+component+'.jsx');
  for (const marker of ['useId','aria-invalid','aria-describedby','role="alert"']) {
    assert.ok(source.includes(marker),component+' missing accessibility marker '+marker);
  }
}
assert.ok(read(componentRoot+'Button.jsx').includes('aria-busy'),
  'Shared Button must announce asynchronous loading');

console.log(`PASS Business OS Enterprise UI v26: ${groups.length} module families, 9 design tokens, 7 shared primitives, mobile and dark coverage`);
console.log('NOTE: Static coverage is not a visual certification. Per-screen QA remains necessary.');
