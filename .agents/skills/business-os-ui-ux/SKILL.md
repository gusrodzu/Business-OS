---
name: business-os-ui-ux
description: "Auditar, diseñar, rediseñar, implementar y validar UI/UX del ERP Business OS (BuzzBee), sus dashboards, módulos, navegación de dos niveles, cards KPI, formularios, tablas y versión responsive. Úsala al mejorar pantallas React/CSS Modules del repositorio gusrodzu/Business-OS o preparar un handoff visual; conserva la lógica de negocio, multiempresa, seguridad y estilo aprobado."
---

# Business OS UI/UX — skill del proyecto

## Propósito y alcance

Aplicar criterios UX originales y reutilizables a **Business OS / BuzzBee** (ERP multiempresa/multigiro). Adaptar el proceso a lo que solicite el usuario: investigar una pantalla, auditar, proponer, implementar, comprobar o entregar especificaciones. No convertir toda solicitud en un rediseño amplio ni producir solamente una imagen cuando pida cambios en el código.

El repositorio es la fuente de verdad. Al iniciar, leer la guía vigente en \`docs/ui-ux/BUSINESS_OS_UI_UX_V1.md\`, el área de código relevante y el issue de roadmap [#73](https://github.com/gusrodzu/Business-OS/issues/73) cuando influya en prioridades o bloqueos. Si difieren, conservar las decisiones más recientes aprobadas por el usuario y señalar la contradicción.

## Activación

Usar para peticiones como:
- «Audita el dashboard y corrige su jerarquía visual».
- «Unifica botones, tablas, formularios y espacios de los módulos».
- «Mejora el menú de dos niveles en móvil».
- «Diseña y aplica un estado vacío accesible en Inventario».
- «Prepara handoff o QA visual de web, tablet y smartphone».

**No usar** para cambios exclusivos de backend, facturación, migraciones o despliegues sin trabajo UI/UX, salvo que el usuario solicite explícitamente revisar su experiencia.

## Contrato de producto que debes preservar

- **Cards KPI rectangulares originales** en Dashboard. No reintroducir el panal ni los hexágonos decorativos; conservar métricas reales, personalización y preferencias aisladas por usuario/empresa.
- **Navegación de dos niveles**: icon rail y explorador contextual; evitar duplicar navegación primaria con tabs del contenido. En móvil respetar drawer/bottom navigation, roles y módulos habilitados.
- **Identidad BuzzBee**: interfaz de trabajo Dark Premium carbón/lima con tema claro utilizable. El color de acento comunica acciones/selección; no sustituye estados semánticos.
- **Arquitectura vigente**: React/Vite + CSS Modules + componentes en \`apps/web/src/design-system/components/\`. Reutilizar código existente antes de crear componentes paralelos.
- **Funcionalidad intacta**: rutas, API, filtros, formularios, permisos, integración backend, demo offline, aislamiento multiempresa y acciones transaccionales.
- No modificar secretos, planes de Vercel, protecciones de \`main\` ni datos de clientes. No iniciar migraciones destructivas por una tarea visual.

## Seleccionar un modo de trabajo

1. **AUDITAR**: inspeccionar la pantalla real y el código. Separar hechos comprobados de hipótesis; entregar hallazgos por gravedad, impacto y dificultad. Ver [patrones ERP](references/erp-patterns.md).
2. **DISEÑAR**: definir objetivo del usuario, jerarquía, componentes, flujo, responsive, claro/oscuro, estados y accesibilidad. No suplantar componentes editables por una imagen.
3. **IMPLEMENTAR**: aplicar cambios mínimos en los archivos existentes, sin perder funcionalidad; usar tokens y componentes compartidos. Ver [sistema visual](references/visual-system.md).
4. **VALIDAR**: ejecutar pruebas apropiadas, revisar capturas si el entorno permite navegador y corregir regresiones. Ver [QA y release](references/qa-release.md).
5. **ENTREGAR**: especificar archivos, cambios, pruebas, capturas disponibles, riesgos, estado de PR, SHA y publicación. No confundir merged con Production READY.

Si la petición mezcla modos, seguir **inspección → propuesta breve → implementación → validación → reporte**. Para tareas sólo conceptuales, detenerse tras un handoff útil.

## Procedimiento paso a paso

1. **Ubicar** ruta, componente, CSS, datos, permisos, uso de móvil y versión realmente ejecutada. Verificar si existe una solución previa para no duplicarla.
2. **Detectar** la fricción real: navegación, densidad, jerarquía, contraste, sobreflujo, accesos, estados, formulario o mensajes. Registrar un criterio de aceptación medible.
3. **Diseñar el mínimo cambio coherente**: contrastar con patrones existentes; documentar desktop/tablet/móvil y estados vacíos/loading/error/foco.
4. **Implementar con alcance acotado**, preferentemente una pantalla o componente compartido por PR. Evitar acumulación de \`!important\` o estilos de parche repetidos. No reescribir módulos funcionales para cambiar apariencia.
5. **Comprobar** con las pruebas disponibles. Un audit estático no demuestra pixel-perfect, contraste real, lector de pantalla ni publicación en un dominio.
6. **Integrar según las protecciones** del repositorio: rama corta, PR, CI y comprobación de despliegue cuando haya acceso. Nunca forzar pushes ni desplegar en bucle para esquivar límites.

## Salida esperada

Para auditoría: **área → problema observado → impacto → corrección → prueba de aceptación**.

Para implementación: **resultado funcional → rutas/archivos → checks PASS/FAIL/no ejecutados → PR/SHA → estado de Vercel (verificado o pendiente)**.

En ambos casos, explicar explícitamente qué se preservó y qué sigue pendiente. No declarar una pantalla "validada" si no se abrió o probó.

## Referencias de lectura condicional

- [Sistema visual](references/visual-system.md): tokens, jerarquía, spacing, KPIs, temas, componentes y estados.
- [Patrones ERP](references/erp-patterns.md): navegación, dashboards, tablas, formularios, POS, CRM y módulos; responsive.
- [QA y release](references/qa-release.md): pruebas, accesibilidad, navegador, CI, Vercel y matriz final.

Esta skill combina criterios generales de diseño centrado en tareas con decisiones originales del proyecto. No copiar literalmente guías de terceros ni reutilizar identidades visuales ajenas.
