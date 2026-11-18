# Business OS — hoja maestra UI responsive (v27)

**Objetivo:** una sola interfaz y sistema de componentes para Web, tablet, Android, iOS y Huawei, manteniendo módulos, permisos, estados de negocio y demo MotorNorte. Documento de implementación; las maquetas son **diseños de referencia**, no datos en producción.

## Identidad
- **Marca:** BuzzBee Business OS.
- **Estilo:** sidebar carbón, espacio de trabajo blanco cálido, canvas muy claro; acciones prioritarias lima; KPI principal oscura y KPI secundarios pastel.
- **Tokens compatibles con v26:** carbón `#242628`, lima `#DDF66C`, canvas `#F5F7F6`, superficie `#FFFFFF`, línea `#DDE4E0`, texto `#262C2D`.
- **Semántica:** el lima comunica **acción/identidad**, no sustituye éxito, advertencia o error. Los estados conservan su significado y texto; nunca depender sólo del color.
- **Forma:** controles con radio 12px, tarjetas 18px, espacios 4/8/12/16/24/32px. Números alineados y con dígitos tabulares.
- **Accesibilidad:** foco visible de 2px; tamaños táctiles objetivo **44 × 44 CSS px** en móvil; contraste WCAG 2.2 AA verificable con herramientas; reducción de movimiento; etiquetas y mensajes claros; no esconder columnas financieras sin alternativa.

## Variantes según ancho disponible

| Variante | Ancho guía | Navegación | KPIs | Tablas / formularios |
|---|---:|---|---|---|
| Desktop | 1440px, expandido ≥1200 | Menú lateral de dos niveles + área central + panel derecho opcional | 4/5 indicadores, sin forzar cantidad | Tabla completa y modal o panel lateral |
| Tablet | 820px, ancho medio 600–839 | Rail compacto / explorador ocultable | 2 columnas | Tabla desplazable dentro de su contenedor; editor ancho adaptable |
| Móvil | 390px, compacto <600 | Navegación inferior de 5 destinos + drawer de módulos | 2 columnas (1 en <340px) | Formularios de una columna y paneles de pantalla completa |

Los puntos de corte deben responder al *viewport* disponible; el mismo tablet puede pasar de compacto a expandido al girar o compartir pantalla.

## Componentes estandarizados
- **Encabezado de página:** título + contexto + una acción principal + secundarias discretas. La acción nunca deja espacio vacío vertical al apilarse.
- **KPI:** icono, etiqueta, cifra, tendencia explicada y periodo; no cifras ficticias. Colores y escalas consistentes.
- **Tabla:** búsqueda/filtro/vistas; filas claras, estados semánticos, ordenación y lectura numérica; scroll horizontal contenido en móvil; sin cortar botones de fila.
- **Formulario:** etiqueta persistente, indicaciones y mensajes de error cerca del campo; 44px de control en móvil; acciones siempre accesibles con teclado virtual.
- **Modal/drawer:** nombre accesible y cierre etiquetado; respetar safe-area, devolver foco tras cerrar, evitar tapar contenido con navegación inferior.
- **POS:** búsqueda grande, productos 2 columnas, carrito vertical y pago accesible por scroll.
- **BuzzBee AI:** asistente contextual en web y acceso directo móvil; las sugerencias nunca ejecutan acciones sin confirmación.

## Módulos y prioridades de adopción

| Ola | Módulos | Criterio de salida |
|---|---|---|
| 1 | Shell, Inicio, navegación, KPI, tablas, formularios | Sistema coherente en tres variantes |
| 2 | Inventario, Productos, Compras, Ventas, Cobranza y POS | Flujos completos de consultar → crear → editar → guardar |
| 3 | CRM, Proyectos, Producción, Marketing y RRHH | Listas, dashboards, Kanban, fichas y drawers consistentes |
| 4 | Finanzas, Fiscal, Reportes, Configuración, SaaS Admin | Tablas densas, roles, estados críticos, exportaciones y pruebas |
| 5 | Android, iOS, Huawei | Pruebas reales con teclado, gestos, notch, tamaño de fuente ampliado y conectividad |

## Criterios de QA obligatorios
1. Probar 320, 360, 390, 430, 600, 820, 1024 y 1440px con capturas y formularios abiertos.
2. Verificar navegación con teclado, lectores de pantalla y orden de foco; objetivo de diseño WCAG 2.2 AA.
3. Verificar zoom 200%, texto grande, claro/oscuro, orientación vertical y horizontal.
4. Confirmar que no existen scrolls horizontales del **documento**; el scroll horizontal de tablas se permite, debe ser obvio y accesible.
5. Ejecutar Frontend QA, seguridad, backend, Prisma, MotorNorte transaccional y revisión visual antes de fusionar.
6. Mantener Vercel como validación de publicación **independiente** del resultado del pipeline.

## Fuentes utilizadas
- [Android adaptive window size classes](https://developer.android.com/develop/ui/views/layout/use-window-size-classes)
- [Apple UI design principles / 44pt touch target](https://developer.apple.com/design/tips/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Estado de implementación
La capa **`responsive-ui-sheet-v27.css`** armoniza superficies reutilizables (KPI, encabezado, filtros y tablas) y reglas por tamaño de pantalla. **No** reemplaza todas las páginas del ERP, no altera lógica comercial, y no certifica todavía el aspecto final de cada módulo ni dispositivos físicos. Las olas restantes requieren QA visual con capturas actualizadas.
