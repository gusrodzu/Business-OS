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
