import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`, import.meta.url),'utf8');
const api=read('apps/api/prisma/seed-demo-company-v8.js');
const offline=read('apps/web/src/offlineDemo.js');
const shell=read('apps/web/src/layout/AppShell.jsx');
const checks=[
 ['LIVE company MotorNorte',api.includes("name:'MotorNorte Refacciones'")],
 ['LIVE RFC unified',api.includes("const taxId='MRA160812MN1'")],
 ['Demo Administrator role',api.includes("name:'Demo Administrator'")],
 ['Platform permissions excluded',api.includes("startsWith:'platform.'")],
 ['Automotive catalog',api.includes('Balatas cerámicas delanteras') && api.includes('Amortiguador de gas delantero')],
 ['Automotive suppliers',api.includes('Frenos del Norte SA de CV')],
 ['Automotive customers',api.includes('Taller Mecánico Garza SA de CV')],
 ['Offline identity Demo BuzzBee',offline.includes("fullName: 'Demo BuzzBee'")],
 ['Offline role Demo Administrator',offline.includes("name: 'Demo Administrator'")],
 ['Offline company MotorNorte',offline.includes("name: 'MotorNorte Refacciones'")],
 ['LIVE banner MotorNorte',shell.includes('MotorNorte Refacciones · entorno aislado')],
];
let fail=0; for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`); if(!ok) fail++;}
console.log(`\nDemo Company Unified v20.3.1: ${checks.length-fail} PASS / ${fail} FAIL`); process.exitCode=fail?1:0;
