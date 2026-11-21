import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const local = readFileSync(new URL('../docker-compose.yml', import.meta.url), 'utf8');
const production = readFileSync(new URL('../docker-compose.production.yml', import.meta.url), 'utf8');

function section(text, name) {
  const match = text.match(new RegExp('^  ' + name + ':\\s*\\n([\\s\\S]*?)(?=^  [a-zA-Z][\\w-]*:\\s*\\n|^volumes:\\s*$|^networks:\\s*$|\\s*$)', 'm'));
  assert.ok(match, 'missing service or network ' + name);
  return match[1];
}

test('local PostgreSQL host port stays loopback-only', () => {
  const db = section(local, 'postgres');
  assert.match(db, /^    ports:\s*$/m);
  assert.match(db, /^      - ["']?127\.0\.0\.1:5432:5432["']?\s*$/m);
  assert.doesNotMatch(db, /^      - ["']?(?:0\.0\.0\.0:)?5432:5432["']?\s*$/m);
});

test('production PostgreSQL has no published host port', () => {
  const db = section(production, 'postgres');
  assert.doesNotMatch(db, /^    ports:\s*$/m);
  assert.match(db, /^    networks:\s*\n      - db\s*$/m);
  assert.match(section(production, 'db'), /^    internal:\s*true\s*$/m);
});

test('production API is exposed to the proxy network, not published directly', () => {
  const api = section(production, 'api');
  assert.doesNotMatch(api, /^    ports:\s*$/m);
  assert.match(api, /^    expose:\s*\n      - ["']?4000["']?\s*$/m);
  assert.match(api, /^    networks:\s*\n      - app\s*\n      - db\s*$/m);
});
