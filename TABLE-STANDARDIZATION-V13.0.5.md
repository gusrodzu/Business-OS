# BuzzBee ERP · Table Standardization v13.0.5

## Objetivo
Eliminar recortes de encabezados, valores y acciones en tablas del ERP y definir un comportamiento responsive único.

## Causa corregida
La capa visual v12.3 imponía `min-width: 680px` a **todas** las tablas cuando el viewport era de 700 px o menos. Las tarjetas con `overflow: hidden` recortaban la última columna, como ocurría en **Capital humano por área / Nómina mensual**.

## Nuevo contrato global
- Tablas compactas (2–4 columnas): se adaptan al ancho disponible y permiten wrap de encabezados/celdas.
- Tablas anchas (5+ columnas): en pantallas pequeñas conservan un ancho útil y habilitan scroll horizontal en vez de recortar contenido.
- Se elimina `nowrap` global en `th` y última celda como causa de overflow.
- Los textos internos usan `overflow-wrap:anywhere` y `text-overflow:clip`.
- Los contenedores de tablas pueden encogerse correctamente dentro de CSS Grid/Flex.
- `DataTableFrame` expone `data-bb-table-frame` y `data-bb-table-scroller` como hooks estables para futuras tablas.

## QA
Ejecutar:

```bash
npm run qa:tables
```

Resultado esperado: `Table standard v13.0.5 OK · 10 checks passed.`
