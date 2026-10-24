import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const owners = source('.github/CODEOWNERS');
const policy = source('.github/SECURITY.md');
const checklist = source('docs/security/operational-controls-checklist-2026-10-24.md');
assert.match(owners, /^\* @gusrodzu$/m, 'CODEOWNERS must define default owner');
assert.match(owners, /^\/apps\/api\/ @gusrodzu$/m, 'Backend must have designated reviewer');
assert.match(owners, /^\/\.github\/ @gusrodzu$/m, 'CI security settings need reviewer');
assert.ok(policy.includes('Report a vulnerability'), 'Private vulnerability reporting instructions required');
assert.ok(!policy.includes('@gmail.com'), 'Do not expose personal mailboxes in security policy');

for (const name of [
  'frontend-qa.yml',
  'dependency-security.yml',
  'erp-backend-integration.yml',
  'prisma-database-smoke.yml',
  'motornorte-transactional-qa.yml',
]) {
  const yaml = source('.github/workflows/' + name);
  assert.match(yaml, /^permissions:\n  contents: read$/m, name + ' must use read-only repository permissions');
  assert.ok(yaml.includes('pull_request:'), name + ' must validate PRs');
}
assert.ok(checklist.includes('Settings → Rules → Rulesets'), 'Branch rules setup must be documented');
assert.ok(checklist.includes('Secret scanning'), 'Secret scanning setup must be documented');
console.log('PASS · CODEOWNERS, responsible disclosure, read-only workflow permissions and operational checklist');
