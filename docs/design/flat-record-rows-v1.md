# Business OS — Filas planas en dashboards y módulos

**Referencia:** Captura Marketing > Rendimiento por campaña, 26/oct/2026.

## Hallazgo
`unified-ui.css` aplica `border-radius:999px` a botones nativos sin etiquetas. Algunos componentes renderizan registros completos como `<button>`, por lo que los renglones de tablas se convierten accidentalmente en píldoras con bordes redondeados.

## Solución
La excepción está acotada en `enterprise-ui-v26.css` a botones que son **hijos directos de listas de registros tabulares** (`performanceTable`, `rankList`, `schedule`, `orderList`, `campaignList`, `table`).

- Contenedores de registros rectos con `border-radius:0` y separador inferior de 1 px.
- `background:transparent` original y hover ligero.
- Texto multilínea para descripciones y nombres de campañas largos.
- Foco visible de teclado dentro de la fila.
- Última fila sin borde inferior adicional.
- Cabecera de tablas de botones con borde separador discreto.

No se alteran badges como `Activo` o `En producción`, chips de filtros, pestañas, botones de acción, cards KPI, rutas, estado React, permisos, adaptadores offline ni los cálculos.

## Cobertura
La regla se aplica a módulos que usan la misma estructura de registro, no indiscriminadamente a cualquier card. Incluye Rendimiento y Atribución de Marketing, ranking ROAS, órdenes de Producción y otras listas tabulares que comparten patrones de CSS Modules.

`npm run ui:rows:audit` valida los selectores y sus invariantes. Smartphone Browser Review inspecciona en Chrome el `border-radius`, los bordes laterales y la sombra de las primeras filas de Marketing y Producción a 390 y 1440 px. El resto de QA (build, offline, seguridad) continúa sin cambios.
