# BuzzBee v21.4.0 — Inventory Domain Migration

## Scope
Inventory is now isolated behind a domain transport boundary while preserving existing routes and workflows.

### Added
- `modules/inventory/services/inventoryApi.js`
- `modules/inventory/hooks/useInventoryResource.js`
- `modules/inventory/domain/contracts.js`
- `modules/inventory/index.js`
- `scripts/audit-inventory-module-v21.4.mjs`

### Canonical screens
- Products
- Inventory balances
- Movements / Kardex
- Transfers and adjustments
- Warehouses

All canonical Inventory screens continue using CSS Modules and no longer import the global API client directly.

## Validation
Run:

```powershell
npm run architecture:inventory
npm run architecture:procurement
npm run architecture:sales
npm run architecture:react-css-modules
npm run architecture:react-css-modules:phase2
npm run build
```

The build must be executed in an environment with dependencies installed.
