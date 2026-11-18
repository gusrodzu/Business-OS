# Business OS Next — OS Workspace, referencia oficial v1

## Objetivo de producto

**Business OS es un sistema operativo empresarial, no un dashboard dentro del navegador.**
El usuario aterriza en un escritorio personalizado con fondo, aplicaciones reales,
widgets, barra del sistema y dock. Cada módulo se abre como una aplicación con
su propia navegación, sin perder capacidades del ERP, permisos ni datos.

**Referencias aprobadas por el usuario (noviembre de 2026):**
1. Tablet horizontal: fondo abstracto negro, ocho lanzadores blancos a la
   izquierda, Centro de control y Wallpaper Studio, tareas/agenda a la derecha y
   dock flotante centrado abajo.
2. La misma tablet con **Ventas abierta como ventana**: barra superior oscura,
   lista de pedidos a la izquierda, detalle del pedido a la derecha,
   acciones sobre el documento, y dock visible sobre el wallpaper.

Son referencias de arquitectura visual y experiencia, no datasets ni
comportamientos ya implementados. No copiar datos numéricos ficticios de las
imágenes a producción.

## Contrato visual

- **El escritorio es el inicio** (`/`). El dashboard heredado permanece accesible
  desde **Centro de control**, sin convertirse en la portada predeterminada.
- **Wallpaper del sistema**: solo en el shell/escritorio y bordes de ventana.
  Dentro de la app, superficies neutras legibles.
- Colores de interfaz: carbón `#17191D`, `#2B2F36`, blanco `#FFFFFF`,
  lienzo `#F3F4F6`, borde `#E5E7EB`, tinta secundaria `#6B7078`.
  Estados operativos reales conservan colores semánticos.
- Launcher de módulos realmente disponibles según empresa; no exponer
  funcionalidades sin licencia como si estuvieran activas.
- Dock de acceso rápido, controles de ventana y búsqueda/notificaciones reales.
  Objetivos táctiles de **44 px** o más y espacios seguros móviles.
- Tablet: ventana flotante; smartphone: app a pantalla completa. Otros módulos
  conservan temporalmente su shell anterior hasta migrarlos por fases.

## Implementado en primera etapa

- `layout/os/workspaceWallpapers.js`: presets monocromáticos y validación
  del fondo persistido.
- `layout/os/OSWallpaperStudio.jsx`: tres fondos, carga local personalizada,
  optimización a JPEG, vista previa y guardado local por usuario/empresa.
- `layout/os/OSDock.jsx`: Inicio, módulos filtrados con habilitaciones y Apps.
- `modules/core/ui/pages/WorkspaceOSHome.jsx`: Home app-first reutilizando
  `WorkspaceAppShelf` y datos reales de Dashboard (métricas elegidas,
  compras mensuales, avisos, solicitudes, vencimientos).
- `layout/AppShell.jsx`: fondo, barra del sistema, dock, catálogo
  y Ventas envuelta en una ventana sobre el escritorio.
- `Dashboard.jsx`: alterna Escritorio / Centro de control; las funciones
  previas de dashboard siguen disponibles.

**Límites de v1 (no prometerlos como resueltos):**
- Fondos personalizados se guardan *en el navegador actual*, no se sincronizan
  entre dispositivos ni con el perfil remoto.
- Ventas funciona dentro de un marco de ventana, pero sus listados y detalles
  internos aún deben adaptarse al master-detail de la referencia.
- Minimizar/cerrar actualmente navega a Home; ventanas vivas,
  pestañas multi-app, restauración del scroll y multitarea persistente
  son una fase posterior.
- Widgets visibles usan la configuración y los datos existentes; arrastrar y
  soltar widgets, cambiar tamaño de iconos y mover el dock son posteriores.
- Las gráficas de compras están identificadas como **compras mensuales**;
  no presentar estos datos como ventas diarias.
- No declarar QA visual en dispositivos hasta realizar las capturas y revisiones.

## Siguientes etapas

1. Completar Ventas `Pedidos → Detalle` con división 35/65 en tablet y
   lista a pantalla completa en smartphone. Reusar rutas, acciones, estados
   y operaciones existentes; ningún CTA ficticio.
2. Mejorar biblioteca de apps, favoritos, carpetas y recientes del usuario.
3. Sincronizar wallpapers y disposición del escritorio en perfil personal,
   con aislamiento multiempresa y reglas de privacidad.
4. Pantallas divididas y multitarea con restauración de estado, sin inventar
   sesiones ni duplicar operaciones.
5. Migrar Inventario, Compras, CRM, POS, Finanzas, RRHH y verticales siguiendo
   la misma arquitectura y React + CSS Modules.

## Restricciones

No alterar transacciones, API, base de datos, aislamiento tenant, roles,
permisos, licencias ni adaptador offline durante refactors visuales. Conservar
la infraestructura actual y la seguridad. No reactivar automatizaciones.
Realizar QA visual integral al final de la fase, respetando todos los checks
automáticos obligatorios en PR.


## Etapa v2 — Ventas como aplicación de dos paneles (14 noviembre 2026)

Implementación propuesta en la rama de rediseño:

- \`/ventas\` abre por defecto **Cotizaciones y pedidos** en lugar del
  resumen comercial, dentro de la ventana existente del sistema operativo.
- La vista \`SalesOSWorkspace\` utiliza **lista 35% / detalle 65%** en pantallas
  amplias y una navegación **lista → ficha → volver** en smartphones.
- Búsqueda, chips por estado, cliente, fechas, partidas, subtotal, impuestos
  y total se alimentan del endpoint existente \`/sales\`; no se incorporan
  pedidos, personas, importes ni métricas ficticias.
- Los botones existentes conservan sus manejadores en \`Sales.jsx\`:
  nueva cotización, envío, aceptación, conversión a pedido, confirmación,
  entrega, cambio de estado a facturado y apertura de la ficha completa.
  **No hay botón de cobro, imprimir o compartir** hasta contar con operaciones
  reales para esas acciones.
- La vista anterior de resumen, pipeline y los módulos hermanos siguen
  accesibles. No se modifica ninguna regla tenant, permiso, licencia,
  persistencia ni API.

**Estado:** implementación de interfaz en rama; QA visual y compilación de
CI pendientes de verificación antes de mezclar a \`main\`.


## Etapa v3 — Inventario como aplicación OS (14 noviembre 2026)

- La ruta /inventario/existencias usa la ventana compartida del sistema operativo.
- El dock abre directamente esta ruta; otras subrutas de inventario conservan
  su contenido previo dentro del marco de aplicación hasta migrarlas.
- InventoryOSWorkspace es un componente de presentación; consume los datos,
  filtros, almacenes y resumen ya calculados por InventoryBalances, sin crear
  endpoints ni datos simulados.
- Interfaz de dos paneles para tablet/escritorio y lista → detalle en smartphone.
  Muestra ubicación, SKU, existencias, reservas, mínimos, costos y valuación.
- Las acciones Productos, Movimientos y Solicitud de compra navegan a rutas
  existentes; no mutan existencias ni generan solicitudes automáticamente.
- El marco OS de AppShell se comparte entre Ventas e Inventario usando el
  mismo dock, wallpaper y controles; el resto del ERP conserva su arquitectura.

**Límites:** QA visual, verificación en dispositivos y revisión de regresiones
pendientes hasta que concluya CI. El marco no implementa multitarea real,
persistencia de ventanas ni sincronización de fondos entre dispositivos.

**Estado v2:** Ventas fue fusionado por PR #558; el documento original de v2
refleja su etapa anterior y no constituye certificación de QA.


## Etapa v4 — Catálogo como aplicación Workspace OS (14 noviembre 2026)

- Implementación en rama apilada sobre fase v3 Inventario (PR #559).
- \`/inventario/productos\` usa el marco de ventana OS ya compartido, con
  nuevo \`ProductCatalogOSWorkspace\` de presentación (React + CSS Modules).
- En tablet/escritorio: catálogo con listado/selección y ficha contextual
  en paneles 35/65. En móvil: lista → ficha → volver.
- Filtros, categorías, productos, precios, márgenes y mínimos provienen
  de los hooks y selectores canónicos del catálogo. No se simula stock real,
  facturación, ni datos de otras empresas.
- El total mostrado como **Costo configurado** reutiliza
  \`getProductCatalogMetrics\` y aclara que no es la valuación de inventario.
- Acciones existentes: crear, importar, editar, activar/desactivar, eliminar,
  selección masiva y ficha completa. Las mutaciones continúan en
  \`useProductCatalogMutations\`, sin nuevas rutas API.
- La ficha detallada y el editor actuales se mantienen, sin duplicar
  formularios. Los enlaces hacia Existencias usan rutas existentes.
- Los componentes antiguos del catálogo permanecen disponibles como
  fallback; no se duplicaron sus reglas de negocio.

**Dependencias de entrega:** aprobar PR #559, después comprobar la versión
apilada de Catálogo. La restauración de otras rutas de la aplicación se maneja
por separado en PR #560. No afirmar QA ni publicación hasta su validación.


## Etapa v5 — Workspace OS shared primitives (14 noviembre 2026)

Se unifica la **presentación**, no la lógica comercial, bajo una nueva capa
compartida en \`apps/web/src/layout/os\`:

- \`OSAppWindow.jsx\`: una ventana con controles accesibles (minimizar,
  maximizar/restaurar y cerrar), montada por \`AppShell\` para Ventas e Inventario.
  Minimizar y cerrar siguen navegando al escritorio, no son procesos vivos.
- \`primitives/OSWorkspaceControls.jsx\`: \`OSFilterRail\`,
  \`OSWorkspaceSearch\` y \`OSWorkspaceSplit\`. Se usan por Ventas,
  Existencias y Catálogo, con estados y callbacks suministrados por cada módulo.
- \`primitives/OSWorkspaceControls.module.css\`: fila táctil de filtros de 44px,
  búsqueda, foco visible, división 35/65 en escritorio y 40/60 en tablet
  estrecha, lista → detalle en smartphone.
- \`primitives/OSWorkspacePanel.module.css\`: composición CSS Modules para
  superficie de panel, encabezado y desplazamiento de registros. Los CSS
  específicos quedan a cargo del contenido de sus módulos.

**Invariantes:** las páginas existentes conservan datos y handlers de negocio,
sin modificar API, Prisma, stock, cobros, roles, permisos, licencias, seguridad
multiempresa, adaptadores offline ni proveedor de despliegue Cloudflare.

**Siguientes consumidores:** Compras, CRM y otros módulos pueden utilizar los
mismos controles únicamente al disponer de datos, rutas y permisos reales.

**Estado:** implementar en rama de revisión, no fusionar ni desplegar hasta
verificar compilación, navegación y QA visual de tablet/móvil.


## P0 — CI y contratos de interfaz de Workspace OS (noviembre 2026)

- Los checks de \`Smartphone Browser Review\` recorren 320, 360, 390 y
  430 px con datos Demo Local, y los controles de accesibilidad del menú.
- \`Pocket OS\` navega mediante el explorador móvil; la barra de iconos clásica
  se oculta allí por diseño.
- El escritorio \`Workspace OS\` utiliza biblioteca de aplicaciones, favoritos,
  ventanas y paneles de lista/detalle; no utiliza en Home los controles
  hexagonales ni el personalizador KPI del dashboard anterior.
- El ERP **no migrado** conserva su barra lateral de iconos y su rail derecho,
  con foco de teclado, accesibilidad y espacios independientes.
- Las pruebas de \`DashboardCustomizer\`, configuración empresarial y datos
  transaccionales siguen vigentes en los módulos que los montan. Los gates
  estáticos que comprobaban JSX descontinuado se conectan a los hooks y
  componentes actuales, sin eliminar controles de permisos o seguridad.
- Límite de deuda CSS clásico: no aumentar los \`!important\` actuales del
  módulo Dashboard, con extracción incremental a módulos propios pendiente.
- La implementación sigue en Cloudflare; las acciones legadas que inspeccionan
  políticas de Vercel no deben interpretarse como dependencia de despliegue.

**Criterio de cierre:** \`Frontend QA\`, \`Smartphone Browser Review\`,
\`ERP Route Render Sweep\`, \`MotorNorte Transactional QA\`, \`Prisma\`,
\`Dependency Security Triage\` y \`ERP Backend Integration Smoke\` deben
aprobar en el mismo SHA antes de fusionar y publicar.


## Compras OS — Fase 1 · Solicitudes (noviembre 2026)

- Se incorpora **Compras** como aplicación del dock y biblioteca de aplicaciones,
  con entrada inicial en \`/compras/solicitudes\`.
- El wrapper de ventana compartido \`OSAppWindow\` sólo se monta para esta ruta.
  \`/compras\`, órdenes, recepciones y proveedores conservan la experiencia ERP
  actual hasta su migración propia, evitando envolverlos prematuramente.
- La nueva \`PurchaseRequestsOSWorkspace\` reutiliza \`OSFilterRail\`,
  \`OSWorkspaceSearch\` y \`OSWorkspaceSplit\`, con lista y detalle simultáneos
  en escritorio/tablet y lista → detalle con retroceso en smartphone.
- Indicadores y tarjetas se alimentan exclusivamente de las solicitudes
  existentes. Se conservan búsqueda, filtros, conteo, partidas, almacén,
  solicitante, importes y fechas reales sin añadir tablas, endpoints ni
  modificar el aislamiento de empresas.
- **Acciones funcionales:** nueva solicitud, ver expediente completo,
  enviar borrador a aprobación y navegar a órdenes/proveedores. El expediente
  modal existente sigue administrando aprobar/rechazar y el control de foco.
- Se mantiene el render tradicional de solicitudes como fallback para rutas
  no canónicas y sus controles de regresión, sin duplicar consultas a la API.

### Próximas etapas

1. Migrar \`/compras/ordenes\` con el mismo patrón y conservar emisión,
   formularios, costos/impuestos y enlace a recepciones.
2. Migrar \`/compras/proveedores\` y recepciones, sin duplicar CRUD ni
   autorizaciones.
3. Activar ventana Compras OS para todas las rutas migradas conforme se
   certifique cada flujo en browser QA.

## OS Home · Contraste y composición (17 nov 2026)

- El escritorio invoca WorkspaceAppShelf con variant="os" (no la vista ERP estándar). El catálogo sigue filtrado por empresa, y conserva favoritos y navegación.
- La bienvenida ocupa el ancho completo sobre vidrio oscuro, con títulos claros y CTA contextual.
- El launcher adopta panel traslúcido propio. Los widgets de Centro de control, Wallpaper Studio, tareas y agenda conservan datos y acciones, con proporciones adaptativas.
- La barra superior OS conserva contraste alto con reglas de especificidad superior a Mono B; búsqueda, perfil y navegación siguen operativos.
- Dashboard retira una rama duplicada que introducía imports y variables no declaradas, manteniendo Escritorio OS y Centro de control tradicional.
- Smartphone Browser Review verifica a 1440px textos claros, encabezado oscuro, ancho del saludo, launcher variant=os y ausencia de overflow, además del responsive previo.
- No se alteran API, PostgreSQL, permisos, catálogo multitenant ni configuración de Cloudflare.

## Compras OS · Órdenes (17 nov 2026)

- `/compras/ordenes` se incorpora a la ventana **Compras** del shell OS,
  conservando el dock, el wallpaper, controles de ventana y navegación existente.
- El componente transaccional `PurchaseOrders` conserva su carga por empresa,
  búsqueda, filtros, selección y handlers actuales de **crear**, **emitir** y
  **recibir**. No se generan operaciones de compra en los controles de QA.
- El explorador visual reutiliza `WorkspaceOSRecordExplorer`:
  escritorio/tablet muestra lista + detalle; Pocket OS cambia entre lista →
  detalle → volver. Controles táctiles de al menos 44 px y scroll vertical.
- `/compras/recepciones` continúa como ruta ERP clásica hasta la próxima
  migración; las pruebas de navegación de la barra lateral se realizan allí.
- Se añaden pruebas browser para formulario real, ventana, filtros, selección
  móvil, retorno y ausencia de desbordamiento a 320/390/1440 px.
- Sin cambios en autorización, API, pagos, datos, proveedores, emisión ni
  recepción: sólo se presenta de otro modo la misma funcionalidad.

## Compras OS · Proveedores (17 nov 2026)

- La ruta `/compras/proveedores` entra en la misma ventana **Compras** del shell
  que Solicitudes y Órdenes. Rutas restantes sin migrar siguen en ERP clásico.
- `SuppliersOS` es exclusivamente presentación: reutiliza el
  `WorkspaceOSRecordExplorer` para lista + detalle en escritorio/tablet
  y lista → detalle → volver en Pocket OS, sin segundo backend ni estado de empresa.
- La página existente conserva `procurementRequest('/suppliers')`, filtros,
  alta/edición (POST/PUT), cambio de estado (PATCH), eliminación confirmada
  (DELETE), la ficha con pestañas y el formulario `supplier-drawer-form`.
- La nueva vista muestra RFC, razón social, contactos, dirección y plazo de
  crédito, con filtros activos/inactivos y accesos a Importar y Órdenes.
- Los datos se leen exclusivamente del estado ya cargado por la página; el
  nuevo componente no importa servicios de API ni modifica autorización.
- Se agrega browser QA en 320/390/1440px para ventana, búsqueda, filtros,
  selección, retorno móvil, ficha completa y apertura/cierre del formulario
  **sin registrar, editar ni eliminar proveedores**.
- Continúa pendiente migrar `/compras/recepciones` y verificar operaciones
  autenticadas de proveedores con permisos multiempresa reales.
