# BuzzBee ERP v15.0.2 · Sales Module Import Hotfix

Corrige la regresión de modularización donde `SalesEnterprise.jsx` importaba `./Sales`, pero `Sales.jsx` seguía en `apps/web/src/pages`.

## Correcciones
- `Sales.jsx` y `Sales.module.css` viven ahora en `apps/web/src/modules/sales/ui/pages/`.
- Imports internos de `Sales.jsx` ajustados a la nueva profundidad modular.
- Se eliminan los archivos legacy `apps/web/src/pages/Sales.jsx` y `Sales.module.css`.
- Se restauran estilos modulares faltantes detectados por auditoría de imports:
  - `modules/shared/ui/ModulePlaceholder.module.css`
  - `modules/inventory/ui/pages/Catalog.module.css`
  - `modules/inventory/ui/pages/Inventory.module.css`
- Se agrega `.env.example` sin secretos reales para mantener Deployment QA reproducible.

## Validación
- Auditoría de imports relativos: 0 imports rotos.
- `npm run qa:modular-all`: 36/36 PASS.
- `npm run qa:all`: 47/47 PASS.
