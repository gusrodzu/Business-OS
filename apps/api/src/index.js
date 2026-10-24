import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import {createHttpLogger} from './lib/httpLogger.js';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prisma} from './lib/prisma.js';
import {requestContext} from './middleware/requestContext.js';
import {operationalTelemetry} from './middleware/operationalTelemetry.js';
import {mutationAudit} from './middleware/mutationAudit.js';
import {registerApiModules} from './bootstrap/registerApiModules.js';
import {startWorkers, stopWorkers} from './bootstrap/workers.js';
import {APP_VERSION} from './lib/version.js';
import {cookieCsrfOriginGuard} from './middleware/csrfOrigin.js';
import {privateStorageDriver, validatePrivateStorageConfiguration} from './lib/privateStorage.js';

const requiredEnvironment = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);
if (missingEnvironment.length > 0) {
  console.error(`Variables faltantes: ${missingEnvironment.join(', ')}`);
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
const productionSecurityErrors = [];
const truthy = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
if (isProduction && String(process.env.JWT_SECRET || '').length < 48) productionSecurityErrors.push('JWT_SECRET debe tener al menos 48 caracteres');
if (isProduction && String(process.env.MFA_ENCRYPTION_KEY || '').length < 32) productionSecurityErrors.push('MFA_ENCRYPTION_KEY debe configurarse con al menos 32 caracteres');
if (isProduction && String(process.env.INTEGRATION_ENCRYPTION_KEY || '').length < 32) productionSecurityErrors.push('INTEGRATION_ENCRYPTION_KEY debe configurarse con al menos 32 caracteres');
if (isProduction && truthy(process.env.ALLOW_LEGACY_BEARER_AUTH)) productionSecurityErrors.push('ALLOW_LEGACY_BEARER_AUTH debe permanecer deshabilitado en producción');
if (isProduction && process.env.COOKIE_SECURE != null && !truthy(process.env.COOKIE_SECURE)) productionSecurityErrors.push('COOKIE_SECURE no puede deshabilitarse en producción');
if (isProduction) {
  const origins = String(process.env.CLIENT_URL || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (!origins.length) productionSecurityErrors.push('CLIENT_URL debe configurarse explícitamente en producción');
  if (origins.some((origin) => !origin.startsWith('https://'))) productionSecurityErrors.push('Todos los CLIENT_URL de producción deben usar HTTPS');
}
try {
  validatePrivateStorageConfiguration();
  if (isProduction && privateStorageDriver() !== 's3' && !truthy(process.env.ALLOW_LOCAL_PRIVATE_STORAGE)) {
    productionSecurityErrors.push('PRIVATE_STORAGE_DRIVER debe ser s3 en producción (o habilita ALLOW_LOCAL_PRIVATE_STORAGE=true de forma consciente)');
  }
} catch (error) {
  productionSecurityErrors.push(error.message);
}
if (productionSecurityErrors.length) {
  console.error(`Configuración insegura para producción: ${productionSecurityErrors.join('; ')}`);
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, '../uploads');
const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = new Set(String(process.env.CLIENT_URL ?? 'http://localhost:5173').split(',').map((value) => value.trim()).filter(Boolean));
const trustProxyRaw = String(process.env.TRUST_PROXY || '').trim();
if (trustProxyRaw) {
  const trustProxy = /^\d+$/.test(trustProxyRaw) ? Number(trustProxyRaw) : trustProxyRaw === 'true' ? 1 : trustProxyRaw.split(',').map((value)=>value.trim()).filter(Boolean);
  app.set('trust proxy', trustProxy);
}

app.disable('x-powered-by');
app.use(requestContext);
app.use(helmet({
  crossOriginResourcePolicy: {policy: 'same-site'},
  referrerPolicy: {policy: 'no-referrer'},
}));
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    const error = new Error('Origen no permitido por CORS');
    error.statusCode = 403;
    error.expose = true;
    error.code = 'CORS_ORIGIN_DENIED';
    return callback(error);
  },
}));
app.use(cookieCsrfOriginGuard);
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({extended: false, limit: '64kb', parameterLimit: 100}));
app.use(createHttpLogger());
app.use(operationalTelemetry);

// El almacenamiento local sólo se publica expresamente en desarrollo. En producción,
// documentos sensibles se sirven únicamente a través de rutas autenticadas desde storage privado.
const allowPublicLocalUploads = !isProduction && process.env.ALLOW_PUBLIC_LOCAL_UPLOADS !== 'false';
if (allowPublicLocalUploads) {
  app.use('/uploads', express.static(uploadsDirectory, {
    fallthrough: false,
    index: false,
    dotfiles: 'deny',
    maxAge: '1h',
    setHeaders(response) {
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Cache-Control', 'private, max-age=3600');
    },
  }));
}

app.get('/api/health', (_request, response) => {
  response.json({ok: true, service: 'BuzzBee ERP API', version: APP_VERSION, timestamp: new Date().toISOString()});
});
app.get('/api/ready', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ok:true,database:'reachable',version:APP_VERSION,timestamp:new Date().toISOString()});
  } catch (error) {
    response.status(503).json({ok:false,database:'unreachable',code:error?.code??null,message:'La API está activa, pero PostgreSQL no está disponible.',timestamp:new Date().toISOString()});
  }
});

app.use(mutationAudit);
const moduleRegistration = registerApiModules(app);
console.log(`[Modules] ${moduleRegistration.modules} módulos API · ${moduleRegistration.routes} rutas registradas`);

app.use((error, request, response, _next) => {
  request.log?.error(error);
  const statusCode=Number(error?.statusCode)||500;
  const expose=Boolean(error?.expose)&&statusCode<500;
  response.status(statusCode).json({ok:false,code:expose?(error.code||'OPERATION_CONFLICT'):'INTERNAL_ERROR',message:expose?error.message:'Error interno del servidor',requestId:request.id||null});
});

startWorkers();
const host = String(process.env.HOST || '0.0.0.0');
const server=app.listen(port, host, () => console.log(`BuzzBee ERP API v${APP_VERSION} disponible en ${host}:${port}/api`));
let shuttingDown=false;
async function shutdown(signal){
  if(shuttingDown)return; shuttingDown=true;
  console.log(`[Shutdown] ${signal} recibido. Cerrando workers y conexiones…`);
  stopWorkers();
  server.close(async()=>{try{await prisma.$disconnect();}catch{} process.exit(0);});
  setTimeout(()=>{console.error('[Shutdown] cierre forzado por timeout.');process.exit(1);},10_000).unref?.();
}
process.on('SIGINT',()=>shutdown('SIGINT'));
process.on('SIGTERM',()=>shutdown('SIGTERM'));
