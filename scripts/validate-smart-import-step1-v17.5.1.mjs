import fs from 'node:fs';
const jsx=fs.readFileSync('apps/web/src/modules/operations/ui/pages/DataHub.jsx','utf8');
const css=fs.readFileSync('apps/web/src/modules/operations/ui/pages/DataHub.module.css','utf8');
const checks=[
  ['grid de origen/estrategia',jsx.includes('sourceStrategyGrid')&&css.includes('.sourceStrategyGrid')],
  ['select shell con iconos',jsx.includes('selectShell')&&jsx.includes('<FileSpreadsheet')&&jsx.includes('<Rows3')],
  ['dropzone ampliado',jsx.includes('dropHint')&&css.includes('min-height:260px')],
  ['hint drag and drop',jsx.includes('Arrastra y suelta un archivo aquí')],
  ['acción analizar separada',jsx.includes('analyzeAction')&&css.includes('.analyzeAction')],
  ['callout estrategia',jsx.includes('modeInfoIcon')&&css.includes('.modeInfoIcon')],
  ['responsive tablet',css.includes('@media(max-width:1180px)')],
  ['responsive móvil',css.includes('@media(max-width:820px)')],
];
let pass=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} · ${name}`);if(ok)pass++;}
console.log(`\nSmart Import Step 1: ${pass}/${checks.length} PASS`);
if(pass!==checks.length) process.exit(1);
