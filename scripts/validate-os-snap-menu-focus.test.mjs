import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../apps/web/src/layout/os/OSAppWindow.jsx',import.meta.url),'utf8');

test('Escape returns keyboard focus to the Snap Layouts trigger',()=>{
  const focus="snapTriggerRef.current?.focus()";
  assert.ok(source.split(focus).length-1>=2,'Both Escape paths must restore focus');
  assert.match(source,/function escape\(event\)\{if\(event\.key==='Escape'\)\{setLayoutsOpen\(false\);/);
  assert.match(source,/onKeyDown=\{event=>\{if\(event\.key==='Escape'\)/);
});

test('Snap Layouts trigger advertises expanded state and menu labels',()=>{
  assert.match(source,/aria-haspopup=\{onSnap\?'true':undefined\}/);
  assert.match(source,/aria-expanded=\{onSnap\?layoutsOpen:undefined\}/);
  assert.match(source,/role="group" aria-label="Organizar ventanas"/);
});

test('portaled Snap Layouts menu moves focus inside on keyboard opening',()=>{
  assert.match(source,/document\.activeElement===snapTriggerRef\.current/);
  assert.match(source,/snapMenuRef\.current\?\.querySelector\('button'\)\?\.focus\(\)/);
});
