import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const web = path.join(root, 'apps/web');
const src = path.join(web, 'src');
let pass = 0, fail = 0;
const results = [];
function check(name, ok, detail='') { results.push({name,ok,detail}); ok ? pass++ : fail++; }
function walk(dir, out=[]) { for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const p=path.join(dir,e.name); e.isDirectory()?walk(p,out):out.push(p); } return out; }
const files = walk(src).filter(f=>/\.(js|jsx|ts|tsx)$/.test(f));
const text = f=>fs.readFileSync(f,'utf8');
const rel = f=>path.relative(root,f).replaceAll('\\','/');

const apiFile = path.join(src,'api.js');
const apiText = text(apiFile);
const capFile = path.join(src,'offlineCapabilities.js');
const offlineFile = path.join(src,'offlineDemo.js');
const caps = text(capFile);
const offline = text(offlineFile);

check('Mapa central OFFLINE_FEATURES existe', fs.existsSync(capFile) && /OFFLINE_FEATURES/.test(caps));
check('apiRequest desvía la sesión offline antes de axios', /activeSession\?\.offlineDemo\) return offlineDemoRequest/.test(apiText));
check('Axios directo queda bloqueado en sesión offline', /OFFLINE_NETWORK_BLOCKED/.test(apiText));

const directAxios = files.filter(f=>f!==apiFile && /from\s+['"]axios['"]|require\(['"]axios['"]\)/.test(text(f)));
check('Ningún componente importa axios directamente', directAxios.length===0, directAxios.map(rel).join(', '));
const rawFetch = files.filter(f=>!f.endsWith('service-worker.js') && /\bfetch\s*\(/.test(text(f)));
check('Ningún componente usa fetch() fuera del adaptador', rawFetch.length===0, rawFetch.map(rel).join(', '));
const sockets = files.filter(f=>/new\s+WebSocket\s*\(|new\s+EventSource\s*\(/.test(text(f)));
check('No existen WebSocket/EventSource que requieran backend', sockets.length===0, sockets.map(rel).join(', '));
const beacons = files.filter(f=>/navigator\.sendBeacon\s*\(/.test(text(f)));
check('No existen sendBeacon que filtren tráfico offline', beacons.length===0, beacons.map(rel).join(', '));

const pkg = JSON.parse(fs.readFileSync(path.join(web,'package.json'),'utf8'));
const deps = Object.keys(pkg.dependencies||{});
const serverOnly = deps.filter(d=>['express','@prisma/client','prisma','jsonwebtoken','bcryptjs','pino','multer','pg'].includes(d));
check('Bundle web no instala dependencias backend', serverOnly.length===0, serverOnly.join(', '));

const routeFiles = walk(path.join(src,'modules')).filter(f=>f.endsWith('routes.jsx'));
const platformRouteFile = routeFiles.find(f=>f.includes('/platform/'));
const erpRouteText = routeFiles.filter(f=>f!==platformRouteFile).map(text).join('\n');
const routeCount = [...erpRouteText.matchAll(/\{id:\s*['"]|\{id:\s/g)].length;
check('Registro ERP tiene rutas para demo offline', routeCount >= 40, `${routeCount} registros`);

const platformProtected = /!platformSession && adminTarget/.test(text(path.join(src,'auth/ProtectedRoute.jsx')));
check('Super Admin permanece fuera de la sesión ERP offline', platformProtected);

for (const key of ['backendApi','postgres','backgroundWorkers','platformAdmin','email','whatsapp','webSockets']) {
  check(`Capacidad bloqueada declarada: ${key}`, new RegExp(`${key}:\\s*\\{status:\\s*['"]blocked['"]`).test(caps));
}
for (const key of ['crudMutations','fileUploads','smartImport','artificialIntelligence','fiscalStamping','payments','billing','integrations']) {
  check(`Capacidad simulada declarada: ${key}`, new RegExp(`${key}:\\s*\\{status:\\s*['"]simulated['"]`).test(caps));
}

check('Adaptador offline maneja FormData sin usar red', /offlineDemoRequest/.test(offline) && !/\bfetch\s*\(|axios\./.test(offline));
const vercel = path.join(web,'vercel.json');
const vtext = fs.existsSync(vercel) ? text(vercel) : '';
check('Vercel conserva fallback SPA a index.html', /index\.html/.test(vtext) && /rewrites/.test(vtext));

console.log('\nBuzzBee Offline Dependencies v17.4.0\n');
for (const r of results) console.log(`${r.ok?'PASS':'FAIL'}  ${r.name}${r.detail?` — ${r.detail}`:''}`);
console.log(`\n${pass}/${pass+fail} PASS`);
process.exitCode = fail ? 1 : 0;
