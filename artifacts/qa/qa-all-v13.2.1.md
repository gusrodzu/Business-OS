# BuzzBee ERP — QA integral v13.2.1

Generado: 2026-09-09T23:40:14.028Z

Modo: **Static**

Resultado: **44/47 PASS** · **3 FAIL**

| Área | PASS | FAIL | Total |
|---|---:|---:|---:|
| Base | 4 | 0 | 4 |
| Flujos | 9 | 0 | 9 |
| Plataforma | 16 | 0 | 16 |
| UX/UI | 12 | 3 | 15 |
| 100/100 | 2 | 0 | 2 |
| Release | 1 | 0 | 1 |

## Suites

- ✅ **Base · Navegación**
- ✅ **Base · Foundation**
- ✅ **Base · Integración de pantallas**
- ✅ **Base · Core**
- ✅ **Flujos · Compras P2P**
- ✅ **Flujos · Ventas O2C**
- ✅ **Flujos · Inventario**
- ✅ **Flujos · Administración y finanzas**
- ✅ **Flujos · RR. HH.**
- ✅ **Flujos · CRM y terceros**
- ✅ **Flujos · POS**
- ✅ **Flujos · Proyectos**
- ✅ **Flujos · Producción**
- ✅ **Plataforma · Intelligence / AI**
- ✅ **Plataforma · Core SaaS**
- ✅ **Plataforma · Confiabilidad core**
- ✅ **Plataforma · Workers**
- ✅ **Plataforma · Integraciones**
- ✅ **Plataforma · Secuencias**
- ✅ **Plataforma · Integridad transaccional**
- ✅ **Plataforma · Máquinas de estado**
- ✅ **Plataforma · Auditoría**
- ✅ **Plataforma · Permisos**
- ✅ **Plataforma · Recovery**
- ✅ **Plataforma · Contratos API**
- ✅ **Plataforma · Multiempresa**
- ✅ **Plataforma · Performance**
- ✅ **Plataforma · Production readiness**
- ✅ **Plataforma · Final hardening**
- ❌ **UX/UI · Navegación por tabs**
- ❌ **UX/UI · UI global**
- ✅ **UX/UI · Navegación sin duplicados**
- ✅ **UX/UI · Tabs sin duplicados**
- ✅ **UX/UI · Topbar tabs**
- ❌ **UX/UI · Topbar tabs extendidos**
- ✅ **UX/UI · Administración / Finanzas navigation**
- ✅ **UX/UI · Racionalización de módulos**
- ✅ **UX/UI · Estandarización visual**
- ✅ **UX/UI · Switches**
- ✅ **UX/UI · Interacciones**
- ✅ **UX/UI · Idioma es-MX**
- ✅ **UX/UI · Deployment UI/API**
- ✅ **UX/UI · Agenda**
- ✅ **UX/UI · Tablas responsive**
- ✅ **100/100 · Dirección**
- ✅ **100/100 · Administración**
- ✅ **Release · Release Candidate**

## Interpretación

- PASS significa que la validación automatizada de esa suite pasó en el código actual.
- Los checks runtime requieren API y PostgreSQL activos; sólo se incluyen con `npm run qa:all:full`.
- Una suite técnica en PASS no sustituye la prueba de aceptación con usuarios reales para otorgar 100/100 definitivo de experiencia.

## Fallos

### UX/UI · Navegación por tabs

```text
Tabbed Module Navigation Audit — v10.4.0
========================================
PASS  Sidebar module parent points to first child route
PASS  Sidebar no longer renders submenu links
PASS  Sidebar marks module active from child route
PASS  Contextual ModuleTabBar exists
PASS  Tab bar uses navigation.js as route source
PASS  Tab bar renders module children as NavLink
PASS  Tab bar mounted immediately after Topbar
FAIL  Desktop tabs have active underline
PASS  Tabs support horizontal scroll
PASS  Mobile hides redundant module label
PASS  Tabbed module helper exported
PASS  No Prisma schema changes

11 PASS / 1 FAIL
```

### UX/UI · UI global

```text
Global UI Refresh Audit — v10.5.0
=================================
PASS  Global UI layer superseded by MD3 runtime
PASS  Sidebar compact width 220
FAIL  Topbar compact height 62
FAIL  Workspace has dedicated module tabs row
FAIL  Content starts below tabs with compact padding
FAIL  Sidebar is light
FAIL  Sidebar active state is soft blue
FAIL  Submodule navigation is tabs
FAIL  Module identity removed from tab strip
FAIL  Right AI rail fixed to 276px
FAIL  AI suggestions remain compact
PASS  Power banner compact
PASS  Global route headers standardized
PASS  Global cards standardized
PASS  Global tables standardized
PASS  Global forms standardized
PASS  Global modal styling retained/normalized
PASS  Responsive module tabs scroll
PASS  No Prisma changes required

10 PASS / 9 FAIL
```

### UX/UI · Topbar tabs extendidos

```text
More Topbar Tabs Audit — v10.5.4
================================
PASS  ModuleTabBar supports single-route modules
FAIL  Single-route modules use local tabs as topbar row
PASS  Producción migrated to ModuleTabs
PASS  Marketing migrated to ModuleTabs
PASS  Facturación migrated to ModuleTabs
PASS  Proyectos migrated to ModuleTabs
PASS  CRM migrated to ModuleTabs
PASS  Producción labels preserved
PASS  Marketing labels preserved
PASS  Fiscal labels preserved
PASS  Proyectos labels preserved
PASS  CRM labels/count preserved
PASS  No Prisma changes required

12 PASS / 1 FAIL
```
