# Migración controlada Prisma 7.10.1 — Business OS

## Cambios

Prisma CLI/client pasan de 6.15.0 a **7.10.1**, con `@prisma/adapter-pg` y `pg`. Se mantiene el generador legacy `prisma-client-js` durante esta etapa para preservar los imports JavaScript `@prisma/client`. Prisma 7 exige adapter al construir un cliente; la implementación central está en `apps/api/src/lib/prisma.js`.

El URL del datasource ya no reside en `schema.prisma`: está en `apps/api/prisma.config.mjs`. La CLI usa `DIRECT_DATABASE_URL` cuando se configura; el runtime requiere `DATABASE_URL`. El constructor rechaza URL de proveedores que no son PostgreSQL TCP.

## Verificación obligatoria antes de desplegar

1. Crear y verificar respaldo `.dump` y procedimiento de recuperación.
2. Probar `npm ci`, `npm --workspace @erp/api run db:generate`, `npm run build` y el QA completo.
3. Ejecutar `Prisma Database Smoke QA` (PostgreSQL 17 efímero, `prisma validate`, `prisma generate`, `prisma db push`, CRUD reversible). **Nunca ejecutar `db push --accept-data-loss` en producción**.
4. Validar `prisma migrate status` contra una **copia aislada** de la base real y confirmar que las migraciones antiguas son compatibles. No se ejecutaron migraciones contra el ERP real.
5. Probar API autenticada, transacciones, compras, ventas, inventario, facturación, tenant isolation y seeds en esa copia antes de liberar.
6. Revisar comportamiento del pool `pg`, conexiones TLS, proxy y variables de entorno en Render/Neon o hosting final.

### Comandos locales de solo lectura

```powershell
npm ci
npm --workspace @erp/api run db:generate
npm run lint --workspace apps/web
npm run build --workspace apps/web
npm run uat:offline
npm audit --omit=dev
```

No usar `db:deploy`, `db:seed`, `db:seed:demo` ni `db push` sobre la base de producción sin ventana de cambios y plan de recuperación.

## Estado

La migración no tiene aprobación de liberación a producción hasta completar las comprobaciones sobre una copia del entorno. El QA de PostgreSQL 17 en GitHub Actions demuestra compatibilidad básica de esquema y acceso, no cubre exhaustivamente la aplicación.

## QA de dependencia regenerada

El lockfile de Prisma 7.10.1 fue reconstruido a partir de `main` con SheetJS 0.20.3 ya instalado. El chequeo completo de PostgreSQL 17 y el QA web deben aprobar en el último commit del PR antes de fusionarlo. No usar este candidato en producción sin pruebas de migraciones y flujos empresariales en copia aislada.
