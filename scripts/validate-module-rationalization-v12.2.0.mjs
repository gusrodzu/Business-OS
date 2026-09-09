import fs from 'node:fs';
import {readWebRoutingSource} from './lib/modular-source.mjs';

const nav = fs.readFileSync('apps/web/src/data/navigation.js', 'utf8');
const sidebar = fs.readFileSync('apps/web/src/layout/Sidebar.jsx', 'utf8');
const app = readWebRoutingSource();

const checks = [
  ['Compras integra Proveedores', nav.includes("{label: 'Proveedores', to: '/compras/proveedores'}")],
  ['Inventario integra Almacenes', nav.includes("{label: 'Almacenes', to: '/almacenes'}")],
  ['Finanzas integra Gastos', nav.includes("{label: 'Gastos', to: '/gastos'}")],
  ['Finanzas integra Activos fijos', nav.includes("{label: 'Activos fijos', to: '/activos-fijos'}")],
  ['Reportes integra Inteligencia', nav.includes("{label: 'Inteligencia', to: '/inteligencia'}")],
  ['POS es opcional', nav.includes("{label: 'POS', moduleKey: 'pos', icon: Store, to: '/pos', defaultVisible: false}")],
  ['Producción es opcional', nav.includes("{label: 'Producción', moduleKey: 'produccion', icon: Factory, to: '/produccion', defaultVisible: false}")],
  ['Proyectos es opcional', nav.includes("{label: 'Proyectos', moduleKey: 'proyectos', icon: FolderKanban, to: '/proyectos', defaultVisible: false}")],
  ['Marketing es opcional', nav.includes("{label: 'Marketing', moduleKey: 'marketing', icon: Megaphone, to: '/marketing', defaultVisible: false}")],
  ['Herramientas SaaS sensibles son platformOnly y Data Hub es tenant', (nav.match(/platformOnly: true/g) || []).length >= 4 && nav.includes("{label: 'Importar datos', icon: FileText, to: '/data-hub'}")],
  ['Sidebar filtra perfil', sidebar.includes('isProfileVisible(item)') && sidebar.includes('item.defaultVisible !== false')],
  ['Rutas opcionales se conservan', ['pos','produccion','proyectos','marketing','flow','integration-hub','data-hub'].every((r)=>app.includes(`path: '${r}'`))],
];

let fail=0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) fail++;
}
console.log(`\nModule Rationalization v12.2.0: ${checks.length-fail} PASS / ${fail} FAIL`);
process.exitCode = fail ? 1 : 0;
