# Business OS — equipos de agentes v2

**Fecha:** 2026-11-21 · **Repositorio:** `gusrodzu/Business-OS` · **Modelo:** Frontend, Backend, Seguridad y QA como equipos de ejecución; Director Técnico y DevOps/SRE como especialidades adicionales, con PRs revisables y coordinación por GitHub.

## Objetivo

Acelerar desarrollo de Business OS sin sacrificar calidad, seguridad ni control del propietario. Las automatizaciones son ejecuciones programadas, **no personal humano ni procesos de cómputo continuos**: cada ejecución examina el estado real y trabaja de manera acotada con las herramientas que estén disponibles. La programación no garantiza acceso a un entorno de ejecución, pruebas de navegador ni horas de desarrollo ininterrumpidas.

## Equipos

| Equipo | Superficie principal | Responsabilidad | Primera prioridad | Evidencias obligatorias |
| --- | --- | --- | --- | --- |
| Backend | `apps/api/**`, dominio compartido y pruebas de API | endpoints, servicios, validaciones, aislamiento de empresas, errores, integraciones y rendimiento | Seleccionar el fallo funcional o de contrato API más urgente según `main` y CI, corregir sin alterar datos reales | prueba de endpoint/integración, multiempresa cuando aplique, checks vinculados al SHA |
| Ciberseguridad | `apps/api/src/**` auth/roles, `apps/web/src/auth/**`, `infra/**`, CI y dependencias | autenticación, autorización, seguridad de archivos, secretos, red, tenant isolation, auditoría defensiva | revisar riesgos de producción/dependencias y corregir un control defensivo de alto impacto sin divulgar hallazgos sensibles | evidencia sanitizada, regresión de seguridad, compatibilidad y revisión del propietario |
| Frontend | `apps/web/src/**` excepto auth sensible | Workspace OS, Pocket OS, componentes React/CSS Modules, interacción y accesibilidad | completar experiencia de ventanas y Widget Studio sin overrides históricos ni regresiones de responsive | lint/build, Frontend QA, capturas/interacciones si hay navegador, rutas y accesibilidad |
| QA independiente | Flujos y contratos entre frontend/backend, pruebas, GitHub Actions | comprobar que los cambios de otros equipos no provocan regresiones ni rompen UX, seguridad o rutas | revisar PRs abiertos y checks por SHA sin duplicar implementación | matriz PASS/FAIL/PENDIENTE, pasos reproducibles, severidad P0-P3 |
| Director Técnico | lectura transversal, roadmap y decisiones de arquitectura | priorizar y coordinar cinco equipos, detectar duplicados, alinear interfaces y contratos | revisar entregas P0/P1, conflictos de archivos y PRs bloqueados | reporte ejecutivo vinculado a SHA/PR, backlog con responsables |
| DevOps/SRE | `.github/workflows/**`, `scripts/ci/**`, Cloudflare/infra (con revisión) | estabilidad CI, reproducibilidad, observabilidad, despliegue y recuperación | auditar el workflow de auto-merge; revisar fallos de CI antes de cambios de infraestructura | evidencia del check por SHA, plan de rollback, PR de cambio reversible |

## Cadencia y coordinación

- Cada equipo revisa el SHA actual de `main`, PRs y issues abiertos en cada ciclo, antes de elegir trabajo.
- Cada equipo debe acotar su unidad de trabajo y dejar a los demás un contrato explícito cuando haya dependencia.
- **Frontend implementa UI; QA valida de forma independiente**. El antiguo cierre Desktop ahora es QA de toda la aplicación. Evita duplicar PRs y revisiones.
- Director Técnico coordina prioridades y dependencias; DevOps opera la calidad de la plataforma sin asumir autorización para publicar o fusionar.
- Reparto de tareas por carpeta y por PR, no por posesión absoluta: los módulos compartidos requieren revisión cruzada.
- Ningún equipo puede fusionar, desplegar, ejecutar migraciones destructivas, cambiar credenciales, modificar reglas de producción o aumentar permisos de forma autónoma.
- Los reportes de ejecución deben referirse a cambios verificables, no simplemente proponer ideas repetidas.

## Matriz de decisión

| Cambio | Implementa | Revisa | Aprobación requerida |
| --- | --- | --- | --- |
| Presentación, CSS, widgets y componentes | Frontend | QA independiente | propietario para merge/deploy |
| Endpoint nuevo o refactor sin schema | Backend | Frontend si cambia contrato | propietario para merge |
| Autenticación, permisos o aislamiento | Backend + Seguridad | Seguridad | propietario antes de merge |
| Datos, Prisma, migraciones y respaldos | Backend | Seguridad | autorización expresa antes de modificar/migrar |
| Dependencias e infraestructura | DevOps/SRE con Seguridad | Backend cuando impacte runtime, Seguridad en permisos | propietario antes de merge |
| API y contratos usados por frontend | Backend | Frontend + QA | propietario para merge |
| Roadmap técnico y dependencias | Director Técnico (solo coordinación) | equipos afectados | propietario para decidir prioridades |
| CI, build, release y observabilidad | DevOps/SRE | QA, Seguridad si afecta controles | propietario antes de merge o deploy |

## Flujo en GitHub

1. Revisar `main`, PRs abiertos, GitHub Actions, `AGENTS.md`, `.github/SECURITY.md` y restricciones de CODEOWNERS.
2. Elegir **una** tarea por ejecución; registrar criterio de aceptación y riesgo en el PR.
3. Rama aislada: `agent/backend/*`, `agent/security/*`, `agent/frontend/*`, `agent/qa/*`, `agent/architecture/*` o `agent/devops/*`. Los PRs compartidos deben explicar el contrato entre equipos.
4. Probar lo que se modificó; señalar claramente si no se pudo ejecutar una prueba por falta de entorno o permiso.
5. Entregar PR a revisión, sin auto-merge. Si existen PRs similares, actualizar el correspondiente en vez de abrir duplicados.
6. El propietario decide aprobar, solicitar cambios o descartar; la automatización siguiente retoma el estado real, sin asumir aprobación.
7. No introducir nuevos secretos ni datos reales en el repositorio público. Hallazgos sensibles por `.github/SECURITY.md`.

## Disponibilidad y activación

- Las automatizaciones de ChatGPT funcionan de forma programada solo si están activas y la cuenta dispone de cupos. **Actualmente el plan alcanzó su máximo de cinco tareas activas**: Frontend, Backend, Seguridad, QA y el proyecto independiente SEVEN EV.
- Director Técnico y DevOps/SRE quedan **preparados como perfiles de agentes personalizados de GitHub Copilot** en `.github/agents/` para ejecución **bajo demanda**, sujetos a los permisos/plan de Copilot y a la aprobación del PR que los contiene. No suponer que tienen una automatización horaria activa.
- Cuando existan cupos disponibles, programar al Director Técnico aproximadamente en el minuto 58 de cada hora (tras Ciberseguridad a :48) y DevOps/SRE cada tres horas, alrededor del minuto 24; confirmar explícitamente su creación.
- GitHub tiene un workflow de auto-merge programado (`.github/workflows/safe-auto-merge.yml`). Su código contempla habilitar auto-merge si se cumplen ciertas condiciones. **Es una brecha respecto a la política de aprobación manual** hasta verificar que la protección de rama y el workflow garantizan la decisión del propietario. DevOps debe auditar y proponer un PR correctivo separado; no declarar resuelto el riesgo solo con este documento.

## Comandos de referencia (según el tipo de cambio)

```bash
npm ci --include=dev
npm run build
npm run security:regressions
npm run uat:tenant
npm run routes:render:safety
npm run mobile:responsive:audit
npm audit --omit=dev --audit-level=high
```

No ejecutar todos indiscriminadamente: escoger la suite mínima suficiente y comprobar el estado de los workflows de PR y `main`. Para verificaciones de navegador o de infraestructura, distinguir las simuladas de una sesión real, y no afirmar que se probó en producción sin evidencia.

## Primeros objetivos compartidos

- **Backend:** estado de API/Prisma, seguridad del aislamiento multiempresa, consistencia de contratos y pruebas de integración; evitar cambios de datos sin aprobación.
- **Seguridad:** validar las pruebas existentes, dependencias de producción, controles de auth y configuraciones de exposición, con reporte privado cuando el detalle sea sensible.
- **Frontend:** cerrar los PRs de Widget Studio / Workspace OS que estén efectivamente abiertos, mejorar responsive, accesibilidad, uniformidad de CSS y no contradecir la referencia visual aprobada.
- **QA:** validar PRs de otros equipos con evidencias y severidad; no aprobar su propio trabajo.
- **Director Técnico:** ordenar bloqueos y prioridades transversales sin editar código ni activar merges.
- **DevOps/SRE:** revisar veracidad de GitHub Actions, el riesgo de auto-merge, Cloudflare y planes de rollback sin tocar producción.
- **Coordinación:** no editar el mismo archivo desde dos agentes simultáneamente; no anunciar como fusionado algo que GitHub no confirme.

## Definición de terminado por unidad

PR descriptivo con alcance acotado y reversible; evidencia de checks del mismo SHA; sin cambios de API/DB/credenciales/producción no autorizados; checklist de regresiones y dependencias; revisión de seguridad y frontend cuando aplique; pendiente de aprobación humana para merge.
