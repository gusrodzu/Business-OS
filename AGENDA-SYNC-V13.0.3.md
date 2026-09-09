# BuzzBee Agenda sincronizada — v13.0.3

La Agenda del rail derecho se alimenta en tiempo real desde los módulos del ERP. No replica las fechas operativas en otra tabla: consulta los registros fuente y genera una vista unificada.

## Fuentes sincronizadas

- Finanzas: cuentas por cobrar y cuentas por pagar.
- CRM: actividades y seguimientos con fecha.
- Marketing: eventos del calendario.
- Proyectos: tareas y fechas de entrega de proyectos.
- Compras: fecha requerida de SOLPED y fecha esperada de órdenes de compra.
- Ventas: entregas de pedidos y vigencia de cotizaciones.
- RR. HH.: pago de nómina, ausencias/licencias y vencimiento de documentos.
- Producción: fecha planeada de finalización de órdenes.

## Comportamiento

- `GET /api/agenda` agrega y normaliza las fechas del sistema por empresa/tenant.
- El rail solicita hasta 6 próximos eventos y conserva vencidos recientes para priorización.
- Se refresca cada 60 segundos y al recuperar foco de la ventana.
- Cada evento navega al módulo que lo originó.
- Indicadores rápidos: Hoy, próximos 7 días y Vencidos.
- No requiere migración de base de datos.

## Archivos principales

- `apps/api/src/routes/agenda.js`
- `apps/api/src/index.js`
- `apps/web/src/framework/BuzzBeeRightRail.jsx`
- `apps/web/src/framework/BuzzBeeRightRail.module.css`
