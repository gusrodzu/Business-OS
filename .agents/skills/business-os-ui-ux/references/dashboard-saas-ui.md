# Capacidad 1 — Dashboard SaaS UI · Business OS

## Cuándo activarla
Al trabajar en Inicio, KPIs, reportes, tablas, filtros, sidebars, CRM, operaciones por rol, Super Admin o paneles multigiro.

## Método de trabajo
1. Identificar **quién** utiliza el panel (empleado, supervisor, administrador o Super Admin), en qué empresa activa y qué decisión necesita tomar. No incorporar métricas sin fuente existente y permiso explícito.
2. Redactar una pregunta por indicador: «¿Qué requiere atención?», «¿Qué cambió?», «¿Qué puedo resolver ahora?». Identificar origen de datos, unidad, periodo, estado de carga, permiso y acción de detalle.
3. Jerarquizar: contexto/empresa → título y acción principal → alertas reales → **cards KPI rectangulares** → tendencia/operación → tabla o actividad.
4. Elegir visualización según tarea: línea para evolución temporal, barras para comparar categorías, tabla para operación, estados semánticos para riesgos; evitar gráficas ornamentales o pies con demasiadas categorías.
5. Tablas de ERP: búsqueda y filtros aplicables, ordenamiento si existe, paginación, montos alineados, acciones por fila, selección masiva sólo cuando esté soportada, estados vacío/error/espera y versionado móvil sin scroll horizontal global.
6. Revisar navegación: rail de nivel 1, explorador contextual de nivel 2, tabs exclusivamente locales. El módulo seleccionado, permisos y accesibilidad deben seguir coherentes al cambiar de empresa.
7. Validar estados por rol, companyId y online/offline. El modo demo nunca debe aparentar datos reales de producción.

## Dashboard aprobado
- Preservar `data-dashboard-kpi-grid="cards"` y **KPI originales rectangulares, sin hexágonos**.
- Cifras obtenidas de API/adaptador; no deducir tendencias ni porcentajes sin serie temporal real.
- Personalizador: añadir/quitar KPIs, estado vacío accionable, orden vigente y preferencias segregadas por usuario/empresa; no migrar almacenamiento por un cambio visual.
- Desktop 4 columnas cuando caben, tablet 2 y smartphone 1–2 según legibilidad y longitud; verificar 320/360/390/430/768/1024/1440.

## Entregable
Para cada panel: mapa de decisiones usuario/rol, jerarquía visual, catálogo de KPIs (fuente/unidad/periodo/detalle), tipos de gráficas, tabla y estados, responsive y criterios de prueba. Si se solicita implementación, indicar rutas React/CSS y QA real.
