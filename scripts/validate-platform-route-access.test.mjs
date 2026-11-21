import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isPlatformRoute} from '../apps/web/src/auth/platformRouteAccess.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('platform-only pages remain in a single navigation context', () => {
  for (const path of ['/admin-saas', '/admin-saas/', '/platform-entry', '/agent-office', '/agent-office/']) {
    assert.equal(isPlatformRoute(path), true, path);
  }
});

test('business module and similar prefix routes are not treated as platform', () => {
  for (const path of ['/', '/recursos-humanos', '/ventas', '/administracion',
    '/admin-saas-demo', '/platform-entry-extra', '/agent-office-public', '', null, undefined]) {
    assert.equal(isPlatformRoute(path), false, String(path));
  }
});

test('ProtectedRoute applies the same guard to platform and ERP sessions', () => {
  const guard = read('apps/web/src/auth/ProtectedRoute.jsx');
  const app = read('apps/web/src/App.jsx');
  const office = read('apps/web/src/modules/platform/ui/pages/AgentOffice.jsx');
  assert.match(guard, /isPlatformRoute\(location\.pathname\)/);
  assert.match(guard, /if \(platformSession && !adminTarget\)/);
  assert.match(guard, /if \(!platformSession && adminTarget\)/);
  assert.match(app, /<Route element=\{<ProtectedRoute\s*\/?>\}/);
  assert.match(office, /platformSession&&user\?\.permissions\?\.includes\('platform.manage'\)/);
});
