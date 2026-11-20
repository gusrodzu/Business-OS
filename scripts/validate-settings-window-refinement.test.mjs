import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../apps/web/src/modules/settings/ui/pages/SettingsHome.module.css',import.meta.url),'utf8');
const jsx=readFileSync(new URL('../apps/web/src/modules/settings/ui/pages/SettingsHome.jsx',import.meta.url),'utf8');
test('Settings window has consistent navigation and card hierarchy',()=>{
 for(const selector of ['.osSettings .sidebar','.osSettings .navItem','.osSettings .search','.osSettings .settingsCategoryHero','.osSettings .settingsCategoryHero+.rows .row'])assert.ok(css.includes(selector),selector);
 for(const token of ['--settings-accent','--settings-divider','--settings-surface'])assert.ok(css.includes(token),token);
});
test('Settings adapts to narrow OS windows and reduced motion',()=>{
 assert.match(css,/@container os-window \(max-width:620px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test('Settings links and search remain functional',()=>{
 assert.match(jsx,/type="search" value=\{search\}/);
 assert.match(jsx,/categories\.map/);
 assert.match(jsx,/shown\.map/);
});
