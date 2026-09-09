# BuzzBee SaaS · Seguridad Super Admin

## Arquitectura aplicada

- Mismo motor de autenticación para ERP y plataforma, con contextos separados.
- `/login`: usuarios operativos del ERP.
- `/admin-login`: cuentas Super Admin SaaS únicamente.
- Una cuenta con `platform.manage` no puede iniciar sesión como usuario ERP normal.
- `platform.manage` pertenece al rol dedicado `Super Admin SaaS`, no al rol `Administrador` ordinario.
- MFA TOTP obligatorio para Super Admin.
- Secreto MFA cifrado en PostgreSQL con AES-256-GCM.
- Sesión Super Admin: JWT de 45 minutos, almacenado en `sessionStorage`.
- Cierre automático por 15 minutos de inactividad del navegador.
- Reautenticación con contraseña + MFA para acciones críticas si pasaron 10 minutos.
- Bloqueo temporal por 5 intentos fallidos y rate limit por IP.
- `sessionVersion` permite revocar JWT al cerrar sesión o reasignar privilegios.
- Auditoría de login, MFA, reautenticación y acciones de plataforma.

## Activación

1. Configura `MFA_ENCRYPTION_KEY` en el `.env` de API.
2. Sincroniza Prisma:
   `npm run db:generate && npm run db:sync`
3. Crea una cuenta separada para plataforma (no uses la cuenta operativa del ERP).
4. Asigna el rol:
   `npm run platform-admin:enable -- admin@tu-dominio.com`
5. Reinicia la API y entra por `/admin-login`.
6. En el primer acceso BuzzBee mostrará la clave TOTP para registrarla en tu autenticador.

## QA

`npm run qa:platform-security`
