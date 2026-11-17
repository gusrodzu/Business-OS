# Business OS Next — modularización React y CSS Modules

Estado: guía incremental para el frontend mobile-first. Referencias: issue #73, `docs/ui-ux/BUSINESS_OS_MOBILE_WIREFRAME_V2.md` y `docs/ui-ux/BUSINESS_OS_NEXT_MONO_B_APPROVED.md`.

## Límites de responsabilidad

- `modules/<feature>/ui/pages/`: orquestación de datos, permisos, navegación, estado y acciones. No duplicar reglas transaccionales.
- `modules/<feature>/ui/components/`: bloques presentacionales de utilidad real, con props explícitas y callbacks; sin llamadas directas a API ni importaciones de páginas.
- `modules/<feature>/ui/hooks/`: estado y selección de datos de interfaz; preservar contratos de servicios.
- `modules/<feature>/ui/utils/`: formateadores y selectores puros; no duplicar reglas de dominio.
- `modules/<feature>/services/`: frontera existente de API; no cambiar endpoints durante refactors visuales.
- `design-system/`: componentes compartidos solo cuando existan al menos dos consumidores concretos. Evitar abstraer cada elemento HTML.

## Convenciones de CSS

`foundation.css` continúa como punto de entrada global; usar tokens semánticos existentes en `tokens.css`. Para estilos nuevos o migrados, preferir `NombreComponente.module.css` junto al componente y clases locales sin selectores globales. No introducir hojas globales adicionales, hexadecimales repetidos, cascadas de overrides ni nuevos `!important`. Migrar selectores gradualmente, conservando desktop y temas claro/oscuro.

Paleta móvil aprobada Mono B: acción `#17191D`, carbón secundario `#2B2F36`, texto secundario `#6B7078`, fondo `#F3F4F6`, superficie `#FFFFFF`, borde `#E7E8EB`. Referenciar **tokens semánticos** donde existan, no copiar estos hexadecimales a cada módulo. Los colores de éxito/alerta/error solo indican estados reales. Mantener foco visible y controles táctiles de al menos 44 px.

## Patrón de extracción POS

Los PR #484–#488 extraen bloques de `Pos.jsx`: catálogo, artículos, totales, pagos y resumen. `Pos.jsx` debe conservar estado de carrito, validaciones, cálculos, stock, permisos, persistencia y cierre de ventas. Cada hijo recibe valores ya calculados y acciones por props; no debe importar `Pos.jsx` ni recalcular el total. `PosTickets.jsx` mantiene selección/anulación; el detalle es presentacional (#489).

Antes de migrar CSS de un componente extraído, comprobar si el selector pertenece al padre, al componente o a un patrón compartido con consumidores reales. Mover únicamente sus reglas al CSS Module local y actualizar el import/uso en el mismo PR; no duplicarlas en ambos archivos.

## Orden seguro de integración

1. Consultar PR abiertos y último `main`; evitar editar las mismas zonas simultáneamente. En particular, #484–#488 tocan `Pos.jsx` y requieren integración coordinada.
2. Elegir un bloque coherente por PR; preservar firmas de callbacks, API, rutas, permisos, aislamiento multiempresa, licencias y operaciones.
3. Mantener el cambio reversible, con explicación de consumidores, responsabilidades y archivos afectados.
4. No fusionar con required checks pendientes/fallidos o conflictos. Mantener PR en borrador si está bloqueado.
5. Reservar QA visual, responsive, accesibilidad e integración para la fase final; no desactivar CI existente.

No modificar desktop ni infraestructura Cloudflare en refactors de UI. No reintroducir verde lima ni acentos decorativos azules.
