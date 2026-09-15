# BuzzBee Business OS v20.3.0 — Runtime Stable Foundation

## Objetivo
Convertir la entrega v20.2.0, ya consolidada visual y arquitectónicamente, en una base operable de forma uniforme desde la raíz para UAT LIVE y Demo Offline.

## Cambios aplicados
- Versiones root, WEB y API alineadas en `20.3.0`.
- `APP_VERSION` de API corregido a `20.3.0` (estaba rezagado en `19.2.0`).
- `npm run dev` inicia API y WEB simultáneamente.
- Aliases raíz restaurados para API, WEB, Prisma, migraciones y seeds.
- `npm run runtime:audit`: puerta estática de runtime.
- `npm run runtime:health`: health/readiness real de API + PostgreSQL.
- `npm run release:audit`: Fluid + Architecture + Runtime.
- Demo Offline universal y dataset MotorNorte preservados sin regresiones intencionales.

## Puerta UAT LIVE
Con PostgreSQL activo:

```powershell
npm run db:generate
npm run db:status
npm run db:migrate
npm run db:seed:demo
npm run db:seed:demo-company
npm run dev
```

En otra terminal:

```powershell
npm run runtime:health
npm run release:audit
```

Después validar en UI: Login → P2P → O2C → POS → Inventario → Finanzas → CRM → RRHH → Proyectos → Producción → Marketing/Reportes/Configuración → roles/tenant/Super Admin → Demo Offline.

## Criterio de cierre
`v20.3.0 Runtime Stable` se considera cerrado cuando el runtime LIVE y los flujos críticos UAT quedan en 0 FAIL. Los cambios de esta entrega preparan y auditan esa ejecución; no sustituyen la prueba contra tu PostgreSQL local/producción.
