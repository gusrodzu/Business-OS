import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../apps/web/src/layout/os/OSAppWindow.jsx',import.meta.url),'utf8');

test('Snap Layouts supports keyboard grid navigation',()=>{
  assert.match(source,/\['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'\]\.includes\(event\.key\)/);
  assert.match(source,/const columns=3/);
  assert.match(source,/buttons\[next\]\?\.focus\(\)/);
  assert.match(source,/event\.preventDefault\(\)/);
});

test('Snap Layouts keeps escape focus restoration',()=>{
  assert.match(source,/event\.key==='Escape'\)\{event\.preventDefault\(\);setLayoutsOpen\(false\);snapTriggerRef\.current\?\.focus\(\)/);
});
