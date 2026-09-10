# BuzzBee ERP v17.0.0 — Workspace UI

BuzzBee adopta una interfaz de trabajo más limpia inspirada en los principios de Google Workspace/Drive, manteniendo identidad propia y Material Design 3 como base técnica.

## Cambios principales

- Shell sin banner promocional persistente.
- Panel derecho colapsable y persistencia de preferencia en `localStorage`.
- Barra de herramientas vertical de 52px para Agenda, Apps y BuzzBee AI.
- Topbar limpia con buscador amplio tipo Workspace.
- Sidebar de 248px con estados activos suaves y navegación en píldora.
- Tabs de 48px con indicador discreto.
- Cards/KPI con superficies planas, bordes suaves y sin sombras ornamentales.
- Tablas con tratamiento tipo lista de archivos: header discreto, filas de 50px y hover suave.
- Inputs/formularios con superficies blancas, radio 10px y foco simple.
- Tokens específicos Workspace para Light/Dark.

## Limpieza CSS

`AppShell.module.css`, `Sidebar.module.css`, `Topbar.module.css`, `ModuleTabBar.module.css` y `BuzzBeeRightRail.module.css` fueron reescritos como contratos únicos, eliminando los bloques históricos de overrides acumulados dentro de esos archivos.

Las hojas legacy históricas continúan fuera del runtime. `workspace.css` es la capa final de presentación de módulos.

## Funcionalidad preservada

No se modifican rutas de negocio, API, permisos, multiempresa, Super Admin, Demo LIVE, Smart Import ni modelos Prisma.
