# Business OS — QA de dependencias (23 de octubre de 2026)

## Alcance y datos de partida

Análisis desde GitHub Actions, con Node.js 24 y el lockfile anterior a los parches:

- Árbol completo: **11 paquetes afectados** (1 crítico, 9 altos, 1 moderado).
- Árbol de producción, `npm audit --omit=dev`: **8 paquetes afectados** (1 crítico, 6 altos, 1 moderado).
- Estos totales proceden de la fecha del análisis y pueden variar cuando npm publique nuevos avisos.
- Las alertas del instalador `npm ci` observadas anteriormente (14) no equivalen necesariamente al recuento actualizado de paquetes vulnerables.

## Parches compatibles incluidos en el PR

Se generaron en una rama aislada con `npm audit fix --package-lock-only --ignore-scripts`, sin `--force`, sin cambiar los manifiestos de dependencias y sin ejecutar migraciones de base de datos.

| Paquete | Antes | Después |
| --- | --- | --- |
| proxy-addr | 2.0.7 | 2.0.8 |
| multer | 2.3.0 | 2.5.0 |
| follow-redirects | 1.16.0 | 1.16.1 |
| vite | 7.3.6 | 7.3.7 |
| source-map-js | 1.2.1 | 1.2.2 |
| brace-expansion | 1.1.18 | 1.1.21 |
| brace-expansion (dependencia de nodemon) | 5.0.9 | 5.0.12 |

El workflow temporal validó la instalación, ESLint, build, auditoría visual, UAT offline y persistencia POS/cobranza **antes de registrar la actualización del lockfile**. El CI del PR debe repetirlas sobre su commit final.

## Riesgos pendientes: no dar por segura una publicación

1. **xlsx (SheetJS 0.18.5)**: el informe de npm no ofrece reparación automática. Se utiliza para procesar hojas subidas a Data Hub en `apps/api/src/modules/platform/api/dataHub.js` y `apps/api/src/modules/operations/api/dataHub.js`. Tiene alertas de contaminación de prototipos y denegación de servicio. Requiere sustituir o aislar el parser, validar límites de entrada y probar las importaciones CSV/XLS/XLSX. No se debe afirmar que el riesgo quedó corregido por los parches compatibles.
2. **Prisma 6.15.0 y dependencias relacionadas**: el informe sugiere una migración mayor a Prisma 7 para algunas alertas, incluyendo `@prisma/config`, `deepmerge-ts` y `effect`. No aplicar una versión mayor automáticamente: necesita validar schema, cliente generado, consultas, migraciones y entorno API. La clasificación de producción debe revisarse con el árbol de dependencias exacto.
3. **React Hooks**: las 42 advertencias previas de ESLint no bloqueaban CI, pero siguen requiriendo revisión cuidadosa por posibles efectos y closures obsoletos.
4. **Riesgo de configuración**: la API puede habilitar `TRUST_PROXY=1`; por eso se priorizó la corrección de `proxy-addr`.

## Procedimiento de verificación

```powershell
npm ci
npm run lint --workspace apps/web
npm run build --workspace apps/web
npm run visual:audit
npm run uat:offline
npm run uat:offline:persistence
npm audit --omit=dev
npm audit
```

No se usó `npm audit fix --force` ni se tocó PostgreSQL. **Que el pipeline esté en verde no equivale a ausencia de vulnerabilidades.** Mantener el lanzamiento bloqueado hasta resolver o aceptar formalmente los riesgos residuales.
