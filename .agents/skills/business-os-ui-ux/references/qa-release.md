# QA de cambios visuales y publicación

## Preflight

1. Confirmar rama/commit actual y qué dashboard o módulo se monta realmente. No modificar una ruta heredada esperando que se vea en la ruta activa.
2. Revisar PR previos, tareas issue #73 y guía UI/UX para no revertir decisiones del usuario.
3. Anotar la interacción y la data que deben permanecer intactas (roles, permisos, empresa activa, filtros, rutas, datos demo, API).
4. Definir criterios de aceptación observables antes de editar.

## Auditorías existentes

Leer primero `package.json`, `.github/workflows/` y el script en cuestión; elegir las comprobaciones apropiadas:

- `npm run lint --workspace apps/web`
- `npm run build --workspace apps/web`
- `npm run ui:foundation:audit`
- `npm run ui:enterprise:audit`
- `npm run ui:spacing:audit`
- `npm run visual:audit`
- `npm run uat:offline`
- `npm run uat:tenant`
- Auditoría de rutas y navegador automatizadas cuando aplique.

Algunos scripts todavía se llaman `ui:hex:audit` y `ui:honeycomb:audit` por motivos históricos. Su resultado debe comprobar las **cards actuales**, no reinstalar un panal antiguo.

## QA manual de UI

- 320, 360, 390, 430, 768, 1024 y 1440 px; móvil, tablet, escritorio, con zoom y contenido largo.
- Tema claro y oscuro; verificar contraste de texto (4.5:1 normal y 3:1 grande) y componentes interactivos relevantes (3:1), según WCAG AA.
- Foco visible, secuencia de Tab, Escape y retorno de foco de drawers/dialogs; etiquetas accesibles de controles.
- Asegurar que alertas, estados, gráficos, tablas y números no dependen sólo del color.
- Target táctil cómodo (44×44 px como objetivo), sin scroll horizontal global no intencional.
- Probar añadir/quitar métricas, cambio de empresa, roles y Demo Offline cuando el cambio afecte Inicio.

## Protocolo GitHub y Vercel

1. Cambios acotados en rama, commit y PR; respetar protección de `main`.
2. Revisar pruebas del SHA exacto. Si fallan, leer logs y corregir la causa en el mismo PR; no cerrar por intuición.
3. Integrar sólo con checks requeridos aprobados.
4. Verificar **Production READY**, dominio y SHA servido por Vercel. Un merge exitoso, un estado genérico Vercel success o una captura de Demo Local **no** demuestran que el público tenga el cambio.
5. Si hay bloqueo `build-rate-limit`, documentarlo; no activar reintentos masivos, eludir cuotas ni cambiar de plan sin autorización.

## Salida de verificación

| Dato | Estado |
|---|---|
| Alcance/archivos | Qué se cambió y por qué |
| Validación estática | Comando y PASS/FAIL/no ejecutado |
| Validación en navegador | Dispositivo/tamaño/tema, resultado |
| Riesgos | Evidencia de regresión y pendientes |
| GitHub | Rama, PR y commit exacto |
| Vercel | Estado de Production verificado o bloqueado |

No afirmar publicación o resultados de pruebas que no se hayan consultado.

## Pruebas según las cinco capacidades

- **Dashboard SaaS UI:** fuentes reales y periodos de KPIs, integridad de tablas/filtros, rutas de detalle, permisos, aislamiento de preferencias entre empresas, estados vacíos, sin tendencias inventadas.
- **Design System Builder:** comprobar consumidores de tokens, modo oscuro/claro, ausencia de reglas globales que afecten a otros módulos, `composes` válido, y medición antes/después del CSS.
- **Design to Code:** comparar el diseño aprobado con la ruta montada, ejecutar lint/build y pruebas de rutas y flujo, revisar aspecto por viewport y estados sin modificar API, roles o valores.
- **Mobile App UI:** probar web/PWA por tamaños y orientación, teclado virtual y safe areas. Una futura app Expo necesita su propio QA nativo y no queda aprobada por CI web.
- **Accessibility Audit:** comprobar WCAG 2.2 AA con contraste medido, foco/teclado, estructura de headings, formularios, zoom/reflow, lectores de pantalla cuando haya acceso y objetivos táctiles. Distinguir pruebas realizadas de pendientes.

No marcar WCAG completo, pixel-perfect ni nativo listo sólo por auditoría estática; exigir evidencia de navegador o dispositivo cuando el objetivo lo requiera.
