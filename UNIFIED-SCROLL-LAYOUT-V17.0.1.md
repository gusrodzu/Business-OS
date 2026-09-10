# BuzzBee ERP v17.0.1 — Unified Scroll Layout

BuzzBee now has one canonical vertical page scroll owner: `AppShell.content`.

## Rules
- Module page/root wrappers may not define their own vertical viewport.
- Tables and kanban boards may scroll horizontally only.
- Drawers, dialogs and intentionally bounded activity/list panels may keep local scroll.
- Sidebar and Workspace Tools remain independent regions.
- The page scrollbar is visually subtle and consistent across modules.

## QA
Run `npm run qa:unified-scroll`.
