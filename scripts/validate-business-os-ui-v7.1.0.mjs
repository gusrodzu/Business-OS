import fs from 'node:fs';
const nav=fs.readFileSync('apps/web/src/data/navigation.js','utf8');
const side=fs.readFileSync('apps/web/src/layout/Sidebar.jsx','utf8');
const css=fs.readFileSync('apps/web/src/layout/Sidebar.module.css','utf8');
const dash=fs.readFileSync('apps/web/src/modules/core/ui/pages/Dashboard.jsx','utf8');
for(const x of ['Principal','Operación','Relaciones','Administración','Inteligencia','Automatizaciones','Integraciones'])
  if(!nav.includes(x)){console.error('nav',x);process.exit(1)}
for(const x of ['osSection','brandAccent'])
  if(!side.includes(x)){console.error('sidebar',x);process.exit(1)}
if(!css.includes('BuzzBee Business OS UI v7.1'))process.exit(1);
const hex=fs.readFileSync('apps/web/src/components/HexQuickActions.jsx','utf8');
if(!dash.includes('<HexQuickActions actions={quickActions}') || !hex.includes('action.to && onNavigate?.(action.to)'))process.exit(1);
console.log('OK: Business OS UI v7.1 tiene navegación simplificada, sidebar oficial y quick actions funcionales.');
