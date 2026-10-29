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

## Incremento 2 · Modelo persistente aditivo (código disponible, despliegue pendiente)

El esquema Prisma y la migración `20261029183000_platform_implementation_lifecycle` introducen una estructura **sin datos iniciales, sin asignar empresas existentes y sin acciones de provisión**:

- `PlatformImplementation` representa una iniciativa de implementación. `kind=PROSPECT|REGISTERED_TENANT` evita confundir prospectos con tenants; no existe `DEMO_LOCAL` como tipo admisible de registro real.
- `stage=LEAD|CONFIGURATION|TESTING|ACTIVE|PAUSED|CANCELLED` es independiente de `Company.active` y `SubscriptionStatus`.
- `companyId` es opcional, único y con clave foránea `ON DELETE SET NULL` para no perder el historial del proyecto si desaparece un tenant. **Ningún ID de demo se vincula automáticamente**.
- `contactEmail`, `industryKey`, `scianCode`, `requestedModuleKeys`, `planKey`, `ownerUserId`, fechas y notas son datos de *planificación*, nunca permisos efectivos ni cambios de licencias.
- `PlatformImplementationEvent` prepara un historial independiente y retenido (`ON DELETE RESTRICT`) de cambios de etapa: etapa anterior/nueva, actor autenticado, motivo y fecha. El escritor futuro deberá insertar etapa y evento en una sola transacción.
- `implementationLifecycle.js` expresa transiciones permitidas, condiciones básicas y bloquea la activación directa. **No es una autorización** ni sustituye verificación server-side de MFA, evidencia UAT, aislamiento, plan y consentimiento.

**Estado actual:** la migración y modelos están versionados, pero todavía **no se han aplicado a la base de producción**, y no hay endpoints que creen/editen estos registros. El registro sigue sin ser utilizable desde el panel de Super Admin. Esta separación es deliberada para revisar integridad, privacidad, compatibilidad de esquema y auditoría antes de exponer operaciones.

### Secuencia de despliegue controlado

1. Revisar migración SQL aditiva y mantener respaldos de PostgreSQL verificados, ventanas y rollback operativo. La migración no borra ni actualiza tablas existentes; **no ejecutar** `prisma db push --accept-data-loss` en producción.
2. Validar `npx prisma validate`, `prisma generate`, pruebas contractuales y una aplicación real de `prisma migrate deploy` en base efímera/sandbox. No interpretar `db push` del smoke QA como prueba de migración.
3. Sólo tras aprobar el despliegue de la migración, permitir endpoints protegidos que requieran sesión de plataforma con MFA y `platform.manage`; para cualquier mutación, reautenticación reciente, idempotencia, validación estricta y auditoría atómica. Nunca confiar en `companyId` ni banderas de QA enviadas por el navegador.
4. Probar con usuario plataforma autorizado, usuario ERP, Demo LIVE y dos tenants distintos para verificar `403`, no filtración y que los datos transaccionales sigan aislados.
5. Añadir UI operativa después, con estados explícitos y confirmaciones; activar empresas o licencias seguirá siendo otro flujo autorizado.

La prueba del modelo es `npm run platform:implementation:lifecycle:audit`; forma parte del Frontend QA para impedir usos accidentales mientras se integra el siguiente incremento.

## Incremento 3 · API de prospectos (habilitación explícita y segura)

La API de la plataforma añade `/api/platform-admin/implementation-records` bajo el router de plataforma:

| Operación | Endpoint | Contrato |
|---|---|---|
| Listar registros | `GET /` | Sólo Super Admin con MFA y `platform.manage`, hasta 100 registros por consulta |
| Ver registro/historial | `GET /:id` | Sólo plataforma, sin autorización ERP ni cambio de tenant |
| Registrar prospecto | `POST /` | Reautenticación reciente (<10 min), Zod estricto y encabezado `idempotency-key` UUID. Siempre `kind=PROSPECT`, `stage=LEAD`, sin empresa vinculada |
| Cambiar etapa segura | `PATCH /:id/stage` | Reautenticación reciente y motivo; sólo `CONFIGURATION`, `PAUSED` o `CANCELLED` conforme a la matriz legal. `TESTING` y `ACTIVE` bloqueados |

**Desactivado por defecto:** la variable `PLATFORM_IMPLEMENTATIONS_ENABLED` debe ser **exactamente** `true`. En cualquier otro valor todos los endpoints devuelven `503 IMPLEMENTATIONS_NOT_ENABLED` antes de consultar las tablas nuevas. No habilitar hasta demostrar `prisma migrate deploy` ejecutado y verificado en el entorno objetivo. Sin esta habilitación, el panel de solo lectura ya existente sigue funcionando como antes.

**Idempotencia y seguridad:** se añade `requestKey String? @unique` mediante migración aditiva `20261029190000_platform_implementation_idempotency`. La creación realiza registro de prospecto, evento inicial y fila de auditoría dentro de la **misma transacción**. Repetir la misma clave con el mismo contenido responde con el recurso anterior; la clave usada con otros datos produce `409`. Los cambios de etapa exigen coincidencia del estado previo y crean evento+auditoría en una transacción; los conflictos concurrentes fallan con `409`.

Los registros almacenan datos de contacto comercial: aplicar política de retención y acceso a datos personales antes de producción. **No** hay creación de `Company`, usuarios, licencias ni módulos habilitados, no se ingresa a un tenant y no se migra información de Demo Local. Se aprovecha el guard CSRF de origen global del API. El backend nunca acepta un `companyId` en la creación de un prospecto.

**Validaciones:**
- `npm run platform:implementation:records:audit` comprueba rutas protegidas, bandera de habilitación, campos Zod, idempotencia, auditoría y restricciones de etapa.
- `Prisma Database Smoke QA` migra una DB PostgreSQL 17 desechable y ejercita creación idempotente/actualización de etapa con historial real.
- Las pruebas estáticas de API no equivalen a UAT autenticado sobre el dominio de producción; verificar explicitamente permisos, MFA, reautenticación, CSRF y headers de sesión antes de habilitar.

**Siguiente fase:** UI de registro de prospectos en Super Admin, una vez verificada la migración y habilitación del entorno. El paso `TESTING` requiere futura verificación servidor de tenant real y aislamiento; `ACTIVE` exige UAT, licencia y aceptación formal. Nunca permitir a la UI declarar esos requisitos por sí misma.

## Próximos incrementos

1. Definir modelo persistido de onboarding fuera de `Company` y migración segura; revisar autorización, transiciones, auditoría y política de datos.
2. Endpoint específico de creación/edición para **registros de implementación**, no para tenants, protegido por sesión Super Admin y permisos granulares, pruebas con cuerpos inválidos y CSRF.
3. Detalle por empresa con módulos realmente habilitados y políticas de plan, no sólo conteos; dashboard real siempre consulta API tenant-scoped y aplica permisos backend.
4. Flujo de provisión idempotente y explícitamente autorizado, sin exponer compañías de clientes entre sí.
5. QA web/móvil WCAG 2.2 AA, no regresión del cliente ERP, UAT por giro, aislamiento intertenant y deploy Production READY verificado.

Esta etapa se vincula al [issue #206](https://github.com/gusrodzu/Business-OS/issues/206) y al [roadmap #73](https://github.com/gusrodzu/Business-OS/issues/73).
