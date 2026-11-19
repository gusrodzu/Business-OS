# Business OS — Estándar híbrido Fluent + macOS v1

## Objetivo
Business OS es un sistema operativo empresarial web/PWA con identidad propia. Usar como **referencia** las guías de Microsoft **Design Windows apps / Fluent** (estructura, navegación, materiales, controles, estados y accesibilidad) y los patrones de interacción de macOS (escritorio, dock, ventanas y organización del trabajo). No replicar marcas, iconos propietarios ni prometer integración nativa inexistente.

## Jerarquía de decisiones
1. Funcionalidad empresarial real, aislamiento multiempresa, permisos y seguridad.
2. Consistencia, legibilidad, accesibilidad y usabilidad con teclado/tacto.
3. Patrones de plataforma según dispositivo.
4. Identidad visual Business OS, sin mezcla indiscriminada de controles.

## Contrato de experiencia
| Superficie | Referencia dominante | Regla Business OS |
| --- | --- | --- |
| Escritorio | macOS | Wallpaper, dock, launcher, widgets pequeños, apps reales |
| Ventanas desktop | macOS + Windows | Arrastrar, redimensionar, maximizar, snap, foco, teclado; maximizar ocupa el espacio de trabajo disponible, respetando el dock |
| Configuración | Windows / Fluent | Navegación lateral, búsqueda, categorías, filas, vistas de detalle y controles reales con feedback |
| Formularios, tablas, paneles | Fluent | Densidad, estados, foco, mensajes, selección y semántica consistentes |
| Tablet | Híbrido | Lista-detalle, touch targets, ventanas cuando haya espacio, split view solo si es funcional |
| Smartphone / Pocket OS | Android como patrón de navegación | App full-screen, retorno claro, dock/navegación móvil y datos compartidos |
| Componentes de negocio | Business OS | KPI rectangulares, patrones ERP, permisos y estados semánticos |

## Tokens y componentes
- Una sola fuente de verdad para colores, tipografía, elevación, radios, espaciado, bordes, motion y foco; **no** introducir paletas aisladas por pantalla.
- Modo claro y oscuro con contraste WCAG 2.2 AA. Colores de énfasis configurables solo si se verifica contraste; error, éxito, aviso y foco nunca dependen únicamente del color.
- Componentes React compartidos para: SettingsRow, SettingsCategory, SettingsControl, OSWindow, DockItem, AppLauncher, Dialog, Tabs, FormField, DataTable, KPI y estados vacíos.
- CSS Modules y tokens semánticos; evitar overrides globales específicos de una página y duplicar controles.
- Estados obligatorios: default, hover, focus-visible, active, disabled, loading, error y success, donde aplique.
- Respeto a prefers-reduced-motion, navegación por teclado, lectores de pantalla, zoom al 200% y objetivos táctiles >=44px en flujos táctiles.

## Personalización funcional
- **Fondo:** presets y carga de imagen existente; ámbito usuario/empresa y vista previa real.
- **Colores y temas:** una fuente de verdad para apariencia y preferencias; no mostrar un tema seleccionado que no se aplicó.
- **Movimiento:** persistir y aplicar reducción de movimiento en todos los componentes compatibles.
- **Inicio:** ruta inicial real, respetando permisos y enlaces profundos.
- **Barra de tareas:** controles solo si cambian el dock real; persistencia por cuenta/empresa.
- **Entrada de texto:** distinguir tamaño de lectura, accesibilidad y opciones reales del teclado; no anunciar configuración del teclado del sistema operativo desde una PWA.
- Toda opción debe indicar alcance (este dispositivo o cuenta), aplicar/guardar, confirmar éxito/error y ofrecer recuperación cuando falle.

## Reglas de implementación y QA
1. Auditar consumidores y tokens antes de modificar CSS.
2. Migrar primero Settings y shell compartido, después módulos por lotes pequeños; no reescribir el ERP completo.
3. Probar 320/360/390/430 px, tablet 768/1024 px y escritorio 1280/1440/1920 px, ventanas normal/maximizada/snap, scroll y zoom.
4. Validar rutas, permisos, aislamiento multiempresa, API, tema, fondo, persistencia, navegación, teclado y reduced-motion.
5. Capturas y pruebas en navegador son evidencia distinta de tests estáticos. No declarar aprobado ni desplegado sin evidencia.
6. PR revisable y CI; evitar fusionar o publicar sin autorización.

## Antipatrones
- Controles de apariencia sin efecto real, tarjetas que parecen clicables sin acción y placeholders que simulan configuraciones.
- Clonar Windows/macOS pixel por pixel, usar efectos de vidrio en tablas densas o sacrificar contraste por estética.
- Modificar almacenamiento o preferencias de otra empresa; acoplar el shell al dominio de un módulo.
- Escalar el dock con transform como solución definitiva sin comprobar hit targets, distribución y superposiciones.

## Fuentes internas
- `docs/ui-ux/BUSINESS_OS_WORKSPACE_OS_V1.md`
- `.agents/skills/business-os-ui-ux/SKILL.md`
- `docs/ui-ux/POCKET_OS_ANDROID_PWA_QA_2026.md`

> Esta es una adaptación de principios, no una reproducción literal ni una transcripción de la documentación oficial de Microsoft o Apple.
