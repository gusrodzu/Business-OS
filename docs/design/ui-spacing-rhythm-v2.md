# Business OS — UI Spacing Rhythm v2
Fecha: 26 de octubre de 2026.

## Objetivo
Unificar distancias entre encabezados, widgets, controles, tablas y el borde del área de trabajo en todos los módulos que usan la fundación visual. Mantener la identidad BuzzBee, las funciones originales y el panel lateral contextual ya integrado.

## Escala compartida
- Separación entre secciones: `--bb28-page-gap: 24px`
- Separación entre paneles: `--bb28-panel-gap: 18px`
- Relleno interior de paneles: `--bb28-panel-padding: 20px`
- Separación de controles: `--bb28-control-gap: 12px`
- Relleno vertical de filas compartidas: `--bb28-row-pad-y: 14px`
- Margen interior horizontal: `--bb28-space-inline: clamp(16px,1.8vw,28px)`

Se incorporan a `enterprise-ui-v26.css`, manteniendo el orden de hojas, sin reset universal y sin afectación a los diálogos y drawers.

## Alcance transversal
- `AppShell`: margen de seguridad de páginas en escritorio, manteniendo la separación a la barra de herramientas.
- `PageHeader`, `KpiGrid` y `UXFoundation`: espaciado entre headers, tarjetas resumen, filtros, tablas y pies.
- `SalesFulfillment`: pestañas, encabezado de historial, caja de búsqueda y contenedor de remisiones.
- `GoodsReceipts`: tarjetas de órdenes pendientes, cabeceras, filtros y tabla.
- `Pos`: separación entre catálogo/ticket, barra de búsqueda, categorías, tarjetas, encabezado y cliente; composición apilada en escritorios estrechos.
- `Production`: órdenes activas, costes, capacidad, secciones y columnas responsivas.
- `Marketing`: encabezados y filas de rendimiento, tabla desplazable y columnas adaptables.

## Límites de seguridad
Ningún endpoint, permiso, inventario demo, facturación, carrito, lógica POS, navegación o contrato offline se modifica. No se fuerzan estilos dentro de tablas densas sin scrollbar propio. Se evita cambiar el comportamiento de la barra inferior móvil.

## Verificación
- `npm run ui:spacing:audit`: escala de tokens, selectors compartidos y cobertura de las cinco pantallas.
- `Frontend QA`: lint, build, auditorías visuales, offline UAT y regresiones existentes.
- `Smartphone Browser Review`: sus 20 capturas base a 320/360/390/430 px y cinco rutas adicionales (Entregas, Recepciones, POS, Producción y Marketing) a 390 y 1440 px.
- QA backend, Prisma y transacciones independientes.

La auditoría de navegador comprueba geometría, pero no reemplaza una revisión manual de capturas o lectura completa con tecnología asistiva.
