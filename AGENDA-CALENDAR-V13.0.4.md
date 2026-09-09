# BuzzBee Agenda v13.0.4 — Calendario central + eventos + recordatorios

## Qué agrega

- Vista completa en `/agenda` con modos **Mes** y **Semana**.
- El calendario mezcla eventos automáticos del ERP con eventos creados manualmente.
- Crear eventos desde un día del calendario o desde el botón `+` del rail derecho.
- Editar, completar/reactivar y eliminar eventos manuales.
- Responsable opcional tomado de empleados activos de la empresa.
- Prioridad: Baja, Normal, Alta y Urgente.
- Recordatorios configurables dentro de BuzzBee.
- Worker `agenda-reminders` que genera notificaciones persistentes.
- El Topbar ahora consume notificaciones reales desde `/activity/notifications`; se retiraron las notificaciones de ejemplo hardcodeadas.
- El rail derecho conserva el resumen compacto debajo de **Aplicaciones** y enlaza a la vista completa.

## Sincronización

Los eventos automáticos siguen leyendo directamente fechas reales de Finanzas, CRM, Marketing, Proyectos, Compras, Ventas, RR. HH., Nómina, documentos y Producción. No se copian a `AgendaEvent`, por lo que no existe una segunda fecha que pueda desincronizarse.

`AgendaEvent` se usa únicamente para eventos creados desde la Agenda.

## Cambio de base de datos

Se agrega el modelo Prisma `AgendaEvent` y los enums `AgendaEventPriority` / `AgendaEventStatus`.

Después de instalar esta versión ejecuta:

```bash
npm install
npm run db:generate
npm run db:sync
npm run qa:agenda
npm run dev
```

`db:sync` usa `prisma db push` y es consistente con la estrategia actual del repositorio, que no mantiene una carpeta histórica de migraciones.

## Recordatorios

El worker revisa cada 2 minutos por defecto (mínimo 1 minuto). Cuando un evento entra en su ventana de recordatorio:

1. crea una notificación para el usuario que creó el evento;
2. si el responsable tiene un email que coincide con un usuario activo de la misma empresa, también crea una notificación para ese usuario;
3. marca `reminderSentAt` para no duplicar el aviso.

Variable opcional:

```env
AGENDA_REMINDER_INTERVAL_MS=120000
```

## Archivos principales

- `apps/api/prisma/schema.prisma`
- `apps/api/src/routes/agenda.js`
- `apps/api/src/services/agendaReminderWorker.js`
- `apps/api/src/index.js`
- `apps/web/src/pages/Agenda.jsx`
- `apps/web/src/pages/Agenda.module.css`
- `apps/web/src/framework/BuzzBeeRightRail.jsx`
- `apps/web/src/framework/BuzzBeeRightRail.module.css`
- `apps/web/src/layout/Topbar.jsx`
- `apps/web/src/layout/Topbar.module.css`
- `apps/web/src/App.jsx`
