# BuzzBee ERP v15.0.5 · Super Admin Entry Selector

## Objetivo
Después de autenticar un Super Admin con MFA, BuzzBee ya no entra directo al Control Plane. Muestra una pantalla intermedia con dos contextos explícitos:

1. **Demo LIVE** — abre el ERP como `BuzzBee Demo Company` con una sesión ERP temporal de 30 minutos.
2. **Panel Super Admin** — abre el Control Plane SaaS en `/admin-saas`.

## Seguridad
- El backend decide el contexto y emite la sesión Demo LIVE.
- Demo LIVE está fijado al usuario `demo@buzzbee.mx` y a su tenant demo activo.
- El token Demo LIVE es `kind: erp`, lleva `demoLive: true` y no concede permisos `platform.manage`.
- La sesión Super Admin original se conserva únicamente en `sessionStorage` para poder volver al selector.
- El ERP muestra un banner persistente `DEMO LIVE` con botón **Volver al Super Admin**.
- La sesión Demo LIVE expira a los 30 minutos.

## Rutas
- `/login` — acceso unificado
- `/platform-entry` — selector exclusivo de Super Admin
- `/admin-saas` — Control Plane
- `/` — ERP tenant / Demo LIVE

## Preparación de Demo LIVE
La opción requiere que exista la empresa demo y el usuario `demo@buzzbee.mx`. Si no existe, ejecutar el seed de Demo Company correspondiente.

## QA
- `npm run qa:platform-entry`
- `npm run qa:unified-login`
- `npm run qa:tenant-isolation`
- `npm run qa:modular-all`
- `npm run qa:all`
