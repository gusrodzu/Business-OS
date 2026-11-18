# Capacidad 2 — Design System Builder · Gobierno de estilos

## Activación
Aplicar cuando se pidan tokens, temas, librería de componentes, patrones visuales entre módulos, CSS repetido, `!important` acumulado o inconsistencias de espaciado/densidad.

## Fuentes de verdad antes de editar
- `apps/web/src/design-system/styles/foundation.css`: entrada única de estilos globales; respetar importaciones y orden.
- `apps/web/src/design-system/styles/enterprise-ui-v26.css`: tokens semánticos `--bb26-*`, incluyendo temas.
- `apps/web/src/design-system/components/`: Button, Card, DataTable, PageHeader, Dialog, Drawer, Input, Select, etc.
- `apps/web/src/ux-foundation/`, `apps/web/src/components/module-system/` y `apps/web/src/components/KpiGrid.module.css`.
- `apps/web/src/design-system/components/ErpModuleResponsive.module.css`: composición **opt-in** compartida para reglas responsive (Ventas, Compras, Inventario y Finanzas). No copiar sus reglas en cada página.

## Arquitectura y tokens
1. Auditar variables existentes `--bb26-*`, `--bb28-*`, `--color-*`, `--md-sys-*` antes de inventar tokens nuevos. Distinguir referencia semántica, variable interna y valor final.
2. Estructurar fundamentos: color (canvas, surface, raised, stroke, text, muted, accent, focus, estado), escala tipográfica, spacing 4/8, radios, sombras, grid/breakpoints, iconografía y modo claro/oscuro.
3. Una decisión visual compartida vive en un token/componente central; un detalle específico vive en su CSS Module; una adaptación responsive compartida utiliza composición opt-in, no selectores globales indiscriminados.
4. Para cada componente documentar anatomía, variantes, tamaños, estados: default/hover/focus-visible/active/disabled/loading/error/empty/success; y comportamiento responsive, roles y accesibilidad.
5. Mantener un inventario de consumidores antes de mover estilos: ¿qué módulos usan la regla?, ¿qué reglas posteriores ganan la cascada?, ¿qué `!important` puede retirarse con evidencia?
6. Migrar módulo por módulo, con diffs pequeños y pruebas; no pegar parches al final del CSS para tapar la cascada. Conservar excepciones funcionales justificadas.
7. Añadir un contrato de regresión cuando se consolide una regla reutilizada: import único, tokens válidos, composición local, sin duplicación y sin overflow.

## Control de cambios
- Dar nombre semántico: `--ui-surface` representa función, no un hex. **No cambiar la paleta oficial** por reetiquetar tokens.
- Contar tamaño CSS, reglas duplicadas y `!important` antes/después, sin vender reducción de bytes como garantía de equivalencia visual.
- No romper contratos de clases `styles.*`, props, permisos o modo oscuro.
- Valorar CSS Modules/Vite: `composes` sólo entre selectores válidos; compilar y comprobar DOM para confirmar comportamiento.
- Versionar cambio, consumidores y criterio de aceptación. Actualizar referencia de tokens si cambia la API del design system.

## Entregable
Mapa token actual → token semántico; catálogo de componentes/estados; consumidores; diff/PR incremental; pruebas de dark/light y breakpoints; deuda técnica remanente.
