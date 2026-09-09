import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const css = read('apps/web/src/design-system/styles/global-ui-v13.css');
const moduleSystem = read('apps/web/src/components/module-system/ModuleSystem.jsx');
const reports = read('apps/web/src/modules/operations/ui/pages/Reports.module.css');

const checks = [
  ['global table standard marker', css.includes('v13.0.5 — Global table overflow + text visibility standard')],
  ['global tables reset legacy min width', /table\{[\s\S]*?min-width:100%!important/.test(css)],
  ['table cells can wrap', css.includes('white-space:normal!important') && css.includes('overflow-wrap:anywhere')],
  ['table text is not ellipsized', css.includes('text-overflow:clip')],
  ['shared table scroller scrolls horizontally', css.includes('[data-bb-table-scroller]') && css.includes('overflow-x:auto!important')],
  ['wide mobile tables detected by column count', css.includes('table:has(thead th:nth-child(5))')],
  ['wide direct table cards can scroll', css.includes(':has(> table:has(thead th:nth-child(5)))')],
  ['DataTableFrame exposes stable table hooks', moduleSystem.includes('data-bb-table-frame') && moduleSystem.includes('data-bb-table-scroller')],
  ['reports table card can shrink', reports.includes('.tableCard{min-width:0;max-width:100%}')],
  ['reports cells wrap', reports.includes('.tableCard th,.tableCard td{white-space:normal;overflow-wrap:anywhere}')],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${name}`);
  if (!ok) failed += 1;
}
if (failed) {
  console.error(`\nTable standard v13.0.5 FAILED · ${failed}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nTable standard v13.0.5 OK · ${checks.length} checks passed.`);
