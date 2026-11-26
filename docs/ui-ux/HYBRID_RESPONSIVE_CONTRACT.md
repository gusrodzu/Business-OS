# Business OS Hybrid Responsive Contract

All existing and future applications use Workspace OS shared React components and CSS Modules. macOS informs window lifecycle and dock; Fluent informs enterprise navigation and controls; Android Material informs touch interaction. Preserve native app identities, semantic states, themes, permissions and tenant isolation.

## Acceptance matrix (CSS pixels, actual content width)

320, 360, 390, 599, 600, 768, 899, 900, 1199, 1200, 1440. Test at short heights, 200% zoom, floating, maximized, snapped and mobile orientations. These are test targets, not a requirement to use identical breakpoints in every component.

- Use named container queries for component layouts; viewport queries only for device shell and safe areas.
- No document-level horizontal overflow; tables, timelines and calendars may scroll locally with keyboard access.
- Keep navigation, search, selection, form actions and critical transaction controls reachable. Preserve state across resize.
- Shared KPI cards, form sections, filters and tables; avoid duplicated chrome. Use theme tokens and semantic status colors.
- Target WCAG 2.2 AA; 44 CSS pixel touch targets where feasible; keyboard focus, accessible names, reduced motion.
- Never create fake data or decorative controls; respect API permissions and tenant isolation.
- Notifications remain a system service, not an independent app.

## Release gate

Inventory routes, check each module in desktop/tablet/Pocket OS, run CI and functional smoke tests, record screenshots and defects. Do not mark a module 100% responsive until verified. Specialized POS, Messenger and Calendar layouts must retain their functional behavior.

## Passport and foldable release gate
The [Foldable Adaptive Contract](./FOLDABLE_ADAPTIVE_CONTRACT.md) is mandatory for existing and future modules. Include near-square, wide and short touch viewports in QA; validate both orientations, keyboard, local scroll, selection and editor continuity. Passport is a geometry profile, not a new shell or a brand-specific mode. Two-pane layouts must fit their real container; do not force a split based on screen aspect ratio alone.
