# BuzzBee · Navegación clara y estandarización de dashboard (incremento UI)

Fecha: 29 de octubre de 2026. Trabajo para #73 (UI-01/UI-03/UI-05, NAV-01/NAV-02, MOD-01), y el design system multiempresa de #206.

## Decisión de producto

El usuario solicita un **menú lateral claro, no oscuro**. La navegación global deja de ser carbón/negro aun cuando el contenido del workspace usa el tema oscuro; conservar contraste, jerarquía y acento BuzzBee sin introducir un tercer tema ni alterar la selección de módulos o las reglas de autorización.

- **Rail de iconos:** superficie gris verdosa muy clara (`#f1f5f2`), texto/íconos de alto contraste y selección suave (`#e3f0d3`).
- **Explorador contextual:** fondo blanco (`#ffffff`), bordes gris claro (`#d8e2db`), texto `#25322b`, hover `#eaf1eb` y acento verde profundo `#42621b`.
- **Super Admin:** su menú lateral adopta el mismo contraste claro y estados de selección, sin perder entradas ni sesiones.
- **Dark mode de contenido:** sigue disponible; la petición visual aplica solo a navegación. El diseño del workspace y sus datos no se fuerzan a modo claro.

## Patrón de módulos y KPI del dashboard

- `Dashboard.jsx` ahora renderiza los indicadores mediante el componente reutilizable `KpiCard` del proyecto, en lugar de un `<article>` exclusivo por tarjeta.
- `KpiCard` acepta atributos de artículo (`...props`): conserva `data-dashboard-kpi`, clases existentes, accesibilidad y estilos de integración, sin perder sus datos ni su metadato.
- Se conserva `data-dashboard-kpi-grid="cards"`, las tarjetas rectangulares, el catálogo de métricas, las preferencias separadas por empresa/usuario, los widgets, el renderizado offline, rutas de detalle, filtros y botones.
- Los siete widgets de Inicio ya usaban el componente `Card` y una cabecera `WidgetHeader` uniforme, por lo que no se duplicó otra biblioteca visual.
- No se introdujeron hexágonos ni nuevos overrides globales. Las clases antiguas y su deuda CSS siguen sujetas a consolidación por etapas.

## Validación y alcance

- La prueba `npm run ui:light-navigation:audit` protege la paleta clara, navegación móvil, foco, dos shells y uso de `KpiCard`. Integrada en `Frontend QA`.
- CI de build, lint, screenshot de móvil y rutas deben aprobar antes de merge; pruebas estáticas por sí solas no certifican contraste WCAG 2.2 AA o equivalencia visual.
- Pendiente: QA visual autenticado en el dominio desplegado, 320/360/390/430/768/1024/1440 px, modo claro/oscuro y navegador real; luego revisar tarjetas KPI de cada módulo y reemplazar excepciones visuales conservando datos reales y permisos.
- No hay cambios de API, backend, base de datos, tenants, datos de cliente, licencias, rutas o demo offline.

## Siguiente incremento

Consolidar el lenguaje visual de widgets de los demás módulos con los mismos `Card`, `KpiCard` y `PageHeader`, sin rediseño masivo ni alterar controles de acceso. Dividir por familia de módulos y verificar el before/after con capturas.
