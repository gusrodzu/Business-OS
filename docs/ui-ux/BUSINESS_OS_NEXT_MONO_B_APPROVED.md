# Business OS Next — Dirección visual aprobada (paleta B)

**Aprobación del usuario:** 8 de noviembre de 2026.  
**Referencia de experiencia:** navegación móvil y claridad de lectura de Shopify, reinterpretadas para Business OS; no reproducir marcas ni elementos protegidos de terceros.  
**Estado de implementación:** por fases; el diseño aprobado no implica que todas las pantallas hayan migrado.

## Paleta monocromática

| Token de diseño | Claro | Uso |
| --- | --- | --- |
| `--bo-mono-ink` | `#17191D` | acciones principales, títulos y selección |
| `--bo-mono-ink-soft` | `#2B2F36` | navegación y superficies oscuras secundarias |
| `--bo-mono-canvas` | `#F3F4F6` | fondo de pantallas |
| `--bo-mono-surface` | `#FFFFFF` | tarjetas, listas y búsqueda |
| `--bo-mono-border` | `#E5E7EB` | divisores y bordes |
| `--bo-mono-muted` | `#6B7078` | metadatos y texto secundario |

**No usar el verde lima anterior ni introducir azul como acento general.** Los colores de éxito, advertencia, peligro y estado informativo se reservan únicamente para comunicar su significado operativo; no son decoración. Respetar accesibilidad, contraste y estados de foco. Usar variantes semánticas del mismo sistema en tema oscuro.

## Estructura móvil aprobada

1. **Shell:** barra superior carbón con contexto de empresa, notificaciones y búsqueda de alto contraste. Dock inferior flotante con rutas existentes, foco de teclado y áreas seguras del dispositivo. Drawer de dos niveles para las áreas autorizadas.
2. **Inicio:** saludo contextual, tarjetas KPI compartidas, avisos de operación, accesos a aplicaciones disponibles por empresa y acciones rápidas reales. Sin inventar datos o acciones.
3. **Listados:** patrones consistentes de búsqueda, filtros horizontales, filas limpias, importes, badges operativos y acceso al detalle; comenzar por Ventas/Pedidos y reutilizar en Compras, Inventario, CRM y Finanzas.
4. **Detalles:** superficies claras, títulos legibles, estado independiente, acciones contextuales y controles de 44 px o más.
5. **Configuración:** listas de navegación compactas, formularios de una columna en teléfono y acciones de sucursales operables.

## Límites de implementación

- Mobile-first: primero <= 760px, luego tablet y desktop; no reescribir desktop sin una fase separada.
- Extraer componentes React solo cuando exista una responsabilidad o reutilización clara; CSS Modules por feature, sin duplicar hojas globales.
- Mantener intactos API, permisos, roles, licencias, funciones de negocio, estado de sesión, aislamiento multiempresa y modo demo offline.
- **QA visual, integración y accesibilidad integrales al cierre de la etapa.** Esto no permite desactivar workflows existentes, ignorar branch protection, ni fusionar PR que tengan checks requeridos fallidos.
- Integrar en PR pequeños, verificando la rama principal y PR abiertos antes de cada cambio.

## Primer bloque

`feat/mobile-monochrome-shell-v1`: aplicar scope `data-visual-palette="mono-b"`, tokens monocromáticos y patrones de shell, Topbar, MobileHomeHero y WorkspaceAppShelf únicamente a la experiencia móvil, sin modificar componentes de dominio ni operaciones.
