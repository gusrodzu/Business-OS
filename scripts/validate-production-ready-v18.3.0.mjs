import fs from 'node:fs';
import path from 'node:path';

const checks = [];
const read = (file) => fs.readFileSync(path.resolve(file), 'utf8');
const exists = (file) => fs.existsSync(path.resolve(file));
const pass = (name, detail = '') => checks.push({name, ok: true, detail});
const fail = (name, detail = '') => checks.push({name, ok: false, detail});
const expect = (name, condition, detail = '') => condition ? pass(name, detail) : fail(name, detail);

const rootPackage = JSON.parse(read('package.json'));
const apiPackage = JSON.parse(read('apps/api/package.json'));
const webPackage = JSON.parse(read('apps/web/package.json'));
const apiIndex = read('apps/api/src/index.js');
const authMiddleware = read('apps/api/src/middleware/auth.js');
const apiAuth = read('apps/api/src/modules/core/api/auth.js');
const platformAdmin = read('apps/api/src/modules/platform/api/platformAdmin.js');
const cookieLib = read('apps/api/src/lib/sessionCookies.js');
const csrf = read('apps/api/src/middleware/csrfOrigin.js');
const storage = read('apps/api/src/lib/privateStorage.js');
const employeeDocs = read('apps/api/src/modules/hr/api/employeeDocuments.js');
const projects = read('apps/api/src/modules/projects/api/projects.js');
const webApi = read('apps/web/src/api.js');
const authContext = read('apps/web/src/auth/AuthContext.jsx');
const envExample = read('apps/api/.env.example');
const migrationPath = 'apps/api/prisma/migrations/0_init/migration.sql';
const migration = exists(migrationPath) ? read(migrationPath) : '';

expect('Version raíz >= 18.3.0', /^(18\.3\.[0-9]+|19\.\d+\.\d+)$/.test(rootPackage.version), rootPackage.version);
expect('Version API compatible 18.3.x', apiPackage.version === rootPackage.version, apiPackage.version);
expect('Version WEB compatible 18.3.x', webPackage.version === rootPackage.version, webPackage.version);
expect('Script db:deploy', rootPackage.scripts?.['db:deploy']?.includes('db:deploy'), rootPackage.scripts?.['db:deploy']);
expect('API usa prisma migrate deploy', apiPackage.scripts?.['db:deploy'] === 'prisma migrate deploy', apiPackage.scripts?.['db:deploy']);
expect('Script db:status', apiPackage.scripts?.['db:status'] === 'prisma migrate status', apiPackage.scripts?.['db:status']);

expect('Migración inicial existe', exists(migrationPath));
expect('migration_lock.toml existe', exists('apps/api/prisma/migrations/migration_lock.toml'));
const tables = (migration.match(/^CREATE TABLE /gm) || []).length;
const enums = (migration.match(/^CREATE TYPE .* AS ENUM/gm) || []).length;
const fks = (migration.match(/ ADD CONSTRAINT .* FOREIGN KEY /g) || []).length;
expect('Baseline contiene esquema empresarial', tables >= 160, `${tables} tablas`);
expect('Baseline contiene enums', enums >= 90, `${enums} enums`);
expect('Baseline contiene relaciones', fks >= 350, `${fks} FK`);
expect('Baseline sin identifiers PostgreSQL >63', !Array.from(migration.matchAll(/"([^"]+)"/g)).some((match) => Buffer.byteLength(match[1], 'utf8') > 63));

expect('Cookies HttpOnly', /httpOnly:\s*true/.test(cookieLib));
expect('Cookie Secure por producción', /boolFromEnv\(process\.env\.COOKIE_SECURE, production\)/.test(cookieLib));
expect('SameSite configurable', /COOKIE_SAME_SITE/.test(cookieLib));
expect('Cookies ERP + Platform separadas', cookieLib.includes('bb_erp_session') && cookieLib.includes('bb_platform_session'));
expect('API setea ERP cookie', /setSessionCookie\(response, 'erp'/.test(apiAuth));
expect('API setea Platform cookie', /setSessionCookie\(response, 'platform'/.test(apiAuth));
expect('Demo LIVE setea cookie ERP', /setSessionCookie\(response, 'erp'/.test(platformAdmin));
expect('Logout limpia cookies', /clearAllSessionCookies\(response\)/.test(apiAuth));
expect('Bearer legacy deshabilitado por defecto en prod', authMiddleware.includes("production ? 'false' : 'true'"));
expect('Producción rechaza Bearer legacy', apiIndex.includes('ALLOW_LEGACY_BEARER_AUTH debe permanecer deshabilitado en producción'));
expect('Producción exige cookies seguras', apiIndex.includes('COOKIE_SECURE no puede deshabilitarse en producción'));
expect('Producción exige CLIENT_URL HTTPS', apiIndex.includes('Todos los CLIENT_URL de producción deben usar HTTPS'));

expect('CSRF Origin guard existe', csrf.includes('CSRF_ORIGIN_DENIED') && csrf.includes('hasSessionCookie'));
expect('CSRF guard está montado', apiIndex.includes('app.use(cookieCsrfOriginGuard)'));
expect('CORS usa credentials', /credentials:\s*true/.test(apiIndex));
expect('Frontend axios usa credentials', /withCredentials:\s*true/.test(webApi));
expect('Frontend elimina token al persistir sesión', webApi.includes('delete safeSession.token'));
expect('Frontend no crea Authorization de sesión', !/Authorization\s*[:=].*Bearer/.test(webApi));
expect('AuthContext no depende de session.token', !authContext.includes('session?.token') && !authContext.includes('result.token'));
expect('AuthContext usa estado authenticated', authContext.includes('session?.authenticated') && authContext.includes('result.authenticated'));

expect('Storage privado soporta S3', storage.includes("DRIVER === 's3'") && storage.includes('AWS4-HMAC-SHA256'));
expect('Storage privado soporta local dev', storage.includes("PRIVATE_STORAGE_DRIVER || 'local'"));
expect('Producción exige S3 por defecto', apiIndex.includes("privateStorageDriver() !== 's3'"));
expect('Expedientes usan memoryStorage', employeeDocs.includes('multer.memoryStorage()'));
expect('Expedientes usan private://', employeeDocs.includes('putPrivateObject') && employeeDocs.includes("router.get('/:id/download'"));
expect('Expedientes limpian uploads huérfanos', employeeDocs.includes("router.post('/upload/discard'") && employeeDocs.includes('El archivo ya está asociado a un documento'));
expect('Proyectos usan memoryStorage', projects.includes('multer.memoryStorage()'));
expect('Proyectos usan private storage', projects.includes('putPrivateObject') && projects.includes("documents/:documentId/download"));
expect('Uploads validan firma real', employeeDocs.includes('assertExpectedFileSignature') && projects.includes('assertExpectedFileSignature'));
expect('Descargas privadas no cacheables', employeeDocs.includes("Cache-Control','private, no-store") && projects.includes("Cache-Control', 'private, no-store"));
expect('Uploads públicos deshabilitados en prod', apiIndex.includes('!isProduction') && apiIndex.includes("app.use('/uploads'"));

for (const key of ['COOKIE_SECURE','COOKIE_SAME_SITE','ALLOW_LEGACY_BEARER_AUTH','PRIVATE_STORAGE_DRIVER','S3_ENDPOINT','S3_BUCKET','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY']) {
  expect(`.env.example incluye ${key}`, envExample.includes(`${key}=`));
}
expect('DATABASE_URL local coincide con Docker', envExample.includes('postgresql://erp_admin:erp_local_password@localhost:5432/erp_cliente'));

for (const file of ['.env.production.example','docker-compose.production.yml','docker-compose.production-managed-db.yml','apps/api/Dockerfile.production','apps/web/Dockerfile.production','infra/Caddyfile','infra/nginx.conf','DESPLEGAR-PRODUCCION.sh','PREPARAR-PRODUCCION.ps1','PRODUCTION-PREFLIGHT.ps1']) {
  expect(`Artefacto de producción ${file}`, exists(file));
}
const productionCompose = read('docker-compose.production.yml');
const managedCompose = read('docker-compose.production-managed-db.yml');
const productionEnv = read('.env.production.example');
const postgresBlock = productionCompose.split('  postgres:')[1]?.split('\n  api:')[0] || '';
expect('Compose producción no expone PostgreSQL', !postgresBlock.includes('ports:'));
expect('Compose producción fuerza cookies seguras', productionCompose.includes('COOKIE_SECURE: "true"') && managedCompose.includes('COOKIE_SECURE: "true"'));
expect('Compose producción fuerza storage S3', productionCompose.includes('PRIVATE_STORAGE_DRIVER: s3') && managedCompose.includes('PRIVATE_STORAGE_DRIVER: s3'));
expect('Compose producción deshabilita Bearer legacy', productionCompose.includes('ALLOW_LEGACY_BEARER_AUTH: "false"') && managedCompose.includes('ALLOW_LEGACY_BEARER_AUTH: "false"'));
expect('Compose producción ejecuta API sin capabilities Linux', productionCompose.includes('cap_drop:') && productionCompose.includes('- ALL'));
expect('Ejemplo producción incluye storage privado', productionEnv.includes('S3_ENDPOINT=') && productionEnv.includes('PRIVATE_STORAGE_DRIVER=s3'));
expect('Script de deploy aplica migraciones', read('DESPLEGAR-PRODUCCION.sh').includes('npm run db:deploy'));
expect('Caddy incluye HSTS y CSP', read('infra/Caddyfile').includes('Strict-Transport-Security') && read('infra/Caddyfile').includes('Content-Security-Policy'));

const markdown = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (['node_modules','.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) markdown.push(path.relative(process.cwd(), full).replaceAll('\\','/'));
  }
}
walk(process.cwd());
markdown.sort();
expect('Sólo README + CHANGELOG Markdown', JSON.stringify(markdown) === JSON.stringify(['CHANGELOG.md','README.md']), markdown.join(', '));

console.log('\nBuzzBee ERP · Production Ready v18.3.0');
console.log('=======================================');
for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'}  ${item.name}${item.detail ? ` · ${item.detail}` : ''}`);
const failed = checks.filter((item) => !item.ok);
console.log(`\nTOTAL: ${checks.length - failed.length}/${checks.length} PASS · ${failed.length} FAIL`);
if (failed.length) {
  console.error(`ERROR QA: Production Ready v18.3.0 tiene ${failed.length} validaciones pendientes.`);
  process.exit(1);
}
console.log('Production Ready v18.3.0: autenticación, migración y storage privado validados estáticamente.');
