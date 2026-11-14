# Business OS — Contrato de experiencia «Sistema Operativo Empresarial» v1

**Nueva referencia visual aprobada:** 14 de noviembre de 2026. El usuario seleccionó dos imágenes de diseño de Business OS: **Escritorio/Home tipo tablet** y **Ventana abierta de Ventas con lista-detalle**.

## Regla principal

Business OS **no es una colección de dashboards web**. El espacio de trabajo debe sentirse como un **sistema operativo empresarial instalable**, personalizable por persona, con aplicaciones de negocio reales y un escritorio que no dependa de llenar cada píxel de tarjetas.

- **Escritorio**: wallpaper a pantalla completa; saludo y empresa; accesos con iconos; widgets pequeños que aportan valor; dock flotante; búsqueda, notificaciones y perfil. Los KPI del negocio son widgets, no el escritorio completo.
- **Aplicaciones**: al abrir un módulo, se ve una ventana con encabezado propio, zona de trabajo clara, navegación y acciones reales. En tablet se permite lista + detalle simultáneos; en teléfono la app será a pantalla completa.
- **Fondos**: selección de wallpapers de la galería y carga de imagen propia. Preferencia aislada por usuario, empresa y demo; el fondo no contamina las pantallas transaccionales ni compromete contraste.
- **Regla cromática**: fondos carbón #17191D, #2B2F36, superficies #FFF, bordes #E5E7EB, tinta y texto secundario #6B7078; los colores están reservados a estados reales.
- **Comportamiento**: launcher de apps solo habilitadas en la empresa; dock con accesos con permiso; foco de teclado y Escape en diálogos; scroll y teclado accesibles; iconos y acciones táctiles de al menos 44 px.
- **Multiplataforma**: smartphone (full-screen), tablet (escritorio y app window / split view), desktop (ventana y herramientas avanzadas). El concepto de PWA/OS es una capa sobre la aplicación existente; no supone permisos de sistema, tareas en segundo plano ni APIs nativas que no existan.

## Primer PR de implementación

El piloto abrió primero en **tablet y desktop >= 761 px para Inicio y Ventas**. La siguiente iteración, incorporada en la misma rama, introduce **Pocket OS Home para smartphone <= 760 px**, conservando el dashboard anterior y las pantallas móviles transaccionales. No sustituye de golpe el ERP entero.

| Parte | Ubicación | Contrato |
| --- | --- | --- |
| Fondo y preferencias | `layout/workspace-os/useWorkspaceWallpaper.js` | Presets y foto propia comprimida y persistida en el navegador por ámbito usuario-empresa |
| Ajustes de fondo | `layout/workspace-os/WorkspaceWallpaperStudio.jsx` | Galería, vista previa y subir imagen JPG/PNG/WebP; sin enviar imágenes al backend |
| Dock de sistema | `layout/workspace-os/WorkspaceOSDock.jsx` | Home, apps, búsqueda y accesos a módulos habilitados |
| Shell y ventana | `layout/AppShell.jsx`, `AppShell.module.css`, `layout/workspace-os/WorkspaceOSAppWindow.jsx` | Home sobre wallpaper y Ventas en ventana reutilizable; en teléfono las apps se muestran a pantalla completa, con Topbar y modales originales |
| Escritorio tablet/desktop | `modules/core/ui/pages/WorkspaceOSHome.jsx` | Primeros dos KPI elegidos, compras mensuales etiquetadas como compras, solicitudes, stock, notificaciones y vencimientos reales |
| Escritorio smartphone | `modules/core/ui/pages/WorkspacePocketHome.jsx`, `WorkspacePocketHome.module.css` | Home independiente con wallpaper, indicadores reales, apps, solicitudes, stock crítico, actividad y vencimientos disponibles; enlace al tablero anterior |
| Launcher | `modules/core/ui/pages/WorkspaceAppShelf.jsx` | Variantes `os` y `pocket` que reutilizan habilitación de módulos, favoritos, giros y navegación; en móvil acceso mediante dock flotante y sección Apps |
| Ventas piloto | `modules/sales/ui/components/SalesOSDocuments.jsx` | Pedidos y cotizaciones leídos de `/sales`, filtros, lista-detalle y acciones existentes de documentos; no crea transacciones nuevas |

La vista operativa anterior del Dashboard permanece disponible desde **«Ver tablero»**. La UI transaccional existente de Ventas conserva sus modales y acciones (también en teléfono).

### Límites deliberados de este primer bloque

- **Pendiente**: aplicar el mismo shell visual a Inventario, Compras, POS, CRM, Finanzas, RRHH y verticales, uno por uno. No se altera ninguno sin su propio PR.
- **Pendiente**: launcher de pantalla completa, aplicaciones recientes con estado restaurable, organización libre de iconos/widgets, ajustes de brillo/blur, persistencia sincronizada en la nube, ventanas arrastrables y soporte multiwindow. No mostrar botones de funciones inactivas.
- **En desarrollo**: Pocket OS Home ya cuenta con estructura responsive, pero requiere pruebas de integración y revisión visual en 320, 360, 390, 430 px, tablet y desktop. Las pantallas transaccionales móviles mantienen sus flujos anteriores para proteger la operativa.
- **Pendiente**: App Drawer de pantalla completa, historial/restauración de apps, migrar Inventario y Compras a ventanas compartidas, y confirmar la apariencia visual contra los mockups en dispositivo real.
- **Limitación**: fondos personalizados guardados localmente en el navegador; no siguen al usuario entre dispositivos ni sustituyen el wallpaper real del sistema operativo.
- **Regla de seguridad**: no modificar API, DB, roles, permisos, licencias, aislamiento multiempresa, modo demo, cobros ni stock por fines visuales. Cumplir CI obligatorio antes de fusionar.

## Siguiente secuencia

1. Validar shell/Home/Ventas en browser y reconciliar la primera imagen (proporciones y espacio vacío del wallpaper) y la segunda (master/detail real).
2. Validar Pocket OS Home, dock flotante y accesibilidad del launcher en smartphone; construir App Drawer completo sin truncar funciones ni eliminar entradas.
3. Integrar Inventario y Compras en ventanas/experiencias OS y extraer patrón de Shell de aplicación compartido.
4. Incorporar preferencias avanzadas, editor de widgets, recientes, layout libre y PWA standalone donde aplique.
5. Ejecutar QA integral de accesibilidad, dispositivos, data real/demo y multiempresa cuando esté cubierta la nueva capa.

Las automatizaciones recurrentes de interfaz móvil/desktop permanecen pausadas a solicitud del usuario.

## Contrato de migración para los próximos PR

1. **No crear más páginas que sean dashboards genéricos como puerta de entrada de cada módulo.** Cada módulo debe conservar su dominio, su ruta y sus operaciones, pero abrir dentro de una aplicación del Workspace OS con encabezado, herramientas y panel de trabajo reutilizable.
2. **Tres experiencias coordinadas, no tres productos independientes.** `Pocket OS` (<= 760 px) usa apps a pantalla completa y navegación de pulgar; `Touch OS` (761–1180 px) usa escritorio, ventanas y lista-detalle táctil; `Desktop OS` (>1180 px) usa escritorio y herramientas avanzadas. Comparten Design System, React Router, AuthContext, preferencias y API.
3. **No falsificar datos para embellecer la interfaz.** Widgets de KPIs, avisos, inventario, solicitudes, órdenes y clientes deben depender de respuestas existentes de la empresa activa y manejar carga, errores y vacío.
4. **Un solo contrato de permisos.** Apps, dock, acciones y accesos respetan módulos/licencias, rol y empresa activa. El frontend no sustituye la autorización del backend. En fallo de licencias, no mostrar apps como habilitadas por defecto.
5. **Reutilización como condición de aceptación.** Nuevos módulos OS emplean `WorkspaceOSAppWindow` (o una evolución compartida) y los componentes comunes de listas, herramientas, formularios y detalles. No duplicar shells ni mover reglas de negocio al layout.
6. **Regla UX móvil.** Controles táctiles de 44 px o más, navegación por teclado/Escape en overlays, safe-area, contraste, scroll independiente, diálogos operables; QA obligatorio en 320/360/390/430 px y rotación de pantalla.
7. **Publicación controlada.** Un componente introducido en una rama o PR no equivale a producción. No fusionar ni publicar hasta que GitHub CI y QA del flujo piloto estén aprobados; infraestructura objetivo: Cloudflare.

**Estado al 14-nov-2026:** escritorio OS tablet/desktop y ventana Ventas presentes en PR #556; Pocket OS Home, dock móvil y extracción del componente de ventana se añadieron a la rama del mismo PR. Pendiente validación en navegador/dispositivo y checks antes de integración.
