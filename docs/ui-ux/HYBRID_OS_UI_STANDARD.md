# Business OS — Hybrid UI standard (2026-11-25)

Calendar is the reference implementation for the approved interaction and visual polish. Apply the same shared patterns to Workspace OS (desktop/tablet) and Pocket OS (smartphone), not the same literal screen layout. Windows-style clarity, macOS-style visual restraint and Material-inspired elevation are adapted to the product, not copied.

## Required rules

- All application windows use shared neutral graphite chrome with no colored top stripe. Preserve minimize/maximize/close, snapping, dock clearance and mobile full-surface behavior.
- Use shared React components and CSS Modules. Centralize tokens in the foundation, do not create a new global theme or another notification provider. Reuse existing KPI, table, list/detail and form patterns.
- Elevation roles 0–5: desktop, panel, window, dialog, anchored popup/toast, critical decision. See OS_ELEVATION_SYSTEM.md. Visual elevation is distinct from stacking/focus ownership; native modal dialogs use the top layer.
- Controls: standard 44px height, 12px field insets, 8px icon gap, 10px radius; compact desktop variants only where justified. Keep labels readable, icons separated from edges and text wrapping inside its pane.
- Selected filters, tabs, date/time selections use graphite #292C31 and white in light mode; light neutral #E5E7EB with dark foreground in dark mode. Hover must not overwrite selected fill or foreground. Summary filter hover uses an outline only.
- Popup surface #FCFBF8, header #F7F6F3, border #E3E5EA, hover #E8E8E5; theme-aware alternatives in dark mode. Reuse BusinessSelect for new controlled single-selects; searchable long lists, visible selection, Escape, focus restoration and no clipping. Do not blindly replace native select where multiple values, form serialization, browser validation, optgroups or other native behavior are required.
- Main form action lime #CFE84F with dark text; secondary actions neutral, destructive red, completed green. Keep save/cancel separate from state-changing actions. Avoid double submissions; show busy states. Preserve meaning of existing module event/status colors.
- Separate navigation, actions, view switches and search. Center period titles between symmetric arrows; use container widths instead of only viewport breakpoints. Summary counts drill down into matching records; ensure the counts and results use the same data and period. Show clear filter and empty states.
- List cards use title, date/time and metadata on separate wrapping rows, compact borders, no overflowing pills. Show status only when supported by data; preserve links and permissions.
- Use es-MX formatting; standalone date headings capitalize only the initial letter (Noviembre de 2026), not every word. Preserve date values, timezone and arithmetic.
- Use the app-wide ToastProvider/useNotify for transient feedback: centered in viewport, semantic green/red/amber/gray-blue, icon, short text, progress and dismiss. Errors default persistent; hover/focus pause. Keep contextual form errors inline with StatusMessage or FeedbackMessage. Do not hide critical validation behind modal layers.
- Use await confirm()/prompt() from useNotify instead of window.confirm/window.prompt; preserve explicit decision, cancel default, focus, error handling and existing API/permission checks. Do not override browser globals. Browser permission prompts cannot be restyled. Keep business notification center separate from transient feedback.
- Preserve actual data and API contracts, role/tenant isolation, loading, empty, failure and retry states; do not invent working functionality in demo. Responsive QA at 320, 360, 390, 430, 1024, 1440 and 1920px; also test short-height, resized, snapped and maximized windows, portrait/landscape, light/dark, keyboard, screen readers, reduced motion, forced colors and 200% zoom.

## Rollout

Shared tokens and component changes affect consumers automatically; legacy module-local styling, native selects, old page copies and inline banners still require explicit migration and browser QA. Do not declare all applications complete based on shared CSS alone. Keep module-specific workflows and data intact.

Apply to Calendar, Tasks, Messages, Approvals, Directory, Settings, Sales, Procurement, Inventory, POS, CRM, Projects, Production, Marketing, Finance, Invoicing, HR and Reports, as well as future modules. Notification Center remains a system surface, not another app window. Each PR must identify migrated paths, checks by SHA, unresolved regressions and live verification status.

## Acceptance

No unintended horizontal overflow, invisible text on hover, clipped popups or inaccessible action. Preserve selected state on hover. Verify cancel does not mutate data. Check full create/edit/delete lifecycle in an isolated demo or test tenant. No production mutations for QA. Follow AGENTS.md and require owner review.

## Fold Safe Zone (mandatory)
All current and future modules must follow [Foldable Adaptive Contract](./FOLDABLE_ADAPTIVE_CONTRACT.md): essential text, interactive controls, cards, widgets, dock/topbar items, dialogs and notifications stay outside each confirmed crease/hinge on unfolded devices. Centered notifications remain the default on normal screens; in fold mode center within the active safe pane, preserving the same provider and focus behavior. Backgrounds may span. No assumed hardware detection from aspect ratio. Validate on real hardware before claiming support.

## Pocket Home and Apps separation

Pocket Home is a widget-only dashboard: greeting, company/date, metrics, control center, recent activity, upcoming deadlines and personalization. No app catalog or separate app shortcut grid on Home. The centered Apps dock action opens the full existing library with system utilities and enabled business apps, categories, search, favorites and recents. Keep route/API permissions and the desktop workspace unchanged.
