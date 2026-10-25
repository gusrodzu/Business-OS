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
assert.equal(config.appName, 'Business OS');
assert.ok(!config.server?.url, 'Native app must bundle its own UI, never point to an arbitrary remote URL');
assert.equal(config.android.allowMixedContent, false, 'Native HTTP mixed content cannot be enabled');
for (const dependency of ['@capacitor/core','@capacitor/android','@capacitor/ios']) {
  assert.match(mobile.dependencies[dependency] || '', /^\^8\./, `${dependency} must match Capacitor 8`);
}
assert.match(mobile.devDependencies['@capacitor/cli'] || '', /^\^8\./);
assert.equal(manifest.id, '/');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.scope, '/');
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
console.log('Business OS Mobile: PWA manifest + Android/iOS config + offline public-shell policy PASS');
console.log('NOTE: Android/iOS native project generation, code signing, store review, native login and device tests still required.');
