# Procurement architecture acceptance

- Module manifest imports routers from `./api`, never from global `routes`.
- Procurement workflow canonical implementation lives under `application`.
- Shared services are dependencies, not owners of Procurement behavior.
- Legacy global route/service paths are shims only.
- Frontend routes import canonical module-local UI.
