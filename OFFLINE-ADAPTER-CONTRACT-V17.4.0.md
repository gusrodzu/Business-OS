# BuzzBee ERP v17.4.0 — Offline Adapter Contract

## Objetivo
La cuenta `admin@erp.local` es una Demo Offline puramente frontend. Una sesión con `offlineDemo=true` no puede depender de API, PostgreSQL, workers, WebSocket/SSE ni servicios externos y puede desplegarse como frontend estático en Vercel.

## Contrato técnico
1. `AuthContext` autentica la cuenta demo localmente.
2. `apiRequest()` detecta `offlineDemo` antes de axios y delega a `offlineDemoRequest()`.
3. El interceptor de axios bloquea cualquier request directo accidental con `OFFLINE_NETWORK_BLOCKED`.
4. `offlineDemoRequest()` devuelve fixtures, formas seguras y mutaciones simuladas.
5. Vercel usa fallback SPA a `index.html` para navegación/refresco de rutas.
6. Super Admin SaaS permanece fuera del contexto offline.

## Matriz por módulo
| Dominio | Demo Offline | Fuente |
|---|---|---|
| Inicio / Agenda | Local | fixtures/adaptador |
| Compras | Local + mutaciones simuladas | adaptador |
| Inventario / Almacenes | Local + mutaciones simuladas | adaptador |
| Administración / Finanzas | Local + mutaciones simuladas | adaptador |
| RRHH | Local + mutaciones simuladas | adaptador |
| Ventas / Cobranza | Local + mutaciones simuladas | adaptador |
| CRM / Marketing / Terceros | Local + mutaciones simuladas | adaptador |
| Proyectos | Local + mutaciones simuladas | adaptador |
| Producción | Local + mutaciones simuladas | adaptador |
| POS | Local + mutaciones simuladas | adaptador |
| Intelligence | Simulado | sin proveedor IA |
| Aprobaciones / Data Hub / Integration Hub / Flow / Reportes | Local/Simulado | adaptador |
| Configuración | Local; empresa persiste | localStorage/adaptador |
| Super Admin SaaS | Bloqueado | requiere sesión platform real |

## Dependencias/funciones externas
- API backend: bloqueada.
- PostgreSQL: no requerido.
- Workers/cron/jobs reales: bloqueados.
- WebSocket/SSE: bloqueados.
- Email/WhatsApp: bloqueados.
- Integraciones/webhooks/API keys: simulados.
- Uploads y documentos: simulados; no existe almacenamiento remoto.
- Smart Import: flujo demostrativo; no importa datos al servidor.
- Pagos/facturación/timbrado: simulados.
- IA: simulada.

## QA
Ejecutar:

```powershell
npm run qa:offline-dependencies
npm run qa:offline-all-routes
npm run qa:offline-runtime-shapes
npm run build
```

El primero valida que no existan bypass de red obvios, dependencias backend dentro del bundle web, sockets/beacons, que el bloqueo axios esté activo y que Vercel conserve su fallback SPA.
