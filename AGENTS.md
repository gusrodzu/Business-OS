# Business OS — instrucciones de colaboración para agentes

Estas instrucciones aplican al repositorio `gusrodzu/Business-OS` y a cualquier agente que trabaje en él. Leer también `docs/engineering/AGENT_TEAMS.md` antes de proponer cambios. **No son una autorización para publicar, fusionar, consultar secretos o modificar producción.**

## Misión

Mantener Business OS como un sistema operativo empresarial multiempresa, escalable, accesible y seguro, con Workspace OS (desktop/tablet) y Pocket OS (móvil). Respetar las decisiones del proyecto y no convertirlo en un dashboard ERP convencional.

## Equipos y zonas de responsabilidad

- **Frontend**: `apps/web/src/**` — Workspace OS, Pocket OS, UX/UI, componentes compartidos, CSS Modules, flujos accesibles, rendimiento frontend. Evitar modificar `apps/web/src/auth/**` sin revisión del equipo Seguridad.
- **Backend**: `apps/api/**`, `packages/**` de lógica de dominio, endpoints, validaciones, límites entre empresas, pruebas de integración. Nunca modificar `apps/api/prisma/**` ni migrar datos sin revisión y autorización expresa.
- **Ciberseguridad**: inspeccionar los límites entre módulos, auth, permisos, tenant isolation, infraestructura, dependencias, secretos, CI y políticas. Priorizar pruebas y correcciones defensivas de alcance reducido. Todo cambio que cruce API, login, permisos, bases de datos, red o despliegue requiere revisión del propietario.
- **Coordinación**: cada ejecución revisa `main`, PRs abiertos y comprobaciones CI; selecciona una tarea que no duplique la de otro equipo; avanza mediante una rama de su ámbito y deja un PR revisable. El propietario del repositorio conserva la aprobación final.

## Contrato operativo

1. Empezar leyendo el SHA de `main`, PRs activos, incidentes y checks relevantes. No trabajar sobre una rama obsoleta ni sobrescribir trabajo ajeno.
2. Delimitar una tarea verificable y su criterio de aceptación antes de editar. Revisar dependencias cruzadas y pedir revisión del otro equipo cuando afecten sus rutas. Preferir cambios pequeños y reversibles.
3. Usar ramas con prefijo `agent/frontend/`, `agent/backend/` o `agent/security/`; crear PR con descripción, archivos, impacto, pruebas ejecutadas, resultados y pendientes. **No fusionar ni desplegar automáticamente**.
4. No inventar resultados ni números. Diferenciar entre pruebas estáticas, pruebas de navegador, pruebas reales y verificaciones pendientes. No relajar controles solo para obtener verde.
5. Mantener pruebas de aislamiento multiempresa, autorización por rol, datos fiscales y transacciones. No simular acciones críticas contra usuarios reales ni modificar datos, pagos, DNS o configuración de producción.
6. Para fallos de seguridad: **no divulgar detalles explotables, credenciales o PII en issues/PRs públicos**. Seguir `.github/SECURITY.md` y reportar hallazgos sensibles por vía privada.
7. Revisar accesibilidad (teclado, foco, contraste, lectores de pantalla y zoom 200 %), responsividad y claridad para personas con distintos niveles de familiaridad digital en las tareas de UI.
8. No introducir dependencias ni migraciones innecesarias; reutilizar patrones React/CSS Modules, API y el diseño existentes. No sustituir Vercel por despliegue: la plataforma actual es Cloudflare Workers/Pages.
9. Cada avance reporta: **qué cambió, commit/PR, pruebas/CI por SHA, riesgos, responsables de revisión y siguiente tarea**. Si no hubo cambios, explicar el bloqueo y no crear commits de relleno.

## Flujo de revisión entre equipos

- Frontend que requiera nuevos datos: documenta contrato y necesita acuerdo de Backend, sin crear respuestas ficticias en producción.
- Backend que cambie payloads, rutas o sesiones: incluir pruebas de compatibilidad y notificar al equipo Frontend.
- Seguridad revisa PRs que toquen auth, permisos, aislamiento de empresas, Prisma, `infra/`, cabeceras o dependencias; puede solicitar cambios, pero no fusionar sin consentimiento.
- PR que afecte a más de un equipo: dividirlo o etiquetarlo como integración, documentando dependencias.
- Antes de enviar a aprobación, comprobar checks del **mismo SHA** que se pretende integrar.

## Referencias

- `docs/engineering/AGENT_TEAMS.md` — matriz de responsabilidad, prioridades y aceptación.
- `.github/CODEOWNERS` — revisión del propietario.
- `.github/SECURITY.md` — reporte responsable.
- `package.json` y `.github/workflows/` — comandos de QA y GitHub Actions.
