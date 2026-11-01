import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('Cloudflare Workers static assets is the only configured Cloudflare release target', () => {
  for (const path of [
    '.github/workflows/cloudflare-pages-deploy.yml',
    '.github/workflows/cloudflare-pages-release.yml',
  ]) {
    assert.equal(existsSync(new URL('../' + path, import.meta.url)), false,
      'Obsolete Pages publishing workflow must not remain active: ' + path);
  }
  const config = read('wrangler.toml');
  const api = read('apps/web/src/api.js');
  assert.match(config, /^name = "business-os"$/m);
  assert.match(config, /^\[assets\]$/m);
  assert.match(config, /^directory = "\.\/apps\/web\/dist"$/m);
  assert.match(config, /^not_found_handling = "single-page-application"$/m);
  assert.doesNotMatch(config, /pages_build_output_dir|\[build\]/);
  assert.match(api, /import\.meta\.env\.VITE_API_URL/);
});

test('Cloudflare static response headers preserve security posture', () => {
  const headers = read('apps/web/public/_headers');
  for (const key of ['Content-Security-Policy', 'X-Frame-Options', 'Strict-Transport-Security', 'Permissions-Policy', 'Referrer-Policy']) {
    assert.ok(headers.includes(key), key + ' is required');
  }
  assert.match(headers, /\/assets\/\*\n  Cache-Control: public, max-age=31536000, immutable/);
  assert.match(headers, /\/sw\.js\n  Cache-Control: no-cache, no-store, must-revalidate/);
});
