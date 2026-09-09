# BuzzBee ERP v12.2.0 — Module Rationalization

Objetivo: reducir la complejidad visible del ERP Cliente sin borrar capacidades existentes ni romper BuzzBee SaaS.

## Navegación operativa principal
- Inicio
- Tareas
- Ventas
- CRM
- Compras
- Inventario
- Centro administrativo
- Finanzas
- Facturación
- Recursos Humanos
- Reportes

## Funciones absorbidas por módulos padre
- Proveedores → Compras
- Almacenes → Inventario
- Gastos → Finanzas
- Activos fijos → Finanzas
- Inteligencia → Reportes
- Prenómina / Expedientes / Operación RH → Recursos Humanos

## Apps opcionales
POS, Producción, Proyectos y Marketing conservan todo su código y rutas. En el perfil `erp-client` no aparecen por defecto; aparecen cuando el módulo está explícitamente habilitado para la empresa.

## Herramientas de plataforma
Flow, Integration Hub, Data Hub, Datos maestros y Plan/Facturación siguen implementados, pero se ocultan de la navegación cotidiana del perfil `erp-client`. Se exponen con `VITE_PRODUCT_PROFILE=buzzbee-saas`.

## Seguridad de la migración
No hay cambios Prisma, no hay migraciones y no se elimina ninguna ruta. Esta versión reorganiza superficies de navegación y descubrimiento, no datos ni lógica transaccional.
