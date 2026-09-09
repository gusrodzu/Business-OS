# BuzzBee v14.1.0 · Procurement reference module

Compras is the first domain physically migrated to the v14 modular architecture.

## Canonical ownership

Backend: `apps/api/src/modules/procurement`
Frontend: `apps/web/src/modules/procurement`

The old global route/page/service paths remain only as compatibility shims so existing integrations and imports can be migrated progressively.

## Layer rules

### Backend
- `api/` owns HTTP routers.
- `application/` owns P2P orchestration and approval integration.
- `domain/` owns module contracts / permissions / endpoint vocabulary.
- `infrastructure/` is reserved for module-specific external adapters.
- `tests/` owns module-specific tests.

### Frontend
- `ui/pages/` owns Procurement screens and CSS.
- `routes.jsx` exposes navigation to the global registry.
- `domain/` owns route vocabulary and future states/types.
- `application/` owns future Procurement-specific client use cases.
- `infrastructure/` owns future Procurement API adapters.

## Migration rule

New Procurement code MUST be added inside the module. Do not add new Procurement implementations to global `routes/`, `services/`, or `pages/`. Compatibility shims may only re-export module code.
