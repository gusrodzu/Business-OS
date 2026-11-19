import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../apps/web/src/',import.meta.url);
const foundation=readFileSync(new URL('design-system/styles/workspace-hybrid-global.css',root),'utf8');
const settings=readFileSync(new URL('modules/settings/ui/pages/SettingsHome.module.css',root),'utf8');
const preferences=readFileSync(new URL('modules/settings/ui/pages/Preferences.jsx',root),'utf8');

test('settings surfaces inherit shared hybrid semantic tokens',()=>{
  for(const token of ['--workspace-settings-surface','--workspace-settings-canvas','--workspace-settings-border','--workspace-settings-accent']){
    assert.ok(foundation.includes(token),token);
  }
  assert.match(settings,/--settings-accent:var\(--workspace-settings-accent/);
  assert.match(settings,/\.settingsCategoryHero\+\.rows \.row/);
});

test('reading preference changes actual OS application surfaces',()=>{
  assert.match(preferences,/dataset\.osTextSize/);
  assert.match(foundation,/data-os-text-size='large'/);
  assert.match(foundation,/data-os-application-window='true'/);
});

test('hybrid OS retains focus and motion contracts',()=>{
  assert.match(foundation,/:focus-visible/);
  assert.match(foundation,/prefers-reduced-motion: reduce/);
  assert.match(foundation,/--workspace-touch-target: 44px/);
});
