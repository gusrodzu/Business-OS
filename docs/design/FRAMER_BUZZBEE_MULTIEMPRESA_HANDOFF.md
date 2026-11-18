# BuzzBee Business OS · Prototipo Framer y handoff UI/UX

**Prototipo editable:** https://framer.com/projects/slIkcCDWidm68dZouEAI

**Estado:** propuesta de referencia **en revisión**, no diseño aprobado ni implementación de producción. No sustituye el proyecto React del ERP ni sus controles de seguridad.

## Trabajo realizado en Framer (29-oct-2026)

- Aplicación React de demostración, no landing page. Componente principal `BusinessOS.tsx` dentro del proyecto Framer.
- Dos niveles de navegación: rail global de iconos y explorador contextual; en smartphone el rail pasa a panel táctil invocable.
- Super Admin ficticio: inicio y directorio de empresas con búsqueda, filtros, vista tabla/tarjetas y asistente de cinco pasos.
- Workspaces de muestra: Autopartes del Norte (refacciones), Café Sierra (restaurante), Clínica Horizonte (salud), FitLab Monterrey (gimnasio) y Constructora Atlas (construcción).
- Dashboards configurados por giro y componentes KPI visuales homogéneos; panel de personalización por empresa, lista de aplicaciones, pantallas simuladas de ventas y operaciones.
- Paleta del prompt prototipo: primario `#2563EB`, acento miel `#F2B544`, light `#F8FAFC`, dark `#0F1117`; esta paleta **no** sustituye automáticamente los tokens `--bb26-*` existentes.
- Breakpoints de canvas Framer: desktop **1200 px**, tablet **810 px**, smartphone **390 px**, con adaptación interna por ancho del componente (ResizeObserver).
- Se eliminó una instancia duplicada que apilaba dos copias del ERP en la Home. Se corrigieron errores de compilación y limpieza de timers de notificación.

## Estado de verificación

- Exportación de componente: sin diagnósticos TypeScript tras corrección.
- Capturas de canvas generadas para los tres tamaños.
- **Limitación pendiente:** la medición automática de altura del componente en el canvas de Framer a 390 px devolvió 200 px; se configuró una altura explícita de 1900 px **sólo en la réplica de smartphone** para revisar la composición. Esto es una solución temporal de diseño; hace falta inspección visual y pruebas de browser (overflow, foco, tabla horizontal, modales) antes de aprobar mobile.
- No se verificó interactividad end-to-end del sitio publicado; el proyecto no se ha publicado. Las acciones están implementadas sólo en la demo React embebida.
- No se han validado todos los criterios WCAG 2.2 AA y no debe considerarse QA de producción.

## Criterios para trasladar diseños al ERP real

1. **No copiar código de Framer a producción directamente**: mapear layouts a CSS Modules y tokens existentes, sin introducir `!important`, hexágonos ni CSS correctivo.
2. Mantener el diseño único de tarjetas KPI rectangulares y navegación de dos niveles para cada rol y giro.
3. No mezclar Super Admin, Demo Local, Demo LIVE ni ERP del cliente. El selector visual de empresa **no** es autorización para cambiar `companyId`; aplicar siempre permisos en backend.
4. SCIAN: cargar únicamente códigos oficiales previamente validados; el prototipo usa etiquetas de giro **sin códigos oficiales**.
5. El wizard de creación debe comenzar en **Demo Local**; aprovisionar tenants reales requiere flujo transaccional, idempotencia, MFA, auditoría y QA intertenant.
6. Implementar primero como componentes reutilizables: Directorio de empresas, encabezado de workspace, KPI base, filtros, tarjetas de empresa, wizard por etapas, drawer responsive.
7. Auditoría con 320/360/390/430/768/810/1024/1200/1440 px, teclado, estados de carga/vacío/error, contraste, semántica y scroll.
8. Comparar capturas Framer vs. React y documentar divergencias antes de fusionar cambios visuales; el prototipo no garantiza exactitud funcional, seguridad o fiscalidad mexicana.

## Próximos hitos

- Corregir altura intrínseca y validar visualmente la versión móvil de Framer; comprobar los modales, la navegación contextual y las tablas en dispositivo real.
- Alinear paleta Framer con el sistema visual BuzzBee actual **tras aprobación**.
- Revisar la interfaz con responsables y seleccionar pantallas de referencia aprobadas.
- Transferir de manera incremental al frontend React de Business OS con pruebas existentes y supervisión del roadmap #73 y fase 2 #206.

Fuente de requisitos: “PROMPT MAESTRO — BUZZBEE BUSINESS OS” suministrado para Framer. Este documento no certifica implementación completa del prompt.
