# BuzzBee v14.0.0 · Modular Architecture Foundation

## Objetivo

Convertir el monorepo en una plataforma mantenible y escalable por dominios sin una migración destructiva de cientos de imports.

## Estructura objetivo

```text
apps/
├── api/
│   └── src/
│       ├── bootstrap/        # composición de módulos y workers
│       ├── modules/          # contratos públicos por dominio
│       │   ├── core/
│       │   ├── procurement/
│       │   ├── inventory/
│       │   ├── finance/
│       │   ├── hr/
│       │   ├── sales/
│       │   ├── crm/
│       │   ├── projects/
│       │   ├── production/
│       │   ├── pos/
│       │   ├── intelligence/
│       │   ├── platform/
│       │   └── operations/
│       ├── middleware/       # infraestructura HTTP compartida
│       ├── lib/              # infraestructura técnica
│       ├── routes/           # implementación legacy compatible
│       └── services/         # implementación legacy compatible
└── web/
    └── src/
        ├── modules/          # rutas por dominio
        ├── design-system/    # UI compartida
        ├── auth/             # autenticación transversal
        ├── layout/           # shells
        ├── framework/        # framework UI
        └── pages/            # implementación legacy compatible
```

## Qué cambia

- `apps/api/src/index.js` sólo configura Express, health/readiness, módulos, error handler y lifecycle.
- Los routers se agrupan mediante 13 manifiestos de dominio.
- Los workers se administran desde un registro único.
- `apps/web/src/App.jsx` sólo compone shells y registros de rutas.
- Las rutas funcionales viven agrupadas por dominio bajo `apps/web/src/modules`.
- El registro web valida rutas duplicadas en arranque.
- El registro API rechaza mounts duplicados.

## Estrategia anti-regresión

No se mueven aún los archivos legacy de `routes`, `services` y `pages`. Funcionan como implementación interna de los nuevos módulos. Esto evita romper imports relativos y permite una migración física incremental.

## Regla para nuevas funcionalidades

A partir de v14, ningún módulo nuevo debe registrarse directamente en `App.jsx` o `api/src/index.js`.

## Próxima etapa opcional

Mover físicamente cada dominio a una estructura vertical:

```text
modules/inventory/
├── api/
├── application/
├── domain/
├── infrastructure/
├── ui/
└── tests/
```

El contrato de bootstrap ya permite hacerlo sin modificar el core.
