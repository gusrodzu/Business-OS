# HaibuOS — Workspace OS app standard v1

## Scope and adoption
Use the existing shared primitives before creating a page-local replacement. This PR introduces the common contract for OSAppWindow, Dialog, centered and legacy EntityDrawer, Agenda editor, decision dialogs, notifications and shared master-detail controls. It does not certify every route or rewrite existing business logic.

## App families
| App | Layout | Local work surface |
|---|---|---|
| Tareas | Inbox / worklist | Centered EntityDrawer |
| Aprobaciones | Inbox / worklist | Decision detail, confirmation |
| Mensajes | Conversation | Conversation detail / utility |
| Agenda | Planner | Form editor and date/time popovers |
| Directorio | Master/detail | Contact detail |
| Ventas, CRM | Master/detail | Record detail and form |
| Compras, Inventario | Master/detail | Request/product detail and form |
| POS | Transaction workspace | Checkout and confirmation |
| Proyectos, Producción, Taller | Worklist/planner | Record detail and form |
| Finanzas, Facturación | Master/detail / table | Transaction forms and decisions |
| RRHH | Master/detail | Employee detail and forms |
| Reportes, Marketing | Dashboard / list | Filters and record detail |
| Administración, Configuración | Settings / master-detail | Forms and confirmations |
| Notificaciones | Utility | Notification center |

## Shared components and visual roles
- OSAppWindow owns application title, icon and minimize/maximize/close. Do not duplicate OS chrome.
- OSWorkspaceControls: shared search, filter rail and split. Use local search/filter/sort only where supported; do not introduce inactive controls.
- UXFoundation: PageHeader, FilterBar, EntityDrawer, FormSection, StickyFormActions, EmptyState, PageSkeleton, InlineErrorState.
- Dialog: general forms; Agenda uses specialized editor and pickers with the same contract.
- StatusNotifications: system feedback and confirm/prompt. Never use native browser confirm for new flows.
- Use data-ws-window-kind (application, form, detail, utility, decision), data-ws-region (header, body, footer), data-ws-close where relevant.
- Use --ws-* semantic roles defined in workspace-hybrid-global.css; do not make module accents the primary business-action color. Preserve existing accessible status semantics.
- Header and footer stay fixed within the surface; only the body scrolls. Close/cancel must be reachable, including on narrow windows. Preserve draft/dirty-state policies and pending operation locks.
- Responsive by available app width; single-column phone, 44px touch actions, keyboard/scroll/focus, safe-area insets, dark and forced colors.
- Foldables: only split when measured viewport segments or explicit confirmed crease configuration allow it; keep controls clear of the crease; otherwise use a single pane. Do not infer hinge from aspect ratio.
- Demo local retains interactive interface with clearly simulated data; never call real business endpoints from an offline-only session.

## Migration sequence
P0: shared primitives and dialog contract (this PR), then visual checks for Tasks, Agenda, Approvals and Messenger.
P1: Sales, Procurement and Inventory: consolidate master/detail, action bars, forms and states; verify all routes.
P2: CRM, Projects, Production, Workshop, POS, Finance, Fiscal, HR, Marketing, Reports, Administration, Settings and Directory: inventory every route, adopt shared primitives, retain authorization and business flows.
P3: remove obsolete CSS only after comparing before/after screenshots and functional coverage.

## Definition of done per route/subwindow
- Desktop floating, snapped and maximized; mobile 320/360/390/430; tablet and segmented/fold-safe states.
- Light, dark, keyboard navigation, visible focus, zoom/text scaling, reduced motion, contrast.
- No horizontal overflow except intentionally scrollable tables; body scrolls without moving actions; no hinge overlap.
- Loading, empty, error, retry, permission denial and relevant mutations tested in demo and connected environments.
- No cross-company state leaks; no fake success or controls.
- Browser screenshots, CI and per-route PASS evidence required. Shared contract alone is not certification.
