import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

const source = readFileSync(new URL('../apps/web/src/layout/workspace-os/WorkspaceOSDock.jsx', import.meta.url), 'utf8');

test('Apps launcher is the first interactive dock item, before Home and module links', () => {
  const dock = source.slice(source.indexOf('<nav className={styles.dock}'));
  const apps = dock.indexOf('aria-label="Ver todas las aplicaciones"');
  const home = dock.indexOf('aria-label="Ir al escritorio"');
  const moduleLinks = dock.indexOf('{visible.map(');
  assert.ok(apps >= 0 && home >= 0 && moduleLinks >= 0, 'dock controls must exist');
  assert.ok(apps < home && home < moduleLinks, 'Apps must be first, then Home, then enabled modules');
});

test('Apps launcher keeps its accessible name and click action', () => {
  const dock = source.slice(source.indexOf('<nav className={styles.dock}'));
  const appsButton = dock.slice(dock.indexOf('<button'), dock.indexOf('</button>') + 9);
  assert.match(appsButton, /aria-label="Ver todas las aplicaciones"/);
  assert.match(appsButton, /onClick=\{onOpenApps\}/);
});
