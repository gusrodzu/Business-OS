# CSS Build Hotfix v16.0.1

## Problema
El rollout MD3 dejó secuencias literales `\n` dentro de cuatro CSS Modules. PostCSS las interpreta como texto inválido y Vite detiene el build con `Unknown word \n`.

## Corrección
Se reemplazaron las secuencias literales por saltos de línea reales en:

- `apps/web/src/layout/AppShell.module.css`
- `apps/web/src/layout/Topbar.module.css`
- `apps/web/src/layout/ModuleTabBar.module.css`
- `apps/web/src/layout/PlatformShell.module.css`

## Validación
La auditoría estática confirma 0 secuencias literales `\n` en todos los archivos `.css` bajo `apps/web/src`.

No requiere migración de PostgreSQL.
