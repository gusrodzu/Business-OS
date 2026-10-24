# Política de seguridad — Business OS

## Reporte responsable

No publiques vulnerabilidades, tokens, credenciales, datos personales o pruebas de explotación en issues o pull requests públicos.

Para notificar vulnerabilidades, utiliza **Report a vulnerability** en la pestaña **Security** del repositorio, si GitHub Private Vulnerability Reporting está habilitado. Si no lo está, contacta al propietario del repositorio por un canal privado acordado antes de compartir detalles técnicos.

## Alcance

Se revisan autenticación, control de acceso por empresa, permisos, pagos, almacenamiento de archivos, integraciones externas, infraestructura y dependencias. No se autoriza probar sobre usuarios, bases de datos o instancias de producción sin consentimiento expreso y un plan de pruebas.

## Mantenimiento

- Ejecutar `npm ci`, `npm run security:regressions`, `npm run release:final` y `npm audit --omit=dev --audit-level=high` antes de versiones de producción.
- No incorporar dependencias mayores ni migraciones de datos sin revisión del impacto y QA.
- Jamás compartir el contenido de variables de entorno, cookies, claves JWT, MFA o respaldos en logs o comentarios de GitHub.
- Conservar las pruebas de aislamiento tenant y los respaldos de recuperación independientes de producción.

## Dependencias

Dependabot prepara PR de npm y GitHub Actions; la suite `Dependency Security Triage` debe permanecer como check obligatorio. Un resultado PASS de npm audit no equivale a una auditoría de seguridad completa.
