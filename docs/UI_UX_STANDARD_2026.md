# Business OS — Sistema de diseño empresarial v26

**Decisión:** un ERP multipropósito con identidad propia, no un clon visual. Mantener sidebar carbón, área de trabajo neutra/blanca y lima como acento de marca. Mantener los datos, permisos, rutas, módulo offline MotorNorte y procesos fiscales intactos.

## Referencias de criterio

- SAP Fiori, concepto y patrones: https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/22bbe89ef68b4d0e98d05f0d56a7f6c8/85f167b1da3d46d98e26cf4cac4430f8.html
- SAP Fiori, patrones de tablas y adaptación a móvil: https://experience.sap.com/fiori-design-web/responsive-table/ y https://experience.sap.com/fiori-design-web/smart-table/
- Material/Android, navegación adaptable: https://developer.android.com/develop/ui/views/layout/build-responsive-navigation
- Apple, barras de pestañas y barras laterales: https://developer.apple.com/design/human-interface-guidelines/tab-bars y https://developer.apple.com/design/human-interface-guidelines/sidebars
- W3C WCAG 2.2, enfoque, objetivos táctiles y reflujo: https://www.w3.org/TR/WCAG22/
- Shopify, formularios y guardado: https://shopify.dev/docs/apps/design/user-experience/forms
- Nielsen Norman Group, aplicaciones complejas: https://www.nngroup.com/articles/complex-application-design/

Estas fuentes fundamentan principios, no se debe afirmar conformidad normativa sin pruebas de usuarios y dispositivos.

## Identidad y densidad

| Elemento | Criterio |
| --- | --- |
| Logo/sidebar | Carbón; orientación funcional, no decoración |
| Acción primaria | Contraste alto; como máximo una acción dominante por sección |
| Lima | Marca y foco, no confundir con éxito/alerta/error |
| Superficies | Blanco/neutros con bordes suaves, sin sombras pesadas |
| KPI | Nombre, valor, unidad/contexto, periodo y comparación **sólo** si los datos existen |
| Tipografía | Títulos claros y números tabulares, no iconos/labels minúsculos |
| Espaciado | Escala base 4, 8, 12, 16, 20, 24 px |
| Radio | 10 px control, 14 px grupos pequeños, 18 px tarjetas |
| Control interactivo | ≥40 px en escritorio; objetivo recomendado ≥44 px en dispositivos táctiles |
| Estado | Texto + icono/color cuando corresponda; nunca sólo color |
| Dark mode | Variables semánticas, sin fondo blanco fijo encima de textos claros |
| Movimiento | Reducir/eliminar animación no esencial para prefers-reduced-motion |

Los `--bb26-*` son la primera capa de tokens. No introducir una segunda capa v26 equivalente. Los estilos específicos de cada módulo siguen encapsulados en CSS Modules. No agregar selectores globales por nombres parciales como `[class*="Card"]` que afecten elementos no relacionados.

## Patrones de experiencia comunes

1. **Página de lista:** título + descripción breve → acción primaria → búsqueda/filtros/vistas guardadas → tabla/resultados → contador, paginación y estados vacíos.
2. **Página de objeto:** nombre + estatus + acciones → resumen → tabs de información → historial/documentos y operaciones. Las acciones irreversibles tienen confirmación clara.
3. **Formulario:** campos agrupados por significado; labels visibles, valores iniciales explicados, validación cercana al campo, mensajes vinculados por `aria-describedby`, sin borrar valores al fallar.
4. **Tabla:** identificar registros, ordenar/filtrar cuando aplique; importes alineados y tabulares, encabezados legibles. En móvil, decidir si la tarea exige comparar columnas (scroll horizontal de tabla) o procesar registros individuales (vista de tarjetas o detalles expandibles). No ocultar datos sin alternativa.
5. **Carga y vacío:** loaders descriptivos, error recuperable, vacío con explicación y acción útil. Separar no-hay-datos de error de conexión y de falta de permisos.
6. **Mensajes:** notificación en contexto, título de error orientado a la causa y siguiente acción; conservar borradores al perder la conexión.
7. **Accesibilidad:** navegación por teclado, orden de foco, etiquetas, foco no oculto por cabeceras/barras, zoom/reflow, contraste normal WCAG AA y objetivos táctiles conforme a WCAG 2.2.

## Estructura responsive

- **320–599 px:** una columna y navegación inferior por destinos principales; acciones de página agrupadas y modales a altura de dispositivo; preservar espacio de teclado y safe areas.
- **600–839 px:** una o dos columnas; filtros en filas; tablas según tipo de tarea.
- **840–1199 px:** shell/tablet adaptativo con rail/drawer y panel de detalle opcional.
- **≥1200 px:** sidebar y workspace de mayor densidad; panel derecho contextual sólo cuando haya ancho suficiente.
- No fijar alturas absurdas ni usar `100vh` si hay teclado/barras; preferir `100dvh` con fallbacks.

## Matriz de migración por módulo

| Dominio | Objetivo visual/UX | Paso |
| --- | --- | --- |
| Inicio / Dashboard | Métricas por rol y acciones prioritarias con datos comprobables | 1 |
| Ventas / Cobranza | Tablas densas, flujo de cotización-pedido-cobro, estados y facturas pendientes | 1–2 |
| Compras / Proveedores | Solicitud → aprobación → OC → recepción, historial y responsables | 2 |
| Inventario / Almacenes | Stock, mínimos, trazabilidad y reabastecimiento; escáner móvil futuro | 1–2 |
| CRM / Terceros | Fichas de empresa/contacto, tareas, oportunidades y actividad | 2 |
| POS | Gran objetivo táctil, carrito visible y cobro/cancelación inequívocos | 2 |
| Finanzas / Tesorería | Importes tabulares, conciliación, vencimientos y datos exportables | 3 |
| Fiscal / CFDI | Formularios guiados, estados PAC/SAT reales, errores recuperables | 3 |
| Producción | Órdenes, consumos, avance, alertas y dependencia de inventario | 3 |
| Proyectos / Tareas | Lista/Kanban, responsables y tiempos sin sobrecargar cada tarjeta | 3 |
| Recursos Humanos | Datos de empleados, permisos e historial sensible | 4 |
| Marketing / Reportes | Segmentación, filtros, periodos comparables y métricas sin falsas tendencias | 4 |
| Configuración / SaaS Admin | Jerarquía de permisos, advertencias y operaciones irreversibles | 4 |

**Paso 1 de este PR:** tokens empresariales y componentes compartidos (`Button`, `Input`, `Select`, `Card`, `Badge`, `DataTable`, `PageHeader`) con una auditoría CI. No implica que cada página legacy haya sido rediseñada o validada visualmente. Los pasos 2–4 deben salir en PR separados, con pruebas y capturas a 320/360/390/430 px y en escritorio, comparados contra esta guía.

## Aceptación antes de fusionar una ronda

- Build/lint/visual audit + offline MotorNorte + seguridad + backend y Prisma aprobados.
- Prueba de teclado, foco visible, elementos no recortados, mensajes de validación y zoom móvil.
- Al menos una pantalla real por patrón afectado, no una landing estática.
- Check contraste con tokens de modo claro/oscuro; los valores del usuario/datos no se modifican.
- No afirmar publicación en Vercel hasta estado **Success** y visita al URL público; el límite de compilaciones es independiente de CI.
