import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const script = 'scripts/runtime-tenant-isolation-v15.0.3.mjs';
const safeBase = { ...process.env, NODE_ENV: 'test', API_URL: 'http://127.0.0.1:4000/api', DATABASE_URL: 'postgresql://qa:qa@127.0.0.1:5432/qa' };

for (const [name, overrides] of [
  ['missing explicit opt-in', {TENANT_QA_ISOLATED: ''}],
  ['production mode', {TENANT_QA_ISOLATED: '1', NODE_ENV: 'production'}],
  ['remote API', {TENANT_QA_ISOLATED: '1', API_URL: 'https://example.invalid/api'}],
  ['remote database', {TENANT_QA_ISOLATED: '1', DATABASE_URL: 'postgresql://qa:qa@example.invalid:5432/qa'}],
  ['missing database target', {TENANT_QA_ISOLATED: '1', DATABASE_URL: ''}],
]) {
  test(`tenant QA rejects ${name} before runtime access`, () => {
    const result = spawnSync(process.execPath, [script], {env: {...safeBase, ...overrides}, encoding: 'utf8', timeout: 10000});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Tenant isolation runtime QA requires/);
    assert.doesNotMatch(result.stdout, /Tenant login|PASS  |FAIL  /);
  });
}
