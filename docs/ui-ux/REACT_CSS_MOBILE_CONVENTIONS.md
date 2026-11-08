# Business OS · Convenciones para UI React modular y CSS estándar

## Objetivo

Modernizar la interfaz móvil sin volver a crear un ERP monolítico. La **arquitectura funcional y los permisos existentes** permanecen intactos. Usar los componentes comunes cuando al menos dos módulos comparten el mismo patrón de interacción; evitar abstraer cada etiqueta o contenedor.

## Responsabilidades y carpetas

- `modules/<feature>/ui/pages`: pantalla/ruta, orquestación, estado y enlace a acciones ya autorizadas. Reducir gradualmente tamaño de archivos.
- `modules/<feature>/ui/components`: presentación propia del negocio, sin fetch adicional ni cambios de API.
- `components`: componentes neutrales reutilizados en más de un módulo, por ejemplo `KpiCard`, `MobileRecordCard`, `MobileListHeader`.
- `design-system/components`: inputs, botones, estados, tabs y contenedores generales. **Consultar antes de inventar componentes paralelos.**
- `design-system/styles/tokens.css`: tokens globales existentes, importados una vez por `foundation.css`. Nunca importar una cadena adicional de parches globales.

## Contrato de estilos

1. Un CSS Module por componente; `styles.card`, `styles.actions`, etc. para estilos locales.
2. Colores: `--color-surface`, `--color-surface-secondary`, `--color-text-primary`, `--color-text-secondary`, `--color-border`, `--color-primary`.
3. Espaciados: `--space-1/2/3/4/6`; radios: `--radius-sm/md/lg`; elevación: `--shadow-sm/md`. Reutilizar alias existentes de MD3; no introducir otra paleta por pantalla.
4. Tema oscuro: respetar tokens semánticos que cambian con `data-theme='dark'`, no sumar colores hex y overrides de modo oscuro en cada feature.
5. Vista móvil: objetivos táctiles preferentemente 44px, foco visible, etiquetas completas y pantallas sin desbordamiento horizontal. Desktop permanece estable; la lista móvil se hace visible con breakpoint local.

## Patrón implementado (Inventario + Ventas)

- `MobileListHeader` recibe `title` y `count`, genera el mismo título y contador visual en ambas listas.
- `MobileRecordCard` recibe `title`, `subtitle`, `status`, `fields`, `onOpen` y `actions`. Solo renderiza, **no consulta ni modifica datos**.
- Cada componente de feature (`ProductCatalogMobileList`, `SalesProspectMobileList`) decide campos, badges, formularios y permisos; usa el mismo estilo semántico de tarjeta. Mutaciones y selecciones siguen en su página/hook original.
- No modificar `KpiCard` ni introducir hexágonos.

## Siguiente orden

Extraer piezas de páginas muy grandes por responsabilidad comprobada (Dashboard, SalesEnterprise, Products); mover CSS local junto con cada pieza y eliminar estilos originales redundantes en la misma PR. Migrar otros módulos solo cuando puedan usar el contrato compartido sin cambios en reglas de negocio.

**Seguridad:** roles, licencias, aislamiento multiempresa, demo offline, API, POS, cobros y stock son invariantes. Los checks de GitHub existentes siguen protegiendo `main`, aunque no formen parte del ciclo de exploración visual.

## Contrato de extracción incremental (noviembre 2026)

Antes de extraer, identificar un consumidor real y verificar que no exista un PR abierto sobre los mismos archivos. La extracción debe ser **mecánica**: preservar el orden de renderizado, los nombres de props observables, los handlers y los valores formateados. Evitar introducir hooks que dupliquen estado del contenedor.

| Responsabilidad | Ubicación | No debe hacer |
| --- | --- | --- |
| Ruta, permisos y mutaciones | `ui/pages` o hook de dominio existente | Duplicar operaciones en tarjetas |
| Carga y estado derivado | `ui/hooks` | Importar JSX o CSS |
| Render de registros y detalles | `ui/components` | Fetch, persistencia, permisos nuevos |
| Formato y definiciones de campos | `ui/utils` (o `utils` del feature existente) | Depender de React, router o DOM |
| Estilos de una pieza | `Component.module.css` | Sobrescribir globalmente otros módulos |

### Ejemplo: detalle de producto

`ProductDetailPanel` recibe `product`, `activeTab` y `formatMoney`. Las definiciones de campos son del feature Inventario; no deben convertirse en un esquema universal de formularios. El padre sigue controlando el drawer y las operaciones. Si una definición incluye un badge JSX, mantener esa responsabilidad presentacional en React; las utilidades puras solo formatean valores.

### Estrategia de migración sin regresiones

1. Revisar `main` y PR abiertos; elegir un bloque sin solapamiento. Si dos PR tocan el mismo componente, integrar o rebasar en secuencia, nunca asumir que se fusionan sin conflicto.
2. Extraer una unidad con límites claros y **mantener las mismas props, callbacks y condiciones**. No mezclar cambios de API o lógica transaccional con ajustes visuales.
3. Mover reglas CSS existentes al módulo propietario, preservando especificidad y orden efectivo. Verificar nombres reales de tokens en `foundation.css` y `tokens.css` antes de usarlos; no inventar alias.
4. Documentar consumidor y responsabilidad en el PR. No crear componentes compartidos sin dos consumidores concretos.
5. Mantener PR en borrador cuando los checks obligatorios estén pendientes, fallen o haya conflictos. Reservar QA visual, responsive, accesibilidad e integración para la fase final; nunca desactivar workflows existentes.

**Ámbito:** solo mobile-first. No rediseñar desktop ni tocar configuración de Cloudflare en refactors de presentación.
