# BuzzBee ERP v20.4.0 — Visual Launch Polish

## Alcance aplicado

Se realizó una capa visual global de pre-lanzamiento sin alterar los contratos funcionales de los módulos. El sistema prioriza legibilidad, densidad ERP, consistencia, accesibilidad y responsive.

## Cambios
- Canvas y superficies con jerarquía más clara.
- Tipografía de títulos y textos secundarios normalizada.
- KPI compactos y consistentes.
- Tablas optimizadas como superficie principal de información.
- Inputs, selects, botones, tabs, chips y estados con ritmo de 40 px.
- Sidebar más compacto, selección más clara y grupos mejor diferenciados.
- Topbar más ligera y buscador menos dominante.
- Dialogs/drawers/popovers con un mismo lenguaje.
- Dark mode con profundidad por superficies y menor ruido de bordes.
- Focus visible y reduced motion para accesibilidad.
- Ajustes responsive para tablet y móvil.

## Regla de producto
La capa v23 es global y se importa al final de la cascada para corregir inconsistencias heredadas sin reescribir cada módulo. Las futuras pantallas deben consumir los componentes del design system en vez de crear estilos locales equivalentes.
