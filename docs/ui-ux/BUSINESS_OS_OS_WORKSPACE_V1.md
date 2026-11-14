# Business OS Next — OS Workspace, referencia oficial v1

## Objetivo de producto

**Business OS es un sistema operativo empresarial, no un dashboard dentro del navegador.**
El usuario aterriza en un escritorio personalizado con fondo, aplicaciones reales,
widgets, barra del sistema y dock. Cada módulo se abre como una aplicación con
su propia navegación, sin perder capacidades del ERP, permisos ni datos.

**Referencias aprobadas por el usuario (noviembre de 2026):**
1. Tablet horizontal: fondo abstracto negro, ocho lanzadores blancos a la
   izquierda, Centro de control y Wallpaper Studio, tareas/agenda a la derecha y
   dock flotante centrado abajo.
2. La misma tablet con **Ventas abierta como ventana**: barra superior oscura,
   lista de pedidos a la izquierda, detalle del pedido a la derecha,
   acciones sobre el documento, y dock visible sobre el wallpaper.

Son referencias de arquitectura visual y experiencia, no datasets ni
comportamientos ya implementados. No copiar datos numéricos ficticios de las
imágenes a producción.

## Contrato visual

- **El escritorio es el inicio** (`/`). El dashboard heredado permanece accesible
  desde **Centro de control**, sin convertirse en la portada predeterminada.
- **Wallpaper del sistema**: solo en el shell/escritorio y bordes de ventana.
  Dentro de la app, superficies neutras legibles.
- Colores de interfaz: carbón `#17191D`, `#2B2F36`, blanco `#FFFFFF`,
  lienzo `#F3F4F6`, borde `#E5E7EB`, tinta secundaria `#6B7078`.
  Estados operativos reales conservan colores semánticos.
- Launcher de módulos realmente disponibles según empresa; no exponer
  funcionalidades sin licencia como si estuvieran activas.
- Dock de acceso rápido, controles de ventana y búsqueda/notificaciones reales.
  Objetivos táctiles de **44 px** o más y espacios seguros móviles.
- Tablet: ventana flotante; smartphone: app a pantalla completa. Otros módulos
  conservan temporalmente su shell anterior hasta migrarlos por fases.

## Implementado en primera etapa

- `layout/os/workspaceWallpapers.js`: presets monocromáticos y validación
  del fondo persistido.
- `layout/os/OSWallpaperStudio.jsx`: tres fondos, carga local personalizada,
  optimización a JPEG, vista previa y guardado local por usuario/empresa.
- `layout/os/OSDock.jsx`: Inicio, módulos filtrados con habilitaciones y Apps.
- `modules/core/ui/pages/WorkspaceOSHome.jsx`: Home app-first reutilizando
  `WorkspaceAppShelf` y datos reales de Dashboard (métricas elegidas,
  compras mensuales, avisos, solicitudes, vencimientos).
- `layout/AppShell.jsx`: fondo, barra del sistema, dock, catálogo
  y Ventas envuelta en una ventana sobre el escritorio.
- `Dashboard.jsx`: alterna Escritorio / Centro de control; las funciones
  previas de dashboard siguen disponibles.

**Límites de v1 (no prometerlos como resueltos):**
- Fondos personalizados se guardan *en el navegador actual*, no se sincronizan
  entre dispositivos ni con el perfil remoto.
- Ventas funciona dentro de un marco de ventana, pero sus listados y detalles
  internos aún deben adaptarse al master-detail de la referencia.
- Minimizar/cerrar actualmente navega a Home; ventanas vivas,
  pestañas multi-app, restauración del scroll y multitarea persistente
  son una fase posterior.
- Widgets visibles usan la configuración y los datos existentes; arrastrar y
  soltar widgets, cambiar tamaño de iconos y mover el dock son posteriores.
- Las gráficas de compras están identificadas como **compras mensuales**;
  no presentar estos datos como ventas diarias.
- No declarar QA visual en dispositivos hasta realizar las capturas y revisiones.

## Siguientes etapas

1. Completar Ventas `Pedidos → Detalle` con división 35/65 en tablet y
   lista a pantalla completa en smartphone. Reusar rutas, acciones, estados
   y operaciones existentes; ningún CTA ficticio.
2. Mejorar biblioteca de apps, favoritos, carpetas y recientes del usuario.
3. Sincronizar wallpapers y disposición del escritorio en perfil personal,
   con aislamiento multiempresa y reglas de privacidad.
4. Pantallas divididas y multitarea con restauración de estado, sin inventar
   sesiones ni duplicar operaciones.
5. Migrar Inventario, Compras, CRM, POS, Finanzas, RRHH y verticales siguiendo
   la misma arquitectura y React + CSS Modules.

## Restricciones

No alterar transacciones, API, base de datos, aislamiento tenant, roles,
permisos, licencias ni adaptador offline durante refactors visuales. Conservar
la infraestructura actual y la seguridad. No reactivar automatizaciones.
Realizar QA visual integral al final de la fase, respetando todos los checks
automáticos obligatorios en PR.
