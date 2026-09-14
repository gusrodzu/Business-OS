import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const checks = [];
const check = (name, ok) => checks.push({name, ok:Boolean(ok)});

const topbar = read('apps/web/src/layout/Topbar.jsx');
const routes = read('apps/web/src/modules/settings/routes.jsx');
const profile = read('apps/web/src/modules/settings/ui/pages/Profile.jsx');
const preferences = read('apps/web/src/modules/settings/ui/pages/Preferences.jsx');
const authApi = read('apps/api/src/modules/core/api/auth.js');
const schema = read('apps/api/prisma/schema.prisma');
const offline = read('apps/web/src/offlineDemo.js');
const login = read('apps/web/src/pages/Login.jsx');
const theme = read('apps/web/src/framework/ThemeContext.jsx');

check('Topbar navega a Mi perfil', topbar.includes("navigate('/perfil')"));
check('Topbar navega a Preferencias', topbar.includes("navigate('/preferencias')"));
check('Topbar navega a Actividad', topbar.includes("navigate('/configuracion/actividad')"));
check('Topbar ejecuta logout', topbar.includes('await logout()'));
check('Ruta /perfil registrada', routes.includes("path: 'perfil'"));
check('Ruta /preferencias registrada', routes.includes("path: 'preferencias'"));
check('Perfil consume /auth/profile', profile.includes("apiRequest('/auth/profile'"));
check('Preferencias consume /auth/preferences', preferences.includes("apiRequest('/auth/preferences'"));
check('API expone PATCH profile', authApi.includes("router.patch('/profile'"));
check('API expone PATCH preferences', authApi.includes("router.patch('/preferences'"));
check('Usuario persiste preferences JSON', /preferences\s+Json\?/.test(schema));
check('Migración preferences presente', fs.existsSync('apps/api/prisma/migrations/20260914150000_user_preferences/migration.sql'));
check('Demo Offline actualiza perfil', offline.includes("normalized === '/auth/profile'"));
check('Demo Offline actualiza preferencias', offline.includes("normalized === '/auth/preferences'"));
check('Demo Offline persiste notificaciones', offline.includes("normalized === '/activity/notifications/read-all'"));
check('Tema aplica densidad', theme.includes('dataset.density'));
check('Tema aplica reducción de movimiento', theme.includes('dataset.reducedMotion'));
check('Login respeta página inicial', login.includes('defaultLandingPage'));

for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'}  ${item.name}`);
const failures = checks.filter((item) => !item.ok);
console.log(`\nUser Menu v18.3.2: ${checks.length - failures.length}/${checks.length} PASS`);
process.exit(failures.length ? 1 : 0);
