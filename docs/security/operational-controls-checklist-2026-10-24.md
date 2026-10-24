# Business OS — habilitación operativa de seguridad

## Hecho en repositorio

- [x] Regresión CSRF/JWT/MFA y validación de semillas de demostración
- [x] Auditoría npm en PR y semanal, bloqueo de hallazgos HIGH/CRITICAL en producción
- [x] Dependabot semanal npm + GitHub Actions
- [x] Logs HTTP saneados en Pino
- [x] Propietario del código definido mediante CODEOWNERS
- [x] Procedimiento de divulgación responsable en SECURITY.md

## Pendiente de configurar en GitHub (se necesita acceso Settings → de administrador)

- [ ] Settings → Rules → Rulesets → crear regla **main** que impida force push y delete
- [ ] Exigir pull request antes de merge, aprobación de otra persona autorizada cuando haya equipo, y no permitir omitir reglas
- [ ] Exigir **los checks**: `Build, lint, visual and offline`, `npm audit (all and production)`, `Prisma 7 PostgreSQL smoke`, `module-integration`, `Compras → Inventario → POS → Factura → Tesorería` (validar nombres exactos en la UI)
- [ ] Exigir resolución de conversaciones de revisión y revisión CODEOWNERS cuando corresponda
- [ ] Settings → Advanced Security: habilitar Secret scanning, Push protection, Dependabot alerts, Dependency graph y Code scanning según plan disponible
- [ ] Configurar un método privado para reportes de seguridad; habilitar Private vulnerability reporting si está disponible
- [ ] Revisar permisos de cuentas/colaboradores y usar autenticación MFA en todas las cuentas con acceso de escritura

## Pendiente en infraestructura de producción (sin revelar valores)

- [ ] Confirmar secretos independientes por ambiente para JWT, MFA, integraciones, S3 y PostgreSQL, y plan de rotación sin pérdida de datos
- [ ] Verificar `COOKIE_SECURE=true`, CORS exacto, HTTPS/TLS, almacenamiento privado y ausencia de usuario demo real
- [ ] Verificar PG no expuesto públicamente, roles de DB mínimos, cifrado de respaldos y restauración aislada de prueba
- [ ] Comprobar que API y frontend publicados pertenecen a la misma versión y funcionan con sesiones y multiempresa reales
- [ ] Planificar prueba no destructiva de seguridad en staging autorizada

## Deuda de React Hooks

La actualización del motor de lint (PR #50) mantiene tres reglas nuevas en nivel de advertencia. No reducir nuevas reglas adicionales: corregir un módulo por PR y validar navegación, hooks y estados. Priorizar autenticación, navegación y componentes transversales; solo después elevar de nuevo estas reglas a error. No convertir `setState` en efectos en soluciones basadas en `setTimeout` para silenciar reglas.

**Nota:** este documento no representa la habilitación de las opciones Settings del proveedor; el conector usado para cambios de código no puede verificarlas ni activarlas.
