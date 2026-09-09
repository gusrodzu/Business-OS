# Procurement module

Canonical backend implementation for Compras / P2P.

Layers:
- `api/`: Express routers and HTTP validation.
- `application/`: use cases / workflow orchestration.
- `domain/`: stable module contracts, states and permission vocabulary.
- `infrastructure/`: adapters exclusive to Procurement.
- `tests/`: module-local tests.

Legacy files in `src/routes/*purchase*`, `receipts.js`, `suppliers.js`, `warehouses.js` and `src/services/procurementFlow.js` are compatibility shims only.
