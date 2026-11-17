import fs from 'node:fs';
import path from 'node:path';

// UI-01: check resolved theme roles, not obsolete literal declarations.
// This audit must continue to work when legacy aliases reference MD3 tokens.
const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const color = read('apps/web/src/design-system/tokens/color.css');
const light = read('apps/web/src/design-system/theme/light.css');
const dark = read('apps/web/src/design-system/theme/dark.css');
const unified = read('apps/web/src/design-system/styles/unified-ui.css');

const darkSelector = ":root[data-theme='dark']";
if (!color.includes(darkSelector)) {
  console.error('FAIL · dark color roles missing');
  process.exit(1);
}

const [baseColors, darkColors] = color.split(darkSelector);
const declarations = source => Object.fromEntries(
  [...source.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
    .map(match => [match[1], match[2].trim()]),
);
const palettes = {
  light: {...declarations(baseColors), ...declarations(light)},
  dark: {...declarations(baseColors), ...declarations(darkColors), ...declarations(dark)},
};

function resolve(theme, name, visited = new Set()) {
  if (visited.has(name)) return undefined;
  visited.add(name);
  const value = palettes[theme][name];
  const reference = value?.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  return reference ? resolve(theme, reference[1], visited) : value;
}

const expected = [
  ['light', '--bb-color-primary', '#2F6BFF'],
  ['light', '--bb-color-primary-soft', '#EAF2FF'],
  ['light', '--bb-page-background', '#F5F7FC'],
  ['light', '--bb-surface', '#FFFFFF'],
  ['light', '--bb-text', '#0F172A'],
  ['light', '--bb-text-muted', '#667085'],
  ['light', '--bb-border', '#D9E2F2'],
  ['light', '--bb-color-success', '#22C55E'],
  ['light', '--bb-color-warning', '#F4B740'],
  ['light', '--bb-color-danger', '#EF4444'],
  ['light', '--bb-brand-purple', '#2F6BFF'],
  ['dark', '--bb-color-primary', '#8FB5FF'],
  ['dark', '--bb-color-primary-soft', '#1B3D70'],
  ['dark', '--bb-page-background', '#0B0F14'],
  ['dark', '--bb-surface', '#10161D'],
  ['dark', '--bb-text', '#F1F5FB'],
  ['dark', '--bb-border', '#2A3543'],
  ['dark', '--bb-color-success', '#80E5A8'],
  ['dark', '--bb-color-warning', '#F8D477'],
  ['dark', '--bb-color-danger', '#FFB4AB'],
];

const checks = expected.map(([theme, name, value]) => [
  theme + ' ' + name,
  resolve(theme, name)?.toUpperCase() === value.toUpperCase(),
]);
checks.push(
  ['legacy purple aliases canonical blue', palettes.light['--bb-brand-purple'] === 'var(--bb-brand-blue)'],
  ['light focus references primary', palettes.light['--bb-focus-ring']?.includes('var(--md-sys-color-primary) 22%')],
  ['dark focus references primary', palettes.dark['--bb-focus-ring']?.includes('var(--md-sys-color-primary) 34%')],
  ['shared focus uses primary', unified.includes('var(--bb-ui-primary) 14%')],
  ['tables use unified neutral header',
    unified.includes('table thead th{background:var(--md-sys-color-surface-container)!important;color:var(--bb-ui-text-secondary)!important')
      && resolve('light', '--md-sys-color-surface-container')?.toUpperCase() === '#F1F4F9'
      && unified.includes('--bb-ui-text-secondary:#667085;')],
  ['light inputs use unified surface',
    unified.includes('select,textarea){background:var(--bb-ui-surface)!important')
      && unified.includes('--bb-ui-surface:#FFFFFF;')],
);

let passed = 0;
for (const [label, ok] of checks) {
  console.log((ok ? 'PASS' : 'FAIL') + ' · ' + label);
  if (ok) passed++;
}
console.log('\nUnified color roles: ' + passed + '/' + checks.length + ' PASS');
process.exitCode = passed === checks.length ? 0 : 1;
