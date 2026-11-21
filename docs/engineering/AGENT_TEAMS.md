# Business OS — equipos de agentes v1

**Fecha:** 2026-11-21 · **Repositorio:** `gusrodzu/Business-OS` · **Modelo:** tres especialidades independientes, con PRs revisables y coordinación por GitHub.

## Objetivo

Acelerar desarrollo de Business OS sin sacrificar calidad, seguridad ni control del propietario. Las automatizaciones son ejecuciones programadas, **no personal humano ni procesos de cómputo continuos**: cada ejecución examina el estado real y trabaja de manera acotada con las herramientas que estén disponibles. La programación no garantiza acceso a un entorno de ejecución, pruebas de navegador ni horas de desarrollo ininterrumpidas.

## Equipos

| Equipo | Superficie principal | Responsabilidad | Primera prioridad | Evidencias obligatorias |
| --- | --- | --- | --- | --- |
| Backend | `apps/api/**`, dominio compartido y pruebas de API | endpoints, servicios, validaciones, aislamiento de empresas, errores, integraciones y rendimiento | Seleccionar el fallo funcional o de contrato API más urgente según `main` y CI, corregir sin alterar datos reales | prueba de endpoint/integración, multiempresa cuando aplique, checks vinculados al SHA |
| Ciberseguridad | `apps/api/src/**` auth/roles, `apps/web/src/auth/**`, `infra/**`, CI y dependencias | autenticación, autorización, seguridad de archivos, secretos, red, tenant isolation, auditoría defensiva | revisar riesgos de producción/dependencias y corregir un control defensivo de alto impacto sin divulgar hallazgos sensibles | evidencia sanitizada, regresión de seguridad, compatibilidad y revisión del propietario |
| Frontend | `apps/web/src/**` excepto auth sensible | Workspace OS, Pocket OS, componentes React/CSS Modules, interacción y accesibilidad | completar experiencia de ventanas y Widget Studio sin overrides históricos ni regresiones de responsive | lint/build, Frontend QA, capturas/interacciones si hay navegador, rutas y accesibilidad |

## Cadencia y coordinación

- Cada equipo revisa el SHA actual de `main`, PRs y issues abiertos en cada ciclo, antes de elegir trabajo.
- Cada equipo debe acotar su unidad de trabajo y dejar a los demás un contrato explícito cuando haya dependencia.
- Las automatizaciones existentes de interfaz y Desktop trabajan la misma capa. **Frontend concentra la implementación UI; Desktop se limita a QA de ventanas y no debe duplicar cambios**.
- Reparto de tareas por carpeta y por PR, no por posesión absoluta: los módulos compartidos requieren revisión cruzada.
- Ningún equipo puede fusionar, desplegar, ejecutar migraciones destructivas, cambiar credenciales, modificar reglas de producción o aumentar permisos de forma autónoma.
- Los reportes de ejecución deben referirse a cambios verificables, no simplemente proponer ideas repetidas.

## Matriz de decisión

| Cambio | Implementa | Revisa | Aprobación requerida |
| --- | --- | --- | --- |
| Presentación, CSS, widgets y componentes | Frontend | QA Desktop | propietario para merge/deploy |
| Endpoint nuevo o refactor sin schema | Backend | Frontend si cambia contrato | propietario para merge |
| Autenticación, permisos o aislamiento | Backend + Seguridad | Seguridad | propietario antes de merge |
| Datos, Prisma, migraciones y respaldos | Backend | Seguridad | autorización expresa antes de modificar/migrar |
| Dependencias e infraestructura | Seguridad | Backend cuando impacte runtime | propietario antes de merge |
| API y contratos usados por frontend | Backend | Frontend | propietario para merge |

## Flujo en GitHub

1. Revisar `main`, PRs abiertos, GitHub Actions, `AGENTS.md`, `.github/SECURITY.md` y restricciones de CODEOWNERS.
2. Elegir **una** tarea por ejecución; registrar criterio de aceptación y riesgo en el PR.
3. Rama aislada: `agent/backend/*`, `agent/security/*` o `agent/frontend/*`. Los PRs compartidos deben explicar el contrato entre equipos.
4. Probar lo que se modificó; señalar claramente si no se pudo ejecutar una prueba por falta de entorno o permiso.
5. Entregar PR a revisión, sin auto-merge. Si existen PRs similares, actualizar el correspondiente en vez de abrir duplicados.
6. El propietario decide aprobar, solicitar cambios o descartar; la automatización siguiente retoma el estado real, sin asumir aprobación.
7. No introducir nuevos secretos ni datos reales en el repositorio público. Hallazgos sensibles por `.github/SECURITY.md`.

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
- **Coordinación:** no editar el mismo archivo desde dos agentes simultáneamente; no anunciar como fusionado algo que GitHub no confirme.

## Definición de terminado por unidad

PR descriptivo con alcance acotado y reversible; evidencia de checks del mismo SHA; sin cambios de API/DB/credenciales/producción no autorizados; checklist de regresiones y dependencias; revisión de seguridad y frontend cuando aplique; pendiente de aprobación humana para merge.
