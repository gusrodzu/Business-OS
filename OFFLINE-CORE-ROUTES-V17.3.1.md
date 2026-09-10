# BuzzBee v17.3.1 — Offline Core Routes

Endurece explícitamente la Demo Local frontend-only para Ventas, Proyectos, Marketing y Configuración > Actividad.

- `/sales` y `/sales-enterprise/dashboard`: arrays y colecciones anidadas seguras.
- `/projects/dashboard`: proyectos con miembros, tareas, documentos, comentarios y enlaces siempre como arrays.
- `/marketing/dashboard`: cada campaña incluye `performance`, `leads`, `opportunities`, `expenses` y `metrics` con forma segura.
- `/activity/activity` y `/activity/notifications`: logs, filtros y contador `unread` seguros.
- Corrige `pipeline` para que siempre sea array en la demo offline.

QA: `npm run qa:offline-core-routes`.
