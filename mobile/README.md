# Business OS móvil — primera fase (Capacitor 8 + PWA)

Esta carpeta constituye el **punto de partida nativo**, no una app firmada ni aprobada por ninguna tienda. La web productiva continúa en `apps/web`; Capacitor empaqueta la salida compilada de React/Vite dentro de WebView, no apunta a `server.url` ni a Vercel. El módulo MotorNorte offline se mantiene como demo; para operar con cuentas reales hay requisitos de red y autenticación adicionales.

## Arquitectura

- **Una sola base React** en `apps/web`, sin duplicar los módulos comerciales.
- **Android**: proyecto generado por Capacitor/Android Studio (AAB para Google Play).
- **iOS**: proyecto generado por Capacitor/Xcode en macOS (archivo distribuible vía App Store Connect/TestFlight).
- **Huawei**: variante del proyecto Android; publicar en AppGallery tras pruebas en Huawei sin Google Mobile Services (GMS). Comprobar SDKs de mapas, notificaciones, pagos y autenticación antes de integrar servicios externos.
- **PWA**: manifiesto, iconos PNG y caché **exclusivamente del shell público y JS/CSS versionados**. El service worker NO almacena endpoints de la API, cuentas, facturas o información privada.

Capacitor se instala **separadamente** en `mobile/` para no alterar el lockfile del monorepo ni el deploy de Vercel. `mobile/android` y `mobile/ios` se crearán en equipos con SDKs apropiados y deberán agregarse al control de versiones una vez revisados. Después de instalar, incluir también `mobile/package-lock.json` para builds reproducibles.

## Primera prueba: PWA y diseño responsive

Desde la raíz del repositorio:

```bash
npm ci
npm run mobile:assets
npm run mobile:verify
npm run build
```

Los iconos PNG se generan automáticamente en `apps/web/public/icons/`. No están versionados y son **provisionales**, sujetos a aprobación de identidad gráfica antes de las tiendas. Vercel sirve `manifest.webmanifest`, `sw.js` y los iconos como archivos estáticos; no se cambia su rewrite SPA.

Revisar en teléfono las siguientes rutas: `/`, `/ventas`, `/inventario/existencias`, `/pos`, `/finanzas/cuentas-por-cobrar`, `/login`. Verificar área segura (*notch*), teclado virtual, menús, tablas con scroll y modo demo.

## Instalar Capacitor y crear Android

Requisitos: Node.js >=22, Android Studio, Android SDK y Java/JDK del IDE.

```bash
cd mobile
npm install
npm run build:web
npm run add:android
npm run sync:android
npm run open:android
```

En Android Studio: ejecutar en emulador y teléfono real; inspeccionar Logcat, permisos, red y botones de navegación. Configurar el identificador definitivo, íconos adaptativos, splash screen, versión, package signing y SDK de destino. **Google Play exige desde el 31 de agosto de 2026 Android API 36 o superior para nuevas apps y actualizaciones**; Capacitor 8 corresponde al target API 36. Crear AAB de *release* firmado con firma/keystore protegida y distribuirlo desde Google Play Console.

**Huawei:** reutilizar el proyecto Android cuando las funciones sean compatibles; probar en un Huawei sin servicios de Google, producir AAB/APK firmado según el canal y subirlo a AppGallery Connect. No asumir que Play Services, Firebase o Google Sign-In estén disponibles. Si se necesitan notificaciones, evaluar implementación específica con HMS Push Kit.

## Crear iOS

Requisitos: **Mac con Xcode 26+**, herramientas de firma y membresía del Apple Developer Program para distribuir. En esa Mac:

```bash
cd mobile
npm install
npm run build:web
npm run add:ios
npm run sync:ios
npm run open:ios
```

Probar con iPhone real, también notch, teclado, Safari/WKWebView, VoiceOver y retorno de la app tras suspensión. Configurar **Bundle ID** definitivo, Signing & Capabilities, iconos, splash y URL de política de privacidad. Archivar y subir mediante Xcode a TestFlight/App Store Connect.

**Importante:** Apple rechaza apps que son sólo sitios web empaquetados (regla 4.2). Antes del envío conviene añadir funcionalidades móviles genuinas (navegación táctil, acceso nativo a archivos/cámara para documentos, notificaciones, bloqueo seguro por biometría si se implementa, indicadores de conectividad) y entregar una demo completamente evaluable.

## Seguridad y bloqueo actual de la app real

1. **API remota:** el cliente actual usa `VITE_API_URL` o `http://localhost:4000/api`; `localhost` no es el backend remoto desde un teléfono. Definir URL pública HTTPS **antes** de habilitar sesiones reales en el binario.
2. **Cookies y CSRF:** el WebView de Capacitor tiene origen propio. Auditar CORS/allowlist, `SameSite`, `Secure`, protección CSRF y sesión en Android/iOS; no desactivar estas salvaguardas para facilitar el desarrollo. El cambio debe probarse en dispositivos, con MFA y cierre de sesión.
3. **Conectividad y datos:** la demo offline MotorNorte no debe convertirse silenciosamente en datos reales sincronizados. Nunca cachear información fiscal, financiera o de otros tenants en el Service Worker.
4. **Almacenamiento/credenciales:** no guardar tokens ni credenciales en `localStorage`. Evaluar Keychain/Keystore y bloqueo del dispositivo antes de operaciones productivas.
5. **Servicios móviles:** notificaciones, cámara, escáner de códigos de barras, PDF/share sheets, modo sin conexión, enlaces profundos y reanudación requieren integración y QA nativo posterior.
6. **Privacidad/legal:** condiciones, privacidad, ficha de tienda, clasificación, cuentas de revisor y datos de prueba. Revisar normativa sobre cobro de suscripciones digitales en apps antes de ofrecer suscripción dentro de iOS/Android.
7. **Identidad estable:** `com.buzzbee.businessos` en `capacitor.config.json` es un **identificador provisional**. Confirmar marca legal y app/bundle ID antes de publicar. Cambiarlo *después* del alta en tiendas crea una app diferente.

## Estado real del trabajo

| Elemento | Estado |
| --- | --- |
| React y módulos ERP reutilizables | Existentes |
| Layout responsivo / safe areas base | Primera fase |
| Manifest PWA + iconos + cache público | Primera fase |
| Capacitor 8 configurado, sin URL remota | Primera fase |
| Proyecto Android generado y probado | Pendiente |
| Proyecto iOS generado y probado | Pendiente |
| Autenticación real en WebViews | Pendiente, bloqueante para lanzamiento |
| Firmas, AAB, IPA, fichas y revisión de tiendas | Pendiente |

No afirmar que ya existe una app lista para Play/App Store/AppGallery hasta haber generado, instalado, probado y firmado las tres distribuciones.

### Fuentes oficiales
- https://capacitorjs.com/docs/getting-started
- https://capacitorjs.com/docs/getting-started/environment-setup
- https://developer.apple.com/app-store/review/guidelines/
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://developer.huawei.com/consumer/en/appgallery
