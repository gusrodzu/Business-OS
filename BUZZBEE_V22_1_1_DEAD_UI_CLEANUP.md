# BuzzBee v22.1.1 — Dead UI Cleanup

## Objetivo
Eliminar componentes/páginas React legacy que ya no forman parte del grafo runtime y duplicaban implementaciones canónicas de `src/modules/*`.

## Resultado
- 48 componentes/páginas JSX legacy eliminados de `apps/web/src/pages`.
- CSS Modules asociados eliminados cuando existían.
- Las páginas runtime conservadas en `src/pages` son únicamente las que siguen siendo entrypoints reales (por ejemplo Login, NotFound y PlatformEntry, además de cualquier página alcanzable desde el grafo de imports).
- El auditor de Ventas fue actualizado para exigir que los duplicados legacy ya no existan, en vez de aceptar shims.
- Versiones root/web/api/runtime sincronizadas en 22.1.1.

## Impacto medido
Antes del cleanup, el gate final revisaba 221 archivos JS/JSX; después revisa 173. El auditor React/CSS Modules reporta 113 JSX y 98 CSS Modules activos en su alcance. Las pantallas >700 líneas detectadas por el gate final bajaron de 12 a 8.

## Validaciones ejecutadas
- `npm run release:final` — PASS
- React + CSS Modules — PASS
- Design System / Shell — 8/8 PASS
- Ventas — PASS
- Compras — PASS
- Inventario — PASS
- Domain Boundaries — 12/12 PASS, 0 transport leaks
- Launch Readiness — 22/22 PASS
- Offline UAT — 483 assertions PASS
- Tenant Isolation — 54/54, 100% PASS
- Full Modular Audit — 36/36 PASS

## Nota
No se eliminaron archivos de infraestructura de dominio (`services`, `hooks`, `contracts`, `index`) solo por no aparecer en el grafo runtime actual: forman parte de la frontera arquitectónica pública y de la migración v22. La limpieza se concentró en componentes UI/páginas duplicadas y seguras de retirar.
