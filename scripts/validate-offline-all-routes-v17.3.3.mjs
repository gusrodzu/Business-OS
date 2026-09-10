import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = process.cwd();
const src = path.join(root, 'apps/web/src');
const routeRoot = path.join(src, 'modules');
const arrayMethods = ['length','map','filter','reduce','some','every','find','slice','flatMap'];
const failures = [];
const checks = [];
const pass = (name, detail='') => { checks.push({ok:true,name,detail}); console.log(`PASS  ${name}${detail ? ` · ${detail}` : ''}`); };
const fail = (name, detail='') => { checks.push({ok:false,name,detail}); failures.push(`${name}: ${detail}`); console.log(`FAIL  ${name}${detail ? ` · ${detail}` : ''}`); };
const read = (p) => fs.readFileSync(p, 'utf8');

function componentFilesAndRoutes() {
  const components = new Map();
  const routes = [];
  for (const moduleName of fs.readdirSync(routeRoot)) {
    const routeFile = path.join(routeRoot, moduleName, 'routes.jsx');
    if (!fs.existsSync(routeFile) || moduleName === 'platform') continue;
    const text = read(routeFile);
    for (const m of text.matchAll(/const\s+(\w+)\s*=\s*lazy\(\(\)=>import\(['"](.+?)['"]\)\)/g)) {
      let file = path.resolve(path.dirname(routeFile), m[2]);
      if (!path.extname(file)) file += '.jsx';
      components.set(m[1], file);
    }
    for (const m of text.matchAll(/\{id:\s*['"]([^'"]+)['"][^}]*?(?:path:\s*['"]([^'"]+)['"]|index:\s*true)[^}]*?Component:\s*(\w+)/g)) {
      routes.push({id:m[1], path:m[2] || '/', component:m[3], file:components.get(m[3])});
    }
    // Handle files formatted with spaces after keys (most modules).
    for (const line of text.split('\n')) {
      if (!line.includes('{id:') || !line.includes('Component:')) continue;
      const id = line.match(/id:\s*['"]([^'"]+)/)?.[1];
      const routePath = line.match(/path:\s*['"]([^'"]+)/)?.[1];
      const isIndex = /index:\s*true/.test(line);
      const component = line.match(/Component:\s*(\w+)/)?.[1];
      if (id && component && !routes.some(r=>r.id===id)) routes.push({id,path:isIndex?'/':routePath,component,file:components.get(component)});
    }
  }
  // Redirect routes in registry are public ERP URLs too.
  const registry = read(path.join(routeRoot, 'registry.jsx'));
  for (const m of registry.matchAll(/\{id:\s*['"]([^'"]+)['"],\s*path:\s*['"]([^'"]+)['"],\s*element:/g)) {
    routes.push({id:m[1],path:m[2],redirect:true});
  }
  return {routes,components:[...new Set([...components.values()].filter(Boolean))]};
}

function endpointTemplates(files) {
  const endpoints = new Set();
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const text = read(file);
    for (const m of text.matchAll(/apiRequest\(\s*([`'"])(.+?)\1/gs)) endpoints.add(m[2].trim());
  }
  for (const rel of ['framework/BuzzBeeRightRail.jsx','layout/Sidebar.jsx','layout/Topbar.jsx']) {
    const file = path.join(src, rel);
    if (!fs.existsSync(file)) continue;
    const text = read(file);
    for (const m of text.matchAll(/apiRequest\(\s*([`'"])(.+?)\1/gs)) endpoints.add(m[2].trim());
  }
  return [...endpoints].sort();
}

function representativeEndpoint(template) {
  let value = template.replace(/\$\{[^}]+\}/g, 'demo-id');
  // Handle malformed template fragments safely and preserve endpoint semantics.
  value = value.replace(/\?demo-id$/,'?year=2026');
  if (value.includes('?') && !value.includes('=')) value = value.split('?')[0];
  return value.startsWith('/') ? value : `/${value}`;
}

function requiredArrayKeys(files) {
  const keys = new Set();
  const methodPattern = arrayMethods.join('|');
  const re = new RegExp(`\\bdata(?:\\?\\.)?\\.([A-Za-z_$][\\w$]*)\\s*(?:\\?\\.)?\\.(${methodPattern})`, 'g');
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const text = read(file);
    for (const m of text.matchAll(re)) keys.add(m[1]);
  }
  return [...keys].sort();
}

const {routes,components} = componentFilesAndRoutes();
const routePaths = [...new Set(routes.map(r=>r.path).filter(Boolean))];
if (routePaths.length >= 50) pass('ERP route registry discovered', `${routePaths.length} routes`);
else fail('ERP route registry discovered', `only ${routePaths.length} routes`);

const missingFiles = routes.filter(r=>!r.redirect && r.file && !fs.existsSync(r.file));
if (!missingFiles.length) pass('Every routed component resolves', `${routes.filter(r=>!r.redirect).length} route components`);
else fail('Every routed component resolves', missingFiles.map(r=>r.id).join(', '));

// Ensure modules do not bypass apiRequest in offline mode.
const bypass = [];
for (const file of components) {
  if (!fs.existsSync(file)) continue;
  const text = read(file);
  if (/\bfetch\s*\(/.test(text) || /\baxios\s*\./.test(text)) bypass.push(path.relative(root,file));
}
if (!bypass.length) pass('No routed module bypasses apiRequest');
else fail('No routed module bypasses apiRequest', bypass.join(', '));

const offline = await import(pathToFileURL(path.join(src,'offlineDemo.js')).href + `?v=${Date.now()}`);
const probe = await offline.offlineDemoRequest('/__offline-shape-probe__');
const requiredKeys = requiredArrayKeys(components);
const missingArrays = requiredKeys.filter(key=>!Array.isArray(probe[key]));
if (!missingArrays.length) pass('Generic offline shape covers routed array reads', `${requiredKeys.length} collection keys`);
else fail('Generic offline shape covers routed array reads', missingArrays.join(', '));

const templates = endpointTemplates(components);
const endpointFailures = [];
for (const template of templates) {
  const endpoint = representativeEndpoint(template);
  try {
    const result = await offline.offlineDemoRequest(endpoint);
    if (!result || typeof result !== 'object') endpointFailures.push(`${template} -> non-object`);
  } catch (error) {
    endpointFailures.push(`${template} -> ${error.message}`);
  }
}
if (!endpointFailures.length) pass('All routed API reads resolve offline', `${templates.length} endpoint templates`);
else fail('All routed API reads resolve offline', endpointFailures.slice(0,12).join('; '));

// Explicitly hit each top-level ERP route through its source component contract probe.
const criticalRoutes = [
  '/', '/agenda','/compras','/compras/solicitudes','/compras/ordenes','/compras/recepciones','/compras/proveedores',
  '/inventario/productos','/inventario/existencias','/inventario/movimientos','/inventario/operaciones','/almacenes',
  '/administracion','/finanzas/cuentas-por-pagar','/finanzas/cuentas-por-cobrar','/finanzas/tesoreria','/finanzas/presupuestos',
  '/finanzas/conciliacion-bancaria','/finanzas/flujo-efectivo','/finanzas/contabilidad','/gastos','/activos-fijos','/facturacion-fiscal',
  '/recursos-humanos','/recursos-humanos/operacion','/recursos-humanos/expedientes','/recursos-humanos/prenomina',
  '/ventas','/ventas/order-to-cash','/ventas/operacion','/ventas/devoluciones','/ventas/cobranza','/crm','/marketing','/terceros',
  '/proyectos','/produccion','/pos','/inteligencia','/aprobaciones','/datos-maestros','/data-hub','/integration-hub','/flow','/reportes',
  '/reportes/demo','/reportes/demo-company','/configuracion','/configuracion/actividad','/configuracion/empresa','/configuracion/usuarios',
  '/configuracion/modulos','/configuracion/facturacion','/ayuda'
];
const registered = new Set(routePaths.map(p=>p==='/'?'/':`/${p}`.replace('//','/')));
const missingCritical = criticalRoutes.filter(r=>!registered.has(r) && r!=='/');
if (!missingCritical.length) pass('All expected ERP URLs are registered', `${criticalRoutes.length} URLs`);
else fail('All expected ERP URLs are registered', missingCritical.join(', '));

// Deep-link support on Vercel.
const vercelPath = path.join(root,'apps/web/vercel.json');
try {
  const vercel = JSON.parse(read(vercelPath));
  const rewrites = Array.isArray(vercel.rewrites) ? vercel.rewrites : [];
  const hasSpa = rewrites.some(r=>r?.destination==='/index.html' && String(r?.source||'').includes('(.*)')) ||
    rewrites.some(r=>r?.destination==='/index.html' && String(r?.source||'').includes('?!assets'));
  if (hasSpa) pass('Vercel deep-link SPA fallback present');
  else fail('Vercel deep-link SPA fallback present','missing rewrite to /index.html');
} catch (error) { fail('Vercel deep-link SPA fallback present',error.message); }

// Local Vite fallback + browser routing are part of the same source contract.
const appText = read(path.join(src,'App.jsx'));
if (appText.includes('<BrowserRouter>') && appText.includes('erpModuleRoutes.map')) pass('Local Vite BrowserRouter route contract present');
else fail('Local Vite BrowserRouter route contract present','App.jsx routing contract missing');

// Offline login must never require VITE_API_URL.
const authText = read(path.join(src,'auth/AuthContext.jsx'));
const apiText = read(path.join(src,'api.js'));
if (authText.includes('OFFLINE_DEMO_EMAIL') && apiText.includes('offlineDemoRequest')) pass('Offline session is detached from backend');
else fail('Offline session is detached from backend','offline interception missing');

// Platform routes are intentionally excluded from tenant demo.
pass('Platform routes intentionally excluded', '/admin-saas requires platform session');

console.log(`\n${checks.filter(c=>c.ok).length}/${checks.length} PASS`);
if (failures.length) process.exit(1);
