# Business OS Next — ownership de componentes y CSS móvil

Guía incremental para el roadmap #73. La referencia visual aprobada es [MONO B](../ui-ux/BUSINESS_OS_NEXT_MONO_B_APPROVED.md); esta guía **no** autoriza cambios en desktop ni lógica de negocio.

## Límites por capa

- `modules/<area>/ui/pages/`: orquestación de pantalla, rutas, composición y permisos ya existentes; no duplicar consultas ni reglas transaccionales.
- `modules/<area>/ui/components/`: presentación de una unidad funcional (tarjeta, colección, ticket, filtros). Props explícitas, sin llamadas directas a API salvo contrato preexistente.
- `modules/<area>/ui/hooks/`: estado y carga **solo cuando una extracción real lo justifique**. Mantener semántica de errores, efectos y permisos.
- `modules/<area>/services/` y utilidades de dominio: conservar contratos existentes; no moverlos como efecto secundario de un PR visual.
- Compartidos: crear un componente en el design system solo después de identificar **dos consumidores reales** y una API estable. No crear wrappers de cada `div`.

## Propiedad de estilos

1. `foundation.css` permanece como entrada global; `tokens.css` y los tokens semánticos existentes son la fuente de verdad. No agregar otra hoja global.
2. Cada componente nuevo o extraído es dueño de su `Component.module.css`; el CSS Module de la página controla únicamente layout de pantalla y composición.
3. En migraciones incrementales se permiten temporalmente dos clases: la heredada para compatibilidad y la nueva clase local para la experiencia móvil. Registrar qué selector heredado podrá retirarse después.
4. Antes de retirar un selector global o de página, localizar todos sus consumidores. No eliminar reglas de desktop para resolver un problema móvil.
5. Preferir `var(--bo-mono-ink)`, `var(--bo-mono-surface)`, `var(--bo-mono-canvas)`, `var(--bo-mono-muted)` y `var(--bo-mono-border)` dentro del scope MONO B. Mantener colores de éxito/alerta/error exclusivamente para estados reales. Tema oscuro: respetar las variables semánticas existentes, no fijar blancos o negros que rompan contraste.
6. Mantener foco visible, controles táctiles de al menos 44 px y `prefers-reduced-motion`; no resolver especificidad añadiendo `!important` en cascada.

## Ejemplo vivo: POS

- `Pos.jsx` conserva estado, operaciones y callbacks.
- `PosProductGrid.jsx` posee colección y estado vacío; `PosProductCard.jsx` posee la presentación de cada producto.
- `PosCartItems.jsx` presenta el ticket, sin apropiarse de operaciones de stock, cobro o cantidades.
- Los CSS Modules `PosProductGrid.module.css`, `PosProductCard.module.css` y `PosCartItems.module.css` deben ser propietarios de estilos móviles de esas piezas. `Pos.module.css` sigue temporalmente para composición y compatibilidad; su limpieza se hará por selector y consumidor, no mediante reescritura masiva.
- No duplicar el trabajo de los PR #494 (tarjeta) y #495 (ticket) mientras sigan abiertos.

## Secuencia de una migración pequeña

1. Revisar `main`, PR abiertos y consumidores del componente/selector.
2. Elegir una sola responsabilidad que pueda separarse sin alterar endpoints, permisos, roles, aislamiento por empresa, licencias, pagos ni stock.
3. Extraer presentación y estilos locales; mantener las mismas props/callbacks y comportamiento desktop.
4. Retirar duplicados solo si no quedan consumidores; si hay trabajo concurrente, dejar el selector heredado documentado y continuar con otro bloque independiente.
5. Entregar rama y PR acotado con alcance, archivos, compatibilidad y dependencias. No fusionar con checks requeridos pendientes o fallidos.

El QA visual, accesibilidad, responsive e integración se agrupa al final de la etapa. Los checks automáticos y protecciones de GitHub siguen vigentes durante cada PR.
