# BuzzBee v17.6.0 — Offline Auto Parts Demo

La cuenta `admin@erp.local` representa a **MotorNorte Refacciones Automotrices, S.A. de C.V.** y opera completamente en frontend.

La demo incluye catálogo de refacciones, tres almacenes/sucursales, empleados, talleres/flotillas como clientes, proveedores de baterías/frenos/suspensión/lubricación, compras, ventas, cobranza, POS, marketing, proyectos, RRHH, finanzas, producción ligera de kits, agenda, reportes e intelligence.

Toda consulta con `offlineDemo=true` entra por `offlineDemoRequest()`. Las rutas sin fixture dedicado reciben `universalDemoContext()` y después pasan por la normalización de shapes para evitar colecciones `undefined`.

No habilita red, PostgreSQL, workers, email, WhatsApp ni Super Admin SaaS.
