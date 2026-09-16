# BuzzBee v21.1.0 — React + CSS Modules · Fase 2

## Alcance aplicado
- Design System: nuevo `PageHeader` reutilizable con CSS Module.
- Home: encabezado migrado al Design System; layout sigue encapsulado en `Dashboard.module.css`.
- AppShell: contrato de workspace, ancho máximo, padding y scroll encapsulados.
- Sidebar: interacción, focus y feedback de presión encapsulados en `Sidebar.module.css`.
- Topbar: sticky header, focus y microinteracciones encapsulados en `Topbar.module.css`.
- Gate nuevo: `npm run architecture:react-css-modules:phase2`.

## Regla de migración
Los CSS globales legacy continúan temporalmente como compatibilidad para módulos aún no migrados. No se eliminan hasta retirar su último consumidor. Nuevas reglas de layout/componentes deben vivir en CSS Modules.

## Próxima fase
Migrar módulos operativos por dominio: Ventas → Compras → Inventario → POS → CRM → Finanzas → RRHH → Proyectos → Producción → Marketing, retirando compatibilidad global conforme cada dominio quede aprobado.
