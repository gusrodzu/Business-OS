# Business OS Next · Convenciones React y CSS mobile-first

> Alcance: evolución incremental del frontend. Referencias: [roadmap #73](https://github.com/gusrodzu/Business-OS/issues/73) y `docs/ui-ux/BUSINESS_OS_MOBILE_WIREFRAME_V2.md`.

## Prioridad y límites

1. **P0: reducir responsabilidades de componentes grandes** antes de añadir pantallas o rediseñar desktop. Priorizar Dashboard, SalesEnterprise, Products y páginas POS/CRM/Finanzas.
2. **P1: encapsular estilos** por consumidor y reutilizar tokens semánticos ya presentes en `foundation.css` / `tokens.css`. No introducir otra hoja global.
3. **P2: compartir solo patrones con consumidores reales**; después extender el diseño móvil a otros módulos.
4. No alterar endpoints, contratos, operaciones, permisos, aislamiento multiempresa, licencias, demo, stock, facturación o infraestructura en un refactor visual.

## Organización objetivo por feature

```text
modules/<area>/
  ui/
    pages/             # orquestación, rutas y composición
    components/        # piezas presentacionales del área
  hooks/               # estado y carga específicos del área
  services/            # adaptadores de acceso existentes, sin cambiar contratos
  utils/               # formato y transformaciones puras
```

Migrar gradualmente desde las rutas actuales: **no mover directorios completos** ni cambiar imports masivamente. Un PR debe resolver una responsabilidad concreta. Si una pieza es usada por un solo feature, mantenerla local. Elevar a compartida únicamente cuando exista reutilización comprobable.

## Contrato de componentes

- La página conserva el contexto de empresa, permisos, selección, navegación y mutaciones.
- Los componentes presentacionales reciben datos preparados y callbacks con nombres explícitos (`onOpen`, `onStageChange`, `onClose`); no hacen solicitudes de red por cuenta propia.
- Los hooks específicos contienen estado y efectos del feature, sin crear dependencias circulares con componentes.
- Los formateadores y transformaciones puras se extraen solo cuando reducen repetición real; no mover reglas transaccionales en refactors visuales.
- Preferir un componente por unidad de comportamiento reconocible (tarjeta de registro, panel de detalle, tabla, Kanban), no por cada `div`.

Ejemplo ilustrativo de separación de responsabilidades:

```jsx
function RecordsPage() {
  const { records, openRecord } = useExistingRecordsController();
  return <RecordsList records={records} onOpen={openRecord} />;
}

function RecordsList({ records, onOpen }) {
  return records.map((record) => (
    <MobileRecordCard
      key={record.id}
      record={record}
      onOpen={() => onOpen(record.id)}
    />
  ));
}
```

Este ejemplo **no implica** crear el hook ni la tarjeta si no existen consumidores concretos.

## CSS Modules y tokens

- Preferir `Component.module.css` junto al componente que lo consume. Los layouts de página permanecen en el módulo de página.
- Reutilizar las variables semánticas ya definidas para superficie, texto, bordes, acento, espaciado, radio, elevación y estados; **verificar nombres reales antes de usarlos**.
- No crear hexadecimales repetidos, nuevas cascadas globales, selectores de especificidad excesiva ni `!important` para corregir conflictos de arquitectura.
- Evitar `composes` hacia CSS Modules de páginas: crea acoplamiento inverso. Extraer reglas locales del componente o una variante compartida con varios consumidores.
- Preservar temas claro/oscuro, foco visible, targets táctiles de al menos 44 px donde corresponda y scroll horizontal de tablas/Kanban.
- No eliminar selectores antiguos hasta comprobar que sus consumidores ya migraron. Evitar duplicar reglas indefinidamente: planear su retiro en el PR de integración.

## Catálogo inicial de patrones

| Patrón | Responsabilidad |
| --- | --- |
| `KpiCard` | Indicador presentacional; valores calculados fuera |
| `MobileRecordCard` | Registro compacto con acción explícita |
| Header/filtros/tabs | Navegación y controles accesibles, sin acoplarse a servicios |
| Empty/loading/error | Estados visuales coherentes con el contexto |
| Formularios/drawers | UI y validación de presentación; mutaciones en orquestador |
| Shell/dock | Estado único de navegación móvil y jerarquía de dos niveles |

No crear componentes genéricos nuevos sin comprobar los existentes y al menos un uso real.

## Secuencia de integración

1. Revisar `main`, PRs abiertos y dependencias apiladas antes de editar.
2. Elegir **un bloque coherente**, rama propia y PR pequeño y reversible.
3. Describir origen, destino, consumidores y comportamiento preservado.
4. No ampliar desktop ni ejecutar ciclos manuales de tests/lint/build/deploy como trabajo iterativo. **No desactivar** workflows ni protecciones existentes; no fusionar con required checks fallidos o pendientes.
5. Integrar PRs dependientes en orden y después retirar duplicaciones antiguas. Registrar decisiones de arquitectura relevantes en #73.

**Invariantes móviles:** Home app-first (4/3 columnas según breakpoint aprobado), favoritos por empresa, giros SCIAN, navegación de dos niveles y un único estado activo en el bottom dock.

**Hosting actual:** Cloudflare. Este documento no presupone Pages o Workers ni solicita cambios de infraestructura.
