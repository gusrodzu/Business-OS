# BuzzBee ERP v13.0.1 RC1.1

Corrección dirigida al fallo detectado por `npm run qa:core-saas`.

## Cambios

1. Health y Ready reportan la misma versión.
2. Billing e Integration Hub usan la misma constante de versión.
3. El runtime QA deja de exigir literalmente v10.3.0.
4. Integration Hub evita seleccionar automáticamente campos de `IntegrationEventLog` incorporados en versiones posteriores; sólo solicita los campos necesarios para el dashboard.

## Seguridad de datos

No requiere `db push`, migraciones, reset ni cambios de volumen.

## Validación recomendada

```powershell
npm install
npm run db:generate
npm run qa:core-saas:static
npm run qa:core-saas
npm run build
```
