# BuzzBee HEX UI v1 — controles inspirados en panal

## Referencia
Referencia aportada en conversación (26/oct/2026): sistema de acciones y controles con remates hexagonales, segmentadores, búsqueda, selector y sliders angulares. Adaptación a los colores Business OS (carbón `#242628`, lima `#D5EF66`) y al sistema de tokens compartidos `--bb26-*`.

## Primera implementación (scoped)
Se aplica **solo a Acciones rápidas del dashboard** para validar legibilidad antes de propagarse a formularios y operaciones críticas. Se incorpora el componente reusable `HexQuickActions` con módulo CSS dedicado:

- **Acciones**: botones angulares con icono dentro de hexágono; mantienen los destinos `quickActions` y `navigate(to)`.
- **Búsqueda**: filtra las acciones por nombre de forma insensible a acentos y mayúsculas.
- **Selector**: filtra por `moduleKey` de los datos existentes sin definir rutas nuevas.
- **Segmentado**: alterna entre todas las acciones o primeras cuatro frecuentes; usa `aria-pressed`.
- **Slider**: limita el número máximo de acciones visibles; entrada nativa accesible mediante teclado.
- **Estado vacío**: mensaje y botón para restablecer los filtros.
- **Accesibilidad**: cada control conserva etiqueta y objetivo rectangular completo, aun cuando la superficie decorativa tiene geometría hexagonal; `:focus-visible`, 44 px móviles y `prefers-reduced-motion`.

## Invariantes
- Se mantienen el dashboard existente, sus KPIs hexagonales, widgets, personalización, roles, rutas, API y datos offline de MotorNorte.
- No se reemplazan inputs ni selectores funcionales en pagos, POS, facturación o flujos delicados.
- No se modifica la navegación principal ni la estructura de datos.
- Los estilos se limitan a `HexQuickActions.module.css`, evitando reglas `!important` globales.

## Verificación
`npm run ui:hex:audit` se integra en `Frontend QA`, además del build, lint, offline UAT y pruebas previas. `Smartphone Browser Review` añade una captura de interacción con el filtro Frecuentes a 390 px (`390-hex-actions.png`), junto a las capturas ya existentes de 320/360/390/430 px.

Estas validaciones no sustituyen la revisión humana del aspecto visual y no confirman el deploy en Vercel.
