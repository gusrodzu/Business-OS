import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('Cloudflare Pages is an explicitly gated frontend-only release', () => {
  assert.equal(existsSync(new URL('../.github/workflows/cloudflare-pages-deploy.yml', import.meta.url)), false, 'Do not allow a second Pages publish workflow to bypass the gated release');
  const config = read('wrangler.toml');
  const workflow = read('.github/workflows/cloudflare-pages-release.yml');
  const api = read('apps/web/src/api.js');
  assert.match(config, /^name = "business-os"$/m);
  assert.match(config, /^pages_build_output_dir = "\.\/apps\/web\/dist"$/m);
  assert.match(workflow, /^  workflow_dispatch:$/m);
  assert.doesNotMatch(workflow, /^  (push|pull_request|schedule):$/m);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main' && inputs\.confirm_publish == true/);
  assert.match(workflow, /EXPECTED_SHA" != "\$GITHUB_SHA"/);
  assert.match(workflow, /secrets\.CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /secrets\.CLOUDFLARE_ACCOUNT_ID/);
  assert.match(workflow, /vars\.BUSINESS_OS_API_URL/);
  assert.match(workflow, /npm run release:final/);
  assert.match(workflow, /npm run security:regressions/);
  assert.match(workflow, /pages deploy apps\/web\/dist --project-name=business-os --branch=main/);
  assert.match(api, /import\.meta\.env\.VITE_API_URL/);
});

test('Cloudflare static response headers preserve Vercel security posture', () => {
  const headers = read('apps/web/public/_headers');
  for (const key of ['Content-Security-Policy', 'X-Frame-Options', 'Strict-Transport-Security', 'Permissions-Policy', 'Referrer-Policy']) {
    assert.ok(headers.includes(key), key + ' is required');
  }
  assert.match(headers, /\/assets\/\*\n  Cache-Control: public, max-age=31536000, immutable/);
  assert.match(headers, /\/sw\.js\n  Cache-Control: no-cache, no-store, must-revalidate/);
});
