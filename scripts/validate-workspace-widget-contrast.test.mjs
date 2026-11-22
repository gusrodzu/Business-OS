import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../apps/web/src/modules/core/ui/pages/WorkspaceWidgetBoard.module.css',import.meta.url),'utf8');

test('wallpaper preview caption has an opaque dark contrast surface',()=>{
  assert.match(css,/\.panel \.previewOverlay\s*\{[^}]*color:#fff;[^}]*background:#142238;/s);
});

test('dark widget mode retains readable labels and navigation actions',()=>{
  for(const selector of ['.metric span','.wallpaperHint','.textAction','.activityRow']){
    assert.ok(css.includes(":global([data-theme='dark']) .panel "+selector),selector);
  }
  assert.match(css,/color:#e9effa;/);
});

// The route auditor samples the wallpaper preview button itself, not just
// its nested caption. Keep the button's inherited foreground readable too.
test('wallpaper preview button foreground contrasts with its opaque fallback',()=>{
  const rule=css.match(/\\.wallpaperPreview\\s*\\{([^}]*)\\}/)?.[1];
  assert.ok(rule,'wallpaper preview rule exists');
  assert.match(rule,/background-color:#19243b;/);
  assert.match(rule,/color:#fff;/);
});
