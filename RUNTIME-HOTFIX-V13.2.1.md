# BuzzBee ERP · Runtime Hotfix v13.2.1

Este hotfix corrige los tres pendientes observados en el QA integral del entorno Windows:

1. **RR. HH. runtime**: monta `hrClientRouter` en `/api/hr-client`, habilitando `/dashboard` y `/payroll-preview`.
2. **Tabs sin duplicados**: el source limpio no contiene `HrClientCenter.jsx` ni `HrClientCenter.module.css`; además `npm run fix:runtime` elimina esos archivos si el hotfix se aplica encima de una copia anterior.
3. **Administración/Finanzas runtime**: `npm run fix:runtime` regenera Prisma y ejecuta `db:sync`, alineando PostgreSQL con el modelo `AgendaEvent` usado por el Centro Administrativo.

También se mejoró `qa:all:full` para mostrar el error útil de una suite runtime y no terminar mostrando sólo `Node.js v...`.

## Aplicación recomendada

```powershell
npm install
npm run fix:runtime
npm run dev
```

En otra terminal, con API y PostgreSQL arriba:

```powershell
npm run qa:all:full
```

Objetivo: **58/58 PASS**.
