# Business OS Next · Mobile First — contrato de diseño v1

Decisión aprobada: 1 de noviembre de 2026. Primero smartphones, después tablets y finalmente desktop. No rediseñar visualmente desktop hasta validar las pantallas móviles.

## Producto
Business OS es un Sistema Operativo para Negocios, no un ERP/CRM genérico. La interfaz móvil prioriza operaciones frecuentes, búsqueda y acciones. Un solo design system debe servir empresas, roles y giros diferentes, sin inventar permisos ni datos.

## Mapa móvil
- Encabezado contextual: menú de dos niveles, nombre de pantalla, búsqueda universal visible, notificaciones y cuenta; conservar control de tema.
- Bottom dock: conservar Inicio, Tareas, Agenda, BuzzBee AI y Módulos hasta evaluar su uso; los módulos se abren en drawer seguro.
- Home: apps favoritas, filtros por área, sugerencias por giro de módulos realmente habilitados, alertas, acciones y KPI rectangulares compartidos.
- Operación: Ventas, POS, Compras, Inventario, CRM, Finanzas, RRHH y verticales deben tener formularios táctiles, estados reales, tablas contenidas y detalle seguro.
- Búsqueda: aprovechar CommandPalette existente sin duplicar lógica.

## Etapas y aceptación
| Etapa | Trabajo | Evidencia exigida |
| --- | --- | --- |
| M1 | Header con búsqueda y launcher compacto | Frontend QA, mobile:responsive:audit, review móvil y visual real |
| M2 | Home orientado a prioridades y tareas | KPI con datos reales, permisos, empresa y demo offline |
| M3 | Ventas, Inventario, POS, Compras | Flujos operativos completos en 320/360/390/430 px |
| M4 | CRM, RRHH, Finanzas y verticales | Componentes compartidos y foco, formularios, tabla y detalles |
| M5 | PWA / QA y accesibilidad | Chrome Android, Safari iOS, Huawei web si es accesible; 768/1024; WCAG 2.2 AA |

## Reglas
Targets táctiles preferentes 44x44 CSS px; contraste claro/oscuro, foco visible, zoom 200 %, safe areas y teclado virtual. Nunca scroll horizontal de toda la página ni campos/facturas truncados. Mantener KpiCard rectangular, dos niveles de navegación, permisos, API, backend PostgreSQL/Render, Super Admin, demo offline y desktop sin regresión.
Cada incremento: inspección, PR pequeño, lint/build, UAT/rutas, test smartphone, CI completo, merge solo si checks PASS, luego verificar Cloudflare Workers business-os y smoke autenticado. Ninguna declaración de QA visual sin abrir la app en teléfono.

## Primera implementación
Topbar.jsx + Topbar.module.css: búsqueda de CommandPalette visible en mobile, táctil y accesible. WorkspaceAppShelf.module.css: apps compactas en smartphones, conservando favoritos, categorías, giro y autorización. validate-mobile-responsive-v22.mjs: regresión estática. QA visual autenticado aún pendiente.