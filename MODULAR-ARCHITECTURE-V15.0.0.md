# BuzzBee Modular Architecture v15.0.0

## Rule
Every business capability is owned by a module. `App.jsx` and `api/src/index.js` only bootstrap registries.

## Canonical module layout
```
modules/<domain>/
  api/
  application/
  domain/
  infrastructure/
  tests/
```
Frontend additionally owns `ui/` and `routes.jsx`.

## Cross-module rule
Do not import another module's `api`, `infrastructure` or `ui` internals. Use its public `domain/contracts.js`, an application port, or a domain event.

## Legacy compatibility
Legacy `routes/` and `pages/` paths are compatibility shims only. New code must never import them. They may be removed after downstream imports reach zero.

## Domains physically migrated
Procurement, Inventory, Finance, HR, CRM, Sales, Projects, Production, POS, Intelligence and Platform.
