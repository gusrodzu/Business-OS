import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const config = JSON.parse(read('mobile/capacitor.config.json'));
const mobile = JSON.parse(read('mobile/package.json'));
const manifest = JSON.parse(read('apps/web/public/manifest.webmanifest'));
const html = read('apps/web/index.html');
const sw = read('apps/web/public/sw.js');
const web = JSON.parse(read('apps/web/package.json'));
const rootPackage = JSON.parse(read('package.json'));

assert.equal(config.webDir, '../apps/web/dist', 'Capacitor must use Vite bundle');
assert.match(config.appId, /^([a-z][a-z0-9_]*\.)+[a-z][a-z0-9_]*$/i);
assert.equal(config.appName, 'HaibuOS');
assert.ok(!config.server?.url, 'Native app must bundle its own UI, never point to an arbitrary remote URL');
assert.equal(config.android.allowMixedContent, false, 'Native HTTP mixed content cannot be enabled');
for (const dependency of ['@capacitor/core','@capacitor/android','@capacitor/ios']) {
  assert.match(mobile.dependencies[dependency] || '', /^\^8\./, `${dependency} must match Capacitor 8`);
}
assert.match(mobile.devDependencies['@capacitor/cli'] || '', /^\^8\./);
assert.equal(manifest.id, '/');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.scope, '/');

assert.equal(manifest.start_url, '/', 'Pocket OS must launch inside its own application scope');
assert.equal(manifest.background_color, '#11151c', 'Android launch background matches Pocket OS wallpaper canvas');
assert.ok(manifest.categories?.includes('business') && manifest.categories?.includes('productivity'));
assert.ok(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3,
  'Pocket OS needs app shortcuts in Android long-press launcher');
const shortcutUrls = new Set();
for (const shortcut of manifest.shortcuts) {
  assert.ok(shortcut.name && shortcut.url, 'Each Android shortcut needs a label and URL');
  const resolved = new URL(shortcut.url, 'https://pocket-os.invalid');
  assert.equal(resolved.origin, 'https://pocket-os.invalid', 'No external shortcut destination');
  assert.ok(resolved.pathname.startsWith('/') && !shortcutUrls.has(shortcut.url),
    'Android shortcuts must be unique same-app paths');
  shortcutUrls.add(shortcut.url);
}
assert.ok(shortcutUrls.has('/') && shortcutUrls.has('/ventas'));
const appBar = read('apps/web/src/layout/os/OSAppWindow.jsx');
const appBarStyles = read('apps/web/src/layout/AppShell.module.css');
const dock = read('apps/web/src/layout/os/OSDock.jsx');
const dockStyles = read('apps/web/src/layout/os/OSDock.module.css');
assert.ok(appBar.includes('aria-label="Volver al escritorio de Pocket OS"'),
  'Pocket OS must provide accessible app-to-home navigation');
assert.ok(appBarStyles.includes(".shell[data-pocket-os='true'] .osWindowControls{display:none}"),
  'Phone app bar must not expose desktop maximize / close window controls');
assert.ok(dock.includes('aria-label="Dock de Pocket OS"'));
assert.ok(dockStyles.includes('.mobileDock') && dockStyles.includes('safe-area-inset-bottom'),
  'Pocket OS dock must respect gesture-navigation safe area');

for (const size of [192, 512]) {
  assert.ok(manifest.icons.some((icon) => icon.src === `/icons/icon-${size}.png` && icon.sizes === `${size}x${size}`));
}
assert.ok(html.includes('viewport-fit=cover'));
assert.ok(html.includes('rel="manifest"'));
assert.ok(html.includes('apple-touch-icon'));
assert.ok(web.scripts.prebuild.includes('generate-mobile-assets'));
assert.ok(web.scripts.predev.includes('generate-mobile-assets'));
assert.ok(rootPackage.scripts['mobile:verify'].includes('validate-mobile-foundation'));
assert.ok(sw.includes("url.pathname.startsWith('/api/')"), 'Service worker must bypass API requests');
assert.ok(sw.includes("url.pathname.startsWith('/assets/')"), 'Service worker may only cache hashed public JS/CSS');
assert.ok(!sw.includes("caches.open('api"), 'Never cache tenant API results');
assert.ok(read('apps/web/src/main.jsx').includes("serviceWorker.register('/sw.js')"));
assert.ok(fs.existsSync(path.join(root, 'scripts/generate-mobile-assets.mjs')));
console.log('HaibuOS Mobile: PWA manifest + Android/iOS config + offline public-shell policy PASS');
console.log('NOTE: Android/iOS native project generation, code signing, store review, native login and device tests still required.');
