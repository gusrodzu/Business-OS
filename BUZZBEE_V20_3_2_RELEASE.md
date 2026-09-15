# BuzzBee Business OS v20.3.2 — UAT Consolidated

- Demo Administrator unificado con MotorNorte Refacciones.
- UAT consolidado para P2P, O2C, POS, Inventario, Finanzas, RRHH, CRM, Proyectos, Producción, Marketing, Offline y multiempresa.
- `npm run uat:all` ejecuta todos los checks disponibles de una sola vez.
- `npm run dev` corregido para Windows + Node.js 24 evitando `spawn EINVAL`.
- `.env` y respaldos con secretos eliminados del paquete; se incluye `apps/api/.env.example`.
- `security:audit` agregado; no aplica upgrades forzados automáticamente.
- Release audit ampliado con Demo Unified y Offline Full Business.

## Ejecución

1. Copiar `apps/api/.env.example` a `apps/api/.env` y ajustar secretos.
2. `npm install`
3. `npm run db:generate`
4. `npm run db:status`
5. `npm run dev`
6. En otra terminal: `npm run uat:all`
7. `npm run release:audit`
8. `npm run security:audit`
