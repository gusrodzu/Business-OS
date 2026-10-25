# Business OS — Sistema de interfaz empresarial v26
**Estado:** primera capa compartida implementada; revisión y adaptación de páginas particulares por fases. No es una certificación visual de todos los módulos.

## Dirección visual aprobada
Business OS conserva la identidad **carbón + lima + superficies blancas cálidas** de la referencia Warehouse Vault: sidebar carbón, navegación compacta, área principal aireada, esquinas moderadas, tablas legibles y KPI con jerarquía fuerte. El lima es un acento para destacar foco, selección y puntos importantes; **no** reemplaza colores semánticos: errores rojos, alertas ámbar, éxitos verdes y datos sin códigos cromáticos exclusivos.

La UI tiene que resultar tan cómoda para un dependiente operando el POS como para un administrador que revisa movimientos y balances; una sola estructura, variaciones por complejidad.

## Referencias consultadas (octubre de 2026)
1. [IBM Carbon, tablas de datos](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines): búsqueda, filtros, acciones de fila, ordenación, paginación, selección múltiple y visibilidad de acciones.
2. [IBM Carbon, filtrado](https://www.carbondesignsystem.com/building-blocks/core/patterns/filtering): selección simple, múltiple y de varias categorías cuando cambie la forma de buscar.
3. [Material / Android, navegación adaptable](https://developer.android.com/develop/ui/views/layout/build-responsive-navigation): bottom navigation para pantallas compactas, rail en tablet y drawer en tamaños grandes.
4. [Apple, diseño de controles](https://developer.apple.com/design/tips/): objetivos táctiles alrededor de 44 × 44 pt; respetar safe areas, orientación, teclado.
5. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/): texto normal con contraste AA >= 4.5:1; objetivos AA >= 24 × 24 CSS px o excepciones explícitas; foco visible y no oculto.
6. [Apple HIG, navegación por tabs](https://developer.apple.com/design/human-interface-guidelines/tab-bars): usar tabs para navegación, no como sustituto de botones de acción.

## Módulos bajo el estándar
El alcance contempla explícitamente **Facturación** comercial y fiscal (CFDI), **Recursos Humanos**, Ventas, Cobranza, Compras, Inventario, Punto de Venta, CRM, Producción, Proyectos y Marketing. Su migración visual se valida por dominio; no todos están concluidos.

## Núcleo compartido (implementado en PR v26)
| Elemento | Regla |
|---|---|
| Sidebar | carbón; estados activo/foco en lima, sin crear doble navegación |
| Fondo | superficies blancas y canvas neutro, bordes suaves, elevación discreta |
| Encabezado | eyebrow opcional / título / descripción breve / **una** CTA principal |
| Botones | primary carbón, secondary contorno o neutral, destructive rojo; 44 px para interacción táctil |
| Formulario | etiqueta persistente, ayuda asociada con `aria-describedby`, error con `aria-invalid`, altura 44 px |
| Tarjeta | bordes semánticos, 18 px de radio, 20 px padding desktop, 16 px móvil |
| Tabla | encabezados legibles, filas ~52 px, hover y foco; número tabular y alineado a la derecha |
| Estado | etiqueta semántica además de color; loading, vacío, error, sin conexión y sin permisos |
| Móvil | datos prioritarios primero, navegación inferior, toolbar flexible, tabla con scroll sin perder columnas |
| Modo oscuro | tokens separados por `:root[data-theme='dark']`; no forzar superficies blancas |

## Cinco arquetipos de pantalla (aplicar con UXFoundation/ModuleSystem)
1. **Resumen / Overview:** título, contexto, 3–5 KPI útiles, siguiente acción, alertas, actividad y detalle.
2. **Lista operativa:** título/CTA, buscador y filtros arriba, tabla con ordenamiento, acciones consistentes y paginación.
3. **Detalle:** identificación/estado, acciones contextualizadas, tabs de información, bitácora/historial, documentos.
4. **Captura / Transacción:** formularios divididos por tema, errores cerca del campo, resumen fijo antes de confirmar, protección contra doble envío.
5. **Analítica:** alcance temporal explícito, leyenda legible, fuente y unidades, drill-down, estados sin datos. No inventar tendencias de demo.

## Matriz de cobertura por módulo (tareas de diseño, NO todas concluidas)
| Prioridad | Workstream | Vistas a armonizar | Chequeos críticos |
|---|---|---|---|
| P0 | Navegación, Inicio y onboarding | Home, acceso, empresa, apps, preferencias | Jerarquía; responsive; roles; demo offline |
| P0 | Ventas / Cobranza / CRM | Pipeline, cotizaciones, pedidos, clientes, devoluciones, recibos | Tablas, búsqueda, moneda, estados, modales, confirmaciones |
| P0 | Compras / Inventario | Órdenes, recepción, proveedores, productos, stock, movimientos | SKU, stock bajo, cantidades, importes, almacenes |
| P0 | Punto de Venta | Catálogo, carrito, cobro, cierres, tickets | Una mano, táctil, validación de montos, teclado y escáner |
| P1 | Finanzas y fiscal | CxC/CxP, tesorería, presupuestos, conciliación, CFDI | Moneda, vencimientos, documentos, permisos; NO alterar timbrado |
| P1 | Reportes e inteligencia | Resumen, tablas exportables, gráficos, alertas | Fechas, definiciones KPI, filtros, accesibilidad de gráficas |
| P1 | Proyectos / Producción | Kanban, órdenes, materiales, entregables, avance | Progresión y alternativas al arrastre, estados, responsables |
| P1 | Recursos Humanos (RR. HH.) | Empleados, asistencia, expedientes, prenómina | Dato sensible, permisos, validaciones, tablas |
| P2 | Marketing, Integraciones, Automatizaciones | Campañas, conexiones, reglas, logs | Acción y estado claros, configuración sin sorpresas |
| P2 | Configuración / Administración SaaS | Usuarios, roles, giros, apps, licencias | Confirmación, permisos, contexto empresa, auditoría |

## Criterios de aceptación por pantalla
- **Anchuras:** 320, 360, 390, 430, 768, 1024 y 1440 px; orientación portrait y landscape donde aplique.
- No overflow horizontal del documento; tablas densas pueden desplazarse dentro de su contenedor.
- Acciones principales visibles sin tapar contenido; bottom nav no invade teclado ni modales.
- Control táctil de preferencia 44 × 44 px; WCAG 2.2 AA exige 24 × 24 CSS px con excepciones. Contraste normal >= 4.5:1.
- Roles, permisos, rutas, estados offline, datos MotorNorte, importes/IVA/saldos y API intactos.
- Estados: vacío, loading, error, offline, disabled, foco por teclado, seleccionado y éxito.
- Test de flujos mínimos: crear/consultar/editar sin pérdida de datos; errores corregibles sin reiniciar.
- Capturas revisadas visualmente, no sólo linters. QA con Chrome para UI web y dispositivos Android/iPhone/Huawei antes de publicar en tiendas.

## Estrategia técnica y deuda actual
`foundation.css` importa múltiples capas heredadas (MD3, Apple Fluid, v23, v24, v25); hay overrides con `!important`. **No** debe crearse una nueva regla genérica que afecte a todos los `div`, las clases generadas de CSS Modules o a páginas de clientes sin contrato. El v26 agrega tokens y mejoras acotadas a componentes concretos, y se irá retirando CSS obsoleto **únicamente** con cobertura visual de regresión. Separar diseño de pagos, productos, autenticación y datos; cada cambio se integra mediante PR con las suites de CI y screenshots del módulo afectado.

## Estado real del lanzamiento
- Diseño v26: **primera capa de componentes compartidos**, no rediseño completo verificado.
- PR posterior: adaptar pantallas especiales gradualmente y consolidar CSS redundante.
- Vercel: comprobar cada nuevo deploy; los bloqueos por `build-rate-limit` pueden dejar la web mostrando un commit anterior.
- Android/iOS/Huawei: las interfaces web responsivas **no equivalen** a binarios nativos QA ni publicación en tiendas.
