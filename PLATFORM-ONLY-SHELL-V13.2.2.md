# BuzzBee Platform Admin · Platform-only shell v13.2.2

El contexto Super Admin queda separado visual y funcionalmente del ERP de tenants.

## Cambios
- `/admin-saas` usa un `PlatformShell` dedicado.
- No carga Sidebar ERP, ModuleTabBar, RightRail, PowerBanner, Agenda rápida, BuzzBee AI ni accesos de Compras/Ventas/Inventario/RRHH/etc.
- Navegación exclusiva: Resumen, Empresas, Suscripciones, Planes, Facturación y Sistema.
- Logout de plataforma regresa a `/admin-login`.
- Mantiene MFA, sesión endurecida, reautenticación y `platform.manage`.
- El Sidebar ERP normal ya no muestra el Panel SaaS.

## Principio
El Super Admin administra BuzzBee como producto SaaS. Los tenants administran su operación empresarial dentro de `/app`/rutas ERP.
- `ProtectedRoute` ahora hace mutuamente excluyentes las sesiones ERP y Platform: una sesión Super Admin es redirigida a `/admin-saas` si intenta abrir una ruta operativa, y una sesión ERP es enviada a `/admin-login` si intenta abrir el panel global.
