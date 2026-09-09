import fs from 'node:fs';
const jsx=fs.readFileSync('apps/web/src/framework/BuzzBeeRightRail.jsx','utf8');
const css=fs.readFileSync('apps/web/src/framework/BuzzBeeRightRail.module.css','utf8');
const checks=[
 ['Agenda debajo de aplicaciones',jsx.indexOf('agendaCard')>jsx.indexOf('appsCard')],
 ['Nueva tarea',jsx.includes('Nueva tarea')],
 ['Semana de 7 días',jsx.includes('Array.from({length:7}')],
 ['Persistencia local',jsx.includes('buzzbee.personalAgenda.v1')&&jsx.includes('localStorage')],
 ['Dashboard agenda',jsx.includes("apiRequest('/dashboard')")&&jsx.includes('response.agenda')],
 ['Modal estándar',jsx.includes('<RecordModal')],
 ['Estado completado',jsx.includes('toggleTask')&&jsx.includes('agendaDone')],
 ['CSS agenda card',css.includes('.agendaCard')],
 ['CSS week strip',css.includes('.weekStrip')],
 ['CSS timeline',css.includes('.agendaTimeline')]
];
let fails=0;
console.log('BuzzBee Agenda Right Rail QA — v13.0.2 RC1.2');
console.log('=============================================');
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`);if(!ok)fails++}
console.log(`\n${checks.length-fails} PASS / ${fails} FAIL`);
process.exitCode=fails?1:0;
