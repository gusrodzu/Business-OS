import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [];
function check(label, pass, detail='') { checks.push({label, pass, detail}); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }

const required = [
  'apps/web/src/design-system/tokens/color.css',
  'apps/web/src/design-system/tokens/typography.css',
  'apps/web/src/design-system/tokens/spacing.css',
  'apps/web/src/design-system/tokens/shape.css',
  'apps/web/src/design-system/tokens/elevation.css',
  'apps/web/src/design-system/tokens/motion.css',
  'apps/web/src/design-system/theme/light.css',
  'apps/web/src/design-system/theme/dark.css',
  'apps/web/src/design-system/styles/md3-foundation.css',
  'apps/web/src/design-system/components/Checkbox.jsx',
  'apps/web/src/design-system/components/Select.jsx',
];
for (const rel of required) check(`Existe ${rel}`, exists(rel));

const colors = read('apps/web/src/design-system/tokens/color.css');
check('MD3 primary role', colors.includes('--md-sys-color-primary:'));
check('MD3 surface containers', colors.includes('--md-sys-color-surface-container-highest:'));
check('Tema oscuro MD3', colors.includes(":root[data-theme='dark']"));
check('Brand colors BuzzBee', colors.includes('--bb-brand-blue:') && colors.includes('--bb-brand-purple:') && colors.includes('--bb-brand-yellow:'));

const tokenBridge = read('apps/web/src/design-system/styles/tokens.css');
check('Legacy tokens mapped to MD3', tokenBridge.includes('--color-primary: var(--md-sys-color-primary)') && tokenBridge.includes('--surface-card: var(--bb-surface)'));

const main = read('apps/web/src/main.jsx');
check('Foundation imported globally', main.includes("./design-system/styles/md3-foundation.css"));

const theme = read('apps/web/src/framework/ThemeContext.jsx');
check('Theme supports system', theme.includes("'system'") && theme.includes('prefers-color-scheme'));
check('Resolved theme exposed', theme.includes('resolvedTheme'));

const button = read('apps/web/src/design-system/components/Button.jsx');
const buttonCss = read('apps/web/src/design-system/components/Button.module.css');
check('Button keeps legacy API', button.includes("primary: 'filled'") && button.includes("secondary: 'outlined'"));
check('Button exposes MD3 variants', ['.filled', '.tonal', '.outlined', '.text', '.elevated'].every((v)=>buttonCss.includes(v)));

const card = read('apps/web/src/design-system/components/Card.jsx');
check('Card supports MD3 variants', card.includes("variant = 'elevated'"));

const inputCss = read('apps/web/src/design-system/components/Input.module.css');
check('Input uses MD3 outline roles', inputCss.includes('var(--md-sys-color-outline)') && inputCss.includes('var(--md-sys-color-primary)'));

const switchCss = read('apps/web/src/design-system/components/Switch.module.css');
check('Switch MD3 dimensions', switchCss.includes('width: 52px') && switchCss.includes('height: 32px'));

const index = read('apps/web/src/design-system/components/index.js');
check('Checkbox exported', index.includes("export {Checkbox}"));
check('Select exported', index.includes("export {Select}"));

const failures = checks.filter((item)=>!item.pass);
for (const item of checks) console.log(`${item.pass ? 'PASS' : 'FAIL'}  ${item.label}${item.detail ? ` · ${item.detail}` : ''}`);
console.log(`\nMaterial Design 3 Foundation: ${checks.length - failures.length}/${checks.length} PASS`);
if (failures.length) process.exit(1);
