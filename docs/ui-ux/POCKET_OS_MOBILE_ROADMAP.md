# Pocket OS — Mobile-first execution roadmap

Basis: ten owner-provided smartphone screenshots dated 2026-11-25, plus the shared Calendar pilot standard (HYBRID_OS_UI_STANDARD.md) and HYBRID_OS_APP_AUDIT.md. Screenshots show desktop-like floating windows, small text and a wide app dock; they do not establish whether the cause is browser desktop-site mode, deployment/cache, viewport or application code. Diagnose before changing detection. No assumption that a rendered demo implements production backend functionality.

## P0 — shared mobile shell

- Verify deployed build SHA, actual innerWidth/visualViewport.width, matchMedia, data-pocket-os, browser desktop-site mode and PWA standalone mode on an actual Android phone. HTML in main already declares width=device-width and viewport-fit=cover. Preserve browser zoom and desktop/tablet support; do not infer device from user agent alone.
- Full-width, full-height application surface below compact app chrome, with scroll ownership and safe-area clearance. No desktop maximize/minimize on phone; keep return to home and sections accessible.
- Four-action dock: Inicio, Apps, Buscar, Asistente. Complete tenant-authorized catalog remains in home shelf and launcher. PR #911 prepared; its 92 route/width geometry checks reached completion with 58px dock and four actions. Full workflow still failed in subsequent desktop Sales running-window selection test. Do not mark release green until fixed and rerun by SHA.
- Shared mobile patterns: list/detail navigation with a Back control, URL/history and selection preservation where appropriate; bottom sheets/dialogs with keyboard, focus restoration, safe cancel and accessible headings; two-column KPI grid where amounts fit, one column otherwise; filters/search and segmented tabs; no clipped controls; local scroll only for data tables that truly need it. Reuse Button, Input, BusinessSelect, StatusMessage, useNotify, existing drawer and KPI components rather than duplicating styles. Main action visible without covering content, minimum 44px targets, semantic colors and selected contrast. Use container widths for app interiors.
- Test portrait 320/360/390/430 CSS px, short-height and landscape, virtual keyboard, safe area, zoom, light/dark and reduced motion. Preserve desktop and tenant permission checks. On screenshot evidence, do not conclude all routes work just because the geometry audit passed.

## P1 — ten screenshot-based application bundles

| App / route | Observed problem | Target UX and components | Functional acceptance |
|---|---|---|---|
| Administration / /configuracion | Persistent category sidebar with desktop-sized content | Android-style settings category list then section screen, search, shared list row and Back | Open all authorized categories; search returns matching settings; save/persist existing preferences and verify after reload; keep denied actions denied |
| Sales / /ventas | Order and quote list/detail side by side; compact item table | Tabs, search and full-width list cards; separate detail and action bar | Switch orders/quotes, search, open detail, Back preserves selection/filter; create quote and validate existing item totals against source (screenshot shows line amounts zero but a nonzero grand total; investigate, do not silently change calculations) |
| Purchasing / /compras/solicitudes | Fixed request list and details squeezed together | Status chips, list first, detail page and sticky permitted actions | Filter and open requests; validate actual status counts; submit/approve/reject only as authorized; cancel leaves data intact; linked order navigation |
| Inventory / /inventario/productos | Visible overlapping text/price/status in list; side-by-side details | Full-width product cards with separate name, SKU, price, status; searchable category filter; separate detail | Search/filter/select/edit; verify card has no overlap at 200% zoom and 320px; preserve SKU, stock, cost and margin; confirm delete safely |
| POS / /pos | Four-column catalog, ticket below long page, cramped touch actions | Two-column catalog when space permits, one at narrow width; horizontal category chips; accessible ticket bottom sheet and sticky cart summary | Add/remove items, quantities, customer, discount, note, total, payment and receipt; prevent duplicate charges; demo/test tenant only; do not claim external payment integrations tested |
| CRM / /crm | Multiple header levels, compressed KPIs | Compact tabs, adaptive KPI grid, vertical pipeline, lead and activity cards | Filter by stage, open lead, create activity, move through existing allowed stages; counts and links match data |
| Projects / /proyectos | Portfolio list and detail share screen; tiny cards and text | Portfolio list → detail, progress and budget cards, team/task sections | Select project, Back retains filters; create/edit task and record hours; verify progress/cost reflect existing APIs |
| Production / /produccion | Desktop grid and small order/cost panels | Compact overview, order cards, separate BOM and center screens | Open order, register allowed operation/consumption/output and verify quantities, costs and status; no production stock mutation in QA |
| Marketing / /marketing | Desktop multi-column campaign table and funnel | KPI pairs, campaign cards, vertical funnel, ROAS and upcoming actions | Switch sections; create/edit demo campaign and event; verify attribution and ROI use existing data and formulas |
| Finance / /finanzas/cuentas-por-pagar | Compressed table extends beyond visible area | KPI pairs, invoice cards, separate detail, payment dialog | Search by supplier/invoice, inspect balance/due date, register invoice/payment in test data, confirm outstanding amount and no duplicate submit |

## P2 — remaining applications

Calendar, Tasks, Messages, Approvals, Directory, Fiscal, HR and Reports inherit P0 and need their own functional mobile validation. Directory is a placeholder; any implementation requires authorized tenant-scoped backend data. Messenger demo is not evidence of live messaging. Fiscal and payment tests must not send real documents or payments.

## Definition of done

Each bundle: inspect actual route and component tree; implement small reviewed PR; run isolated demo/test tenant workflows and responsive browser screenshots; check keyboard/focus, empty/loading/error/retry, permissions, state persistence, dark/light, no clipped/overlapping controls. Verify source and deployed SHA and owner physical-device review. Record actual tests and blockers. Keep mobile-specific styles scoped so desktop layout is unchanged. The roadmap is not a claim of implementation or production certification.
