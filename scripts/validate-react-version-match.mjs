import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=(relative)=>JSON.parse(readFileSync(path.join(root,relative),'utf8'));
const pkg=json('apps/web/package.json');
const lock=json('package-lock.json');
const react=pkg.dependencies.react;
const dom=pkg.dependencies['react-dom'];

assert.equal(react,dom,'react and react-dom declarations must be identical exact versions');
assert.match(react,/^\d+\.\d+\.\d+$/,'React must be pinned to an exact version');
assert.equal(lock.packages['apps/web'].dependencies.react,react,'Lockfile React declaration mismatch');
assert.equal(lock.packages['apps/web'].dependencies['react-dom'],dom,'Lockfile renderer declaration mismatch');
assert.equal(lock.packages['node_modules/react'].version,react,'Lockfile React package mismatch');
assert.equal(lock.packages['node_modules/react-dom'].version,dom,'Lockfile React DOM package mismatch');
const scheduler=lock.packages['node_modules/scheduler'].version;
assert.ok(scheduler.startsWith('0.28.'),'React DOM 19.3.x requires scheduler 0.28.x');
assert.equal(lock.packages['node_modules/react-dom'].dependencies.scheduler,'^0.28.0');
assert.equal(lock.packages['node_modules/react-dom'].peerDependencies.react,'^19.3.1');

// Validate real npm ci output as well as package metadata when node_modules exist.
const req=createRequire(path.join(root,'apps/web/package.json'));
let installedReact;
try {
  installedReact=req('react/package.json').version;
} catch (error) {
  if(error.code!=='MODULE_NOT_FOUND')throw error;
}
if(installedReact){
  const installedDom=req('react-dom/package.json').version;
  assert.equal(installedReact,react,'Installed React differs from lockfile');
  assert.equal(installedDom,dom,'Installed React DOM differs from React');
  console.log('PASS · Installed React and React DOM match: '+react);
}
console.log('PASS · React runtime and renderer versions match: '+react);
