# Sistema visual de Business OS

Referencia para auditorías y cambios de jerarquía, color, tipografía, espaciado, componentes y temas. La fuente definitiva sigue siendo el código y la guía `docs/ui-ux/BUSINESS_OS_UI_UX_V1.md`.

## Identidad

- BuzzBee: interfaz de trabajo **Dark Premium**, superficies carbón y acento lima; modo claro legible.
- **Dashboard con cards KPI rectangulares**. No regresar a hexágonos ni panales decorativos.
- Favorecer lectura rápida y jerarquía operativa sobre efectos de brillo, grandes banners o badges innecesarios.
- No introducir copias de componentes existentes ni parches CSS `!important` como solución por defecto.

## Tokens y coherencia

Antes de crear variables nuevas, inspeccionar los tokens actuales `--bb26-*`, `--color-*` y las clases del design system. Mapear intenciones semánticas: canvas, surface, raised-surface, text, text-muted, stroke, accent, focus, success, warning, danger e info.

No aplicar una paleta distinta por módulo; los colores de estado requieren texto o icono además del tono.

## Reglas visuales

- Ritmo espacial principal de 8 px, con incrementos 4/8/12/16/24/32, ajustados al diseño existente.
- Alinear contenidos y controles a ejes consistentes; `min-width:0` y `minmax(0,1fr)` donde eviten desbordamientos en grids.
- Radios de referencia: controles 8–12 px; cards 12–18 px; modales/drawers 16–20 px. No cambiar globalmente sin auditar consumidores.
- Título de página > título de sección > widget > etiquetas de campo > texto de apoyo.
- Números KPI y monetarios con dígitos tabulares; permitir cadenas largas y localización.
- Priorizar una acción principal por pantalla; emplear variantes secundarias/ghost cuando corresponda.
- Cada componente debe contemplar normal, hover, activo, foco, deshabilitado, cargando, error, vacío y éxito cuando sea pertinente.
- Respetar `prefers-reduced-motion`; no usar animación como única pista de estado.

## KPI cards originales

Mantener `data-dashboard-kpi-grid="cards"`, métricas de API/demo y personalización segregada por usuario/empresa. El código conserva nombres heredados como `honeycombPreferences.js`: el nombre histórico **no** obliga a un diseño hexagonal ni autoriza cambiar claves persistidas. Usar 4 columnas sólo cuando sean legibles; degradar a 2 o 1 según el espacio real.

## Componentes compartidos

Antes de modificar pantallas, inspeccionar `apps/web/src/design-system/components/`. Preferir sus Button, Card, PageHeader, DataTable, Dialog, Drawer, etc. Crear variantes comunes sólo después de comprobar uso real en más de un módulo.

No afirmar conformidad de contraste sin medición visual y ratio; las pruebas estáticas no sustituyen QA de navegador.
