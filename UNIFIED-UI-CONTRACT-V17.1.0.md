# BuzzBee ERP v17.1.0 — Unified UI Contract

Esta versión consolida la presentación transversal del ERP sobre Workspace UI + Material Design 3.

## Contrato visual

- Control estándar: 40 px; compacto: 32 px.
- Botones: radio completo (pill), tipografía 13 px / 650.
- Inputs/selects: 40 px, radio 10 px, un solo focus ring.
- Cards: radio 16 px, borde suave, sin sombras ornamentales.
- KPI: 116 px mínimo, valor 25.6 px, padding 18 px.
- Toolbar/table header: 64 px y buscador de 40 px.
- Tabla: encabezado 42 px; filas 52 px; padding 16 px; hover suave.
- Badges/chips: 26 px, radio completo.
- Formularios: gap 16 px; dos columnas desktop, una columna <= 900 px.
- Dashboard grids: `grid-auto-rows:max-content`, evitando cards estiradas con grandes espacios vacíos.
- Modales: una sola política global, dark-mode safe.

## CSS consolidado

Se reescribieron sin bloques históricos acumulados:

- `components/module-system/ModuleSystem.module.css`
- `components/KpiCard.module.css`
- `design-system/components/Button.module.css`
- `Input.module.css`
- `Select.module.css`
- `Card.module.css`
- `Badge.module.css`
- `DataTable.module.css`

Se agregó `design-system/styles/unified-ui.css` como contrato transversal final.

Las antiguas capas `detail-drawer-global.css` y `modal-centered-global.css` dejan de cargarse en runtime; su política útil quedó consolidada en el contrato v17.1.0.

## QA

`npm run qa:ui-contract`
