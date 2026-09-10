# BuzzBee v17.3.0 — Offline Route Hardening

Objetivo: que la cuenta `admin@erp.local` pueda recorrer todas las rutas ERP en un deploy frontend-only (Vercel) sin API, PostgreSQL ni workers.

Cambios principales:
- normalización de colecciones top-level y anidadas para evitar `.length`, `.map`, `.filter` o `.reduce` sobre `undefined`;
- contrato específico de `/approvals/dashboard` (`workflows`, `requests`, `inbox`, `requestedByMe`, `summary`);
- defaults para dashboards de Producción, POS, Marketing, Módulos, Billing, Integraciones, Intelligence, Proyectos y otros;
- QA `npm run qa:offline-routes` que recorre los endpoints principales y verifica que ningún módulo haga `fetch`/axios directo saltándose `apiRequest`;
- validación de rewrite SPA de Vercel.

La Demo Local sigue siendo explícitamente frontend-only. No usa `VITE_API_URL` mientras la sesión tenga `offlineDemo: true`.
