# BuzzBee v17.2.1 — Offline Demo Date Hotfix

Corrige el error `Invalid time value` al abrir la Demo Local sin backend.

## Causa
El Home esperaba `monthlyPurchases` con `year` y `month` numéricos, mientras el fixture frontend-only enviaba una fecha completa en `month`. La construcción `Date.UTC(item.year, item.month - 1, 1)` generaba `Invalid Date`.

## Cambios
- Fixtures mensuales alineados con el contrato real del Dashboard.
- `safeDate()` evita que una fecha inválida tumbe toda la pantalla.
- Normalización `purchaseMonthDate()`.
- Datos auxiliares del Home (`criticalProducts`, `agenda`, `categorySpend`) incluidos en la demo offline.
- QA: `npm run qa:offline-demo:dates`.
