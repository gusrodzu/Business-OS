# BuzzBee ERP v15.0.0 — Full Modularization

## Objetivo
Convertir BuzzBee en una plataforma mantenible y escalable por dominios, evitando archivos núcleo monolíticos y dependencias internas entre módulos.

## Dominios migrados físicamente
- Core
- Procurement / Compras
- Inventory / Inventario
- Finance / Finanzas
- HR / RR. HH.
- CRM
- Sales / Ventas
- Projects / Proyectos
- Production / Producción
- POS
- Intelligence / AI
- Platform / Super Admin SaaS
- Operations
- Settings (frontend)

## Estructura canónica
### API
`apps/api/src/modules/<domain>/`
- `api/`: routers/endpoints del dominio
- `application/`: casos de uso y orquestación
- `domain/`: contratos públicos y reglas del dominio
- `infrastructure/`: adapters externos/persistencia especializada
- `tests/`: QA del dominio
- `index.js`: manifiesto de rutas públicas

### Web
`apps/web/src/modules/<domain>/`
- `ui/pages/`: pantallas propietarias del dominio
- `application/`
- `domain/`
- `infrastructure/`
- `tests/`
- `routes.jsx`: rutas públicas del módulo

## Reglas obligatorias
1. `App.jsx` no registra páginas de negocio directamente.
2. `api/src/index.js` no monta routers de negocio directamente.
3. Un módulo no importa `api/`, `ui/` o `infrastructure/` internos de otro módulo.
4. Contratos cruzados viven en `domain/contracts.js`.
5. Eventos cruzados usan `modules/shared/eventBus.js` o la infraestructura persistente de integration events.
6. No se permiten shims legacy nuevos.
7. Todo módulo nuevo debe añadir QA propio y participar en QA cross-module.

## Legacy cleanup
- Compatibility shims API: 0
- Compatibility shims UI: 0
- `ModulePlaceholder` compartido pasó a `modules/shared/ui/`.

## Validación
- `npm run qa:modular-all` → 36/36
- `npm run qa:architecture` → 35/35
- `npm run qa:all` → 47/47
- `npm run qa:platform-control-plane` → 38/38
- `npm run qa:platform-security` → 16/16
- `npm run qa:platform-admin` → 20/20

## Próximas puertas de release
1. `npm run qa:all:full` con API + PostgreSQL reales.
2. UAT con usuarios reales del cliente.
3. Staging.
4. Go-live / producción.
