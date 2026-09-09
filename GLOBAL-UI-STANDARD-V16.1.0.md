# BuzzBee v16.1.0 — Global UI Standardization

BuzzBee now has one canonical visual contract loaded after the MD3 foundation. The objective is predictable density, hierarchy and spacing across ERP, Demo LIVE and Platform Admin.

## Canonical measurements
- Controls: 32 / 40 / 48 px (small / standard / large)
- Inputs and selects: 40 px standard
- Textarea: 96 px minimum
- Table header: 44 px
- Table row: 48 px target
- Card padding: 20 px
- Page/section rhythm: 24 px
- Form field gap: 16 px
- Dialog padding: 24 px

## Typography
- H1: 32 px / 700
- H2: 28 px / 700
- H3: 24 px / 700
- H4: 20 px / 600
- Section: 18 px / 600
- Card title: 16 px / 600
- Body: 14 px / 400
- Body small: 13 px / 400
- Caption/label: 12 px
- KPI value: 28 px / 700

## CSS authority
Runtime no longer imports `module-global.css` or `modal-format-v9.4.css`. They remain only as legacy QA/reference artifacts so older validators do not lose historical context. `global-standard.css` is loaded last and is the final compatibility/canonical layer.

## Components
Button, Input, Select, Switch, Checkbox, Textarea, Card, KPI, Chip, Badge, Tabs, DataTable, Dialog, Drawer and Snackbar use or inherit the shared token contract.

## Rule for new work
Do not introduce arbitrary dimensions when a design-system token exists. Prefer shared components over local button/input/table implementations.
