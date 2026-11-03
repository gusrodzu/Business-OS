# Business OS Next — contrato de arquitectura frontend móvil

Alcance: refactors incrementales de [#73](https://github.com/gusrodzu/Business-OS/issues/73). La arquitectura y la conservación funcional preceden al rediseño de pantallas. Desktop no cambia.

## Estructura por feature

```text
modules/<area>/
  ui/
    pages/          # orquestación: estado, navegación, permisos, mutations
    components/     # presentación y callbacks explícitos
    hooks/          # estado/lecturas cuando existen consumidores reales
    utils/          # funciones puras de presentación/selección
  services/         # adaptadores de API existentes; no reescribir endpoints
```

Respetar las rutas reales del repositorio si un módulo ya organiza sus servicios fuera de `ui`. Extraer solo piezas con responsabilidad coherente y consumidor real; no crear un componente por cada contenedor. No mover guardias de permisos al componente visual. No trasladar operaciones de stock, pagos, tenant o licencias a utilidades de presentación.

## CSS y tokens

`apps/web/src/main.jsx` importa únicamente `design-system/styles/foundation.css`. Esa hoja importa `tokens.css` y el resto de estilos globales heredados; **no agregar otra importación global**. `tokens.css` agrega roles de color, tipografía, espaciado, tamaños, layout, forma, elevación, movimiento y temas claro/oscuro.

- Cada componente nuevo o extraído usa `NombreComponente.module.css` junto al JSX.
- Preferir roles existentes como `--surface-card`, `--text-primary`, `--text-secondary`, `--border-default` y `--color-primary-ring`; consultar los archivos `design-system/tokens/*` antes de introducir nuevos nombres.
- Mantener estados `:focus-visible`, controles táctiles de al menos 44px donde aplique, safe-area y temas claro/oscuro. No añadir hexadecimales duplicados ni `!important` para competir con cascadas heredadas.
- Migrar las reglas de un componente a la vez; eliminar las reglas originales solo cuando no tengan otros consumidores. `composes` puede servir como puente temporal, documentando la dependencia.

## Componentes compartidos: primero comprobar consumidores

`components/KpiCard` y `KpiGrid` ya existen: reutilizarlos antes de crear variantes. `MobileRecordCard` solo se generaliza cuando dos módulos comparten semántica real (identidad, estado, metadatos y acciones); no debe conocer endpoints, permisos ni giros. Formularios, filtros, encabezados y estados vacíos/carga/error se comparten únicamente cuando su contrato de props es estable.

Ejemplo de separación:

```jsx
// Página: obtiene datos y mantiene el evento de dominio.
<ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
// Componente: solo muestra campos autorizados y llama onClose.
```

## Secuencia para cada PR

1. Leer PRs abiertos para evitar tocar el mismo archivo sin coordinar dependencias.
2. Seleccionar una extracción reversible con consumidor real; mantener firmas y efectos.
3. Separar JSX/CSS Module o una utilidad pura, sin alterar endpoints, roles, demo, licencias ni aislamiento por empresa.
4. Explicar en el PR archivos, responsabilidades que permanecen en la página y solapamientos con otros PRs.
5. Dejar el PR en draft hasta que los checks requeridos y las protecciones de `main` permitan integración. No desactivar workflows ni declarar deploy sin confirmación.

La iteración actual no incluye ciclos manuales de QA, lint, build o deploy por directriz del proyecto. Eso **no** exime de los gates existentes. Referencia de jerarquía móvil: `docs/ui-ux/BUSINESS_OS_MOBILE_WIREFRAME_V2.md`; conservar Home app-first 4/3, favoritos por empresa, navegación de dos niveles y bottom dock único.
