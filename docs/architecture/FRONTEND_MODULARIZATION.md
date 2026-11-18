# Business OS Next — estándares de modularización mobile-first

> Alcance: frontend React/Vite. Documento complementario a `docs/ui-ux/BUSINESS_OS_MOBILE_WIREFRAME_V2.md` y `.agents/skills/business-os-ui-ux/SKILL.md`. No autoriza cambios de API, permisos ni desktop.

## Responsabilidades por feature

```text
modules/<area>/
  services/                 # clientes API existentes; no duplicar endpoints
  ui/
    pages/                  # orquestación, permisos y callbacks transaccionales
    components/             # piezas presentacionales con consumidores reales
      FeaturePanel.jsx
      FeaturePanel.module.css
    hooks/                  # estado/carga cuando la extracción reduzca complejidad
    utils/                  # formatos y transformaciones puras
```

No mover servicios o hooks por estética. Confirmar la ruta usada por el router antes de editar: existen páginas históricas fuera de `modules/`. Mantener la página como orquestadora de la carga, estado, errores, autorización y operaciones. El componente presentacional recibe datos y callbacks; no introduce peticiones ni estado tenant propio.

## Contratos compartidos

- `KpiCard`: rectangular, métrica real, sin hexágonos ni KPI inventados; reutilizar con `KpiGrid` y `KpiInfo` existentes.
- `MobileRecordCard`: registros táctiles autorizados; el feature define campos, estados y acciones. No trasladar reglas de permisos al componente visual.
- Formularios: el padre conserva submit, mutaciones y errores de API; el hijo encapsula campos, labels y layout.
- Detalles, POS, filtros, tabs, launcher y dock: reutilizar los componentes actuales antes de extraer otros; mantener navegación de dos niveles, favoritos por empresa y un único estado activo del dock.
- Utilidades: extraer sólo si eliminan duplicación efectiva, como `modules/finance/ui/utils/formatCurrency.js`.

## CSS Modules y tokens

`foundation.css` continúa como entrada global; consultar `tokens.css` y el design system antes de crear estilos. Un `*.module.css` por componente visual cuando aporta aislamiento real. Preferir tokens semánticos existentes para superficie, texto, borde, acento, estado, espacio, radio, sombra y foco; no introducir nombres paralelos sin revisar consumidores. Evitar hexadecimales repetidos, cascadas globales nuevas, `!important` y selectores de alta especificidad.

Migrar reglas por bloque: mover las clases que usa el componente, cambiar sus referencias `styles.*`, y eliminar únicamente los selectores originales que ya no tienen consumidores. Preservar temas claro/oscuro, foco visible, targets táctiles de al menos 44 px y safe areas. No alterar desktop hasta completar M5.

## Incrementos seguros

1. Revisar issue #73, PR abiertos, rama `main`, router y archivos vigentes para evitar solapamientos.
2. Seleccionar **un bloque coherente** (lista, formulario, tabla, detalle o utilidad compartida), sin abstracciones sin consumidor.
3. Extraer componente + CSS Module si corresponde, conservando props, eventos, estados vacíos, carga y error.
4. No modificar contratos de API, stock, pagos, permisos, roles, licencias, demo ni aislamiento multiempresa.
5. Abrir PR pequeño y reversible; describir consumidores, archivos movidos y comportamiento conservado. No fusionar con required checks fallidos o pendientes.
6. Mantener workflows existentes. El flujo incremental no agrega ciclos de QA manual, lint, builds o despliegues; no declarar PASS ni publicación sin evidencia.

## Mapa de migración

Inventario: `Products.jsx` → listas y detalles. Ventas: `SalesEnterprise.jsx` → listas, formularios y paneles. Dashboard: personalizador y bloques de lectura. POS: sesiones, carrito y cobro visual sin cambiar transacciones. CRM: diálogos y registros. Finanzas: gastos, presupuestos y sus utilidades. Continuar gradualmente con Compras, RRHH y verticales **después** de estabilizar la base compartida.

**Regla antiduplícados:** antes de crear un componente, buscar por nombre, estructura y consumidor en `design-system/components`, `components` y `modules/*/ui/components`. Sólo elevar a compartido tras comprobar al menos dos consumidores compatibles.
