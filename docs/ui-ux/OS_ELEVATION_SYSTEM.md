# Business OS — Elevation System

Material-inspired visual roles (not a literal Material elevation mapping). Shared values live in design-system/tokens/elevation.css; opt-in data-os-elevation roles are styled in os-elevation.css via the foundation entrypoint.

| Level | Purpose |
| --- | --- |
| 0 | Desktop and base surfaces |
| 1 | Subtle cards and panels (opt-in) |
| 2 | App windows; focused desktop slots have stronger shadows; full-screen/mobile windows remain flat |
| 3 | Modal forms and shared Dialog surfaces |
| 4 | Anchored pickers, snap menus and contextual popups |
| 5 | Critical confirmation surfaces (reserved; adopt per component) |

Visual depth does not set global z-index. Keep the existing window manager's order, stage boundaries and dock. Native modal dialogs belong to the browser top layer; nested popups must be hosted inside their owning dialog, above the panel, rather than attached to document.body outside it. Keep the parent modal's existing focus/cancel semantics. Do not use higher z-index values as a workaround for clipping. Use named local layer tokens for nested dialog/popup/critical layers.

Use theme surfaces, borders and shared shadows. Keep title bars neutral. Avoid a second global scrim for nonmodal field pickers. No new shadow on maximized or Pocket OS windows. Respect forced colors and reduced motion.

Initial rollout: OSAppWindow, desktop slots, shared Dialog, window snap menu and Calendar editor/pickers. Other legacy modal implementations, cards, notification center, menus and critical confirmations require individually verified migration; the tokens alone do not change their interaction behavior.

Acceptance: verify light/dark themes, floating/maximized/snapped windows, mobile portrait/landscape, nested popup clipping, Escape, focus restoration and pointer hit testing. Visual elevation and browser stacking are separate tests.
