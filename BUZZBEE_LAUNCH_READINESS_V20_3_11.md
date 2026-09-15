# BuzzBee v20.3.11 — Launch Readiness QA

## Alcance
Auditoría pre-lanzamiento sobre UX/UI, arquitectura, módulos, aislamiento multiempresa, demo offline y factibilidad multiindustria. Los checks estáticos no sustituyen UAT LIVE contra API + PostgreSQL.

## Correcciones de esta pasada
- Auditor de runtime desacoplado de la versión histórica 20.3.2.
- APP_VERSION alineada con root/API/Web.
- Validadores de Proyectos y Marketing adaptados a la arquitectura modular actual; los FAIL anteriores eran falsos positivos por nombres/espaciado/ruta antigua.
- Copy crítico visible normalizado a español (Ventas, Pedido a cobro, Gestión de proyectos, Registro de horas, Inversión, Pronóstico, Planta, Costos, Capacidad, Configuración de empresa).
- Nuevo `npm run launch:audit` como gate estático de pre-lanzamiento.

## Matriz de producto
| Dominio | Encaje multiempresa | Decisión de producto |
|---|---|---|
| Core, usuarios, roles, tareas, calendario | Universal | Core obligatorio |
| Ventas, Compras, Finanzas, CRM, RRHH, Proyectos, Marketing, Reportes | Horizontal | Apps configurables |
| Inventario | Horizontal con capacidades | Lotes, series, caducidad y ubicaciones como features |
| POS | Condicional | App opcional para operación presencial/retail |
| Producción | Condicional | App opcional para manufactura/ensamble |
| Facturación fiscal MX | País/regulación | Capability fiscal por país, no Core universal |
| Citas, membresías, mesas, habitaciones, expedientes | Vertical | Paquetes por industria, no contaminar Core |

## Gate antes de v1.0
Para declarar un módulo READY debe pasar: UX + UI + funcional LIVE + integración + tenant/permisos + datos + offline (cuando aplique) + business fit. `launch:audit` valida estructura y contratos; `uat:all` y pruebas manuales completan el gate LIVE.

## Estado de esta build
La arquitectura, capas visuales, demo offline y cobertura tenant tienen validadores existentes. Proyectos y Marketing contienen actualmente sus relaciones/rutas/calendario; los reportes previos que los marcaban ausentes eran incompatibilidades de los validadores históricos. El UAT LIVE sigue pendiente de ejecutarse en un entorno con PostgreSQL/API activos.

## Build en este entorno
No se marca como PASS: el paquete de dependencias disponible fue generado para Windows y Rollup requiere un binario nativo Linux distinto. Ejecutar `npm install && npm run build` en el entorno local/CI objetivo.
