# Pocket OS · Pruebas Android/PWA de instalación y navegación

**Estado:** `main` incluye Pocket OS como experiencia responsiva de la misma aplicación React. Esta guía valida la instalación **PWA** desde un sitio HTTPS ya desplegado; **no** constituye una certificación de APK, Play Store, Huawei AppGallery ni de un teléfono real.

## Arquitectura y criterio de aceptación

- En escritorio (>760 px), cada módulo usa ventanas de Workspace OS y barra de menú/dock de escritorio.
- En smartphone (≤760 px), el mismo usuario/empresa/datos/permisos usa **Pocket OS**: wallpaper, inicio de apps, cajón de aplicaciones, dock y encabezado táctil dentro de cada módulo.
- Todas las operaciones y permisos continúan en el backend existente; el shell móvil no otorga licencias ni acceso adicional.
- La PWA debe abrirse como app independiente del navegador, con sus iconos y atajos del manifiesto; no es un sistema operativo Android real ni modifica Android.
- El Service Worker solo puede cachear shell público e imágenes/JS/CSS no privados. API, datos fiscales, registros, cookies y sesiones deben mantener la política de seguridad y NO almacenarse en caché.

## 1. Instalación física en Android Chrome

Requiere un HTTPS del **deploy actual** con el SHA verificado y un teléfono Android; no usar una URL antigua. Si no se conoce el despliegue actual, primero identificarlo en la infraestructura activa y no inferirlo de Vercel.

1. Abrir la URL HTTPS en Chrome para Android. Iniciar sesión con usuario de prueba o **Demo Local** sin datos sensibles.
2. Menú ⋮ de Chrome → **Instalar aplicación** o **Agregar a pantalla principal** (según versión). Confirmar la instalación si aparece.
3. Desde el lanzador de Android abrir **Business OS**, no una pestaña de Chrome. Confirmar que no aparece la barra de direcciones.
4. Mantener presionado el icono y comprobar, si Chrome los muestra, los atajos Inicio, Ventas, Inventario y Compras. Probar también un inicio sin sesión: debe pasar por autenticación y nunca abrir datos de otra empresa.
5. Volver al sistema Android, suspender y reabrir Business OS. Confirmar sesión y empresa según política del servidor, no mediante caché privado.

Si el navegador no ofrece instalación, revisar `/manifest.webmanifest`, iconos 192/512, `/sw.js`, HTTPS, consola y requisitos propios del navegador. No prometer instalación universal.

## 2. Lista de pruebas manuales en teléfono real

| Caso | Resultado requerido | Estado inicial |
|---|---|---|
| Inicio 320–430 px | Wallpaper, apps autorizadas, widgets y dock sin overflow | Pendiente real |
| App Ventas | Abre pantalla de aplicación; botón de volver retorna a escritorio | Pendiente real |
| Compras/Proveedores | Búsqueda, lista/detalle y formulario existente; no altera datos de prueba | Pendiente real |
| Inventario | Existencias y navegación táctil, filtros y listas con scroll | Pendiente real |
| Finanzas, CRM, RRHH | Mismos permisos y datos, sin rutas nuevas ni acceso lateral | Pendiente real |
| Cajón Apps | Abrir, buscar, cerrar con botón / retroceso; foco restaurado | Pendiente real |
| Teclado virtual | Buscador y formularios editables; dock no tapa campos/CTA | Pendiente real |
| Retroceso Android | Volver dentro del historial o cerrar diálogo según contexto | Pendiente real |
| Barra de estado / notch | Texto legible y zonas seguras, vertical y horizontal | Pendiente real |
| Accesibilidad | TalkBack, nombres, orden de foco, 44px objetivo táctil, zoom | Pendiente real |
| Sin conectividad | Nada de datos privados cacheados; mensajes/error y recuperación | Pendiente real |
| Suspender/reanudar | Conserva/expira sesión según backend; sin datos cruzados | Pendiente real |
| Cambio de empresa/rol | El catálogo, widgets y permisos cambian de forma aislada | Pendiente real |

No hacer transacciones reales, cobros, aprobaciones ni altas de proveedores para completar esta matriz. Usar Demo Local o entorno de prueba con datos autorizados.

## 3. Comprobaciones automáticas ya disponibles

- `npm run mobile:verify`: contrato de Capacitor 8, manifiesto PWA, atajos, splash, no `server.url`, políticas del SW, barra Android y dock táctil.
- `npm run mobile:responsive:audit`: adaptabilidad y safe areas.
- `Smartphone Browser Review`: Chrome/CDP en 320/360/390/430 px, navegación, lista/detalle, formularios no persistidos, cajón de aplicaciones, encabezado móvil, botón volver, Wallpaper Studio y rutas clave.
- `Frontend QA` y `ERP Route Render Sweep`: build/lint, rutas y contratos.
- **Las pruebas emuladas no reemplazan un Android físico**, modo PWA instalado, teclado OEM ni TalkBack. Verificar versión del deploy antes de cualquier certificación.

## 4. Android nativo con Capacitor: etapa separada

`mobile/capacitor.config.json` empaqueta `../apps/web/dist`; `mobile/android` aún debe generarse con SDK/JDK reales y validarse localmente. Antes de firmar un AAB: definir marca/bundle ID definitivo, HTTPS API, cookies `SameSite`/CSRF, navegación Back WebView, autorizaciones, permisos de archivos/notificaciones, target SDK, seguridad de credenciales y pruebas en hardware. No publicar en ninguna tienda sin pasar esos requisitos.

**Registro QA recomendado:** fecha, dispositivo/modelo, versión Android/Chrome, ancho CSS, fuente/zoom, URL HTTPS, SHA de `main` desplegado, empresa de prueba, capturas sin información privada, resultado de cada caso y enlaces de incidencias.
