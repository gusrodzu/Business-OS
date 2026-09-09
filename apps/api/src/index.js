import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prisma} from './lib/prisma.js';
import {requestContext} from './middleware/requestContext.js';
import {operationalTelemetry} from './middleware/operationalTelemetry.js';
import {mutationAudit} from './middleware/mutationAudit.js';
import {registerApiModules} from './bootstrap/registerApiModules.js';
import {startWorkers, stopWorkers} from './bootstrap/workers.js';

const requiredEnvironment = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);

if (missingEnvironment.length > 0) {
  console.error(`Variables faltantes: ${missingEnvironment.join(', ')}`);
  process.exit(1);
}

import {APP_VERSION} from './lib/version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, '../uploads');

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

app.use(requestContext);
app.use(helmet());
app.use(cors({origin: clientUrl, credentials: true}));
app.use(express.json({limit: '1mb'}));
app.use(pinoHttp());
app.use(operationalTelemetry);
app.use('/uploads', express.static(uploadsDirectory, {fallthrough: false, maxAge: '1h'}));

app.get('/api/health', (_request, response) => {
  response.json({ok: true, service: 'ERP Cliente API', version: APP_VERSION, timestamp: new Date().toISOString()});
});

app.get('/api/ready', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ok:true,database:'reachable',version:APP_VERSION,timestamp:new Date().toISOString()});
  } catch (error) {
    response.status(503).json({
      ok:false,
      database:'unreachable',
      code:error?.code??null,
      message:'La API está activa, pero PostgreSQL no está disponible.',
      timestamp:new Date().toISOString()
    });
  }
});

app.use(mutationAudit);

const moduleRegistration = registerApiModules(app);
console.log(`[Modules] ${moduleRegistration.modules} módulos API · ${moduleRegistration.routes} rutas registradas`);

app.use((error, request, response, _next) => {
  request.log?.error(error);
  const statusCode=Number(error?.statusCode)||500;
  const expose=Boolean(error?.expose)&&statusCode<500;
  response.status(statusCode).json({
    ok:false,
    code:expose?(error.code||'OPERATION_CONFLICT'):'INTERNAL_ERROR',
    message:expose?error.message:'Error interno del servidor',
    requestId:request.id||null
  });
});


startWorkers();

const server=app.listen(port, () => {
  console.log(`ERP API v${APP_VERSION} disponible en http://localhost:${port}/api`);
});

let shuttingDown=false;
async function shutdown(signal){
  if(shuttingDown)return;
  shuttingDown=true;
  console.log(`[Shutdown] ${signal} recibido. Cerrando workers y conexiones…`);
  stopWorkers();
  server.close(async()=>{
    try{await prisma.$disconnect();}catch{}
    process.exit(0);
  });
  setTimeout(()=>{
    console.error('[Shutdown] cierre forzado por timeout.');
    process.exit(1);
  },10_000).unref?.();
}
process.on('SIGINT',()=>shutdown('SIGINT'));
process.on('SIGTERM',()=>shutdown('SIGTERM'));

