# Cross-app hybrid UI audit — 2026-11-25

Basis: current modular route registries and the 18 principal routed JSX pages on main, compared with HYBRID_OS_UI_STANDARD.md. This is a source inventory, not rendered browser certification. Counts are literal JSX occurrences, exclude imported child components, and are not a completeness percentage. Native required/form controls must retain validation/serialization on migration.

| App | Principal module page (under modules/) | Native select | Native date/time | Next work |
|---|---|---:|---:|---|
| Calendar | core/ui/pages/Agenda.jsx | 0 | 0 | Reference; 3 BusinessSelect controls, status toasts; runtime QA |
| Tasks | operations/ui/pages/TaskCenter.jsx | 0 | 0 | Existing summary filters; migrate feedback (this PR), verify selected hover/drawer |
| Messages | core/ui/pages/BusinessMessenger.jsx | 1 | 0 | Presence selector; conversation layout; demo vs live service |
| Approvals | operations/ui/pages/Approvals.jsx | 0 | 0 | Feedback (this PR); verify company summary semantics before drill-down |
| Directory | core/ui/pages/SystemUtilityApp.jsx | 0 | 0 | Placeholder; implement authorized tenant-scoped directory, not fake contacts |
| Settings | settings/ui/pages/SettingsHome.jsx | 0 | 0 | Audit child panels and persistence |
| Sales | sales/ui/pages/SalesEnterprise.jsx | 0 | 0 | Legacy notices; child dialogs and all sales routes |
| Procurement | procurement/ui/pages/ProcurementCenter.jsx | 0 | 0 | Legacy notices; KPI scope and child routes |
| Inventory | inventory/ui/pages/Products.jsx | 0 | 0 | Catalog hooks/forms, balances, moves, warehouses |
| POS | pos/ui/pages/Pos.jsx | 4 | 0 | Checkout feedback, native selects and dialogs; transactional QA |
| CRM | crm/ui/pages/Crm.jsx | 0 | 0 | Legacy notices; lead hooks and forms |
| Projects | projects/ui/pages/Projects.jsx | 14 | 5 | Selects, date controls, KPI and modal actions |
| Production | production/ui/pages/Production.jsx | 15 | 3 | Selects, dates, KPI and order forms |
| Marketing | crm/ui/pages/Marketing.jsx | 10 | 7 | Selects, dates, KPI and campaign forms |
| Finance | finance/ui/pages/AccountsPayable.jsx | 4 | 3 | Selects, dates, payment dialogs; all finance subroutes |
| Fiscal | finance/ui/pages/Fiscal.jsx | 5 | 1 | Selects, date, fiscal feedback, preserve PAC boundary |
| HR | hr/ui/pages/HumanResources.jsx | 5 | 2 | Selects, date, employee forms and sensitive permissions |
| Reports | operations/ui/pages/Reports.jsx | 0 | 2 | Period controls, KPI and export states |
| Total | 18 principal pages | 54 | 23 | Additional subroutes and child components not counted |

Notification Center is a system surface. Do not reintroduce an app window. Legacy files under src/pages also contain native decisions; determine reachability before migrating or deleting. Shared design tokens already landed via #906. #907 merged, but its recorded Frontend QA, Smartphone Browser Review and ERP Route Render Sweep failed; verify current SHA before release.

## Execution queue
1. Stabilize shared shell, CI, dock and modal/popup ownership. No bypassing checks.
2. Productivity: Tasks, Approvals, Messages, Directory, Settings. Directory and live messaging require functional scope, permissions and backend review.
3. Operations: Sales, Procurement, Inventory, POS, CRM. Check transaction and cancellation paths.
4. Forms-heavy: Projects, Production, Marketing, Finance, Fiscal, HR, Reports. Extract shared date/time picker only after testing value semantics, keyboard, timezone and required fields; migrate controlled selects case by case.
5. Per app, record subroutes, components, fixtures and screenshots. Verify the standard at 320/360/390/430 and desktop/tablet, including window resizing, modal ownership, theme, keyboard, selected/hover contrast, notifications, real errors, count/drill-down equivalence and permissions. No live data writes in QA. Mark complete only after runtime verification.

## This PR
Tasks and Approvals now use useNotify for successful decisions and StatusMessage for persistent errors. Tasks retains its existing load retry and puts decision errors in its drawer. Existing API requests, filters and comment handling are unchanged. No new backend or schema. Other entries remain pending. Browser tests and CI not executed in this audit.
