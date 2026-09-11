import fs from 'node:fs';
const src=fs.readFileSync('apps/web/src/offlineDemo.js','utf8');
const api=fs.readFileSync('apps/web/src/api.js','utf8');
const checks=[
 ['Empresa MotorNorte',src.includes('MotorNorte Refacciones Automotrices')],
 ['Catálogo automotriz',src.includes('Batería AGM L42')&&src.includes('balatas cerámicas')&&src.includes('Amortiguador gas')],
 ['Empleados demo',src.includes('Mariana')&&src.includes('Carlos')&&src.includes('Diana')],
 ['Clientes automotrices',src.includes('Taller El Pistón')&&src.includes('Flotillas Norte')],
 ['Proveedores automotrices',src.includes('LTH Noreste')&&src.includes('Fricomex')],
 ['POS con ventas demo',src.includes('POS-006842')&&src.includes('posSales')],
 ['Inventario multialmacén',src.includes('Almacén Monterrey Centro')&&src.includes('Almacén Guadalupe')],
 ['Compras automotrices',src.includes('SOL-REF-2026')&&src.includes('OC-REF-2026')],
 ['Ventas/cobranza demo',src.includes('FAC-MN-10844')&&src.includes("'/collections'" )],
 ['Marketing automotriz',src.includes('Mes del Frenado Seguro')],
 ['Proyecto de expansión',src.includes('Apertura sucursal San Luis Potosí')],
 ['Fallback universal offline',src.includes('return normalizeOfflineShape(path, universalDemoContext());')],
 ['API enruta sesión offline',api.includes("if (activeSession?.offlineDemo) return offlineDemoRequest(path, options);")],
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} · ${n}`); if(ok)pass++;}
console.log(`\nOffline Auto Parts Demo: ${pass}/${checks.length} PASS`); process.exit(pass===checks.length?0:1);
