# BuzzBee ERP v17.5.0 — Visual Control Normalization

Esta versión corrige regresiones visuales transversales causadas por la normalización global de botones nativos.

## Alcance
- Reportes / Administración: filas de “Resumen de operación” planas dentro de una sola card.
- Proyectos: rail lateral como lista compacta, sin pills gigantes.
- Compras: acción “más” como control icon-only cuadrado/redondeado.
- Inventario / Productos: switches compactos y acciones alineadas.
- POS: ticket más estable; sólo el carrito mantiene scroll local en desktop.

## Contrato semántico nuevo
- `data-ui-surface="row"` para filas clicables.
- `data-ui-surface="card"` para cards clicables.
- `data-ui-icon="true"` para acciones sólo icono.

No modifica reglas de negocio ni el contrato offline.
