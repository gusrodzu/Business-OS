# Business OS: reembolsos, reversión contable y conciliación

## Alcance
El registro de reembolso NO envía fondos ni inicia solicitudes al banco o la pasarela de pago. Registra un reembolso ya confirmado externamente.

POST /api/sales-returns/credit-notes/:id/refunds requiere sales.approve, treasury.move, treasuryAccountId de cuenta BANK, externalReference y confirmedAt. Crea una salida en Tesorería y auditoría. Verifica empresa, moneda, saldo disponible, importe efectivamente cobrado, nota aplicada y duplicados. Serializa operaciones concurrentes sobre la factura origen.

POST /api/accounting/entries/:id/reverse exige accounting.manage y accounting.approve. Crea póliza opuesta POSTED, conserva asiento original y exige periodo abierto. No permite reversión doble.

## Pruebas
GitHub Actions utiliza PostgreSQL 17 efímero: Compras, POS, O2C, devoluciones y notas, reembolso confirmado y salida única de Tesorería, conciliación de su salida mediante CSV bancario sintético, reversión de pólizas y restricciones de periodos cerrados y de permisos de usuario.

## Advertencias
- No registrar reembolso hasta que exista confirmación externa verificable.
- No se ejecutan reembolsos bancarios ni timbrado/cancelación SAT.
- El CSV sintético no garantiza compatibilidad con todos los formatos bancarios.
- No borrar pólizas originales ni reabrir periodos contables cerrados para realizar reversos.
- Una prueba con PostgreSQL efímero no sustituye ensayos de restauración de la base existente.

## Ensayo de compatibilidad con datos reales
La base erp_cliente local no es accesible por GitHub Actions. Crear una restauración aislada del .dump verificado, en base y volumen distintos. Revisar migrate status y schema diff antes de ejecutar cambios. Nunca usar db push --accept-data-loss ni scripts que escriben sobre la instancia habitual ni producción.
