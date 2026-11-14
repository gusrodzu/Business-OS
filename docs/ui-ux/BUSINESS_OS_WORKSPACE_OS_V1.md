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

La primera versión está enfocada en **tablet y desktop >= 761 px para Inicio y la ruta /ventas**. No sustituye de golpe el ERP entero.

| Parte | Ubicación | Contrato |
| --- | --- | --- |
| Fondo y preferencias | `layout/workspace-os/useWorkspaceWallpaper.js` | Presets y foto propia comprimida y persistida en el navegador por ámbito usuario-empresa |
| Ajustes de fondo | `layout/workspace-os/WorkspaceWallpaperStudio.jsx` | Galería, vista previa y subir imagen JPG/PNG/WebP; sin enviar imágenes al backend |
| Dock de sistema | `layout/workspace-os/WorkspaceOSDock.jsx` | Home, apps, búsqueda y accesos a módulos habilitados |
| Shell y ventana | `layout/AppShell.jsx`, `AppShell.module.css` | Home sobre wallpaper y Ventas en ventana; conserva Topbar, notificaciones y modales originales |
| Escritorio | `modules/core/ui/pages/WorkspaceOSHome.jsx` | Primeros dos KPI elegidos, compras mensuales etiquetadas como compras, solicitudes, stock, notificaciones y vencimientos reales |
| Launcher | `modules/core/ui/pages/WorkspaceAppShelf.jsx` | Variante `os` que reutiliza habilitación de módulos, favoritos, giros y navegación |
| Ventas piloto | `modules/sales/ui/components/SalesOSDocuments.jsx` | Pedidos y cotizaciones leídos de `/sales`, filtros, lista-detalle y acciones existentes de documentos; no crea transacciones nuevas |

La vista operativa anterior del Dashboard permanece disponible desde **«Ver tablero»**. La UI transaccional existente de Ventas conserva sus modales y acciones (también en teléfono).

### Límites deliberados de este primer bloque

- **Pendiente**: aplicar el mismo shell visual a Inventario, Compras, POS, CRM, Finanzas, RRHH y verticales, uno por uno. No se altera ninguno sin su propio PR.
- **Pendiente**: launcher de pantalla completa, aplicaciones recientes con estado restaurable, organización libre de iconos/widgets, ajustes de brillo/blur, persistencia sincronizada en la nube, ventanas arrastrables y soporte multiwindow. No mostrar botones de funciones inactivas.
- **Pendiente**: rediseño smartphone estilo OS y pruebas de integración/visuales completas en dispositivos 320, 360, 390, 430 px, tablet y desktop. El móvil mantiene sus flujos actuales hasta su adaptación.
- **Limitación**: fondos personalizados guardados localmente en el navegador; no siguen al usuario entre dispositivos ni sustituyen el wallpaper real del sistema operativo.
- **Regla de seguridad**: no modificar API, DB, roles, permisos, licencias, aislamiento multiempresa, modo demo, cobros ni stock por fines visuales. Cumplir CI obligatorio antes de fusionar.

## Siguiente secuencia

1. Validar shell/Home/Ventas en browser y reconciliar la primera imagen (proporciones y espacio vacío del wallpaper) y la segunda (master/detail real).
2. Poner navegación OS y App Drawer en la versión smartphone, sin truncar funciones ni eliminar entradas.
3. Integrar Inventario y Compras en ventanas/experiencias OS y extraer patrón de Shell de aplicación compartido.
4. Incorporar preferencias avanzadas, editor de widgets, recientes, layout libre y PWA standalone donde aplique.
5. Ejecutar QA integral de accesibilidad, dispositivos, data real/demo y multiempresa cuando esté cubierta la nueva capa.

Las automatizaciones recurrentes de interfaz móvil/desktop permanecen pausadas a solicitud del usuario.
