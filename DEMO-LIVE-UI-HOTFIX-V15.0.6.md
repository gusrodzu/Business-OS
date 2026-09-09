# BuzzBee v15.0.6 — Demo LIVE UI Hotfix

## Correcciones
- El shell reconoce la barra Demo LIVE como una fila propia del layout.
- Se elimina el solapamiento entre tabs locales y encabezados de módulo.
- Se elimina el espacio vertical excesivo observado en Finanzas.
- `/configuracion` deja de mostrar el placeholder de Sprint 2 y usa un hub funcional de configuración.
- Demo LIVE usa un rol dedicado `Demo Administrator` sincronizado con todos los permisos ERP actuales, excluyendo `platform.*`.
- Agenda conserva `agenda.read` como permiso real; el rol Demo se sincroniza automáticamente al entrar.

## QA
Ejecutar `npm run qa:demo-live-ui`, `npm run qa:modular-all` y `npm run qa:all`.
