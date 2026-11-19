# Business OS — Integración UI/UX única para piloto enero 2027

**Entrega:** un solo PR de integración (PR #704). La rama acumula cambios en commits revisables; no se fragmenta en PRs por módulo. No se fusiona por calendario ni por apariencia: solo al pasar puertas de calidad.

## Definition of Done — experiencia transversal
- [ ] Escritorio OS: wallpaper, launcher, dock, foco, multitarea, snap, maximizar/restaurar, scroll de ventanas, atajos.
- [ ] Configuración: las siete opciones de Personalización tienen efecto real, estado y persistencia; las seis categorías comparten estructura.
- [ ] Sistema visual: tokens semánticos y componentes compartidos en lugar de CSS duplicado; claro/oscuro; hover/focus/disabled/loading/error.
- [ ] Módulos: revisar cada ruta de ventas, compras, inventario, finanzas, CRM, POS, proyectos, producción, RRHH, reportes y administración; conservar flujos reales.
- [ ] Pocket OS: navegación móvil y aplicaciones fullscreen, sin controles desktop impropios.
- [ ] Tablet: 768/1024 px, lista-detalle y scroll sin contenido oculto.
- [ ] Accesibilidad: WCAG 2.2 AA, teclado, foco, contraste, reduced-motion, targets táctiles.
- [ ] Seguridad: roles, permisos, empresa activa, aislamiento de preferencias y datos, sin cambios destructivos.
- [ ] Persistencia: cuenta/empresa para preferencias sincronizadas; distinguir preferencias solo de navegador y reportar fallos.
- [ ] QA: capturas 320/360/390/430/768/1024/1280/1440/1920, temas, zoom 200%, navegación y rutas críticas.
- [ ] CI: build, lint/QA frontend, pruebas de navegador, smoke API/DB y regresiones de rutas en verde.
- [ ] UAT: escenarios de usuarios no técnicos y usuarios expertos, evidencia de problemas y correcciones.
- [ ] Plan de reversión y piloto: datos de demostración, permisos mínimos, incidencias, soporte y responsable de bloqueo.

## Criterios de aceptación para enero
1. Un usuario nuevo completa sin asistencia los flujos críticos definidos para su giro.
2. Un usuario habitual encuentra funciones y realiza tareas repetitivas sin pérdida de información.
3. No hay bloqueos P0/P1, errores críticos de autorización o pérdida de datos.
4. Los problemas P2 restantes se documentan y aceptan expresamente antes de iniciar el piloto.
5. El PR se integra solo tras evidencias reproducibles, no por completar casillas sin prueba.

## Método de ejecución
- **Un PR, múltiples commits**: foundation → shell desktop → settings → componentes → rutas de negocio → pocket/tablet → QA/UAT.
- Registrar en el mismo PR las capturas, fallos y correcciones; no abrir PRs visuales adicionales para este alcance.
- No eliminar módulos, cambiar permisos, alterar API o modificar datos reales para satisfacer métricas visuales.
- El PR puede permanecer abierto durante la integración. El documento es un contrato, no una afirmación de que la implementación ya terminó.
