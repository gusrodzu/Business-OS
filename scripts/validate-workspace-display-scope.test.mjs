import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const prefs=readFileSync(new URL('../apps/web/src/modules/settings/ui/pages/Preferences.jsx',import.meta.url),'utf8');
const dock=readFileSync(new URL('../apps/web/src/layout/os/OSDock.jsx',import.meta.url),'utf8');
test('display preferences use user and tenant scoped key',()=>{
  assert.match(prefs,/String\(user\?\.id\|\|'guest'\)/);
  assert.match(prefs,/user\?\.companyId/);
  assert.match(prefs,/business-os-display:/);
  assert.match(dock,/business-os-display:/);
});
test('hydration applies saved preferences only after scope resolution',()=>{
  assert.match(prefs,/displayState\.scope===scope/);
  assert.match(prefs,/displayState\.scope!==scope/);
  assert.match(prefs,/setDisplayState\(next\)/);
  assert.match(prefs,/dataset\.osDockSize=next\.dock/);
  assert.match(prefs,/dataset\.osTextSize=next\.text/);
});
test('browser-only preferences show feedback on persistence failure',()=>{
  assert.match(prefs,/No se pudo guardar esta preferencia en el navegador/);
  assert.match(prefs,/Preferencia de este navegador guardada/);
});
