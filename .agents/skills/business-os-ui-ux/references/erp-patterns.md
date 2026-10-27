# Patrones de UX para Business OS

Objetivo: mejorar tareas reales de un ERP multiempresa sin alterar lógica, permisos, API, datos ni demo offline.

## Navegación

- **Nivel 1:** rail de módulos (icono, foco, tooltip/nombre accesible, activo).
- **Nivel 2:** explorador contextual para el módulo elegido (búsqueda, favoritos, recientes, secciones, enlaces habilitados).
- Evitar tabs superiores que dupliquen navegación primaria; conservar tabs para detalles internos.
- En móvil: drawer con foco inicial, retorno de foco al cerrar, scroll independiente y navegación usable con una mano.
- Nunca exponer rutas deshabilitadas mediante favoritos, recientes o cambio de empresa.

## Dashboard

- Contexto claro de usuario/empresa; primero tareas urgentes, después indicadores y operación.
- Cards KPI **rectangulares** de etiqueta/valor/estado; evitar panal y figuras decorativas.
- Personalización de indicadores y widgets existente, sin modificar claves de persistencia ni mezclar empresas.
- Los números deben derivarse de los datos existentes y no de fixtures inventados.

## Tablas y listas

Buscar, filtrar, ordenar si aplica, mostrar estados de carga/vacío/error y proporcionar acciones claras por fila. Alinear cifras de forma consistente y conservar acceso a detalles en teclado. En móvil decidir entre scroll horizontal dentro de la tabla y tarjetas de registro según datos/tarea; evitar overflow de toda la pantalla.

## Formularios

Labels visibles, instrucciones concisas, validación cerca del campo, errores claros, guardado con feedback y confirmaciones de acciones destructivas. Respetar cancelación, datos no guardados, estados de guardado y permisos.

## Flujos especializados

- **Ventas/Compras:** preservar estados de cotización, pedido, orden, entrega, factura, pago y vínculo con terceros.
- **Inventario:** distinguir stock, mínimos, almacenes, SKU, movimientos y disponibilidad.
- **POS:** optimizar táctil y lectura de totales; impedir dobles envíos y conservar transacciones.
- **CRM/Proyectos:** filtros, responsables y estado; Kanban debe tener alternativa de lista/teclado.
- **Finanzas:** cifras monetarias sin ambigüedad, fechas, moneda y estados de conciliación.
- **Super Admin:** navegación, datos y acciones estrictamente acotados al rol.

## Responsive

Comprobar 320/360/390/430/768/1024/1440 px y temas claro/oscuro. En móviles contemplar safe areas, teclado virtual, orden de tabulación, targets táctiles cómodos y textos largos. No declarar mobile-ready sólo por CSS `@media`.

## Estados de pantalla

Para cada flujo priorizar: normal, loading, vacío, error recuperable, acceso prohibido, operación exitosa y conexión perdida/estado offline si está soportado. No crear estados ficticios que oculten fallos.
