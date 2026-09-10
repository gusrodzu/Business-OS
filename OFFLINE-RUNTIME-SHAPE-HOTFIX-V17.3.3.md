# BuzzBee v17.3.3 — Offline Runtime Shape Hotfix

Corrige tres fallos runtime detectados en Demo Local/Vercel:

- Proyectos: `project.metrics.taskProgress` siempre existe y la UI tolera metrics ausente.
- Centro Administrativo: `activity` siempre es array y `upcoming.agenda` tiene contrato estable.
- Ventas: cotizaciones/pedidos offline siempre incluyen `createdBy`, fechas y total base; la UI tolera creador ausente.

La corrección se aplica tanto en el adaptador offline como en la UI para defensa en profundidad.
