# Data Hub — Importación segura de hojas (23/oct/2026)

## Dependencia
`apps/api/package.json` utiliza el tarball oficial de SheetJS 0.20.3 mediante URL fija. El lockfile incluye SHA-512 integrity y permite mantener compatibilidad de importación CSV, XLSX y XLS.

La distribución oficial está documentada en https://docs.sheetjs.com/docs/getting-started/installation/nodejs/.

## Defensa en profundidad
Ambas API de Data Hub leen con `sheetRows:5002` (encabezado más 5001 filas) y mantienen la regla existente que rechaza más de 5000 filas de datos. Multer sigue limitando el tamaño de carga a 10 MB.

## Regresión
`node apps/api/scripts/validate-datahub-formats.mjs` comprueba tipos CSV/XLS/XLSX, fecha serial, valores y límite. GitHub Actions ejecuta este test además de lint, build, pruebas visuales y offline.

## Consideraciones
`npm audit` depende del índice de vulnerabilidades de npm, que puede etiquetar el nombre `xlsx` incluso si la versión oficial 0.20.3 se instala desde fuera de npm. Verificar siempre versión real, proveedor y advisory. No aceptar archivos más grandes que 10 MB ni desactivar permisos Data Hub.

No hubo cambios en PostgreSQL ni en las migraciones de Prisma.
