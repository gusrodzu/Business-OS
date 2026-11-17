# Business OS — Sistema de diseño empresarial v26
## Decisión de arquitectura visual
**Identidad original:** navegación carbón + acento lima + lienzo claro; no se clona el dashboard "Warehouse Vault". Se conserva la personalización oscura. Se mantiene el flujo existente de Business OS, datos MotorNorte, roles y operaciones financieras.

**Referencias externas (consultadas octubre 2026):**
- [IBM Carbon · Data tables](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines): densidad, filtros, acciones por fila, acciones masivas y cabeceras.
- [Apple HIG · Layout](https://developer.apple.com/design/human-interface-guidelines/layout): jerarquía, alineación, áreas seguras, tamaños de texto y adaptación.
- [Android Developers · Navigation](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns): barras inferiores en compacto, navegación lateral en vistas amplias.
- [Atlassian · Buttons](https://atlassian.design/components/button/usage): un CTA principal por contexto, verbos concretos.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): foco visible, contraste, navegación mediante teclado, tamaño mínimo de objetivo y reflow.

Las guías sirven como **criterios**, no significan cumplimiento certificado o que hayan sido implementadas en todas las vistas.

## Tokens de diseño de código
Archivo: `apps/web/src/design-system/styles/enterprise-ui-v26.css`; importado al final de `foundation.css`.

| Elemento | Claro | Oscuro / comportamiento |
|---|---|---|
| Acción principal | Lima `#D5EF66` + tinta `#25321B` | Lima `#D9F472` + tinta oscura |
| Navegación | Carbón `#242628` | Conserva tema oscuro existente |
| Superficie | Blanco `#FFFFFF` | `#0B1724` |
| Canvas | `#F5F7F6` | `#07111D` |
| Bordes | `#DDE4E0` | `#34485A` |
| Radio de tarjeta | 18 px | Igual |
| Radio de control | 12 px | Igual |
| Controles | 42 px desktop, 44 px smartphone | Aplicar a controles de alta frecuencia |
| Fila de tabla | 52 px desktop, 48 px smartphone | Tabla táctil, scroll horizontal sin pérdida de columnas |
| Foco de teclado | 2 px + offset 3 px | Color contrastante según tema |
| Microanimación | 140 ms | Se desactiva con prefers-reduced-motion |

Evitar colores semánticos derivados de la paleta de marca. **Éxito, error, advertencia y pendiente** siempre usan tokens específicos, texto visible y significado textual, no solo color. No alterar los números, cálculos o semáforos del ERP.

## Anatomía estándar de todas las pantallas
1. **Contexto de navegación:** nombre de módulo, breadcrumb o categoría y ubicación actual.
2. **Encabezado:** título corto, una frase de ayuda, un único CTA principal relevante.
3. **Resumen operativo opcional:** 2–4 indicadores con contexto temporal, métricas verificables y enlaces a detalle. Nunca inventar tendencias.
4. **Zona de trabajo:** filtros visibles, vistas guardadas, datos densos, acciones por registro y estados vacíos comprensibles.
5. **Detalle y edición:** drawer para consulta/edición habitual; diálogo para compromiso o confirmación; confirmación explícita para acciones destructivas.
6. **Feedback:** guardar, error, estado de carga, errores de campo, modo offline, reintento de red y resultado final.

## Patrones por dispositivo
- **Escritorio (≥1181):** sidebar a la izquierda, área central flexible, herramientas contextuales a la derecha; tablas completas, opciones densas y atajos.
- **Tablet (761–1180):** sidebar en drawer, panel lateral contextual ocultable, grids progresivos; no exigir zoom o scroll horizontal de toda la página.
- **Smartphone (320–760):** barra inferior Inicio/Tareas/Agenda/BuzzBee AI/Módulos, controles 44 px en navegación, una columna en formularios, diálogos utilizables, Safe Areas; tablas se desplazan solo dentro de su contenedor.
- **Accesibilidad:** foco visible, orden lógico, labels reales, mensajes asociados a inputs, métricas con contexto, tabs navegables por teclado y reduced motion.
- **Preferencias:** soportar zoom de texto y tema oscuro sin forzar un color fijo en el contenido.

## Matriz de cobertura funcional
**Estado "fundación aplicada" NO significa que el módulo esté rediseñado o revisado visualmente por completo.** Describe que los componentes compartidos pasan a usar tokens; las pantallas específicas necesitan revisión individual.

| Familia | Pantallas / tareas | Prioridad | Estado |
|---|---|---|---|
| Inicio y Agenda | Panel ejecutivo, KPIs, acciones recomendadas y calendario | Alta | Fundación aplicada; revisión de flujos pendiente |
| Ventas y Cobranza | Cotizaciones, pedidos, cobros, filtros, estados y validación | Alta | Fundación aplicada; revisión de flujos pendiente |
| Inventario | Stock, almacenes, SKU, alertas y reabastecimiento | Alta | Fundación aplicada; revisión de flujos pendiente |
| Compras | Solicitudes, órdenes, recepción, aprobaciones y proveedores | Alta | Fundación aplicada; revisión de flujos pendiente |
| Finanzas y Facturación | Cartera, tesorería, CFDI, conciliación, partidas y vencimientos | Alta | Fundación aplicada; revisión de flujos pendiente |
| Punto de venta | Escaneo, carrito, cobro, turnos y comprobante | Alta | Fundación aplicada; revisión de flujos pendiente |
| CRM | Contactos, oportunidades, historial y seguimiento comercial | Media | Fundación aplicada; revisión de flujos pendiente |
| Proyectos | Kanban, estado, responsables, fechas y tareas | Media | Fundación aplicada; revisión de flujos pendiente |
| Producción | Órdenes, materiales, mermas y trazabilidad | Media | Fundación aplicada; revisión de flujos pendiente |
| Recursos Humanos | Empleados, turnos, solicitudes y expedientes | Media | Fundación aplicada; revisión de flujos pendiente |
| Inteligencia y Análisis | Reportes, gráficas, comparadores y filtros de fecha | Media | Fundación aplicada; revisión de flujos pendiente |
| Operaciones y Administración | Aprobaciones, tareas, datos maestros, integraciones y reportes | Media | Fundación aplicada; revisión de flujos pendiente |
| Configuración y Empresa | Preferencias, permisos, roles, sucursales y personalización | Media | Fundación aplicada; revisión de flujos pendiente |

## Entregas por fases
**Fase A — Shared UI / actual PR:** tokens de claro/oscuro, Button, Card, Input, Select, Badge, DataTable y KPI; CI de contrato. No cambia servicios ni rutas.

**Fase B — Operaciones críticas:** Ventas, Cobranza, Inventario, Compras, Finanzas, Facturación y POS. Cada pantalla: referencia antes/después, teclado, errores, estados offline y 320/360/390/430px.

**Fase C — Productividad:** CRM, Proyectos, Producción, RH y Operaciones. Revisión de tareas, filtros y vistas de detalle.

**Fase D — Análisis y configuración:** Analytics/Inteligencia, dashboards, permisos, administración y preferencias. Unificar gráficas, estados, tablas y carga vacía.

**Fase E — QA completa:** cubrir rutas registradas, pruebas de escritorio/tablet/móvil, dark mode, contraste automatizado, teclado y tecnologías asistivas; y pruebas manuales en Android/iOS/Huawei antes de asegurar cumplimiento.

## Definición de terminado por módulo
- Pantalla principal + crear/editar/detalle + errores/vacíos + carga/offline revisadas.
- Acciones importantes visibles sin saturar el encabezado; botones describen exactamente el efecto.
- No se pierden columnas de datos; hay alternativa razonable para móvil.
- Inputs con labels visibles, ayuda y errores en contexto; no se confunden advertencias con éxitos.
- Roles, permisos, datos demo MotorNorte, permisos de facturación y pagos intactos.
- Capturas 320/360/390/430, 768, 1280 y 1440, además de esquema oscuro.
- CI Frontend QA, Dependency Security, Prisma, backend, MotorNorte y Chrome cuando aplique.
- El cambio de Vercel solo se declara publicado al verificarse el deploy Ready/Production.

## Riesgos y estrategia de mantenimiento
Se observaron **múltiples capas CSS** previas (v21–v25), con `!important` global y variables históricas azules. No sustituirlas en bloque: introducir tokens, migrar componentes gradualmente y retirar capas redundantes únicamente con capturas/tests comparativos. Evitar CSS que seleccione cualquier `div` o clases de módulos por coincidencia de substrings. No asumir que una vista ya usa los componentes canónicos.
