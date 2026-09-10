# BuzzBee ERP — QA integral v17.1.0

Generado: 2026-09-10T02:25:28.308Z

Modo: **Static**

Resultado: **45/48 PASS** · **3 FAIL**

| Área | PASS | FAIL | Total |
|---|---:|---:|---:|
| Base | 4 | 0 | 4 |
| Flujos | 9 | 0 | 9 |
| Plataforma | 16 | 0 | 16 |
| UX/UI | 14 | 2 | 16 |
| 100/100 | 2 | 0 | 2 |
| Release | 0 | 1 | 1 |

## Suites

- ✅ **Base · Navegación**
- ✅ **Base · Foundation**
- ✅ **Base · Integración de pantallas**
- ✅ **Base · Core**
- ✅ **Flujos · Compras P2P**
- ✅ **Flujos · Ventas O2C**
- ✅ **Flujos · Inventario**
- ✅ **Flujos · Administración y finanzas**
- ✅ **Flujos · RR. HH.**
- ✅ **Flujos · CRM y terceros**
- ✅ **Flujos · POS**
- ✅ **Flujos · Proyectos**
- ✅ **Flujos · Producción**
- ✅ **Plataforma · Intelligence / AI**
- ✅ **Plataforma · Core SaaS**
- ✅ **Plataforma · Confiabilidad core**
- ✅ **Plataforma · Workers**
- ✅ **Plataforma · Integraciones**
- ✅ **Plataforma · Secuencias**
- ✅ **Plataforma · Integridad transaccional**
- ✅ **Plataforma · Máquinas de estado**
- ✅ **Plataforma · Auditoría**
- ✅ **Plataforma · Permisos**
- ✅ **Plataforma · Recovery**
- ✅ **Plataforma · Contratos API**
- ✅ **Plataforma · Multiempresa**
- ✅ **Plataforma · Performance**
- ✅ **Plataforma · Production readiness**
- ✅ **Plataforma · Final hardening**
- ❌ **UX/UI · Workspace UI**
- ✅ **UX/UI · Unified UI Contract**
- ✅ **UX/UI · MD3 Full**
- ✅ **UX/UI · Navegación sin duplicados**
- ✅ **UX/UI · Tabs sin duplicados**
- ✅ **UX/UI · Topbar tabs**
- ✅ **UX/UI · Accesibilidad**
- ✅ **UX/UI · Administración / Finanzas navigation**
- ✅ **UX/UI · Racionalización de módulos**
- ✅ **UX/UI · Estandarización visual**
- ✅ **UX/UI · Switches**
- ✅ **UX/UI · Interacciones**
- ✅ **UX/UI · Idioma es-MX**
- ❌ **UX/UI · Deployment UI/API**
- ✅ **UX/UI · Agenda**
- ✅ **UX/UI · Tablas responsive**
- ✅ **100/100 · Dirección**
- ✅ **100/100 · Administración**
- ❌ **Release · Release Candidate**

## Interpretación

- PASS significa que la validación automatizada de esa suite pasó en el código actual.
- Los checks runtime requieren API y PostgreSQL activos; sólo se incluyen con `npm run qa:all:full`.
- Una suite técnica en PASS no sustituye la prueba de aceptación con usuarios reales para otorgar 100/100 definitivo de experiencia.

## Fallos

### UX/UI · Workspace UI

```text
BuzzBee Workspace UI v17.0.0
=============================
PASS  Workspace layer loaded
PASS  Workspace layer feeds final UI contract
PASS  Power banner removed from shell
PASS  Collapsible Workspace tools
PASS  Tool strip includes Agenda, Apps and AI
PASS  Right panel closed by default
PASS  Workspace content maximizes width when panel closed
FAIL  Google-style wide search surface
PASS  Topbar no historical version override blocks
PASS  Sidebar uses quiet rounded navigation
PASS  Sidebar no historical override blocks
PASS  Module tabs are quiet 48px strip
PASS  Module tabs no historical override blocks
PASS  Right rail rewritten as lightweight panel
PASS  Workspace cards are flat
PASS  Workspace tables use file-list treatment
PASS  Workspace form controls use quiet surfaces
PASS  Dark Workspace tokens included
PASS  Responsive shell still supported
PASS  Project version is 17.x

19/20 PASS
```

### UX/UI · Deployment UI/API

```text
PASS Frontend tiene build Vite
PASS Root build apunta al workspace web
PASS API usa Helmet
PASS API CORS configurado
PASS Health endpoint disponible
PASS Readiness DB disponible
PASS Vercel rewrite SPA disponible
FAIL Variables de entorno documentadas

Deployment Hardening: 7 PASS / 1 FAIL
```

### Release · Release Candidate

```text
ng/error estandarizados
PASS Paginación estandarizada
PASS Validación de formularios visible
PASS Modales responsive
PASS Focus accesible
PASS Reduced motion soportado
PASS Switch usa geometría MD3 52x32
PASS Vercel SPA rewrite presente

UX & Interaction Standardization: 11 PASS / 0 FAIL

=== Idioma UI ===
PASS Diccionario es-MX central
PASS Badge usa statusLabel
PASS Sin copy inglés crítico detectado

UI Language Audit: 3 PASS / 0 FAIL

=== Deployment ===
PASS Frontend tiene build Vite
PASS Root build apunta al workspace web
PASS API usa Helmet
PASS API CORS configurado
PASS Health endpoint disponible
PASS Readiness DB disponible
PASS Vercel rewrite SPA disponible
FAIL Variables de entorno documentadas

Deployment Hardening: 7 PASS / 1 FAIL

=== Module rationalization ===
PASS Compras integra Proveedores
PASS Inventario integra Almacenes
PASS Finanzas integra Gastos
PASS Finanzas integra Activos fijos
PASS Reportes integra Inteligencia
PASS POS es opcional
PASS Producción es opcional
PASS Proyectos es opcional
PASS Marketing es opcional
PASS Herramientas SaaS sensibles son platformOnly y Data Hub es tenant
PASS Sidebar filtra perfil
PASS Rutas opcionales se conservan

Module Rationalization v12.2.0: 12 PASS / 0 FAIL

=== Visual standardization ===
PASS  v12.3 visual layer superseded by MD3 runtime
PASS  KPI visual system standardized
PASS  table visual system standardized
PASS  list rows standardized
PASS  buttons and controls standardized
PASS  centered modal visual system standardized
PASS  responsive data views included
PASS  central Spanish status dictionary exists
PASS  Badge translates API enum labels for presentation
PASS  Workflow Engine removed from visible copy
PASS  Order-to-Cash loading/error copy localized
PASS  Marketing modal eyebrow localized

Visual Standardization v12.3.0: 12 PASS / 0 FAIL

=== Switch standardization ===
PASS  Switch compartido usa 52px MD3 de ancho
PASS  Switch compartido usa 32px MD3 de alto
PASS  Thumb activo usa 24px MD3
PASS  Recorrido del thumb es 20px MD3
PASS  Mantiene role switch accesible
PASS  Mantiene aria-checked
PASS  Token global de ancho MD3
PASS  Token global de alto MD3
PASS  Fallback global role=switch
PASS  Hover no cambia tamaño/posición

10 PASS / 0 FAIL

=== Final hardening ===

Final Hardening Audit — v12.1.0 RC1
====================================
PASS  Mutating endpoints have explicit permission/scope/self-service guard
PASS  Company mutations use explicit permissions
PASS  Notification self-service mutations have explicit guard
PASS  Role list is tenant-aware
PASS  Role update verifies tenant ownership
PASS  Warehouse tenant boundary is explicit
PASS  React pages use route-level lazy loading
PASS  Routes have Suspense fallback
PASS  Vite uses manualChunks
PASS  React vendor chunk configured
PASS  Contract validation coverage remains >= 75%

Mutating endpoints: 221
Explicitly protected: 221 (100%)
Schema-validated nearby: 179 (81%)
11 PASS / 0 FAIL

=== Transactional integrity ===

Transactional Integrity Audit — v11.0.0
=======================================
PASS  Serializable isolation is enforced
PASS  P2034 write conflicts retry
PASS  Postgres serialization/deadlock conflicts retry
PASS  Retries are bounded
PASS  Jittered exponential backoff exists
PASS  Exhausted conflict becomes HTTP 409
PASS  Global handler exposes safe operational conflict
PASS  At least 15 transactional routes hardened
PASS  No legacy direct callback transactions remain in routes
PASS  Treasury sequence accepts transaction client
PASS  Treasury MOV sequence is transaction-local
PASS  Treasury transfer sequence is transaction-local
PASS  Sales delivery sequence is transaction-local
PASS  Idempotency model preserved
PASS  SequenceCounter preserved
PASS  Integration event dedup preserved
PASS  No Prisma schema changes required
PASS  No destructive reset introduced

Hardened route files: 15
Legacy direct transaction callbacks: 0
18 PASS / 0 FAIL

Release Candidate v13.0.0 RC1: 7/8 suites PASS
```
