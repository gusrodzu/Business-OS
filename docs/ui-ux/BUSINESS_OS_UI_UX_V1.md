# Business OS / BuzzBee — Guía de producto UI/UX v1
**Fecha:** 27 de octubre de 2026  
**Estado:** propuesta de contrato de diseño; no sustituye los controles de QA o despliegue.  
**Roadmap de ejecución:** [issue #73](https://github.com/gusrodzu/Business-OS/issues/73).  
**Método:** auditoría UX (heurísticas de Nielsen), patrones SaaS ERP, sistema de diseño semántico, diseño responsive y accesibilidad WCAG 2.2 AA.

## 1. Alcance y decisiones aprobadas

Business OS es un ERP multiempresa y multigiro para colaboradores, gerentes, administradores y Super Admin. La interfaz debe priorizar el trabajo operativo, ser legible con información densa y evitar adornos que reduzcan el espacio útil. Mantener **Dark Premium Workspace** como dirección visual, con modo claro accesible y acento BuzzBee lima controlado.

Decisiones vigentes que NO deben revertirse sin aprobación:
- **Dashboard:** cards KPI rectangulares originales, no hexágonos ni panal decorativo. Los datos, catálogo configurable y preferencias por usuario/empresa se conservan.
- **Navegación:** dos niveles; icon rail de 64 px y explorador contextual por módulo. En móvil, explorador accesible/deslizable y bottom navigation existente.
- **Módulos:** preservar reglas de negocio, rutas, filtros, datos offline, backend, seguridad y aislamiento de empresas.
- **Entrega:** `main` está protegido; usar PR y CI. Un merge no significa que Vercel Production ya muestre el cambio.

## 2. Observaciones de auditoría de código (no equivalen a evaluación visual en un navegador)

| Área | Evidencia observada | Riesgo u oportunidad |
|---|---|---|
| Dashboard | `apps/web/src/modules/core/ui/pages/Dashboard.jsx` emplea `data-dashboard-kpi-grid="cards"`, `kpiCard` y catálogo personalizado | Mantener cards y verificar lectura de cantidades/estados en ancho estrecho y dark |
| CSS del Dashboard | `Dashboard.module.css` acumula numerosas redefiniciones y selectores con `!important` | La cascada dificulta corregir problemas sin regresiones; consolidar por etapas y con capturas |
| Menú contextual | `TwoLevelSidebar.module.css` define icon rail carbón y panel oscuro, estados activos y tamaño de 44 px | Auditar selección inequívoca, foco, scroll y jerarquía de subniveles |
| Componentes base | `design-system/components/index.js` exporta Button, Card, DataTable, PageHeader, Dialog, Drawer y otros | Usar componentes compartidos; prohibir clones estilísticos innecesarios |
| Publicación | issue #73 mantiene `DEPLOY-02` y `QA-01` sin cerrar | Verificar dominio Production, commit servido y smoke autenticado antes de declarar publicado |

## 3. Principios UX

1. **Una tarea principal por pantalla:** el título debe responder «¿dónde estoy?»; la acción primaria «¿qué puedo hacer aquí?».
2. **Menos elementos en competencia:** el rail cambia de módulo; el explorador navega secciones; los tabs sólo cambian vistas locales. No duplicar el mismo nivel en tres lugares.
3. **Jerarquía estable:** encabezado y acciones → filtros/búsqueda → KPIs cuando aporten una decisión → contenido principal → detalle/acciones secundarias.
4. **Densidad controlada:** espaciados consistentes de 8/16/24 px; minimizar banners y pills redundantes, no reducir legibilidad.
5. **Información semántica:** estados de órdenes, dinero y stock no dependen sólo del color; siempre incluir texto/icono cuando corresponda.
6. **Preferencias persistentes y seguras:** los widgets sólo pueden representar métricas permitidas para el rol y la empresa activa.

## 4. Fundamentos para consolidar (tokens semánticos)

Se proponen nombres semánticos como interfaz de diseño. Antes de introducir nuevos tokens, mapearlos a las variables existentes `--bb26-*` y `--color-*` para no romper pantallas.

| Función | Token objetivo | Uso |
|---|---|---|
| Lienzo | `--ui-canvas` | Fondo general |
| Superficie | `--ui-surface` | Cards, formularios, paneles |
| Superficie elevada | `--ui-surface-raised` | Drawer, diálogo y menús |
| Texto primario | `--ui-text` | Contenido y cifras |
| Texto secundario | `--ui-text-muted` | Etiquetas, aclaraciones |
| Borde | `--ui-stroke` | Separadores y controles |
| Acción principal | `--ui-accent` | Un CTA primario y selección |
| Foco | `--ui-focus` | Anillo de teclado perceptible |
| Estados | `--ui-success/warning/danger/info` | Estados con contraste en claro y oscuro |

**Paleta de referencia, no cambio aplicado:** en modo oscuro el rail actual usa `#252628`, el panel `#101112` y el acento actual `#bcf724`. Preservar identidad; auditar contraste real antes de elevar estos valores a tokens globales.

- Ritmo espacial: base 8 px, incrementos útiles 4/8/12/16/24/32.
- Tipografía: títulos de página claramente superiores a títulos de sección; tablas legibles y valores KPI con cifras tabulares.
- Bordes: controles 8–12 px, cards 12–18 px y paneles 16–20 px; evitar radios inconsistentes dentro de un mismo patrón.
- Componentes: default, hover, focus-visible, loading, disabled, error, empty y success.
- Movilidad: controles táctiles de **al menos 44 × 44 px** donde correspondan y respeto a safe areas.

## 5. Patrón aprobado: Dashboard / Inicio

**Web:** PageHeader con contexto/empresa y 1 CTA prioritario; alerta operativa relevante, 4 cards KPI rectangulares iniciales; resto de widgets en grid que priorice «qué requiere atención» sobre información decorativa. Personalización permite añadir/quitar indicadores conservando persistencia por usuario/empresa.

**Tablet:** 2 KPI por fila cuando el ancho no permita leer 4; widgets apilados o 2 columnas según espacio real disponible.

**Móvil:** 1 o 2 KPI por fila dependiendo de los textos y el ancho disponible. Sin cortes horizontales; cifras y etiquetas adaptables, tablas con patrón responsive propio; sin hexágonos.

**Criterios comprobables:**
- No se renderiza `<HoneycombKpis>`; sí `data-dashboard-kpi-grid="cards"`.
- Los 4 indicadores iniciales y métricas agregadas obtienen valores del adaptador actual, sin cifras inventadas.
- Agregar/quitar KPI, recargar y cambiar de empresa no mezcla preferencias.
- El layout no tiene overflow accidental a 320, 360, 390, 430, 768, 1024 ni 1440 px.
- Tema oscuro y claro: contraste WCAG 2.2 AA, foco visible, lectura de etiquetas y números.
- Vercel: comprobar que el commit con estas cards es **realmente** el que sirve el dominio Production.

## 6. Contratos reutilizables para otros módulos

**Tablas ERP:** búsquedas y filtros consistentes, cabecera visible cuando útil, números y montos alineados a la derecha, filas activables con teclado, paginación/estado vacío y acciones claras. Diseñar versión compacta móvil (scroll contenido o tarjetas de registro) según el flujo.

**Formularios:** labels persistentes, agrupación lógica, 1 acción principal y cancelación segura, errores junto a campos, confirmación tras guardar y estados de carga sin saltos bruscos.

**Diálogos y drawers:** jerarquía entre contextual y modal, Escape cuando sea seguro, foco inicial y retorno al disparador, `aria-modal` sólo en superficies efectivamente modales.

**Navegación:** menú de dos niveles sin duplicados; favorito/reciente respetan roles y empresa; indicador activo inequívoco; drawer móvil no permite tabulación detrás del overlay.

**Estados y feedback:** skeleton en cargas reales, copy útil en vacíos, errores recuperables y toasts no duplicados.

## 7. Plan incremental y Definition of Done

| Orden | Incremento | Evidencia exigida |
|---|---|---|
| P0 | Validar Vercel Production | READY + dominio + SHA servido + smoke de rol, empresa y demo offline |
| P1 | UI-01 / UI-05: inventario y mapeo de tokens | Mapear variables existentes, diffs limitados y capturas claro/oscuro |
| P1 | NAV-01/02/03: navegación | Recorrido por teclado, 2 niveles, roles, favoritos y móvil sin duplicados |
| P2 | MOD-01 Dashboard original | KPI cards en 7 anchos, personalización, sin overflow |
| P2 | Ventas, Compras, Inventario, POS, CRM, Finanzas y demás módulos | Checklist por módulo y sin alteración de lógica |
| P3 | Tablet, móviles, PWA/offline | Teclado virtual, safe areas, orientación, touch y continuidad |
| P4 | QA visual, a11y, bundle | CI + pruebas visuales + registro de issues críticos |

**No marcar una tarea como completada sin evidencia.** Para cada PR registrar archivos, alcance, capturas cuando haya cambio visual, pruebas, SHA, riesgo de regresión, estado Vercel y rollback. No cambiar producción ni seguridad sólo por adoptar esta guía.

## 8. Cómo usar UI UX Designer en las siguientes tareas

Para cada módulo: **auditoría → hipótesis UX → decisión de diseño → cambio atómico React/CSS → prueba en 7 tamaños, light/dark y teclado → revisión de resultados → PR**. Hacer explícito qué se preserva: flujo, permisos, fuentes de datos y preferencias. No convertir el ERP en una maqueta estática.
