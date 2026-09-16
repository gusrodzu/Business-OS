# BuzzBee v21.3.0 — Procurement domain migration

## Scope
Migrates the Compras/Procurement frontend boundary to the v21 React + CSS Modules architecture without changing business workflows.

## Applied
- Added `modules/procurement/services/procurementApi.js` as the domain transport boundary.
- Added `modules/procurement/hooks/useProcurementResource.js` for reusable async resource state.
- Added a public `modules/procurement/index.js` boundary.
- Purchase Requests, Purchase Orders, Goods Receipts, Procurement Center and Suppliers no longer import the global API client directly.
- Existing CSS Modules remain encapsulated per Procurement screen.
- Added `npm run architecture:procurement` gate.
- Synchronized root, web and API package versions to 21.3.0.

## Validation performed
- Procurement architecture gate: PASS (5 canonical JSX screens).
- React/CSS Modules gate: PASS.
- Phase 2 Design System/Shell gate: PASS (8/8).
- Sales v21.2 architecture regression gate: PASS.

## Remaining
This is the domain-boundary migration. Larger Procurement screens can be decomposed further into feature components/hooks during UX/function UAT, without blocking the next domain migration.
