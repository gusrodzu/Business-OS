# BuzzBee v17.1.1 — Topbar Grid Hotfix

Corrige la estructura del Topbar Workspace.

## Causa
El buscador estaba anidado dentro de `.actions`, aunque el CSS lo trataba como columna 2 del grid principal. Esto dejaba la columna 3 vacía y desbalanceaba buscador, acciones y perfil.

## Contrato
- Columna 1: contexto/breadcrumb.
- Columna 2: búsqueda global.
- Columna 3: AI, tema, notificaciones y perfil.
- En <=1180px se oculta búsqueda y se vuelve grid de dos columnas.
