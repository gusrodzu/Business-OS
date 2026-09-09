# Administración 100/100 · v13.2.0

## Objetivo
Convertir el Centro Administrativo en una bandeja operativa transversal: el usuario puede saber qué requiere atención, por qué, cuánto representa y en qué módulo resolverlo sin reconstruir el contexto manualmente.

## Alcance incorporado
- Score de salud administrativa 0–100.
- Capital de trabajo: Tesorería + CxC − CxP.
- Ejecución mensual: presupuesto mensual vs gastos registrados.
- Bandeja unificada de pendientes con severidad y vencimiento.
- Aprobaciones pendientes y envejecidas (>48 h).
- Pagos y cobranzas vencidas/próximas.
- Órdenes de compra con recepción atrasada.
- Documentos laborales vencidos y por vencer.
- Nómina pendiente de pago.
- Agenda de próximos 7 días.
- Notificaciones no leídas.
- Actividad reciente desde AuditLog.
- Semáforo de seis procesos administrativos críticos.
- Drill-down a la aplicación canónica de origen.
- Diseño responsive y reglas anti-recorte de texto.

## Arquitectura
No se crea una nueva tabla ni se duplican procesos. `/api/administration/dashboard` agrega datos existentes de Finanzas, Compras, Aprobaciones, RR. HH., Agenda, Notificaciones y Auditoría.

## QA
Ejecutar:

```bash
npm run qa:administration
```

Criterio estático: 24/24 checks.

## Base de datos
No requiere migración Prisma.
