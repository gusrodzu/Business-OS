# BuzzBee ERP v16.0.0 — Material Design 3 Full Rollout

Esta versión ejecuta las fases 2 a 7 del Design System.

## Fase 2 — Controles
Button, Input, Select, Switch y Checkbox usan roles, estados y geometría MD3.

## Fase 3 — Cards y estados
Cards, KPI, Chips y Badges comparten superficies, forma, elevación y estados.

## Fase 4 — Navegación
Topbar, Sidebar, tabs y shells ERP/Platform consumen tokens MD3.

## Fase 5 — Datos y overlays
Se incorporan DataTable, Dialog, Drawer y Snackbar canónicos. Los componentes legacy reciben una capa de compatibilidad visual.

## Fase 6 — Migración por módulo
AppShell etiqueta cada ruta con `data-md3-module`; todos los dominios ERP y Platform quedan bajo el contrato visual global sin alterar lógica de negocio.

## Fase 7 — Dark mode y accesibilidad
Light/Dark/System, reduced motion, focus visible, contrast preference, roles ARIA y tamaños táctiles adaptativos.

## Regla permanente
Los módulos nuevos deben consumir `design-system/components` y no crear controles visuales duplicados si existe un equivalente canónico.
