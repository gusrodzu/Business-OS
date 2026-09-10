# BuzzBee ERP — QA integral v17.0.0

Generado: 2026-09-10T00:27:28.219Z

Modo: **Static**

Resultado: **45/47 PASS** · **2 FAIL**

| Área | PASS | FAIL | Total |
|---|---:|---:|---:|
| Base | 4 | 0 | 4 |
| Flujos | 9 | 0 | 9 |
| Plataforma | 16 | 0 | 16 |
| UX/UI | 13 | 2 | 15 |
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
- ✅ **UX/UI · Workspace UI**
- ❌ **UX/UI · MD3 Full**
- ✅ **UX/UI · Navegación sin duplicados**
- ✅ **UX/UI · Tabs sin duplicados**
- ❌ **UX/UI · Topbar tabs**
- ✅ **UX/UI · Accesibilidad**
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

### UX/UI · MD3 Full

```text
BuzzBee MD3 Full Rollout v16.0.0
55/58 PASS
PASS  Componente MD3 Button
PASS  Componente MD3 Input
PASS  Componente MD3 Select
PASS  Componente MD3 Switch
PASS  Componente MD3 Checkbox
PASS  Componente MD3 Card
PASS  Componente MD3 Badge
PASS  Componente MD3 Chip
PASS  Componente MD3 Tabs
PASS  Componente MD3 Dialog
PASS  Componente MD3 Drawer
PASS  Componente MD3 Snackbar
PASS  Componente MD3 DataTable
PASS  Export Button
PASS  Export Input
PASS  Export Select
PASS  Export Switch
PASS  Export Checkbox
PASS  Export Card
PASS  Export Badge
PASS  Export Chip
PASS  Export Tabs
PASS  Export Dialog
PASS  Export Drawer
PASS  Export Snackbar
PASS  Export DataTable
PASS  Contrato visual por módulo
PASS  Tablas globales MD3
PASS  Reduced motion
PASS  More contrast
PASS  Rollout importado globalmente
PASS  AppShell etiqueta módulo
PASS  PlatformShell etiquetado
PASS  Shell Topbar.module.css usa roles MD3
PASS  Shell Sidebar.module.css usa roles MD3
PASS  Shell ModuleTabBar.module.css usa roles MD3
PASS  Shell AppShell.module.css usa roles MD3
PASS  Shell PlatformShell.module.css usa roles MD3
FAIL  KPI migrado a MD3
FAIL  ModuleSystem MD3
FAIL  DataTableFrame MD3
PASS  RecordModal MD3
PASS  Módulo core bajo rollout
PASS  Módulo procurement bajo rollout
PASS  Módulo inventory bajo rollout
PASS  Módulo finance bajo rollout
PASS  Módulo hr bajo rollout
PASS  Módulo crm bajo rollout
PASS  Módulo sales bajo rollout
PASS  Módulo projects bajo rollout
PASS  Módulo production bajo rollout
PASS  Módulo pos bajo rollout
PASS  Módulo intelligence bajo rollout
PASS  Módulo operations bajo rollout
PASS  Módulo settings bajo rollout
PASS  Módulo platform bajo rollout
PASS  Versión MD3 v16+
PASS  QA MD3 Full registrado
```

### UX/UI · Topbar tabs

```text
All Tabs in Topbar Audit — v10.5.3
==================================
PASS  ModuleTabs uses React portal
PASS  Module tabs target exists in topbar navigation
PASS  Topbar supports secondary local tab row
FAIL  Local tabs have topbar visual style
PASS  Modal tabs stay inline
PASS  Ventas local tabs use ModuleTabs
PASS  RRHH local tabs use ModuleTabs
PASS  RRHH operation tabs moved to ModuleTabs
PASS  Inventory operation tabs moved to ModuleTabs
PASS  Legacy /rrhh remains redirect
PASS  No Prisma changes required

10 PASS / 1 FAIL
```
