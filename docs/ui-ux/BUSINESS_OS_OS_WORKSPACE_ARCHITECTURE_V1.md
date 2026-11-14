# Business OS · Sistema operativo empresarial (dirección aprobada)

## Decisión de producto
Las dos maquetas de tablet compartidas por el usuario (1. Escritorio de Business OS con wallpaper, iconos, widgets, dock; 2. Ventas abierta como una ventana con lista y detalle) son el objetivo visual de referencia. **Business OS no debe verse como un dashboard dentro del navegador**. El Home es un **escritorio empresarial personalizado**; los módulos son **aplicaciones**; los indicadores operativos son widgets opcionales o parte de la aplicación Centro de control.

La inspiración procede de la experiencia general de tablets/desktop OS, no de copiar las marcas, imágenes, componentes privativos o interfaces de Samsung, Android ni Apple.

## Reglas permanentes
1. **Escritorio en lugar de dashboard**: fondo propio, aplicaciones como iconos, espacios negativos, widgets y dock; no llenar la pantalla de KPIs.
2. **Aplicaciones en lugar de secciones**: cada módulo tiene nombre, icono, encabezado, navegación interna, controles y superficie legible. Ventas es la app piloto.
3. **Fondo visible solo en la capa OS**: el wallpaper no puede competir con tablas, formularios, modales o documentos. Esas superficies tienen contraste alto.
4. **Personalización por persona y empresa**: jamás mezclar el wallpaper de otro usuario/tenant. Licencias, módulos y permisos continúan siendo administrados por la organización.
5. **UI adaptable**: smartphone muestra una app a pantalla completa; tablet/desktop pueden mostrar ventanas y multitarea cuando se implementen de forma real. No simular botones o ventanas que no funcionen.
6. **Acciones reales**: respetar rutas, estados del dominio, filtros, búsqueda, favoritos, habilitación de módulos y aislamiento de datos. Sin datos de ejemplo inventados en vistas conectadas.
7. **Patrón visual**: #17191D, #2B2F36, #FFFFFF, #F3F4F6, #E5E7EB; colores semánticos exclusivamente para estados. Iconos redondeados o cuadrados, no hexágonos decorativos. Accesibilidad y blancos de toque >=44 px.
8. **Arquitectura**: componentes React por responsabilidad y CSS Modules; evitar nuevos estilos globales, duplicación de estado y iframes. Cualquier ventana debe renderizar el módulo real, no una réplica estática.
9. **Preservar la operación**: API, base de datos, auth, permisos, Super Admin, multiempresa, facturación, POS, seguridad, inventario y demo offline permanecen funcionales.

## Implementación v1 (PR de introducción)
- `AppShell` reconoce `data-os-context='home'|'sales'|'standard'`: aplica apariencia OS solo a Inicio y Ventas piloto, sin cambiar otras rutas.
- `useWorkspaceAppearance` mantiene la apariencia individual, con almacenamiento del navegador segmentado por usuario, empresa y entorno demo. Fondos abstractos hechos con CSS y carga de imágenes JPG/PNG/WebP de máximo 900 KB.
- `WorkspaceOSHome` agrega escritorio, lanzador `WorkspaceAppShelf` con las reglas reales de visibilidad de módulos, indicadores reales, evolución de **compras** mensuales, prioridades de solicitudes e inventario, agenda financiera y Wallpaper Studio.
- `Dashboard` permite volver al Centro de control existente, sin borrar ninguno de sus widgets ni operaciones.
- `AppShell` contiene dock de navegación real y biblioteca de aplicaciones; `Topbar` usa identidad Business OS y nombre de empresa activa; Ventas conserva sus tabs de sección.
- `Sales` se presenta como ventana en tablet/desktop: barra de título, volver al escritorio y ampliar/restaurar. Su estado de pedidos/cotizaciones, detalles, formularios, API y transacciones originales continúan montados.
- La versión smartphone del Home hereda el nuevo escritorio compacto y utiliza la navegación móvil existente; Ventas mantiene su experiencia funcional de listas móviles.

## Pendientes explícitos (NO afirmarlos como implementados)
- Comparación visual real en pantallas 320/360/390/430, tablet horizontal/vertical y desktop.
- Sincronización entre dispositivos de wallpaper y widgets: actualmente las preferencias se guardan **solo en este navegador**.
- Reordenamiento libre de iconos y widgets, tamaños, múltiples escritorios y arrastrar/soltar.
- Recuperación del estado al cerrar/cambiar de app, multitarea real y ventanas simultáneas: el dock actual es navegación, no un gestor completo de procesos.
- Generalizar ventana y app header a Inventario, Compras, CRM, POS, Finanzas, RRHH y verticales.
- Interfaz dedicada de detalle a dos columnas dentro de Ventas a partir de sus registros reales.
- Pruebas visuales, revisión de accesibilidad integral, responsive y desempeño en dispositivos, en fase final; **mantener CI y checks obligatorios siempre**.

## Orden de trabajo siguiente
1. Ajustar referencias reales del Home y el window chrome en tablet (seguridad y enfoque visual).
2. Consolidar AppWindow y AppHeader compartidos cuando haya un segundo módulo consumidor.
3. Extender a Inventario / Compras con navegación real.
4. Mejorar smartphone como launcher + app full-screen + recientes (funcionales).
5. Completar personalización y fase final de QA multidispositivo.

> Regla de aceptación: navegar desde un icono del escritorio a un módulo real y regresar sin mostrar un panel genérico como pantalla principal. Las referencias son la meta visual; el código se incorporará en incrementos reversibles y con PRs sujetos a sus checks.
