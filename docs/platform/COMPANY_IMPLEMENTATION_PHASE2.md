# Business OS · Empresas e implementación (fase 2)

## Separación de dominios

- **Demo Local**: catálogo visual ficticio `/demo/empresas` y dashboards simulados por giro. Se guarda sólo en el navegador. No es un cliente, tenant ni licencia.
- **Super Admin / plataforma**: consulta autorizada de empresas reales mediante `GET /platform-admin/companies`, protegida por `requirePlatformAuth`, `requirePlatformSession` y `platform.manage`. No es una sesión ERP.
- **ERP de cada empresa**: datos transaccionales aislados por `companyId` derivado exclusivamente de la identidad autenticada en el backend. No usar `companyId` provisto por el frontend como permiso.
- **ERP a medida del cliente actual**: conservar la entrega independiente del roadmap SaaS. No convertir su dataset ni sus credenciales en prospecto.

## Incremento 1 · Señales de preparación en Super Admin

En `/admin-saas?tab=companies`, el componente `CompanyReadinessBoard` presenta *exclusivamente* empresas existentes que devuelve la API protegida de plataforma; sin rutas de creación, escritura ni cambio de tenant. Las cuatro señales son de cobertura de configuración:

| Señal | Fuente existente | Qué **no** significa |
|---|---|---|
| Giro registrado | `Company.industry` | No valida catálogo SCIAN ni flujos verticales |
| Plan registrado | `CompanySubscription.plan.name` | No certifica pago, vigencia o autorización |
| Usuarios vinculados | `Company._count.users` | No certifica roles, MFA o acceso efectivo |
| Módulos vinculados | `Company._count.enabledModules` | No certifica módulo habilitado, licencia o feature flags |

`0–4 elementos documentados` es una **lectura de configuración**, no un estado persistido de onboarding, no un Health Score y no un criterio de activación comercial. `Company.active` y `CompanySubscription.status` son estados existentes de otros dominios y no deben reinterpretarse como fase de implementación.

## Contrato propuesto para el ciclo de implementación (aún no persistido)

**Prospecto → Configuración → Pruebas → Activo**, con estados adicionales `Pausado` y `Cancelado` cuando estén justificados. Este ciclo requiere un registro **separado** de `Company.active` y `SubscriptionStatus`. Una futura estructura debe contar al menos con:

- Identificador, nombre, contacto autorizado y categoría: oportunidad comercial / tenant existente / Demo Local, sin colapsar categorías.
- Giro principal y SCIAN, secundarias, necesidades, módulos solicitados vs. módulos efectivamente permitidos, plan, fechas objetivo y responsables.
- Estado onboarding, marcas de tiempo, último actor, notas/adjuntos permitidos y evidencia de QA.
- Asociación opcional a `Company.id` cuando exista realmente un tenant, con índice único para evitar duplicados.
- Registro de auditoría de transiciones y mecanismos de cancelación/reversión para acciones de aprovisionamiento.

| Transición | Requisitos mínimos antes de habilitarla |
|---|---|
| Prospecto → Configuración | Datos de contacto validados, autorización de uso y responsable |
| Configuración → Pruebas | Tenant creado mediante flujo autorizado, usuarios y permisos mínimos, separación de datos verificada |
| Pruebas → Activo | UAT por giro, pruebas intertenant, billing/licencia, MFA/roles y aceptación documentada |
| Pausado / Cancelado | Justificación, auditoría y bloqueo de acciones no permitidas |

**No realizar migraciones ni acciones de provisión sólo por construir el panel**. Diseñar primero flujo, permisos, idempotencia, logs, migración reversible y pruebas. Solicitar revisión de seguridad para endpoints y acciones que puedan cambiar cuentas reales.

## Próximos incrementos

1. Definir modelo persistido de onboarding fuera de `Company` y migración segura; revisar autorización, transiciones, auditoría y política de datos.
2. Endpoint específico de creación/edición para **registros de implementación**, no para tenants, protegido por sesión Super Admin y permisos granulares, pruebas con cuerpos inválidos y CSRF.
3. Detalle por empresa con módulos realmente habilitados y políticas de plan, no sólo conteos; dashboard real siempre consulta API tenant-scoped y aplica permisos backend.
4. Flujo de provisión idempotente y explícitamente autorizado, sin exponer compañías de clientes entre sí.
5. QA web/móvil WCAG 2.2 AA, no regresión del cliente ERP, UAT por giro, aislamiento intertenant y deploy Production READY verificado.

Esta etapa se vincula al [issue #206](https://github.com/gusrodzu/Business-OS/issues/206) y al [roadmap #73](https://github.com/gusrodzu/Business-OS/issues/73).
