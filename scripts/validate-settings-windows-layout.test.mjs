import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const jsx=readFileSync(new URL('../apps/web/src/modules/settings/ui/pages/SettingsHome.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../apps/web/src/modules/settings/ui/pages/SettingsHome.module.css',import.meta.url),'utf8');

test('six settings categories keep the same OS navigation shell',()=>{
  for(const category of ['system','personal','account','company','apps','security']){
    assert.match(jsx,new RegExp("id:'"+category+"'"));
  }
  assert.match(jsx,/aria-current=\{activeCategory===id\?'page':undefined\}/);
  assert.match(jsx,/settingsCategoryHero/);
  assert.match(css,/\.settingsCategoryHero\{/);
  assert.match(css,/\.settingsCategoryHero\+\.rows/);
});

test('personalization has real theme and wallpaper actions and accessible selection',()=>{
  assert.match(jsx,/applyAppearance\?\.\(theme\.id\)/);
  assert.match(jsx,/applyWallpaper\?\.\(\{kind:'preset',id:item\.id\}\)/);
  assert.match(jsx,/aria-pressed=\{appearance===theme\.id\}/);
  assert.match(jsx,/aria-pressed=\{wallpaper\?\.kind==='preset'&&wallpaper\.id===item\.id\}/);
  assert.match(jsx,/wallpaperBackground\(wallpaper\)/);
  assert.match(jsx,/setPersonalSection\(null\)/);
});

test('settings retain keyboard focus, responsive layouts and reduced-motion support',()=>{
  assert.match(css,/\.winSettingsRow:focus-visible/);
  assert.match(css,/\.winThemeTile:focus-visible/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(jsx,/role="alert"/);
});

test('settings routes remain linked to implemented modules',()=>{
  for(const route of ['/configuracion/actividad','/configuracion/preferencias','/configuracion/perfil','/configuracion/usuarios','/configuracion/empresa','/configuracion/modulos','/configuracion/facturacion']){
    assert.ok(jsx.includes(route),route);
  }
});
