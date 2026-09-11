
## 17.5.3 — Indexed Sections Polish
- Corrige selector lateral de Proyectos.
- Mejora tabla de Facturas de proveedor y fallback de estados.
- Corrige espaciado de Resumen de operación.
- Refina Smart Import / Origen y estrategia.
- Ajusta contrato semántico global de filas para no sobreescribir padding/radius de módulos.
## 17.4.4 — Projects Layout & Data Hotfix
- Corrige métricas offline de Proyectos (`tasksDone`, `tasksTotal`, `overdueTasks`, `laborHours`, `actualCost`).
- Evita `undefined / undefined` en Avance del proyecto.
- Corrige cards/listado de proyectos para que no hereden geometría pill de botones globales.
- Evita stretch vertical de cards en el portafolio y mejora grid/responsive.


## 17.4.2 — Offline Collections Hotfix
- Endurece `/ventas/cobranza` en Demo Offline.
- Añade fixtures completos de cartera, cuentas y pagos.
- Registro de cobros simulado y persistente en localStorage.
- Agrega `qa:offline-collections`.
## 17.4.1 — Offline Actor Hotfix
- Corrige crash de `/ventas` por `createdBy.firstName` indefinido en actividad comercial offline.
- Normaliza actores offline y endurece referencias `createdBy` en UI.

## 17.3.1 — Offline Core Routes

- Fix Demo Offline: Ventas, Proyectos, Marketing y Configuración/Actividad.
- Contratos de respuesta específicos para evitar `.length`, `.map`, `.filter` sobre `undefined`.
- Nuevo `qa:offline-core-routes`.

# v17.2.3 — Offline Demo Array Hotfix

- Corrige `Cannot read properties of undefined (reading 'length')` en la Demo Local.
- Normaliza colecciones faltantes y estructuras anidadas de RR. HH., Proyectos, Billing y expedientes.
- Mantiene la demo 100% frontend-only.

## 17.2.1 — Offline Demo Date Hotfix
- Corrige `Invalid time value` en Home de Demo Local.
- Endurece parsing de fechas del dashboard.
- Alinea fixtures mensuales frontend-only.

# v17.2.0 — Offline Frontend Demo

- `admin@erp.local` funciona sin backend.
- Login, sesión y logout locales para esta cuenta.
- `apiRequest` usa fixtures locales y nunca contacta `VITE_API_URL` en modo offline.
- Fixtures para dashboards y módulos principales.
- Banner visible `DEMO LOCAL`.

# v17.0.2 — Dashboard Workspace Layout

- Dashboard canvases ahora ocupan el ancho completo como Inicio.
- AppShell mantiene el único scrollbar vertical de página.
- Supporting rail corregido: ya no comprime Aplicaciones/Agenda.
- Scroll local reservado a widgets acotados y scroll horizontal a tablas/kanban.

# v17.0.1 — Unified Scroll Layout

- Standardized AppShell content as the single vertical page scroll owner.
- Removed page-level nested vertical viewports from module roots.
- Restricted tables and kanban boards to horizontal scrolling.
- Added subtle consistent Workspace scrollbar styling.
- Added `qa:unified-scroll`.

# v17.0.0 — Workspace UI

- Nueva dirección visual limpia tipo Workspace/Drive con identidad BuzzBee.
- Sidebar, Topbar, ModuleTabBar, AppShell y Right Rail reescritos sin cadenas históricas de overrides.
- Right rail colapsable y tool strip vertical.
- Banner inferior persistente eliminado.
- Cards, KPI, tablas y formularios simplificados mediante `workspace.css`.
- Sin cambios de base de datos.

# v16.1.0 — Global UI Standardization

- Canonical typography, spacing, sizing and layout tokens.
- Unified controls, forms, cards/KPI, tabs, tables and legacy dialog/drawer compatibility.
- Added shared Textarea component.
- Removed module-global.css and modal-format-v9.4.css from runtime cascade.
- Reduced globals.css to reset-only responsibilities.
- Added `qa:ui-standard-global`.

# 16.0.2 — Table CSS Cleanup

- Limpieza de CSS global legacy que duplicaba reglas visuales.
- Platform Admin migrado a `DataTable` MD3 compartido.
- Reglas de tabla encapsuladas por componente.

# BuzzBee ERP v16.0.1 — CSS Build Hotfix

- Corrige secuencias literales `\n` introducidas en CSS durante el rollout MD3.
- Archivos corregidos: `AppShell.module.css`, `Topbar.module.css`, `ModuleTabBar.module.css`, `PlatformShell.module.css`.
- Evita errores PostCSS `Unknown word \n` en `vite build`.
- Sin cambios de base de datos ni lógica de negocio.

# v16.0.0 — Material Design 3 Full Rollout

- Fases 2–7 de MD3 completadas a nivel de Design System y shells.
- Nuevos Chip, Tabs, Dialog, Drawer, Snackbar y DataTable.
- Navegación ERP y Platform migrada a roles MD3.
- Contrato visual global por módulo mediante `data-md3-module`.
- Dark mode y accessibility QA reforzados.

# v15.0.6 — Demo LIVE UI & Layout Hotfix

- Corrige grid del AppShell cuando existe la barra Demo LIVE.
- Evita tabs/títulos superpuestos en Ventas, Inventario y RR. HH.
- Corrige el espacio vertical excesivo en Finanzas.
- Reemplaza `/configuracion` placeholder por un hub real de configuración.
- Sincroniza el rol Demo Administrator con permisos tenant actuales, excluyendo plataforma.
- Agrega `qa:demo-live-ui`.


## v15.0.5 — Super Admin Entry Selector
- Pantalla post-MFA `/platform-entry` con opciones Demo LIVE y Panel Super Admin.
- Sesión Demo LIVE temporal y aislada usando BuzzBee Demo Company.
- Retorno seguro al contexto Super Admin desde el ERP demo.
- Banner persistente de Demo LIVE.
- Nuevo QA `qa:platform-entry` 12/12.
- QA integral 47/47.
# v15.0.4 — Unified Login Auto Detection

- Single `/login` for ERP and Super Admin accounts.
- Backend decides session type from permissions; client cannot select context.
- Super Admin MFA continues automatically after credentials.
- `/admin-login` is now a compatibility redirect only.
- Tenant isolation and platform/ERP session separation remain enforced.

# v14.1.0 — Procurement Reference Module

- Migración física de Compras/P2P al dominio `modules/procurement`.
- Routers, flujo de compras y pantallas ahora tienen ownership modular canónico.
- Se mantienen shims de compatibilidad en rutas/servicios/pages legacy para evitar regresiones.
- Se agregan contratos de dominio y estructura application/domain/infrastructure/tests.
- Compras queda como plantilla para migrar Inventario, Finanzas, RRHH y demás dominios.

# v13.2.1 — QA integral y permisos de Agenda

- Nuevo `npm run qa:all` para ejecutar en una sola pasada el QA canónico de Base, Flujos, Plataforma, UX/UI, roles 100/100 y Release.
- Resultado estático: 47/47 suites PASS.
- Nuevo `npm run qa:all:full` para sumar checks runtime cuando API/PostgreSQL están activos.
- Agenda protegida con `agenda.read` y `agenda.manage`; cobertura de mutaciones 221/221 (100%).
- Permisos de Agenda agregados al seed.
- Elimina `HrClientCenter` legacy sin ruta/import.
- Auditores históricos de versión y RRHH adaptados a la arquitectura central actual.
- Versión root/API/web/health alineada a 13.2.1.
- Reportes QA generados en `artifacts/qa`.

# v13.2.0 — Administración 100/100

- Centro Administrativo convertido en bandeja operativa transversal.
- Score de salud administrativa 0–100.
- Capital de trabajo y ejecución presupuestal mensual.
- Cola unificada para pagos, cobranza, aprobaciones, compras, documentos y nómina.
- Semáforo de procesos críticos con drill-down.
- Agenda de próximos 7 días y notificaciones integradas.
- Actividad reciente conectada a AuditLog para trazabilidad.
- Responsive reforzado y textos largos sin recorte.
- Nuevo QA `npm run qa:administration` con 24 checks.
- Sin cambios de Prisma ni migraciones.

# v13.1.0 — Dirección 100/100

- Reporte ejecutivo conectado a Ventas, Cobranza, Tesorería, Presupuestos y Aprobaciones.
- Comparación automática contra periodo anterior equivalente.
- Saldos CxC/CxP reconstruidos al cierre con pagos históricos.
- Nuevo score de salud del negocio y decisiones priorizadas.
- Drill-down desde KPIs y alertas hacia módulos de origen.
- Evolución mensual con ventas, cobranza, compras y nómina.
- Exportación CSV ejecutiva ampliada.
- `KpiCard` incorpora interacción accesible por teclado para navegación ejecutiva.
- Nuevo QA `npm run qa:direction` con 22 checks.

## v13.0.5 — Global table visibility standard
- Corrige columnas cortadas en `Capital humano por área` y tablas equivalentes.
- Elimina el `min-width: 680px` indiscriminado heredado en tablas compactas.
- Estandariza wrapping de encabezados, celdas y contenidos.
- Tablas de 5+ columnas usan scroll horizontal en pantallas pequeñas.
- Refuerza `DataTableFrame` con hooks estables de layout.
- Agrega `npm run qa:tables`.

# v13.0.4 — Agenda central operativa

- Agrega `/agenda` con vistas Mes y Semana.
- Eventos manuales persistentes con responsable, prioridad, estado y recordatorio.
- Worker de recordatorios conectado a notificaciones reales.
- Topbar consume notificaciones del sistema y elimina ejemplos hardcodeados.
- El rail derecho mantiene Agenda debajo de Aplicaciones y enlaza a la vista completa.
- Prisma: agrega `AgendaEvent`, `AgendaEventPriority` y `AgendaEventStatus`.

# v13.0.1 RC1.1 — Core SaaS Runtime Fix

- Unifica la versión reportada por `/api/health`, `/api/ready`, Billing e Integration Hub mediante `APP_VERSION`.
- Corrige el QA `qa:core-saas` para validar una versión presente y alineada en vez de exigir v10.3.0.
- Corrige el dashboard de Integration Hub usando selección explícita de campos compatibles de `IntegrationEventLog`, evitando errores 500 cuando una base existente aún no contiene los campos de trazabilidad añadidos posteriormente.
- No incluye cambios de Prisma, migraciones ni datos.

## 13.0.0-rc.1 — Integrated Product Hardening
- UX & interaction standardization global.
- Visual/data-view consistency and accessibility polish.
- Expanded es-MX UI normalization and English copy audit.
- Vercel SPA deployment config and deployment audit.
- Consolidated RC static QA runner.
- No Prisma/database changes.

# v12.1.0 RC1 — Final Hardening
- Permisos explícitos en mutaciones pendientes.
- Self-service guard para notificaciones del usuario.
- Company/Branch mutations con permisos explícitos.
- Roles administrativos con validación tenant-aware.
- Route-level React lazy loading.
- Vite manual vendor chunks.
- Sin cambios Prisma.

# v12.0.0 — Production Readiness Suite
- Checkpoints 16–25 agrupados.
- Sin cambios Prisma.

# v11.0.0 — Transactional Integrity
- Serializable transaction guard compartido.
- Retry para conflictos y deadlocks.
- HTTP 409 seguro al agotar reintentos.
- 15+ rutas transaccionales endurecidas.
- Folios críticos ligados al cliente transaccional.
- Sin cambios Prisma.

# v10.9.0 — Complete Sequence Migration
- Migra folios count()+1 restantes a SequenceCounter.
- Unifica MOV de CxP/Cobranza/Tesorería.
- Sin cambios Prisma adicionales.

# v10.8.0 — Integration Reliability
- Deduplicación persistente de eventos por tenant.
- Correlation ID persistente y source request trace.
- Replay controlado de eventos.
- Idempotencia funcional en POST de Public API.
- Métricas históricas de integración/API.
- Health operativo 24h.
- Prisma: campos aditivos en IntegrationEventLog.

# v10.7.0 — Worker Reliability + Event Traceability
- Health de workers y cola.
- Graceful shutdown.
- Correlation ID Evento → Flow → Webhook.
- Sin cambios Prisma.

# v10.6.1 — Admin + Finance Navigation Cleanup
- Administración y Finanzas quedan conceptualmente separados.
- Centro administrativo ya no duplica tabs/rutas de Finanzas.
- /finanzas redirige a su primera ruta canónica.
- Aliases administrativos antiguos redirigen a /finanzas/*.
- Contabilidad mueve sus tabs internas al Topbar.
- Sin cambios Prisma adicionales.

# v10.6.0 — Core Reliability
- Idempotencia persistente para operaciones críticas mediante Idempotency-Key.
- Replays seguros y bloqueo de duplicados concurrentes.
- SequenceCounter atómico para folios de Compras, Tesorería y Flow.
- Telemetría HTTP estructurada con requestId/tenant/user/duración.
- Prisma: dos modelos aditivos, sin resets destructivos.

# v10.5.4 — More Topbar Tabs
- Producción, Marketing, Facturación Fiscal, Proyectos y CRM migran tabs al Topbar.
- ModuleTabBar soporta módulos de una sola ruta.
- Sin cambios Prisma.

# v10.5.3 — All Tabs in Topbar
- ModuleTabs de página se renderiza mediante portal en ModuleTabBar.
- Todas las tabs de navegación quedan en la superficie superior.
- Soporte de segunda fila contextual de tabs locales.
- HrOperations e InventoryOperations migrados de tabs legacy a ModuleTabs.
- Tabs de modales permanecen inline.
- Sin cambios Prisma.

# v10.5.2 — Module Tab Dedup
- Eliminado el segundo tab bar de Compras.
- Eliminado el segundo tab bar de Inventario.
- Eliminado el tab bar route-level duplicado en Order-to-Cash.
- Ventas conserva sólo tabs internos de estado local.
- RRHH conserva Empleados/Departamentos/Puestos y elimina navegación route-level duplicada.
- Eliminado HrClientCenter legacy; /rrhh permanece como redirect.
- Sin cambios Prisma.

# v10.5.1 — Navigation Cleanup
- Eliminadas entradas duplicadas a /inteligencia.
- BuzzBee AI deja de duplicarse como app/menú; permanece como asistente.
- /rrhh redirige a /recursos-humanos.
- /finanzas/clientes redirige a /terceros.
- Eliminadas imports de pantallas legacy duplicadas.
- Command Palette deduplica navegación.
- Sin cambios Prisma.

# v10.5.0 — Global UI Refresh
- Aplicación global de la referencia visual aprobada.
- Sidebar compacto/light.
- Topbar compacto.
- Tabs de módulos alineados y sin solapamientos.
- Workspace, cards, KPI, tablas, formularios y modales unificados.
- BuzzBee AI rail y Power Banner redimensionados.
- Responsive global refinado.
- Sin cambios Prisma.

# v10.4.0 — Tabbed Module Navigation
- Sidebar simplificado a módulos principales.
- Eliminados submenús internos de módulos.
- Nueva navegación contextual por pestañas debajo del Topbar.
- Tabs responsive con scroll horizontal.
- navigation.js sigue siendo la fuente única de rutas.
- Sin cambios Prisma.

# v10.3.0 — Core SaaS Hardening
- Tenant validation DB-backed en JWT.
- Correlation/request IDs globales.
- API key timing-safe + active tenant.
- SSRF hardening de Integration Hub.
- Usage/limits SaaS endpoint.
- SaaS platform status endpoint.
- Auditoría de operaciones de billing.
- Runtime QA read-only.
- Sin cambios Prisma.

# v10.2.0 — Reports + Intelligence + AI Functional QA
- Revenue Intelligence alineado a SalesInvoice/issueDate.
- Compras Intelligence alineadas a PurchaseOrder/orderDate.
- Moneda dinámica en Intelligence.
- Intelligence UI estandarizado a 4 KPI.
- BuzzBee AI agrega contexto POS.
- QA transversal de Reportes, Intelligence y AI.
- Scan Intelligence opt-in y seguro.
- Sin cambios Prisma.

# v10.1.0 — POS Functional QA
- Venta POS integrada con InventoryBalance.
- Kardex SALE_OUT en ventas.
- Anulación POS restaura stock con SALE_RETURN_IN.
- Corrección de doble conteo de efectivo al cerrar caja.
- Bloqueo de productos duplicados en ticket.
- Eventos de bajo stock POS.
- QA E2E terminal → venta → inventario → anulación → cierre.
- Prisma: extensión aditiva SALE_RETURN_IN.

# v10.0.0 — CRM & Business Party Functional QA
- Sincronización automática Customer/Supplier → Business Party.
- Validación de convergencia CUSTOMER + SUPPLIER en una identidad empresarial.
- QA de contactos, direcciones, duplicados, merge y scoring.
- QA de prospectos CRM y atribución Marketing.
- QA read-only por defecto.
- Sin cambios Prisma.

# v9.9.0 — HR Functional QA
- Checkpoint funcional completo de RRHH.
- QA de empleados, asistencia, permisos, incidencias y expedientes.
- Validación de incidencias integradas con cálculo de nómina.
- Validación de reglas CALCULATED → APPROVED → PAID.
- E2E usa fechas históricas aisladas y cancela la nómina QA al finalizar.
- QA read-only por defecto.
- Sin cambios Prisma.

# v9.8.0 — Administration & Finance Functional QA
- CxP ahora puede reflejar pagos en Tesorería.
- Bloqueo de fondos insuficientes en pago a proveedor.
- Corrección CollectionReceipt en aplicación posterior de cobranza.
- Centro Administrativo usa depreciación calculada en vivo.
- QA transversal AP/AR/Tesorería/Gastos/Presupuestos/Activos/Reportes.
- QA read-only por defecto y prueba de tesorería compensatoria.
- Sin cambios Prisma.

# v9.7.0 — Inventory Functional QA
- Checklist funcional de Inventario.
- QA de existencias, ajustes, transferencias, Kardex y consistencia de stock.
- Validación de stock negativo y transferencias inválidas.
- Verificación TRANSFER_OUT / TRANSFER_IN.
- E2E con compensación para restaurar stock neto.
- QA read-only por defecto.
- Corrige el texto de versión del arranque API.
- Sin cambios Prisma adicionales sobre v9.6.0.

# v9.6.0 — Order-to-Cash Functional QA
- Checklist funcional Cotización → Pedido → Entrega → Inventario/Kardex → Factura → CxC → Cobranza → Tesorería.
- Corrección del Kardex de ventas al schema canónico de InventoryMovement.
- Nuevo enum aditivo `SALE_OUT`.
- QA estático `qa:o2c:static`.
- QA runtime `qa:o2c`, read-only por defecto.
- Modo transaccional explícito con `O2C_WRITE=1`.
- Reporte JSON automático en `artifacts/qa`.
- Sin resets ni operaciones destructivas.

# v9.5.0 — Modal Architecture Migration
- Se crean primitives compartidos de arquitectura de modal.
- CxP y CxC migran su detalle a RecordModal con información financiera propia.
- RRHH migra crear/editar a RecordModal con secciones semánticas.
- Centro de Compras adopta header enriquecido.
- Todos los DetailDrawer existentes heredan el RecordModal estandarizado.
- Se mantiene la capa visual global para modales legacy restantes.
- Sin cambios Prisma.

# v9.4.0 — Global Modal Format
- El formato visual SOLPED se convierte en estándar global de modales.
- Cada modal conserva su información y acciones propias.
- Headers, tabs, cards, detail grids, notas, tablas, inputs y footers quedan estandarizados.
- Shared RecordModal ahora soporta icono, eyebrow, status y metadata opcional.
- Cobertura global sobre 36 páginas con modales.
- Todos los modales permanecen centrados.
- Sin cambios Prisma.

# v9.3.0 — Purchase Request Modal Redesign
- Rediseño completo del modal de detalle SOLPED.
- Información organizada en cards, metadata, estado, prioridad y flujo.
- Tabs Resumen / Partidas / Aprobaciones.
- Tabla de partidas y total estimado.
- Acciones funcionales existentes preservadas.
- Modal centrado y responsive.
- Sin cambios Prisma.

# v9.2.1 — All Modals Centered
- Todos los modales se fuerzan al centro del viewport.
- Se cubren modales legacy, detalle, pagos, duplicados, tamaños grandes/pequeños y wrappers DetailDrawer.
- Se elimina visualmente cualquier comportamiento de panel lateral/full-height.
- Override global importado al final para evitar excepciones por CSS de módulo.
- Sin cambios Prisma.

# v9.2.0 — Standardized Modals
- Se revierte el patrón de drawer lateral como interacción principal.
- Consultar, crear y editar registros vuelve a modal centrado.
- Nuevo `RecordModal` compartido.
- `DetailDrawer` se mantiene como wrapper compatible para evitar regresiones.
- Los detail viewers legacy también se normalizan a modal.
- Se conserva la estandarización v9: sidebar blanca, KPIs, tabs, tablas, controles y responsive.
- Sin cambios Prisma.

# v9.1.0 — Procure-to-Pay Functional QA
- Checklist funcional oficial SOLPED → Aprobación → OC → Recepción → Inventario/Kardex → CxP → Pago.
- Nuevo `qa:p2p:static`.
- Nuevo `qa:p2p` read-only por defecto.
- Modo transaccional explícito con `P2P_WRITE=1`.
- Reporte JSON automático en `artifacts/qa`.
- Sin cambios Prisma y sin operaciones destructivas.

# v9.0.0 — Interface Standardization
- Sidebar cambia oficialmente a blanca.
- Nuevo refresh global de UX/UI para estandarizar toda la interfaz.
- Headers, cards, KPIs, tabs, toolbars, inputs, tablas y drawers unificados.
- Topbar y workspace refinados.
- Responsive y split-screen preservados.
- Sin cambios Prisma.

# v8.9.0 — POS Commercial Redesign
- Rediseño integral de Punto de venta siguiendo la referencia visual aprobada.
- Nuevo catálogo visual, categorías, stock y ticket vivo lateral.
- Checkout más claro con cliente, cantidades, nota, descuentos y formas de pago.
- POS usa 4 KPI compartidos.
- Acciones operativas POS usan drawer lateral.
- API POS expone categoría y balances de inventario para el catálogo.
- Sin cambios Prisma.

# v8.8.1 — POS Ticket Drawer
- Historial de Tickets POS abre cada ticket en DetailDrawer lateral.
- Drawer con Resumen, Partidas, Pagos y Trazabilidad.
- Anular ticket mantiene confirmación destructiva.
- Flujo de venta activa permanece en la vista POS principal.
- Sin cambios Prisma.

# v8.8.0 — Contextual Drawer Actions
- Regla oficial: consultar, crear y editar registros usa drawer lateral.
- /terceros: crear/editar tercero, agregar contacto y dirección pasan a drawer.
- /compras/proveedores: crear/editar proveedor pasa a drawer.
- /compras/recepciones: registrar recepción pasa a drawer.
- Confirmaciones y decisiones destructivas siguen como modal/confirmación.
- Sin cambios Prisma.

# v8.7.1 — Specific Detail Drawers
- /terceros: perfil existente ahora abre DetailDrawer.
- /compras/proveedores: proveedor existente abre DetailDrawer.
- /compras/recepciones: recepción existente abre DetailDrawer.
- Crear/editar/registrar acciones conserva modal centrado.
- Sin cambios Prisma.

# v8.7.0 — Global Detail Drawers
- Ver/abrir registros ahora usa drawer lateral derecho como regla global.
- Se convierten visualmente los detail viewers legacy con drawer/detailModal.
- CxP, CxC, Órdenes de compra, Nómina y Presupuestos adoptan el patrón.
- Se preservan los DetailDrawer nativos de Compras, Ventas y Productos.
- Crear/editar/acciones siguen usando modal centrado.
- Drawer full-height, header/footer sticky y responsive móvil.
- Sin cambios Prisma.

# v8.6.0 — Global Module Design System
- El Module Design System aprobado se aplica globalmente a las 54 pantallas funcionales.
- Encabezados, KPI, tabs, paneles, toolbars, búsqueda, tablas y modales estandarizados.
- KPI: 4 desktop / 2 split-screen / 1 móvil.
- Tablas con encabezado sticky y scroll local.
- Shared ModuleTabs cambia a acento azul del diseño aprobado.
- Se conserva sidebar Business OS oscuro con activo azul.
- Compras y Ventas quedan como implementaciones visuales completas de referencia.
- Sin cambios Prisma.

# v8.5.0 — Module Design System Rollout
- Implementación real del mockup aprobado en Compras.
- 4 KPI + Requiere atención + actividad 6 meses + tabla reciente.
- Drawer lateral completo para SOLPED.
- Solicitudes migradas al sistema compartido.
- Sidebar Business OS oscuro con activo azul.
- Responsive vertical split.
- Sin cambios Prisma.

# v8.4.0 — Module Design System
- Nuevo estándar visual compartido para módulos.
- ModuleHeader, ModuleTabs, ModuleToolbar, DataTableFrame, AttentionPanel y DetailDrawer.
- Migración inicial de Compras, Ventas, Order-to-Cash, Inventario, Productos, RR. HH. y Administración.
- Productos incorpora drawer de detalle con pestañas.
- KPI compartidos preservados.
- Responsive para monitor dividido vertical y móvil.
- Sin cambios Prisma.

# v8.3.0 — Order-to-Cash
- 🔵🟢 Nuevo centro Order-to-Cash.
- Cotización → pedido → entrega → factura → CxC → cobranza.
- KPI y alertas comerciales.
- Flujo visual de seis etapas.
- Hotfix de cobranza: CollectionReceipt canónico.
- Runtime E2E extendido con Order-to-Cash.
- Responsive vertical split.
- Sin cambios Prisma.

# v8.2.0 — Centro Administrativo
- 🔵🟢 Nuevo Centro Administrativo.
- Resumen de CxP/CxC, tesorería, gastos, presupuestos y activos.
- Alertas de vencimientos.
- KPI compartidos.
- Responsive para monitor dividido vertical.
- Sin cambios Prisma.

# v8.1.1 — Vertical Split Responsive
- Responsive específico para monitor dividido verticalmente.
- Sidebar drawer hasta 1180px.
- Topbar compacta.
- Right rail se sustituye por AI flotante.
- KPI y grids adaptativos.
- Tablas con scroll interno.
- Demo Ejecutiva y Demo Company optimizadas.
- Sin cambios Prisma.

# v8.1.0 — QA End-to-End + Commercial Polish
- 🔵🟢 QA técnico para Demo Company.
- Nuevo `npm run demo:e2e`.
- Login BuzzBee Business OS con acceso Demo Company.
- Estados loading/error de Demo Company.
- Página 404 real.
- Sin cambios Prisma.

# v8.0.1 — Demo Seed Hotfix
- Corrige uso inválido de Company.slug.
- Demo Company ahora usa taxId único.
- Corrige claves compuestas reales de Warehouse.
- Corrige Role, Position, PurchaseRequestItem, PurchaseOrderItem, GoodsReceipt y HrIncident.
- Seed demo no usa deleteMany.
- Sin cambios de schema Prisma.

# v8.0.0 — Demo Company
- 🔵🟢 Hito 6.
- Empresa demo aislada y seed idempotente.
- Productos, clientes, proveedores, empleados e inventario.
- Flujo SOLPED → OC → recepción → CxP.
- CxC vencida para demo financiera.
- Asistencia, permiso e incidencia RRHH.
- Business Party demo.
- Demo Readiness API/UI.
- Guion comercial de 8 pasos.
- Sin cambios de Prisma schema.

# v7.9.0 — Executive Intelligence Demo
- 🔵🟢 Hito 5.
- Nueva Demo Ejecutiva en Reportes.
- Business Health Score + dimensiones.
- Historia comercial end-to-end.
- Finanzas, Compras, Inventario y RRHH en una vista.
- Alertas e Intelligence.
- BuzzBee AI Executive Briefing.
- Corrige permiso HR de AI a employees.read.
- Reportes usan moneda de la empresa.
- Reportes usan KpiGrid compartido.
- Sin cambios de Prisma schema.

# v7.8.1 — HR Schema Hotfix
- Corrige P1012 por `leaveRequests` duplicado en Employee.
- Elimina modelos paralelos HrAttendance/HrLeaveRequest.
- Reutiliza AttendanceRecord/LeaveRequest existentes.
- Corrige employeeNumber/status y campos reales de LeaveRequest.
- Reutiliza permisos existentes.
- No requiere db push.

# v7.8.0 — HR Client v1
- 🔵🟢 Hito 4 para ERP Cliente y BuzzBee.
- Centro operativo de RRHH.
- Asistencia diaria.
- Permisos/vacaciones con resolución.
- Prenómina básica mensual.
- KPI estándar.
- Eventos HR.
- Schema aditivo: HrAttendance + HrLeaveRequest.

# v7.7.0 — Procure-to-Pay Flow v1
- 🔵🟢 Hito 3 para ERP Cliente y BuzzBee reutilizable.
- Nuevo Centro de compras.
- SOLPED integrada con BuzzBee Aprobaciones.
- Corrección de aprobación: CompanyUser → UserRole/RolePermission.
- OC mantiene aprobación obligatoria configurable.
- Recepción actualiza inventario y Kardex.
- Recepción con documento de proveedor genera CxP automáticamente.
- Eventos de dominio para solicitud, aprobación, recepción, inventario y CxP.
- Seed idempotente de workflows base de compras.
- Sin cambios de Prisma schema.

# v7.6.0 — Business Party v2
- 🟢 Track compartido ERP Cliente + BuzzBee SaaS.
- Contactos múltiples y contacto principal.
- Direcciones múltiples y domicilio fiscal.
- Tags empresariales.
- Profile Score 0–100.
- Centro de deduplicación.
- Matching RFC/correo/teléfono/nombre.
- Merge manual con protecciones de trazabilidad.
- Historial de fusiones.
- Terceros 360 ampliado.
- Sincronización legacy crea datos iniciales de contacto/dirección.
- Mantiene Customer/Supplier existentes; no hay migración destructiva.

# v7.5.1 — Stabilization & Core Audit
- Corrige Modules/Billing dashboard.
- Corrige incompatibilidades BuzzBee AI ↔ Prisma.
- Agrega DB readiness.
- Agrega auditoría estática y smoke test.
- Sin cambios de base de datos.
- Track compartido ERP Cliente + BuzzBee SaaS.

# v7.5.0 — BuzzBee AI Backend v1
- Nuevo `/api/ai/context` y `/api/ai/ask`.
- AI read-only con tenant isolation.
- Registry allowlisted de consultas ERP.
- Respuestas reales sobre Ventas, Compras, Inventario, CRM, Finanzas, RH, Producción, Proyectos e Inteligencia.
- Permisos aplicados antes de consultar cada dominio.
- Auditoría de consultas AI.
- Modo determinístico sin proveedor externo.
- Integración opcional con OpenAI Responses API mediante variables de entorno.
- AIAssistant ahora muestra conversación, respuesta y fuentes.
- Sin cambios de schema Prisma.

# v7.4.11 — Light Sidebar
- Sidebar blanco en lugar de azul marino.
- Navegación con texto carbón y secundarios grises.
- Hover lavanda.
- Estado activo morado BuzzBee.
- Se conservan estructura, dimensiones y tipografía.
- Sin cambios de base de datos.

# v7.4.10 — Four AI Suggestions

- BuzzBee AI muestra 4 sugerencias contextuales en lugar de 5.
- Se conservan las dimensiones exteriores del bloque.
- Las 4 preguntas se redistribuyen verticalmente para aprovechar el espacio.
- Se conserva la escala tipográfica grande de v7.4.9.
- Sin cambios de base de datos.

# v7.4.9 — Large Readable UI
- Incremento global y visible de tipografía.
- Títulos principales y secciones más grandes.
- Texto general sube a 16px base.
- Controles y tablas más legibles.
- Sidebar, Topbar, AI, Apps y banner ampliados.
- KPI ampliados.
- Se conserva el layout y dimensiones de bloques.
- Sin cambios de base de datos.

# v7.4.8 — AI Spacing + 5 Suggestions
- 5 sugerencias contextuales visibles en BuzzBee AI.
- Mejor distribución interna sin cambiar dimensiones externas.
- Aplicaciones conserva grid 4x3.
- Sin cambios de base de datos.

# v7.4.7 — Readable Typography

- Aumenta títulos principales, secciones, cards y texto operativo.
- Aumenta valores KPI manteniendo jerarquía.
- Mejora legibilidad de BuzzBee AI y Aplicaciones sin cambiar el layout aprobado.
- Mejora Sidebar, Topbar y Power Banner.
- Conserva el rail vertical 50/50 y la distribución a lo largo.
- Sin cambios de base de datos.

# v7.4.6 — Stretched Compact Rail

- Conserva dimensiones compactas de v7.4.5.
- BuzzBee AI y Aplicaciones ocupan todo el alto útil.
- Sugerencias AI distribuidas verticalmente sin aumentar tamaño.
- Apps 4x3 distribuidas a lo largo sin aumentar iconos.
- Rail dividido 50/50.
- Sin cambios de base de datos.

# v7.4.5 — Compact Right Rail

- Ajuste de espacios de BuzzBee AI según referencia.
- Aplicaciones vuelve a altura natural.
- Eliminada distribución forzada 50/50.
- Menor padding y separación interna.
- Grid de apps compacto 4x3.
- Sin espacios blancos grandes.
- Sin cambios de base de datos.

# v7.4.4 — Filled Right Rail

- BuzzBee AI y Aplicaciones dividen el rail 50/50.
- Contenido interno de BuzzBee AI usa todo el alto disponible.
- Sugerencias AI se distribuyen verticalmente.
- CTA AI anclado al fondo de su card.
- Aplicaciones usa cuadrícula 4x3 a altura completa.
- Se eliminan grandes espacios vacíos dentro de ambas cards.
- Sin cambios de base de datos.

# v7.4.3 — Business OS Typography System

- Nueva escala tipográfica semántica global.
- Jerarquía unificada para títulos de página, sección, subsección y cards.
- Normalización de encabezados en todos los módulos.
- Dashboard ejecutivo refinado.
- KPI estandarizados con valor, título y descripción coherentes.
- Sidebar y Topbar ajustados.
- BuzzBee AI y Aplicaciones ajustados.
- Power Banner ajustado.
- Tablas, formularios, labels y captions normalizados.
- Responsive typography.
- Sin cambios de base de datos.

# v7.4.2 — Full Height Right Rail

- BuzzBee AI y Aplicaciones se extienden a lo largo de toda la sección central.
- Los dos bloques reparten dinámicamente el alto disponible.
- Scroll interno para prompts/apps cuando sea necesario.
- Dashboard central mantiene scroll independiente.
- Power Banner inferior permanece visible.
- Sin cambios de base de datos.

# v7.4.1 — Fixed Business OS Shell

- El banner "Explora todo el poder de BuzzBee" permanece siempre visible.
- El banner ya no se superpone al dashboard.
- Solo el contenido central de cada módulo hace scroll.
- BuzzBee AI y Aplicaciones permanecen visibles en desktop.
- Topbar y sidebar permanecen estables.
- El botón AI móvil se eleva para no chocar con el banner.
- Sin cambios de base de datos.

# v7.4.0 — Global Modules Layout

- BuzzBee AI y Aplicaciones redimensionados.
- Power Banner convertido de overlay fijo a footer global dentro del flujo.
- Los tres bloques globales permanecen disponibles en todas las rutas.
- El banner ya no tapa contenido.
- Sin cambios de base de datos.

# v7.3.0 — Global Power Banner

- Banner global "Explora todo el poder de BuzzBee".
- Visible en todas las rutas protegidas.
- Montado desde AppShell.
- Ajustes de tamaño y densidad del rail derecho.
- Responsive desktop/tablet/mobile.
- Reserva de espacio inferior para no tapar contenido.
- Sin cambios de base de datos.

# v7.2.0 — Contextual BuzzBee AI + Persistent Apps

- Global right rail on all protected desktop routes.
- BuzzBee AI persists across modules.
- Contextual questions by route/module.
- Persistent Application Launcher.
- Apps respect enabled modules when module state is available.
- Floating BuzzBee AI button on tablet/mobile.
- AI drawer inherits current module context.
- Clicking a suggested question preloads it into BuzzBee AI.
- No destructive database changes.
- No external LLM added yet.

# v7.1.0 — BuzzBee Business OS UI

- Nueva dirección visual oficial Business OS.
- Sidebar oscuro y navegación por lenguaje de negocio.
- Core técnico oculto detrás de experiencias simples.
- Flow renombrado visualmente como Automatizaciones.
- Integration Hub renombrado visualmente como Integraciones.
- Data Hub/Master Data reorganizados bajo Sistema.
- Business Party expuesto como Clientes/Proveedores.
- Inicio refinado hacia prioridades del negocio.
- Corrección de Quick Actions `path` → `to`.
- Sin cambios destructivos de datos.

# v7.0.0 — BuzzBee Business Party Core

- Nuevo núcleo unificado de terceros.
- BusinessParty y BusinessPartyRole.
- Roles CUSTOMER, SUPPLIER, LEAD, CONTACT, PARTNER y OTHER.
- Sincronización segura de clientes/proveedores existentes.
- Unificación por RFC, correo o identidad empresarial.
- Nueva pantalla Terceros 360.
- KPIs estandarizados BuzzBee.
- Eventos para Flow e Integration Hub.
- Nuevos permisos business_parties.*.
- Sin migración destructiva de Customer/Supplier.
- Mantiene `npm run update`.

# v6.9.0 — BuzzBee Intelligence v3

- Business Health Score 0–100.
- Scoring por Comercial, Operaciones, Finanzas y Plataforma.
- Presión de cobranza.
- Eventos de insight nuevo y severidad escalada.
- Intelligence conectado a BuzzBee Flow.
- Estados ACKNOWLEDGED/DISMISSED preservados.
- Scanner automático configurable.
- Nueva pestaña Salud.
- Mantiene `npm run update`.

# v6.8.0 — BuzzBee Intelligence v2 + Safe Update

- IntelligenceMetricSnapshot.
- Historial diario de métricas.
- Tendencias de 30 días.
- Proyección lineal simple de 7 puntos con R².
- Insight de tendencia persistente de ventas.
- Nueva pestaña Tendencias.
- `npm run update` para actualización segura.
- `npm run update:check`.
- API `dev` usa nodemon para reinicio automático.
- Sin resets, sin eliminación de volúmenes y sin aceptación automática de pérdida de datos.

# v6.7.0 — BuzzBee Intelligence v1

- Catálogo semántico de métricas.
- IntelligenceMetricDefinition.
- IntelligenceInsight.
- Alertas, anomalías y recomendaciones explicables.
- Scanner de inteligencia.
- Detección de stock crítico.
- Comparación de ventas 30d vs 30d anteriores.
- Señal de cobranza elevada.
- Señal de error rate de Flow.
- Señal de Dead Letter Queue.
- UI BuzzBee Intelligence con KPI Design System.

# v6.6.0 — BuzzBee Flow v2

- Motor Evento -> Condición -> Acción.
- AutomationFlow, AutomationFlowRun y AutomationFlowActionRun.
- Builder visual inicial.
- Condiciones ALL / ANY.
- Operadores comparativos.
- Plantillas entre eventos y acciones.
- Acciones NOTIFY, CREATE_PURCHASE_REQUEST y CREATE_APPROVAL.
- Event Bus conectado automáticamente con BuzzBee Flow.
- Historial por ejecución y acción.
- KPI Design System oficial.

# v6.5.0 — BuzzBee Integration Hub v3

- Cola durable WebhookDeliveryJob.
- Worker interno recuperable.
- Reintentos automáticos con backoff.
- Dead Letter Queue.
- Reintento manual de DLQ.
- Recuperación de jobs PROCESSING atascados.
- Eventos expense.submitted, approval.required e inventory.low_stock.
- UI Cola / DLQ.
- Mantiene Public API v1, API Key auth y firma HMAC.

# v6.4.1 — Prisma Schema Hotfix

- Corrige `webhookDeliveryLogs` y `apiAccessLogs` concatenados en Company.
- Corrige `accessLogs` concatenado con `@@index` en ApiCredential.
- Escaneo adicional de declaraciones Prisma concatenadas.
- Sin cambios destructivos de datos.
- No requiere reset de Prisma ni eliminación de volúmenes.

# v6.4.0 — BuzzBee Integration Hub v2

- API Keys ahora autentican requests externos reales.
- Public API v1 con scopes.
- ApiAccessLog.
- Event Bus v1.
- IntegrationEventLog.
- Webhooks automáticos desde Clientes, Proveedores, Productos, Ventas, Compras y Data Hub.
- UI Event Bus y Public API.
- Sincronización no bloqueante con `setImmediate`.

# v6.3.1 — Prisma Schema Hotfix

- Corrige relaciones concatenadas accidentalmente en `Company`.
- Corrige relaciones concatenadas accidentalmente en `User`.
- Sin cambios destructivos de base de datos.
- No requiere reset ni eliminación de volúmenes.

# v6.3.0 — BuzzBee Integration Hub v1

- Nuevo Integration Hub dentro del Core.
- Directorio de conexiones.
- API Keys hasheadas y secreto de una sola visualización.
- Scopes y revocación.
- Webhooks salientes firmados con HMAC SHA-256.
- Signing secrets cifrados con AES-256-GCM.
- Test real de endpoints con timeout.
- Logs de entrega, HTTP status y latencia.
- Rotación de signing secrets.
- Nuevo estándar de configuración `INTEGRATION_ENCRYPTION_KEY`.
- KPI Design System oficial.

# v6.2.0 — BuzzBee Data Hub v2

- Modo Solo crear / Crear y actualizar.
- Preview antes/después para actualizaciones.
- Snapshots por fila.
- Rollback controlado por lote.
- Estados de reversa total y parcial.
- Permiso específico `data_hub.rollback`.
- Corrige inserción de permisos de Master Data/Data Hub en seed.
- Corrige creación/búsqueda de categorías, departamentos y puestos.
- Mantiene KPI Design System oficial.

# v6.1.0 — BuzzBee Data Hub v1

- Importación CSV, XLSX y XLS.
- Mapeo de columnas asistido.
- Validación y normalización antes del alta.
- Staging de importaciones con trazabilidad.
- Preview de filas válidas e inválidas.
- Importación segura de Clientes, Proveedores, Productos y Empleados.
- Detección de registros ya existentes.
- Historial de lotes.
- KPI Design System oficial.
- No elimina ni sobrescribe información existente.

# v6.0.0 — BuzzBee Core v1 / Master Data

- Centro de Datos Maestros.
- Catálogos, contactos y direcciones maestras.
- Motor inicial de calidad de datos.
- Estrategia no destructiva.
- KPI Design System oficial.

# v5.10.1 — KPI Design System

- Estandariza todos los bloques KPI existentes.
- Nuevo `KpiGrid` compartido.
- Gastos y Activos Fijos migrados de Card genérica a KpiCard.
- Todos los KPI usan información contextual con KpiInfo.
- Grid 4/2/1 responsive.
- Regla de Design System documentada para futuros módulos.
- Sin cambios de Prisma ni base de datos.

# v5.10.0 — Activos Fijos

- Nuevo módulo de activos fijos.
- Categorías patrimoniales.
- Depreciación lineal y valor en libros.
- Control de ubicación, custodio y número de serie.
- Bajas, ventas y pérdidas.
- Dashboard patrimonial.

# v5.9.2 — Frontend Startup Hotfix

- Corrige `Receipt is not defined` en la navegación.
- React vuelve a montar correctamente en lugar de quedarse en `Iniciando BuzzBee...`.
- Sin cambios de Prisma ni base de datos.

# v5.9.1 — Prisma Schema Hotfix

- Corrige relación `Role.permissions` / `Role.approvalRules` que estaba concatenada en una sola línea.
- Prisma Client puede regenerarse correctamente.
- Corrige mensaje prematuro de éxito en seed demo.
- Sin reset ni borrado de datos.

# v5.9.0 — Gastos y Viáticos

- Nuevo módulo financiero de gastos y viáticos.
- Categorías, comprobantes, método de pago y reembolso.
- Aprobación integrada con Workflows.
- Estados DRAFT/SUBMITTED/APPROVED/REJECTED/PAID/CANCELLED.
- Dashboard y navegación en Finanzas.

# v5.8.0 — Navigation UX

- Jerarquía por áreas de negocio.
- Grupos colapsables y persistentes.
- Filtrado por módulos habilitados.
- Sistema separado de operación.
- Sin cambios de base de datos.

# v5.7.1 — Aprobaciones integradas con Compras

- Las órdenes de compra crean solicitud de aprobación automáticamente cuando existe un workflow aplicable.
- Una OC pendiente/rechazada no puede emitirse.
- Una OC aprobada puede continuar a `ISSUED`.
- La API de órdenes devuelve el estado de aprobación asociado.
- Sin workflow aplicable, Compras conserva su flujo anterior.
- No agrega nuevas tablas respecto a v5.7.0.

# v5.7.0 — Workflows y Aprobaciones

- Nuevo módulo `/aprobaciones`.
- Workflows configurables por empresa y tipo de entidad.
- Reglas secuenciales por usuario, rol o permiso.
- Umbrales opcionales por importe.
- Solicitudes con pasos, historial y trazabilidad.
- Bandeja personal de aprobaciones.
- Aprobar, rechazar y cancelar solicitudes.
- Permisos `approvals.read`, `approvals.manage`, `approvals.decide`.
- Demo de aprobación de orden de compra.
- Módulo activable desde Configuración de módulos.

# v5.6.4 — Navegación visible de configuración SaaS

- `Plan y facturación` aparece primero en la sección Sistema.
- `Configuración de módulos` aparece inmediatamente debajo.
- Se renombra `Módulos y planes` a `Configuración de módulos`.
- El resto de opciones administrativas queda separado en `Administración`.
- No cambia Prisma ni la base de datos.

# v5.6.3 — Frontend startup hotfix

- Corrige `CreditCard is not defined` en `navigation.js`.
- Importa `CreditCard` correctamente desde `lucide-react`.
- Corrige la pantalla atrapada en `Iniciando BuzzBee…`.
- No modifica Prisma ni la base de datos.
- No requiere seeds ni `db:sync`.

# v5.6.2 — API import hotfix

- Corrige el arranque de la API en Billing.
- `requireAuth` se importa desde `middleware/auth.js`.
- `requirePermission` se importa desde `middleware/permissions.js`.
- No hay cambios de Prisma ni de base de datos.
- No requiere `db:sync`.

# v5.6.1 — Hotfix arranque Billing

- Corrige relación Prisma faltante `CompanySubscription.scheduledPlan`.
- Corrige la ruta React `/configuracion/facturacion`.
- La ruta queda antes del wildcard `configuracion/*`.
- Agrega `/api/billing/health` para diagnóstico.
- No elimina datos ni requiere reset de PostgreSQL.

# v5.6.0 — Billing & Subscriptions estilo Shopify

- Upgrade de plan inmediato.
- Prorrateo del tiempo restante del ciclo.
- Crédito proporcional del plan anterior.
- Downgrade programado al final del periodo ya pagado.
- Ciclos mensual y anual.
- Historial de cambios de plan.
- Facturas SaaS, líneas, créditos y payment attempts.
- Métodos de pago tokenizados por proveedor (sin guardar tarjeta completa).
- Nueva pantalla `Plan y facturación`.
- Base preparada para conectar Mercado Pago.
- Los módulos del nuevo plan se sincronizan al aplicarse el cambio.

# v5.5.3 — Ciclo de facturación y bloqueo de plan

- El cambio de plan entra en vigor inmediatamente.
- El cliente selecciona un día de corte/pago entre 1 y 28.
- Se calcula automáticamente la siguiente fecha de facturación.
- El plan queda bloqueado hasta esa fecha.
- La API rechaza cambios anticipados con HTTP 409 `PLAN_CHANGE_LOCKED`.
- Al cambiar de plan, se deshabilitan también los módulos que no pertenecen al nuevo plan.
- Se conserva historial de suscripciones y periodos.
- No requiere reset de base de datos.

# v5.5.2 — Seed demo hotfix

- Corrige `ReferenceError: warehouseMain is not defined`.
- Reutiliza el almacén demo existente `warehouses['MTY-GEN']` para Producción y POS.
- Permite que `seed-demo.js` continúe hasta Configuración modular SaaS.
- Sin cambios en Prisma schema.
- Sin reset ni cambios destructivos de base de datos.

# v5.5.1 — Navegación modular

- Agrega acceso visible `Módulos y planes` en la sección Sistema.
- Conecta Sidebar con `/api/modules/dashboard`.
- Oculta del menú los módulos desactivados para la empresa.
- Mantiene fallback seguro al menú completo si el usuario no puede consultar configuración modular.
- Agrega `moduleKey` a las aplicaciones principales.
- Registra `/configuracion/modulos` en `routeManifest`.
- Sin cambios de schema Prisma ni cambios destructivos en PostgreSQL.

# v5.5.0 — Configuración modular SaaS

- Catálogo global de módulos.
- Activación por empresa.
- Features por módulo.
- Planes y módulos incluidos.
- Suscripciones.
- Límites por plan y overrides.
- Usage records.
- Permisos `modules.read` / `modules.manage`.
- Datos demo de planes Starter, Growth y Business OS.

# v5.4.2 — Prisma relation hotfix

- Corrige el hotfix v5.4.1.
- Inserta `productionOrders ProductionOrder[]` específicamente dentro de `model Product`.
- Elimina el falso positivo de validación anterior.
- Sin cambios destructivos en PostgreSQL.

# v5.4.1 — POS Hotfix

- Corrige Prisma P1012 en `ProductionOrder.product`.
- Agrega la relación inversa `Product.productionOrders`.
- Permite generar Prisma Client con los modelos de Producción y POS.
- Corrige indirectamente el error del seed demo donde `prisma.posDiscount` aparecía como undefined.
- Sin cambios destructivos ni reset de base de datos.

# v5.4.0 — POS

- Nuevo módulo `/pos`.
- Terminales y cajas.
- Apertura/cierre de turno.
- Tickets y líneas de venta.
- Pagos múltiples.
- Efectivo, tarjeta, transferencia, wallet y crédito.
- Movimientos de caja.
- Descuentos.
- Anulación de tickets.
- Integración con clientes, productos y almacenes.
- Permisos `pos.read` / `pos.manage`.
- Datos demo POS.
- Cambios Prisma aditivos.

# v5.3.0 — Producción / Manufactura

- Nuevo módulo `/produccion`.
- BOM y componentes.
- Centros de trabajo.
- Órdenes de producción.
- Routing y operaciones.
- Consumos, salidas, lotes y mermas.
- Costeo de material, labor, overhead y externos.
- Integración con ventas, proyectos, productos y almacenes.
- Permisos `production.read` / `production.manage`.
- Datos demo de manufactura.
- Cambios Prisma aditivos.

# v5.2.0 — Facturación fiscal / CFDI

- Nuevo módulo `/facturacion-fiscal`.
- Perfiles fiscales de emisor y receptor.
- CFDI 4.0 preparado desde factura comercial.
- Conceptos e impuestos fiscales.
- Registro de timbrado PAC y UUID.
- Cancelaciones fiscales.
- Complemento de recepción de pagos 2.0.
- Permisos `fiscal.read` / `fiscal.manage`.
- Datos demo fiscales.
- Reparación preventiva de la relación Customer/Marketing detectada en el schema de v5.1.0.
- Cambios Prisma aditivos, sin reset de datos.

# v5.1.0 — Marketing

- Nuevo módulo Marketing en `/marketing`.
- Campañas, canales, inversión, métricas y calendario.
- Integración de leads con CRM.
- Atribución de oportunidades y pedidos de venta.
- KPIs CPL, CTR, conversión, ROAS y ROI.
- Permisos `marketing.read` y `marketing.manage`.
- Datos demo de Marketing.
- Cambios Prisma exclusivamente aditivos.

# v5.0.0 — Proyectos

- Nuevo módulo de Proyectos en `/proyectos`.
- Portafolio, subproyectos, tareas, equipo, timesheets, comentarios y archivos.
- Integración con clientes, pedidos de venta y órdenes de compra.
- Costeo real: compras + horas; ingresos y margen por proyecto.
- Nuevos permisos `projects.read` / `projects.manage`.
- Datos demo de proyectos.
- Cambios Prisma aditivos; sin reset de base de datos.

# v4.9.0 — CRM

- Nuevo módulo CRM independiente en `/crm`.
- Dashboard CRM, pipeline, leads/oportunidades y agenda comercial.
- Conversión de prospectos ganados a clientes reales del ERP.
- Actividades comerciales pueden completarse y reabrirse.
- Integración al menú principal y acciones rápidas.
- Sin cambios destructivos de schema ni base de datos.

# v4.8.1 — Dashboard auth fix

- Corrige el identificador del usuario en `/api/dashboard`.
- El JWT guarda el usuario en `sub`; el Dashboard ahora usa `req.auth.sub`.
- No modifica schema, migraciones ni datos de PostgreSQL.

# v4.8.0 — Dashboard conectado a datos reales

- Dashboard reemplaza cifras mock por datos PostgreSQL.
- Nuevo endpoint `/api/dashboard`.
- Auditoría automática de pantallas conectadas a API.
- Conserva seed demo y correcciones de schema de v4.7.5 estable.
- `dev` del API usa Node directo para evitar el cierre observado con nodemon.

# v4.7.5 corregida — Datos demo sobre base estable v4.7.4

- Reconstruida directamente desde v4.7.4 estable.
- Añadido únicamente seed-demo.js y su comando npm.
- Prisma/@prisma-client fijados en 6.15.0 para reproducibilidad.
- Sin cambios en schema.prisma, prisma.js, autenticación, Docker o rutas.

# Changelog

## v4.7.4 — Componente único de KPI

- Creación del componente reutilizable `KpiCard`.
- Sustitución de las tarjetas KPI antiguas en 24 pantallas.
- Migración de 104 tarjetas al mismo componente estructural.
- Normalización de tarjetas con contenido directo o envuelto en `<div>`.
- Mismo orden interno: icono, título, valor y descripción.
- Mismo fondo, borde, altura, padding, radio, sombra y tipografía.
- Blindaje del botón de información frente a estilos locales.
- Tamaño fijo de 28 px para el botón y 14 px para su icono.
- Corrección del KPI `Valor de inventario` para usar un icono real.
- Eliminación de la hoja global anterior basada únicamente en selectores.
- El popover sigue renderizándose por React Portal.
- No requiere migración de Prisma.

## Commit

```text
fix(ui): reemplazar las KPI por un componente único y corregir su estructura interna
```


## v4.7.5 schema fix
- Corrige 10 errores P1012 de relaciones Prisma.
- Sin cambios destructivos sobre PostgreSQL/Docker.

## 12.3.1 — Switch Standardization
- Estandarizado el tamaño de todos los switches de estado a 40×22 px.
- Thumb unificado a 16 px y desplazamiento de 18 px.
- Añadido fallback global para cualquier `button[role="switch"]` en páginas y modales.
- Corregido hover para que los switches no hereden el desplazamiento vertical de botones generales.
- Sin cambios de base de datos.

## v13.2.1 · Super Admin SaaS
- Nuevo `/admin-saas` para administración global de BuzzBee.
- Nueva API `/api/platform-admin` con métricas SaaS, empresas, suscripciones, planes, facturación y sistema.
- Nuevo permiso `platform.manage` y script `platform-admin:enable`.
- Suspensión/reactivación de empresas y cambios de estado de suscripción auditados.
- QA específico `qa:platform-admin` (20/20 PASS).
- Matriz de permisos ampliada a 223/223 endpoints mutables protegidos.

## v13.2.1 · Super Admin Security Hardening
- Login separado `/admin-login` para cuentas Super Admin SaaS.
- MFA TOTP obligatorio con secreto cifrado AES-256-GCM.
- Rol dedicado `Super Admin SaaS`; `platform.manage` deja de pertenecer a Administrador ERP.
- Sesión de plataforma 45 min + idle timeout 15 min + sessionStorage.
- Reautenticación contraseña + MFA para acciones críticas después de 10 min.
- Bloqueo de cuenta, rate limiting de login y revocación de JWT con `sessionVersion`.
- Auditoría ampliada de acceso, MFA y reautenticación.
- QA Platform Security 16/16 y QA integral 47/47.

## v13.2.2 · Platform-only Super Admin shell
- Se separó `/admin-saas` del shell operativo ERP.
- El Super Admin ya no ve módulos de tenants ni navegación operacional.
- Se agregó navegación exclusiva de plataforma SaaS.

## v13.3.0 — Platform Control Plane
- Super Admin expandido a control plane SaaS completo y aislado del ERP de tenants.
- Nuevas áreas: renovaciones, trials, usuarios globales, Health Score, soporte, módulos/features, integraciones, revenue, seguridad, auditoría y configuración global.
- Métricas SaaS: MRR, ARR, ARPU, churn aproximado, cobranza y health promedio.
- Acciones críticas protegidas con `platform.manage`, MFA y reautenticación reciente.
- Nuevos modelos persistentes: `PlatformSetting` y `PlatformSupportTicket`.
- Permisos mutables: 237/237 protegidos.
- QA integral: 47/47 PASS; Control Plane: 38/38 PASS; Platform Security: 16/16 PASS; Platform Admin: 20/20 PASS.

## 14.0.0 - Modular Architecture Foundation

- API compuesta por manifiestos de dominio en `apps/api/src/modules`.
- Registro central de routers con protección contra mounts duplicados.
- Workers centralizados en `apps/api/src/bootstrap/workers.js`.
- Frontend con rutas agrupadas por dominio en `apps/web/src/modules`.
- `App.jsx` reducido a composición de shells y registros.
- Validación de rutas web duplicadas.
- Estrategia de compatibilidad para migrar gradualmente `routes/services/pages` sin big-bang refactor.
- Nuevo `npm run qa:architecture`.

## v15.0.0 — Full Modularization
- Migración física de todos los dominios principales a `apps/api/src/modules/*` y `apps/web/src/modules/*`.
- Eliminación completa de compatibility shims API/UI.
- Contratos públicos por dominio.
- Shared kernel y event bus interno.
- QA actualizado para inspeccionar rutas canónicas modulares.
- Nuevo `qa:modular-all` con 36/36 checks.
- QA integral preservado en 47/47.

## 15.0.3 — Tenant Isolation Hardening
- Super Admin desacoplado de tenants (`User.companyId` nullable para plataforma).
- Separación estricta de sesiones ERP vs Platform en backend.
- Usuarios/roles/permisos de plataforma invisibles e inmutables desde Administración tenant.
- Auditor multiempresa modular actualizado y QA de aislamiento dedicado.

## v15.1.0 — Smart Import
- Data Hub pasa al dominio tenant `operations`.
- Importación inteligente por RRHH, Inventario, Compras y Ventas/CRM.
- Detección automática del tipo de datos y confianza de interpretación.
- Mapeo flexible de columnas legacy.
- Soporte multi-hoja de Excel.
- Detección de duplicados dentro del archivo.
- Vista previa cruda + validación + diff antes del commit.
- Accesos directos de importación desde cada módulo.

## v15.2.0 — Material Design 3 Foundation
- Material Design 3 se convierte en la base del BuzzBee Design System.
- Nuevos tokens de color, tipografía, spacing, shape, elevation y motion.
- Temas Light/Dark/System con resolución automática del tema del sistema.
- Compatibilidad de tokens legacy mediante aliases MD3.
- Button, Card, Input, Switch y Badge migrados a roles MD3.
- Nuevos componentes compartidos Checkbox y Select.
- Nuevo `qa:md3-foundation`.

## 17.1.0 — Unified UI Contract
- Estandarización transversal de botones, inputs, selects, tablas, cards, KPIs, chips, toolbars y formularios.
- Eliminación de bloques históricos acumulados en los CSS compartidos principales.
- Consolidación de la política de modales; se retiran del runtime las capas globales v9 redundantes.
- Corrección de focus doble en buscadores/inputs compuestos.
- Grids de dashboard dejan de estirar cards y generar espacios vacíos artificiales.
- Nuevo QA: `npm run qa:ui-contract`.

## 17.3.0 — Offline Route Hardening
- Endurecimiento global de shapes para Demo Local frontend-only.
- Corrección específica de `/aprobaciones` y colecciones anidadas.
- QA de cobertura de rutas offline y compatibilidad Vercel SPA.

## 17.3.2 — Offline All Routes
- Auditoría transversal de todas las rutas ERP para Demo Offline.
- Contrato genérico ampliado a 71 colecciones consumidas por pantallas.
- 152 plantillas de endpoint verificadas contra el adaptador local.
- Defaults específicos para Presupuestos, Cash Flow, Reportes, Flow, Integraciones, Master Data y O2C.
- Validación de deep links para Vercel y navegación local Vite.

## 17.4.0 — Offline Adapter Contract
- Mapa central `OFFLINE_FEATURES`/`OFFLINE_MODULES`.
- Barrera axios `OFFLINE_NETWORK_BLOCKED` para impedir bypass de red en sesiones offline.
- QA `qa:offline-dependencies` para dependencias, red, sockets, backend-only packages, Vercel y separación de Super Admin.
- Documento de matriz funcional offline/local/simulada/bloqueada.

## 17.4.3 — POS Layout Hotfix
- Corrige geometría de cards clicables del POS y elimina scroll vertical artificial del ticket.
## v17.5.0 — Visual Control Normalization
- Corrige superficies clicables que heredaban geometría pill (Reportes y Proyectos).
- Normaliza acciones icon-only en tablas de Compras/Inventario.
- Agrega Switch compacto para tablas densas.
- Ajusta densidad y scroll del checkout POS.
- Mantiene el contrato offline sin cambios funcionales.


## 17.5.1 — Smart Import Step 1 Redesign
- Rediseño de Data Hub > Origen y estrategia con dropzone central, selectores con iconos, CTA separado y callout informativo.
- Responsive actualizado sin cambios de lógica ni API.

## 17.5.2 — Unified Color System
- Smart Import palette promoted to the global BuzzBee visual color contract.
- Canonical blue set to #2F6BFF with #2459D6 hover and #EAF2FF soft surfaces.
- Workspace neutrals standardized to #F5F7FC / #FFFFFF / #F8FAFC.
- Text and borders standardized to #0F172A / #667085 / #94A3B8 / #D9E2F2.
- Historical purple/indigo UI accents normalized to canonical blue.
- Semantic green/yellow/red remain reserved for business statuses.
- Added `npm run qa:unified-colors`.

## v17.5.4 — POS Catalog Toolbar
- Barra de catálogo POS refinada.
- Eliminado doble focus/borde interno del buscador.
- Categoría, búsqueda y filtros normalizados a 44px.
- Botón de limpiar búsqueda y responsive mejorado.

## 17.6.0 — Offline Auto Parts Demo
- Demo Offline convertida a empresa coherente de refacciones automotrices: MotorNorte Refacciones.
- Dataset transversal para empleados, clientes, proveedores, inventario, compras, ventas, cobranza, POS, proyectos, marketing, RRHH y finanzas.
- Fallback universal de consulta para cualquier endpoint ERP sin fixture específico.
- Nuevo QA `npm run qa:offline-auto-parts`.
