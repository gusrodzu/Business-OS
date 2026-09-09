import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const pagesDir = path.join(root, 'apps', 'web', 'src', 'pages');
const marker = 'Compatibility shim. Canonical UI lives';

if (!fs.existsSync(pagesDir)) {
  console.log('No existe apps/web/src/pages. No hay shims UI que limpiar.');
  process.exit(0);
}

const removed = [];
for (const entry of fs.readdirSync(pagesDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const file = path.join(pagesDir, entry.name);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(marker)) continue;

  fs.rmSync(file, { force: true });
  removed.push(path.relative(root, file));
}

console.log(`UI compatibility shims eliminados: ${removed.length}`);
for (const file of removed) console.log(`  - ${file}`);

const qa = spawnSync(process.execPath, ['scripts/validate-full-modular-v15.0.0.mjs'], {
  cwd: root,
  stdio: 'inherit',
});

process.exit(qa.status ?? 1);
