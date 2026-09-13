# BuzzBee ERP v18.0.0 — Demo empresarial completamente offline

La sesión **Demo Offline** representa a **MotorNorte Refacciones Automotrices, S.A. de C.V.**, una distribuidora mexicana de refacciones con tres sucursales. Toda consulta del frontend se resuelve mediante el adaptador local; la demo no requiere API, base de datos, workers ni integraciones externas.

## Cobertura funcional

- Catálogo automotriz, existencias por almacén, movimientos, transferencias y ajustes.
- Solicitudes, órdenes y recepciones de compra ligadas a proveedores.
- Clientes, prospectos, CRM, cotizaciones, pedidos, entregas, facturas, devoluciones y cobranza.
- POS con terminales, sesiones, ventas, productos, clientes y almacenes.
- Empleados, departamentos, puestos, asistencia, permisos, incidencias, expedientes y prenómina.
- Tesorería, CxP, CxC, conciliación, contabilidad, gastos, activos, presupuestos y flujo de efectivo.
- Fiscal, proyectos, producción de kits, marketing, aprobaciones, Master Data, Data Hub, integraciones, Flow, reportes e inteligencia.
- Administración de empresa, sucursales, usuarios, roles, módulos, suscripción, actividad, notificaciones y agenda.

Los documentos y movimientos reutilizan los mismos identificadores maestros. Por ello una orden de compra apunta a un proveedor real del demo, una factura a un cliente existente, una prenómina a empleados válidos y una venta POS al mismo catálogo e inventario.

## Comportamiento offline

- Las rutas conocidas devuelven conjuntos útiles y coherentes para operar cada pantalla.
- Las rutas de detalle reutilizan el contexto del módulo y mantienen las relaciones.
- Las acciones de alta, pago, prueba, importación, ejecución e inteligencia regresan contratos simulados consumibles por la interfaz.
- Una ruta de consulta no registrada recibe un contrato seguro con contexto de MotorNorte y colecciones vacías, sin intentar salir a la red.
- Super Admin permanece separado de la demo de empresa.

## Validación

```bash
npm run qa:offline-business
npm run qa:offline-auto-parts
npm run qa:offline-all-routes
npm run qa:offline-runtime-shapes
npm run qa:offline-dependencies
npm run build
```

La validación específica recorre todas las zonas funcionales, comprueba arreglos no vacíos, relaciones cruzadas, contratos de mutación y el fallback universal.
