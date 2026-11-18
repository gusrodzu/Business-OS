# Business OS Next — Convenciones de modularización React y CSS

Alcance: frontend **mobile-first**. Complementa [wireframe móvil v2](../ui-ux/BUSINESS_OS_MOBILE_WIREFRAME_V2.md) y [roadmap #73](https://github.com/gusrodzu/Business-OS/issues/73). No autoriza cambios de desktop, API, permisos, transacciones ni infraestructura.

## Organización por feature

```text
modules/<area>/
  ui/
    pages/           # Orquestación de pantalla, rutas, callbacks
    components/      # Secciones visuales con responsabilidad real
  hooks/             # Estado y efectos reutilizables del feature
  services/          # Adaptadores existentes de API, sin alterar contratos
  utils/             # Formato y transformaciones puras
```

Respetar la estructura existente del módulo; no mover carpetas por estética. Un componente extraído debe tener consumidor real. Evitar componentes de un único `div`, dependencias cíclicas y abstracciones prematuras.

## Contrato de responsabilidades

- **Página**: carga, permisos ya existentes, estado transaccional, mutaciones y coordinación de secciones.
- **Componente visual**: recibe datos y callbacks explícitos, muestra loading/empty/error cuando corresponde; no dispara nuevas peticiones ni interpreta permisos.
- **Hook**: encapsula estado/efectos relacionados; preservar dependencias de efectos, claves de persistencia y alcance por usuario/empresa/demo.
- **Servicio**: mantiene endpoint, método, payload, errores y autorización sin cambios durante un refactor visual.
- **Utilidad**: función pura de formato/cálculo; evitar mover reglas de negocio sin necesidad.

Ejemplo de contrato (orientativo):

```jsx
function PurchaseRequestMetrics({metrics}) {
  return <KpiGrid>{/* KpiCard existente, datos provistos por la página */}</KpiGrid>;
}
```

Preferir `KpiCard`, `KpiGrid`, `KpiInfo` y patrones compartidos existentes antes de introducir equivalentes. Los componentes de módulo deben permanecer en su feature hasta existir al menos dos consumidores reales en áreas distintas.

## CSS Modules y tokens

- `foundation.css` permanece como entrada global existente. No crear hojas globales adicionales para cada refactor.
- Un `Component.module.css` por componente visual cuando necesita estilos propios. Importar como `styles`; clases locales descriptivas (`root`, `header`, `list`, `actions`, `emptyState`).
- Reutilizar primero los tokens semánticos y estilos del design system existente; revisar las ubicaciones reales de `foundation.css` y `tokens.css` antes de modificar valores. No inventar variables nuevas ni copiar hexadecimales.
- Variantes explícitas (`compact`, `selected`, `danger`) mejor que selectores profundos. Evitar `!important`, selectores por estructura del DOM y cascadas de overrides.
- Conservar tema claro/oscuro, foco visible, áreas táctiles de al menos 44px, safe areas y el shell/dock móvil. No reestilizar desktop como efecto secundario.

## Migración incremental

1. Revisar `main` y PR abiertos que toquen el archivo para no duplicar ni producir conflictos evitables.
2. Elegir **una sección cohesionada** de un archivo extenso, con interfaz de props clara.
3. Extraer presentación sin modificar API, autorizaciones, operaciones, stock, cálculos de negocio ni estados persistidos.
4. Extraer únicamente los estilos de esa sección a CSS Module, preferentemente reutilizando reglas/tokens existentes; no reescribir la hoja global completa.
5. Abrir PR pequeño en borrador; documentar archivos, consumidores y límites. Mantener checks obligatorios existentes y no fusionar con checks pendientes/fallidos.
6. Continuar con otro bloque independiente si el PR anterior queda bloqueado. No afirmar publicación ni despliegue.

## Antiduplicados y límites

Antes de crear un componente, buscar uno equivalente en `design-system/components`, `ux-foundation`, `components` y el feature actual. Evitar nuevas implementaciones de KPI, cards móviles, filtros, empty/loading/error y botones primarios cuando las existentes cumplen el contrato. El Home conserva launcher 4/3 columnas, favoritos por empresa, giros SCIAN, navegación de dos niveles y un único estado en bottom dock. Cloudflare es la plataforma actual; este documento no cambia despliegues.
