# Business OS — Sistema UI/UX empresarial v26

> **Objetivo:** mejorar todo el ERP sin alterar procesos de negocio, permisos, datos offline ni identidad de BuzzBee. La referencia visual es navegación carbón, acentos lima y superficies neutras. Este documento define el estándar; una primera ronda ya actualiza los componentes compartidos y las siguientes rondas deben evaluar cada módulo con capturas antes de fusionar.

## Referencias públicas (2026)
- W3C WCAG 2.2: https://www.w3.org/TR/wcag/
- IBM Carbon Data Table: https://www.carbondesignsystem.com/components/data-table/usage/
- Atlassian Design Tokens: https://atlassian.design/foundations/design-tokens
- Material 3 / Android Adaptive Navigation: https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
- Apple HIG Buttons: https://developer.apple.com/design/human-interface-guidelines/buttons
- Shopify resource index: https://shopify.dev/docs/api/app-home/latest/patterns/templates/resource-index

## Decisiones de producto
1. **Claridad y utilidad antes que efectos visuales.** Un encabezado por vista con título, descripción corta, contexto de empresa y acción primaria. Bloques de información organizados por tarea; máximo cinco acciones visibles en toolbars complejas.
2. **Un solo estilo de navegación.** Sidebar persistente en pantallas amplias; barra inferior + menú completo en smartphones. El estado activo muestra texto + fondo/acento; no solo color.
3. **Datos fáciles de inspeccionar.** KPI con unidad y período claros, cifras tabulares, etiquetas coherentes y estados de carga/vacío/error. Los gráficos requieren datos reales, leyenda, etiquetas, período y alternativa textual. Nunca inventar tendencias a partir de la demo.
4. **Tablas para flujos empresariales.** Título/búsqueda/filtros, cabeceras claras, orden cuando el dato lo permita, acciones contextualizadas, paginación si existe volumen, selección múltiple solo cuando hay acciones de lote. Preservar columnas mediante scroll horizontal de contenedor en teléfono.
5. **Formularios comprensibles.** Grupos lógicos, etiquetas externas visibles, indicador de obligatoriedad, ejemplo cuando ayude, validaciones conectadas con `aria-describedby` y `aria-invalid`, prevención de duplicados, errores próximos al campo. Botones Guardar y Cancelar siempre accesibles. No cambiar validadores backend como parte de una ronda cosmética.
6. **Estados semánticos (sin depender del color).** Neutro=borrador; informativo=en proceso; success=pagado o completado; warning=por vencer, stock bajo; danger=vencido/crítico/error. No reutilizar lima decorativo como color de error o éxito por comodidad.
7. **Interacción accesible.** Objetivo WCAG 2.2 AA: contraste normal ≥4.5:1, controles no textuales ≥3:1 cuando aplica, foco visible/no tapado, tamaño mínimo WCAG AA de 24px salvo excepciones; adoptar **44px** de objetivo táctil interno en smartphone por comodidad.
8. **Responsive/adaptable.** Verificar 320,360,390,430,768,1024,1440px, landscape y zoom 200%. Evitar barras inferiores bajo teclado y modales con scroll escondido. No basarse únicamente en media queries globales; usar CSS Modules en componentes.
9. **Modo oscuro:** superficies, bordes, acciones, estados y texto usan roles semánticos; revisar contrastes individualmente en lugar de invertir colores.
10. **Consistencia de texto:** español MX, fechas locales, MXN legible, unidades y estados de operaciones diferenciados. Acciones destructivas piden confirmación; no etiquetar una integración externa como activa si aún es simulada.

## Sistema visual adoptado
- **Carbón:** navegación y acciones primarias, no superficies de datos masivas.
- **Lima:** selección, marcas y acento de identidad, no todos los botones.
- **Blanco cálido:** superficies; fondo suave para jerarquía.
- **Tokens v26:** `apps/web/src/design-system/styles/enterprise-ux-v26.css` importado una sola vez vía `foundation.css`.
- **Componentes que deben reutilizarse:** `PageHeader`, `Card`, `KpiCard`, `Badge`, `Button`, `Input`, `Select`, `DataTable`, `FilterBar`, `SmartTable`, `RecordModal`, `EntityDrawer`.
- Evitar más overrides por subcadena del nombre CSS generado. Mantener los estilos por módulo bajo CSS Modules.

## Matriz de renovación por módulos

| Área | Patrón principal | Verificaciones funcionales |
|---|---|---|
| Inicio/Dashboard | KPIs con período + acciones + insights | datos reales o demo claramente identificada |
| Ventas y cotizaciones | pipeline, tabla, detalle, cotización | impuestos, descuentos, vigencia, estados |
| Cobranza/facturas | antigüedad, saldo y captura | no ocultar total/aplicaciones/guardar; no duplicar pagos |
| Compras | solicitudes, proveedores, órdenes | estados, recepciones parciales |
| Inventario | balance por almacén, mínimos, movimientos | no confundir disponible con reservado |
| POS | catálogo táctil, ticket y pago | precio, impuestos, descuentos y cierre de caja |
| CRM | listado y ficha, Kanban, seguimiento | recordatorios, propietario, historial |
| Finanzas | tableros, conciliación, flujos | signo de montos, saldo, fechas, precisión |
| Fiscal | listado CFDI, receptor, cobros, avisos PAC | distinguir preparación de timbrado real |
| RRHH | plantilla, fichas, permisos y asistencia | privacidad, estados sensibles y autorización |
| Producción | órdenes, etapas, consumo de materiales | cantidades, progreso y mermas |
| Proyectos | Kanban, lista, hitos y dependencias | fechas, prioridades, responsable |
| Marketing | campañas, métricas, activos | fuente y período de medición |
| Reportes | filtros, métricas y exportaciones | periodos, datos faltantes, accesibilidad |
| Configuración | formularios agrupados y permisos | guardado, auditoría, advertencias |
| Centro administrativo SaaS | clientes, planes, roles, facturación | segregación de tenants y acceso Super Admin |

## Criterios de aceptación por módulo

**Experiencia:** la acción principal cabe en la primera sección; una persona identifica título, estado, próxima acción y resultados sin depender de colores. Tablas densas continúan operables con teclado y touch. La barra inferior no tapa elementos.

**Accesibilidad:** tabulación/foco visible, etiquetas vinculadas, `aria-invalid` y ayuda asociada, controles táctiles, contraste, ausencia de pérdida de contenido al ampliar y en paisaje. Revisar con lectores de pantalla, no solo por CSS.

**Calidad:** lint/build, cinco suites históricas, `npm run visual:audit`, `npm run mobile:responsive:audit`, demo offline y captura/browser QA. Comparación antes/después a 390px y 1440px, modo oscuro y claro. Marcar `PASS`, `FIX` o `PENDIENTE DATOS` con evidencia por ruta.

## Plan de despliegue (sin rediseño de riesgo alto)

- **Ronda 1 — Base compartida:** tokens, botones, tablas, formularios, encabezados, badges, tarjetas; pruebas de regresión. No cambiar cálculos ni rutas.
- **Ronda 2 — Flujos de dinero:** Ventas, Cobranza, Fiscal, Finanzas y POS. Capturas por vista y auditoría transaccional.
- **Ronda 3 — Operaciones:** Compras, Inventario, Producción, Proyectos y logística.
- **Ronda 4 — Relación y gestión:** CRM, Marketing, RRHH, Reportes y Configuración.
- **Ronda 5 — Plataforma:** SaaS Super Admin, permisos, onboarding, PWA/nativo, oscuridad, QA visual de todas las rutas.

**Estado:** la ronda 1 no equivale a que todas las pantallas del ERP hayan sido inspeccionadas ni publicadas. Continuar por PR pequeños y CI verde; Vercel puede rechazar publicaciones por cuota aunque GitHub compile bien.
