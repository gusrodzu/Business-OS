# BuzzBee ERP v16.0.2 — Table CSS Cleanup

- Desactiva del bundle/runtime las capas globales obsoletas v9/v10.5/v12.3/v13 que competían con Material Design 3. Se conservan sólo como referencia/compatibilidad de QA histórico y ya no se importan en `main.jsx`.
- Platform Admin usa el componente canónico `DataTable`.
- Se eliminan selectores globales desnudos `table`, `th` y `td` del CSS Module de Platform Admin.
- Las tablas del Control Plane quedan encapsuladas, con scroll horizontal sólo cuando es necesario.
- Mantiene `module-global.css` temporalmente como compatibilidad para módulos aún no completamente migrados a componentes MD3.

QA: `npm run qa:table-css`.
