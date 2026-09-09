import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const legacy = [
  'apps/web/src/pages/HrClientCenter.jsx',
  'apps/web/src/pages/HrClientCenter.module.css',
];

let removed = 0;
for (const relative of legacy) {
  const target = path.resolve(root, relative);
  if (fs.existsSync(target)) {
    fs.rmSync(target, {force: true});
    console.log(`REMOVED legacy: ${relative}`);
    removed++;
  }
}

const apiIndex = fs.readFileSync(path.resolve(root, 'apps/api/src/index.js'), 'utf8');
if (!apiIndex.includes("app.use('/api/hr-client', hrClientRouter);")) {
  console.error('FAIL: /api/hr-client no está montado en apps/api/src/index.js');
  process.exit(1);
}

const schema = fs.readFileSync(path.resolve(root, 'apps/api/prisma/schema.prisma'), 'utf8');
if (!schema.includes('model AgendaEvent {')) {
  console.error('FAIL: el modelo AgendaEvent no existe en schema.prisma');
  process.exit(1);
}

console.log(`PASS: limpieza legacy (${removed} archivo(s) removido(s)).`);
console.log('PASS: /api/hr-client está montado.');
console.log('PASS: AgendaEvent existe en Prisma schema.');
console.log('Siguiente: Prisma generate + db push para alinear PostgreSQL.');
