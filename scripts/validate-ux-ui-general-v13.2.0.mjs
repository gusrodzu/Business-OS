import fs from 'node:fs';
import path from 'node:path';

const root='apps/web/src';
const checks=[];
const read=p=>fs.readFileSync(p,'utf8');
const check=(name,ok,detail='')=>{checks.push([name,!!ok,detail]);console.log(`${ok?'PASS':'FAIL'}  ${name}${detail?` · ${detail}`:''}`)};
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(jsx|js|css)$/.test(e.name))files.push(p)}}
walk(root);
const allJs=files.filter(f=>/\.(jsx|js)$/.test(f)).map(f=>read(f)).join('\n');
const main=read('apps/web/src/main.jsx');
const css=read('apps/web/src/design-system/styles/global-ui-v13.2.css');
const buttonCss=read('apps/web/src/design-system/components/Button.module.css');
const input=read('apps/web/src/design-system/components/Input.jsx');
const sw=read('apps/web/src/design-system/components/Switch.jsx');
const swCss=read('apps/web/src/design-system/components/Switch.module.css');
const lang=read('apps/web/src/design-system/i18n/uiLanguage.js');

check('Capa UX/UI v13.2 cargada globalmente',main.includes('global-ui-v13.2.css'));
check('Botón mediano estandarizado a 38px',buttonCss.includes('min-height: 38px'));
check('Switch estandarizado 40×22',swCss.includes('width: 40px')&&swCss.includes('height: 22px'));
check('Switch accesible y deshabilitable',sw.includes('aria-label=')&&sw.includes('disabled={disabled}'));
check('Input expone errores a tecnologías de asistencia',input.includes('aria-invalid=')&&input.includes('role="alert"'));
check('Tablas con encabezado sticky y overflow controlado',css.includes('position:sticky')&&css.includes('scrollbar-gutter:stable'));
check('Botones nativos y DS comparten geometría',css.includes('button:not([role="switch"]')&&css.includes('--bb-control-h:38px'));
check('Empty/loading/error comparten patrón',css.includes('[class*="_empty_"]')&&css.includes('[class*="_loading_"]')&&css.includes('[class*="_error_"]'));
check('Modales centrados y scroll acotado',css.includes('max-height:min(88vh,920px)')&&css.includes('[class*="_modalFooter_"]'));
check('Responsive móvil cubierto',css.includes('@media(max-width:700px)')&&css.includes('@media(max-width:430px)'));
check('Reduced motion cubierto',css.includes('prefers-reduced-motion:reduce'));
check('Diccionario es-MX ampliado',lang.includes("CUSTOMER:'Cliente'")&&lang.includes("OPPORTUNITY:'Oportunidad'")&&lang.includes("SYNCED:'Sincronizado'"));

const forbidden=[
 'Customer Relationship Management','Order-to-Cash','Shop floor','Costing','Timesheet',
 'Project Management','Sales App','eyebrow="Spend"','eyebrow="Forecast"','Company override','Analytics & Forecast'
];
const hits=forbidden.filter(x=>allJs.includes(x));
check('Sin copy crítico en inglés',hits.length===0,hits.length?hits.join(', '):'es-MX');

const jsx=files.filter(f=>f.endsWith('.jsx'));
let rawButtons=0,tables=0,modalFiles=0,switchFiles=0;
for(const f of jsx){const s=read(f);rawButtons+=(s.match(/<button\b/g)||[]).length;tables+=(s.match(/<table\b/g)||[]).length;if(/modal|overlay/i.test(s))modalFiles++;if(/role="switch"|<Switch\b/.test(s))switchFiles++;}
console.log('\nInventario UI:');
console.log(`- ${rawButtons} botones nativos cubiertos por la capa global`);
console.log(`- ${tables} tablas cubiertas por densidad/overflow común`);
console.log(`- ${modalFiles} archivos con superficies modal/overlay`);
console.log(`- ${switchFiles} archivos con switches`);

const failed=checks.filter(c=>!c[1]);
console.log(`\nUX/UI General Audit v13.2.0: ${checks.length-failed.length} PASS / ${failed.length} FAIL`);
process.exit(failed.length?1:0);
