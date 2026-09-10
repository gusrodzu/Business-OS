# BuzzBee ERP v17.4.1 — Offline Actor Hotfix

Corrige referencias de actor/usuario faltantes en datos offline, especialmente en Ventas.

## Cambios
- `/sales-enterprise/dashboard`: cada actividad garantiza `createdBy`.
- UI de Ventas usa fallback seguro para `createdBy.firstName/lastName`.
- Se endurecieron referencias equivalentes en Finanzas, Proyectos, Sales Fulfillment y compatibilidad.
- La cuenta offline sigue sin depender del backend.
