# Business OS — UI Foundation 2.0 (sprint 1)

## Objetivo y alcance
Consolidar la capa reutilizable de interfaz sin sustituir el diseño carbón/lima de BuzzBee, sin cambiar rutas, roles, permisos, cálculos, datos MotorNorte, endpoints o adaptadores offline.

### Cambios incluidos
- **Tokens compartidos**: espaciados, tamaños para ayudas de formulario y etiquetas de controles en `enterprise-ui-v26.css`. No se agrega una nueva hoja global ni se cambia el orden de importación.
- **Button / Input / Select**: foco visible coherente, controles móviles de 44 px, mensajes de ayuda más legibles, estados de error, discapacidad y movimiento reducido. La API pública de los componentes permanece igual.
- **Card / DataTable**: controles responsive sin cambiar el scroll de los widgets; tablas con región desplazable, navegación por teclado, foco visible y números tabulares cuando se identifica un campo numérico.
- **PageHeader**: eliminación de sus dos bloques CSS duplicados; encabezados, acciones y textos largos adaptan su ancho.
- **Checkbox**: ID único generado si el consumidor no proporciona `id`; mantiene `checked`, `onChange` y la etiqueta nativa.
- **Dialog / Drawer**: foco inicial, navegación Tab/Shift+Tab dentro del diálogo, Escape, restablecimiento del foco previo y títulos accesibles. Las acciones de cierre y el portal siguen siendo los mismos.
- **UX Foundation**: búsqueda etiquetada, fichas de filtros eliminables con nombres claros, botón de favoritos con estado presionado, tolerancia a bloqueo de almacenamiento local y controles táctiles en móvil.
- **QA**: contrato estático nuevo `npm run ui:foundation:audit`, incorporado a `Frontend QA`. Los workflows existentes ejecutan build, lint, release audits, offline UAT y revisión de navegador en 320/360/390/430 px.

### No incluido
No se reescriben pantallas operativas ni se eliminan reglas heredadas de forma masiva. La auditoría anterior encontró múltiples capas CSS con `!important`; su reducción será gradual por módulo, acompañada de capturas comparativas. No se cambia el diseño hexagonal del dashboard.

## Matriz de aceptación
| Comportamiento | Validación |
| --- | --- |
| Accesibilidad básica | `ui:foundation:audit`, lint, foco Tab/Shift+Tab, Escape, labels y mensajes de error |
| Apariencia | `ui:enterprise:audit`, `ui:sheet:audit`, `visual:audit` |
| Responsive | `mobile:responsive:audit` y Smartphone Browser Review (320, 360, 390, 430 px) |
| Flujos funcionales | `release:final`, `uat:offline`, `uat:offline:persistence` y workflows transaccionales |
| Permisos, rutas, backend | No modificados; verificar los cambios de archivos del PR y la CI |

Las pruebas automatizadas no constituyen una certificación integral de WCAG. Para considerar el sprint listo para producción se requiere que los checks de código y navegador pasen, inspección visual de las capturas y validación del despliegue Vercel por separado.

## Próxima iteración
- Migrar el CSS de alta especificidad del dashboard y los módulos críticos a componentes aislados, sin eliminar overrides en lote.
- Probar flujos completos con teclado y lector de pantalla sobre Ventas, Compras, Inventario, Finanzas y POS.
- Mejorar el rendimiento de tablas y medir Core Web Vitals en las rutas más usadas.
