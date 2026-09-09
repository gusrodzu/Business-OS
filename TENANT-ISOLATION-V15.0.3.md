# BuzzBee ERP v15.0.3 — Tenant Isolation Hardening

## Objetivo
Ningún usuario ERP puede leer, modificar o administrar información de otra empresa. Las cuentas Super Admin pertenecen a la plataforma y no a un tenant.

## Cambios
- `User.companyId` pasa a ser nullable para cuentas de plataforma.
- Super Admin SaaS se desacopla de cualquier `Company` (`companyId = null`).
- Al promover una cuenta a Super Admin se eliminan sus roles ERP y se revocan sesiones anteriores.
- Las sesiones `platform` son rechazadas por las APIs tenant.
- Las sesiones `erp` no pueden entrar al Control Plane.
- `/api/admin/users` excluye por defensa en profundidad cualquier cuenta con `platform.manage`.
- `platform.manage` y el rol Super Admin no se exponen ni se pueden asignar desde Administración de una empresa.
- Auditor multiempresa actualizado para la arquitectura modular v15: inspecciona 53 archivos API protegidos y exige scoping de tenant.
- QA específico estático y runtime para intentos de acceso cruzado.

## Actualización obligatoria
```powershell
npm install
npm run db:generate
npm run db:sync
npm run fix:tenant-isolation
```

Esto desacopla de su empresa actual todas las cuentas que tengan `platform.manage` y revoca sus sesiones. Después debes volver a iniciar sesión en `/admin-login`.

Atajo:
```powershell
npm run fix:tenant-isolation:all
```

## QA
```powershell
npm run qa:tenant-isolation
npm run qa:all
npm run qa:modular-all
```

Con API y PostgreSQL activos:
```powershell
npm run qa:tenant-isolation:runtime
```
