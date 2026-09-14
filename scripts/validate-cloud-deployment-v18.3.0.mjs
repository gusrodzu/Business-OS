import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const check = (name, ok, detail='') => checks.push({name, ok:Boolean(ok), detail});

const render = read('render.yaml');
const vercel = JSON.parse(read('vercel.json'));
const api = read('apps/api/src/index.js');
const cloudEnv = read('.env.cloud.example');
const gitignore = read('.gitignore');

check('Render usa Node runtime', /runtime:\s*node/.test(render));
check('Render API en Ohio', /region:\s*ohio/.test(render));
check('Render plan production no-free', /plan:\s*0\.5c-512mb/.test(render));
check('Render ejecuta Prisma generate', /buildCommand:.*db:generate/.test(render));
check('Render ejecuta migrate deploy antes de publicar', /preDeployCommand:\s*npm run db:deploy/.test(render));
check('Render inicia workspace API', /startCommand:\s*npm run start -w apps\/api/.test(render));
check('Render health check valida DB', /healthCheckPath:\s*\/api\/ready/.test(render));
check('DATABASE_URL no está hardcodeada', /key:\s*DATABASE_URL\s*\n\s*sync:\s*false/.test(render));
check('JWT_SECRET no está hardcodeado', /key:\s*JWT_SECRET\s*\n\s*sync:\s*false/.test(render));
check('R2 secreto no está hardcodeado', /key:\s*S3_SECRET_ACCESS_KEY\s*\n\s*sync:\s*false/.test(render));
check('Legacy Bearer apagado', /ALLOW_LEGACY_BEARER_AUTH[\s\S]{0,80}value:\s*"false"/.test(render));
check('Storage local público apagado', /ALLOW_PUBLIC_LOCAL_UPLOADS[\s\S]{0,80}value:\s*"false"/.test(render));
check('API escucha 0.0.0.0 configurable', /process\.env\.HOST\s*\|\|\s*'0\.0\.0\.0'/.test(api) && /app\.listen\(port, host/.test(api));
check('Vercel compila sólo Web workspace', vercel.buildCommand === 'npm run build -w apps/web');
check('Vercel publica dist Web', vercel.outputDirectory === 'apps/web/dist');
check('Vercel tiene fallback SPA', Array.isArray(vercel.rewrites) && vercel.rewrites.some(x => x.destination === '/index.html'));
check('Vercel instala lockfile reproducible', vercel.installCommand === 'npm ci');
check('Cloud env usa HTTPS frontend', /CLIENT_URL=https:\/\/app\.TU_DOMINIO\.com/.test(cloudEnv));
check('Cloud env usa API HTTPS', /VITE_API_URL=https:\/\/api\.TU_DOMINIO\.com\/api/.test(cloudEnv));
check('Cloud env usa Neon SSL', /DATABASE_URL=.*sslmode=require/.test(cloudEnv));
check('Cloud env usa R2 privado', /PRIVATE_STORAGE_DRIVER=s3/.test(cloudEnv));
check('.env.cloud.local ignorado', gitignore.includes('.env.cloud.local') || gitignore.includes('.env*'));
check('No hay secretos reales obvios en plantilla', !/(sk-[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16})/.test(cloudEnv));

const failed = checks.filter(x => !x.ok);
for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}${item.detail ? ` · ${item.detail}` : ''}`);
console.log(`\nCloud Deploy QA: ${checks.length-failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
