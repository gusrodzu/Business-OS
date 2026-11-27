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

## Official application icon style — Symbian Anna inspired (mandatory)
The approved HaibuOS application icon identity is inspired by Nokia Symbian Anna, using original artwork rather than copying third-party assets.
- Rounded-square silhouette between square and circular: shared 64 × 64 SVG viewBox, 62 × 62 background at (1,1), corner radius 20.
- Colorful, recognizable backgrounds with a smooth matte vertical gradient. No corner shine, specular highlights, glossy overlays, decorative rim strokes or heavy three-dimensional effects.
- Simple white monochrome pictograms, centered with consistent optical weight and generous internal spacing; recognizable at dock and window-title sizes.
- Preserve each approved application color and symbol. POS: blue cash register. Operations: orange gear with circular arrows.
- Reuse `apps/web/src/layout/os/OSSystemAppIcon.jsx` for application identities in Desktop OS, Pocket OS, Hub OS, dock, launcher and window chrome; register artwork and color pairs for new applications instead of duplicating the icon component.
- This rule concerns application identity icons, not every functional control: keep existing accessible action/navigation icons and semantic status indicators where appropriate.
- Validate small and large sizes, light/dark surfaces and consistent silhouettes; preserve the existing icon-catalog regression tests.
- Do not introduce another app icon style without explicit design approval.

## Official internal app navigation — App Navigation Rail (mandatory)
The left icon rail approved in Mensajes is the reference for the internal navigation of all primary HaibuOS applications. It is distinct from the global dock and application launcher.
- Every primary app with multiple destinations or views must expose its authorized internal navigation through a compact vertical rail on the leading edge of the desktop window. Single-view apps must not invent destinations or display an empty rail; document the exception.
- Desktop baseline: 52 CSS px rail width (allow 56 px for touch), 20–24 px monochrome functional glyphs, 44 × 44 px targets, consistent 8 px spacing, subtle neutral surface and separator. Keep the active item visually distinct using shared semantic selection tokens, not color alone.
- Keep the rail stable when changing sections. Use optional accessible labels/tooltips and keyboard navigation; use aria-current for routes and aria-pressed for view filters, not both indiscriminately. Preserve visible focus, route authorization and tenant scoping.
- An optional second panel holds contextual lists, filters or section choices; the main panel holds the working content. Avoid duplicating the same navigation in breadcrumbs, pills and rail when unnecessary. Existing actions remain discoverable during migration.
- On narrow windows, phones and passport-like displays, collapse the rail into an accessible local navigation drawer or compact switcher (not a second system dock). The app's destinations remain reachable, including while viewing detail. Adapt to available window width, not only device width.
- On unfolded devices use only verified viewport segments or configured crease geometry; keep rail, targets and key content entirely within usable segments. If safe segmentation is not possible, use a single-pane layout.
- Subwindows such as forms, confirmations and simple detail dialogs inherit the parent app context and do not duplicate the rail. Full work subwindows reuse it only when they have independent section navigation.
- Reuse one shared AppNavigationRail primitive in future implementation; Mensajes is the visual reference, not a reason to copy its local CSS into each module. Keep Symbian-inspired colorful icons for application identity, monochrome glyphs for internal navigation.
- Migration: Mensajes (reference), Tareas/Aprobaciones/Agenda/Directorio, Ventas/Compras/Inventario/CRM/POS, then the remaining application families. Use only existing reachable routes and functional views. Validate desktop, snap, narrow window, mobile, foldable, dark mode and keyboard behavior before certifying each module.


## App navigation rollout coverage
Implementation coverage is not browser certification.
- OSAppSurface route rail: Sales, Procurement, Inventory, CRM, Finance, HR, Reports.
- Local rail: Agenda, Messenger, Tasks, Approvals, POS, Projects, Production, Marketing, Fiscal, Settings, Flow, MasterData, IntegrationHub, DataHub, AdministrativeCenter, DemoCompanyWorkspace.
- Notification center: utility exception. Keep compact All / Unread filters and explicit close; no redundant desktop rail.
- Directory: placeholder awaiting a tenant-authorized service. No fictional navigation until real destinations exist.
- Demo company portfolio: single list with creation action and search/filter; no redundant rail. Its company workspace has a rail for summary, customization and return to portfolio.
- Generic application fallback and single-view pages: no invented routes. Preserve existing guards and module licenses.
- Review all secondary pages separately, including nested forms, responsive navigation, dark theme and actual fold geometry. Do not claim all apps are certified until browser and connected-data checks pass.

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
