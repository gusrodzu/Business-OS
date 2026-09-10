# BuzzBee ERP v17.0.2 — Dashboard Workspace Layout

## Objetivo
Unificar todos los dashboards con el mismo contrato visual y de desplazamiento de Inicio.

- Un solo scroll vertical de página: `AppShell.content`.
- Todos los módulos usan el ancho completo disponible.
- Headers, KPIs y grids dejan de heredar anchos legacy centrados.
- El supporting panel derecho tiene columnas explícitas y ya no colapsa su contenido.
- Tablas y kanban conservan únicamente scroll horizontal cuando lo necesitan.
- Listas acotadas (actividad, agenda, etc.) pueden mantener scroll local.

## Supporting panel
Cerrado: 52px.
Abierto: 352px = 52px de herramientas + 300px de contenido.
En viewport menor: 332px = 52px + 280px.
Debajo de 1180px se oculta como ya hacía el Workspace UI responsive.
