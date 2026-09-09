# BuzzBee SaaS · Super Admin v13.2.1 · Security Hardened

El panel global del propietario de BuzzBee queda separado de la operación diaria de cada tenant y usa un contexto de autenticación endurecido.

## Rutas

- Login ERP: `/login`
- Login Super Admin: `/admin-login`
- Panel global: `/admin-saas`
- API: `/api/platform-admin/*`
- Permiso exclusivo: `platform.manage`
- Rol dedicado: `Super Admin SaaS`

## Seguridad

- Una cuenta con `platform.manage` no puede iniciar sesión por `/login`.
- Una cuenta ERP ordinaria no puede iniciar sesión por `/admin-login`.
- MFA TOTP obligatorio para Super Admin.
- Secreto MFA cifrado en PostgreSQL con AES-256-GCM.
- Sesión de plataforma de 45 minutos.
- Token de plataforma en `sessionStorage`, no persistente al cerrar el navegador.
- Cierre local por 15 minutos de inactividad.
- Reautenticación con contraseña + MFA para acciones críticas después de 10 minutos.
- Bloqueo temporal por intentos fallidos y rate limit de login.
- Revocación de JWT mediante `sessionVersion`.
- Auditoría de login, MFA, reautenticación y acciones globales.

## Activación inicial

1. Configura en el `.env` de API una clave distinta al JWT:

```env
MFA_ENCRYPTION_KEY=un-secreto-aleatorio-largo-y-unico
```

2. Sincroniza Prisma:

```powershell
npm run db:generate
npm run db:sync
```

3. Crea una cuenta separada para administración global y asígnala como Super Admin:

```powershell
npm run platform-admin:enable -- admin-plataforma@tu-dominio.com
```

El script crea/usa el rol `Super Admin SaaS`, remueve `platform.manage` de cualquier rol ERP ordinario y fuerza nueva configuración MFA para esa cuenta.

4. Entra por:

```text
/admin-login
```

En el primer acceso BuzzBee mostrará la clave TOTP para agregarla a Google Authenticator, Microsoft Authenticator, 1Password u otra app compatible.

## QA

```powershell
npm run qa:platform-admin
npm run qa:platform-security
npm run qa:permissions
npm run qa:all
```

Validación de esta entrega:

- Platform Admin: 20/20 PASS
- Platform Security: 16/16 PASS
- Permissions Matrix: 226/226 endpoints mutables protegidos (100%)
- QA integral: 47/47 PASS
