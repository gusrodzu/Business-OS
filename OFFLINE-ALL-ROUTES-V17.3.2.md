# BuzzBee v17.3.2 — Offline All Routes

Objetivo: que la sesión `admin@erp.local` pueda consultar el ERP sin API, PostgreSQL ni workers, tanto en Vite local como en Vercel.

## Alcance auditado

- 64 registros de ruta detectados incluyendo rutas de módulo, redirects y placeholders/wildcards.
- 54 URLs ERP canónicas comprobadas explícitamente.
- 57 componentes enrutados resuelven a archivos existentes.
- 152 plantillas de endpoints `apiRequest()` de componentes enrutados resuelven mediante `offlineDemoRequest()`.
- 71 colecciones usadas con `.length`, `.map`, `.filter`, `.reduce`, `.find`, etc. están garantizadas en el contrato offline.
- No hay `fetch()` ni `axios.*` directos en componentes ERP enrutados.
- Vercel mantiene rewrite SPA a `/index.html` para deep links.
- `BrowserRouter` + registry modular mantienen navegación local con Vite.

## Correcciones adicionales

Se agregaron defaults offline para colecciones que aún podían quedar indefinidas, incluyendo `budgets`, `recentMovements`, `actionItems`, `attention`, `demoStory`, `salesInvoices`, `timeline`, `payables`, `providers`, `queue`, `triggerEvents`, `actionTypes` y `approvalWorkflows`.

También se agregaron contratos específicos para Presupuestos, Flujo de efectivo, Reporte ejecutivo, catálogos de Flow/Integraciones, Master Data, Order-to-Cash y otros endpoints secundarios.

## Seguridad

La Demo Offline es tenant/ERP y no habilita el Control Plane. `/admin-saas` y la sesión de plataforma quedan deliberadamente fuera de este modo.

## QA

Ejecutar:

```powershell
npm run qa:offline-all-routes
npm run qa:offline-routes
npm run qa:offline-core-routes
npm run qa:offline-demo:shape
npm run qa:offline-demo:dates
npm run build
```

Para prueba real de aislamiento, detener la API y ejecutar sólo:

```powershell
npm run dev:web
```

Ingresar con `admin@erp.local` y navegar/refrescar rutas directas.
