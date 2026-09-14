# BuzzBee ERP v18.3.6

BuzzBee ERP / Business OS multiempresa. Esta versión conserva la Demo Offline y endurece la ruta a producción con migraciones Prisma versionadas, sesiones web en cookies HttpOnly y almacenamiento privado de documentos.

## Requisitos

- Node.js 20+ (probado por el proyecto con Node 24)
- npm
- Docker Desktop para PostgreSQL local
- PostgreSQL 17 local o administrado

## Desarrollo local

```powershell
npm install
Copy-Item .\apps\api\.env.example .\apps\api\.env
docker compose up -d
npm run db:generate
npm run db:deploy
npm run db:seed
npm run db:seed:demo
npm run db:seed:demo-company
npm run qa:all
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:4000`  
PostgreSQL local: `localhost:5432`

Para desarrollo iterativo del esquema puede seguir usándose `npm run db:migrate`. `db:sync` queda reservado a prototipado/desarrollo y no debe formar parte del despliegue de producción.

## Demo Offline

```powershell
npm install
npm run dev:web
```

La cuenta `admin@erp.local` / `Admin123!` activa el adaptador frontend-only y no requiere API ni PostgreSQL.

## Cloud Deploy recomendado v18.3

Arquitectura objetivo:

```text
Internet
  ├─ app.TU_DOMINIO.com  -> Vercel (React/Vite)
  └─ api.TU_DOMINIO.com  -> Render Ohio (Node/Express)
                                ├─ Neon PostgreSQL us-east-2 (pooled + SSL)
                                └─ Cloudflare R2 privado (S3 API)
```

Archivos incorporados para este flujo:

- `vercel.json`: build del workspace `apps/web`, publicación de `apps/web/dist`, fallback SPA y headers básicos.
- `render.yaml`: Blueprint de la API, plan `0.5c-512mb`, región Ohio, `prisma migrate deploy` como pre-deploy y `/api/ready` como healthcheck.
- `.env.cloud.example`: mapa de variables Vercel/Render/Neon/R2 sin secretos reales.
- `PREPARAR-CLOUD.ps1`: genera secretos locales y una `.env.cloud.local` ignorada por Git.
- `npm run qa:cloud-deploy`: valida estáticamente la configuración cloud.
- `npm run smoke:cloud`: valida frontend, deep-link, API, PostgreSQL y CORS una vez publicados.

Para producción se recomienda asignar `app.TU_DOMINIO.com` a Vercel y `api.TU_DOMINIO.com` a Render. Configura en Vercel `VITE_API_URL=https://api.TU_DOMINIO.com/api`; en Render usa `CLIENT_URL=https://app.TU_DOMINIO.com`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=lax` y deja `COOKIE_DOMAIN` vacío para conservar cookies host-only.

Neon debe proporcionar una URL **pooled** con `sslmode=require` y, de ser posible, desplegarse en `us-east-2` para emparejarla con Render Ohio. El bucket R2 debe permanecer privado: BuzzBee accede por la API S3 desde el backend, no directamente desde el navegador.

Flujo de preparación:

```powershell
.\PREPARAR-CLOUD.ps1
npm ci
npm run db:generate
npm run qa:production-ready
npm run qa:cloud-deploy
npm run qa:all
npm run build
```

Después de publicar y configurar DNS:

```powershell
$env:BUZZBEE_WEB_URL='https://app.TU_DOMINIO.com'
$env:BUZZBEE_API_URL='https://api.TU_DOMINIO.com'
npm run smoke:cloud
```

## Producción

Configura como mínimo estas variables en el entorno de la API:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<48+ caracteres aleatorios>
MFA_ENCRYPTION_KEY=<32+ caracteres aleatorios>
INTEGRATION_ENCRYPTION_KEY=<32+ caracteres aleatorios>
CLIENT_URL=https://app.tudominio.com
TRUST_PROXY=1

COOKIE_SECURE=true
COOKIE_SAME_SITE=none
COOKIE_DOMAIN=
ALLOW_LEGACY_BEARER_AUTH=false

PRIVATE_STORAGE_DRIVER=s3
S3_ENDPOINT=https://...
S3_BUCKET=buzzbee-private
S3_REGION=auto
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_SESSION_TOKEN=
ALLOW_LOCAL_PRIVATE_STORAGE=false
ALLOW_PUBLIC_LOCAL_UPLOADS=false
```

Si WEB y API viven bajo el mismo sitio, `COOKIE_SAME_SITE=lax` es preferible. Si están en sitios distintos (por ejemplo frontend en Vercel y API en otro dominio), usa `COOKIE_SAME_SITE=none` junto con `COOKIE_SECURE=true`. `CLIENT_URL` debe contener exactamente los orígenes HTTPS autorizados, separados por coma cuando haya más de uno.

Despliegue de una base nueva:

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run qa:production-ready
npm run build
```

La API inicia con `npm run start -w apps/api` y el frontend se publica desde `apps/web/dist` o mediante el proveedor de frontend elegido.


### Docker de producción incluido

La raíz del proyecto incluye dos opciones listas para configurar:

- `docker-compose.production.yml`: WEB + API + PostgreSQL privado + Caddy/HTTPS.
- `docker-compose.production-managed-db.yml`: WEB + API + Caddy usando PostgreSQL administrado (recomendado para SaaS).

Antes del primer deploy puedes generar `.env.production` con `PREPARAR-PRODUCCION.ps1`, validarlo con `PRODUCTION-PREFLIGHT.ps1` y, en un servidor Linux con Docker, ejecutar `DESPLEGAR-PRODUCCION.sh`. PostgreSQL no publica el puerto 5432 en el compose de producción.

### Base existente creada antes de v18.2.0

No ejecutes `0_init` contra una base ya poblada sin revisar primero que su esquema corresponda al `schema.prisma` actual. Para adoptar el historial de migraciones en una base existente, verifica el esquema y después marca el baseline como aplicado con Prisma:

```bash
npx prisma migrate resolve --applied 0_init --schema apps/api/prisma/schema.prisma
npm run db:status
```

En una base vacía no se usa `resolve`; simplemente ejecuta `npm run db:deploy`.

## Seguridad de sesión v18.2

- Los JWT de usuario ya no se entregan al JavaScript del navegador ni se guardan en `localStorage`/`sessionStorage`.
- ERP y Super Admin usan cookies HttpOnly separadas.
- `Secure` es obligatorio en producción.
- Operaciones mutables autenticadas por cookie validan el `Origin` contra `CLIENT_URL` para mitigar CSRF.
- El Bearer legacy para sesiones está deshabilitado por defecto en producción.
- Las API keys públicas `bb_live_...` siguen usando su mecanismo Bearer/x-api-key independiente.

## Documentos privados

Los archivos nuevos de Expedientes de RR. HH. y Proyectos se almacenan como referencias `private://` y sólo se descargan a través de endpoints autenticados con permisos y aislamiento por empresa.

- Desarrollo: `PRIVATE_STORAGE_DRIVER=local` guarda en `apps/api/private_uploads` sin publicarlo por Express.
- Producción: usa `PRIVATE_STORAGE_DRIVER=s3` con un bucket privado compatible con S3/R2.
- Los uploads validan extensión, MIME, tamaño y firma binaria básica del contenido.

## Prisma y migraciones

El baseline versionado está en:

```text
apps/api/prisma/migrations/0_init/migration.sql
```

Comandos principales:

```bash
npm run db:generate
npm run db:migrate      # desarrollo: crea/aplica nuevas migraciones
npm run db:deploy       # producción: aplica migraciones existentes
npm run db:status       # revisa el estado de migraciones
```

Cada cambio futuro de `schema.prisma` debe acompañarse de una nueva migración dentro de `apps/api/prisma/migrations/`; no se debe editar `0_init` después de entrar en producción.

## QA

```bash
npm run qa:production-ready
npm run qa:critical-routes
npm run qa:enterprise-security
npm run qa:tenant-isolation
npm run qa:platform-security
npm run qa:offline-all-routes
npm run qa:all
```

`CHANGELOG.md` es el único historial humano de cambios y versiones del proyecto.
