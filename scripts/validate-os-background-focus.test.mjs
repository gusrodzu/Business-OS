import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../apps/web/src/layout/os/OSWindowStage.jsx',import.meta.url),'utf8');
test('background window receives focus even when its first click targets a button',()=>{
 assert.match(source,/onPointerDown=\{\(\)=>\{if\(!selected&&!hidden\)onFocus\(window\.key\);\}\}/);
 assert.doesNotMatch(source,/!event\.target\.closest\('button'\)\)onFocus/);
});
test('hidden windows cannot be focused by pointer',()=>{
 assert.match(source,/!selected&&!hidden/);
});

test('keyboard focus entering a background window activates it without activating hidden windows',()=>{
 assert.match(source,/onFocusCapture=\{\(\)=>\{if\(!selected&&!hidden\)onFocus\(window\.key\);\}\}/);
});
