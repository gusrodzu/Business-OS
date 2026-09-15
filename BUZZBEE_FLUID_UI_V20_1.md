# BuzzBee Business OS — Fluid UI v20.1.0

## Migración aplicada
Se extendió la capa Apple-inspired/MD3 al workspace completo mediante un contrato semántico por módulo, sin cambiar rutas ni contratos de datos.

Módulos cubiertos: Home, Ventas, Compras, Inventario, Finanzas, CRM, RRHH, Proyectos, POS y Producción.

### Cambios
- `UXRouteFrame` identifica cada familia con `data-fluid-module`.
- Nueva capa `fluid-module-rollout.css` para ritmo, superficies, tablas, controles, tabs, drawers, dark mode y responsive.
- Feedback físico inmediato en press y estados focus/hover coherentes.
- Tablas con hover/focus contextual, cabecera estable y scroll contenido.
- Drawers/paneles contextuales con material translúcido y jerarquía de profundidad.
- Ajustes específicos para POS, finanzas, proyectos y módulos de alta densidad.
- `prefers-reduced-motion` y `prefers-reduced-transparency` incluidos.
- Versión web actualizada a `20.1.0`.

## QA ejecutado
`node scripts/validate-fluid-ui-v20.1.0.mjs` → **13 PASS / 0 FAIL**.

El build no puede validarse en este contenedor porque el `node_modules` recibido contiene el ejecutable Vite sin permisos/compatibilidad de ejecución Linux (`vite: Permission denied`). En Windows, reconstruir dependencias antes del build.

```powershell
cd apps/web
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
npm install
npm run build
npm run dev
```
