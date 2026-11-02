# Business OS Next · Wireframe Mobile First v2

**Referencias aprobadas por el usuario:** wireframes monocromáticos de una aplicación móvil de servicios/comercio: Home con buscador y categorías, catálogo en grid, fichas de detalle, lista/carrito, confirmación, perfil y navegación inferior. Son referencias de **arquitectura y jerarquía**, no assets para copiar ni una indicación de convertir Business OS en un marketplace.

## Traducción a Sistema Operativo para Negocios

| Patrón del wireframe | Experiencia Business OS | Fuente de datos y guardias |
| --- | --- | --- |
| Barra superior + búsqueda | Contexto de empresa, buscador universal y perfil | CommandPalette existente, usuario autenticado |
| Categorías 4 columnas | **Launcher de apps** por área, hasta 8 visibles y «Ver todas» | `navigationGroups` + módulos habilitados, filtros por perfil, favoritos por tenant |
| Hero / promoción | **Prioridades del día**: solicitudes, alertas, órdenes que requieren atención | Solo datos de `/dashboard` o demo identificada, jamás porcentajes ficticios |
| Productos recomendados | **Actividad / registros recientes** y KPIs rectangulares | Datos reales de la empresa activa y permisos |
| Catálogo de productos 2 columnas | Inventario: productos/refacciones en tarjetas con stock, SKU, precio y filtros | Inventario autorizado, no datos entre empresas |
| Ficha de producto | Panel de producto/cliente/prospecto/pedido con información jerarquizada | Rutas y EntityDrawer existentes |
| Carrito y orden | **POS**: carrito de venta, cantidades, impuestos, cobro y confirmación | Operaciones existentes; no inventar flujos de pago |
| Lista de artículos | Compras / órdenes / tareas: listas táctiles y estado por registro | Paginación/filtros reales |
| Perfil/ajustes | Perfil, empresas permitidas, seguridad, preferencias y licencias | Acceso por rol, Super Admin separado |
| Bottom nav de 5 destinos | Inicio / Tareas / Agenda / BuzzBee AI / Módulos | Conservar rutas reales y safe-area existente |

## Contrato de diseño

1. **Mobile first:** viewport 320/360/390/430 px y landscape; tablet después, desktop no cambia hasta QA móvil.
2. **Jerarquía:** barra contextual → prioridades → categorías/apps → indicadores → registros y acciones recientes. Los accesos operativos nunca se reemplazan con promociones.
3. **Launcher:** 4 columnas para teléfonos con espacio suficiente, 3 en <=375 px para etiquetas legibles. Primeras 8 apps, filtros por área y «Ver todas». Iconografía coherente y espacio de toque >=44px. Favoritos mantienen accesibilidad táctil; nunca son permiso.
4. **Pantallas interiores:** detalles completos, acciones visibles, campos en una columna, filtros táctiles, bottom sheets/drawers accesibles, tablas con scroll dentro del componente, estados vacío/carga/error reales.
5. **Identidad:** conservar Business OS / BuzzBee y diseño OS premium. Wireframes blancos indican estructura; adaptar a tema claro y dark premium, sin imponer blanco ni usar placeholders de productos reales.
6. **Seguridad:** multiempresa, roles, licencias, aislamiento tenant, demo offline y Super Admin preservados. Datos económicos y stock desde APIs o simulación declarada.

## Implementación incremental

- **W1 (este PR):** reordenar Home móvil para mostrar aplicaciones antes de KPIs y adaptar `WorkspaceAppShelf` a grid de categorías 4/3 columnas, controles de favoritos y «Ver todas». No hay cambios de backend.
- **W2:** búsqueda visual completa del Home reutilizando CommandPalette; no duplicar endpoints.
- **W3:** patrón `MobileRecordCard` compartido: productos, oportunidades, pedidos, tareas, transacciones con datos y acciones originales.
- **W4:** pantalla de detalle con cabecera, estado, secciones y acciones seguras. Base reutilizable en Inventario y Ventas.
- **W5:** POS tipo carrito/checkout empresarial **únicamente en el POS**, manteniendo caja, inventario, impuestos y comprobantes.
- **W6:** perfil, ajustes, empresa activa y QA con Android/iOS/Huawei, roles y tenants diferentes.

**Aceptación:** `npm run mobile:responsive:audit`, `npm run ui:light-navigation:audit`, lint/build, Frontend QA, Smartphone Browser Review, ERP Route Render Sweep, seguridad/Prisma, y luego smoke auténtico. No marcar pixel-perfect ni deploy completado sin verificación del SHA.

El objetivo es un **Sistema Operativo para Negocios** con claridad de e-commerce para sus aplicaciones, no una tienda online.
