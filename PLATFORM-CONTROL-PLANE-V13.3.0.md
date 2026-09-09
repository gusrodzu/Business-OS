# BuzzBee Platform Control Plane v13.3.0

El Super Admin queda separado del ERP operativo y ahora administra exclusivamente la plataforma SaaS.

## Áreas incluidas
- Resumen ejecutivo SaaS: MRR, ARR, cartera, Health Score, renovaciones, trials y soporte.
- Empresas / tenants: estado, plan, usuarios, módulos y Health Score.
- Suscripciones y renovaciones.
- Trials con extensión controlada.
- Facturación SaaS.
- Usuarios globales: estado, MFA, último acceso y revocación de sesiones.
- Health Score de clientes.
- Centro de soporte persistente.
- Planes de suscripción.
- Módulos y feature flags globales.
- Integraciones y webhooks.
- Revenue: MRR, ARR, ARPU, churn aproximado, facturación vs cobranza 12 meses.
- Sistema y observabilidad.
- Seguridad global.
- Auditoría global.
- Configuración de plataforma, mantenimiento y comunicado global.

## Seguridad
Las mutaciones críticas requieren sesión Super Admin con MFA, `platform.manage` y reautenticación reciente.

## Base de datos
Agrega `PlatformSetting` y `PlatformSupportTicket`. Ejecutar `npm run db:generate` y `npm run db:sync`.
