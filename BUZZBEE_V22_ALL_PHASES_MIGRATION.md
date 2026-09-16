# BuzzBee v22.0.0 — Domain migration

Migración conjunta de las fases restantes de frontend hacia fronteras de dominio React + CSS Modules.

## Dominios
Sales, Procurement, Inventory, POS, CRM/Marketing, Finance, HR, Projects, Production, Settings, Operations/Reports y Platform ahora disponen de frontera de transporte, hook async base e index público.

## Regla
Las páginas dentro de `modules/*/ui` ya no deben importar `src/api.js` directamente. El acceso LIVE/OFFLINE continúa pasando por `apiRequest`, pero exclusivamente detrás de `services/<domain>Api.js`, preservando el adaptador offline existente.

## Gates
- `npm run architecture:domains`
- `npm run architecture:v22`
- `npm run launch:audit`
- `npm run uat:all`

## Alcance
Esta entrega completa la frontera arquitectónica de los dominios. No afirma que cada pantalla grande haya sido subdividida totalmente en componentes/hooks de feature; esa optimización puede hacerse incrementalmente sin volver a acoplar UI y transporte.

## Validación ejecutada
- Domain Boundary Audit: 12/12 dominios PASS; 67 JSX; 0 imports directos de transporte.
- React/CSS Modules audit: PASS.
- Phase 2 Design System/Shell: 8/8 PASS.
- Sales, Procurement, Inventory regression gates: PASS.
- Launch Readiness: 22/22 PASS.
- Offline UAT: 483 assertions PASS.
- Tenant isolation: 54/54 rutas, 100% PASS.
- Build: NO CERTIFICADO en este entorno (`vite: not found`, dependencias no instaladas).
