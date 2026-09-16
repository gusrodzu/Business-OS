# BuzzBee v21.2.0 — Sales domain migration

## Scope
First domain-level migration after the v21 React/CSS Modules foundation.

## Completed
- Sales is canonical under `apps/web/src/modules/sales`.
- Added `services/salesApi.js` as the transport boundary between Sales UI and the global API adapter.
- Canonical Sales pages no longer import the global API client directly.
- Added `hooks/useSalesResource.js` for shared async resource state in subsequent page decomposition.
- Replaced legacy duplicated Sales page implementations in `src/pages` with compatibility re-exports.
- Preserved existing routes and CSS Modules to minimize runtime regression risk.
- Added `npm run architecture:sales`.

## Static validation
- Sales architecture: PASS
- React/CSS Modules architecture: PASS
- Phase 2 shell/design-system architecture: 8/8 PASS

## Deliberately pending
The large Sales screens still contain presentation and workflow state in the same page component. The next Sales pass should split `SalesEnterprise`, `Sales`, `SalesFulfillment`, `SalesReturns` and `Collections` into feature components/hooks without changing business behavior.

A production build/runtime UAT was not claimed in this packaging environment.
