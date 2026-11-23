import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../apps/web/src/modules/core/ui/pages/WorkspaceWidgetBoard.module.css',import.meta.url),'utf8');
const luminance=(hex)=>{
  const channels=hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255);
  const linear=channels.map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
  return linear[0]*0.2126+linear[1]*0.7152+linear[2]*0.0722;
};
const contrast=(a,b)=>{
  const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);
  return (values[0]+0.05)/(values[1]+0.05);
};

test('wallpaper and activity widgets have opaque dark backgrounds with AA text contrast',()=>{
  const panelRule=css.match(/:global\(\[data-theme='dark'\]\) \.panel\[data-widget-id='wallpaper'\],[\s\S]*?\{([^}]*)\}/);
  assert.ok(panelRule,'Dark theme must explicitly cover wallpaper and activity widget panels');
  assert.match(panelRule[0],/data-widget-id='activity'/);
  const background=panelRule[1].match(/background:\s*(#[0-9a-f]{6})/i)?.[1];
  const foreground=panelRule[1].match(/color:\s*(#[0-9a-f]{6})/i)?.[1];
  assert.ok(background&&foreground,'Use opaque hex colors instead of transparent glass');
  assert.ok(contrast(foreground,background)>=4.5,'Widget text must meet WCAG AA 4.5:1');
  assert.match(css,/:global\(\[data-theme='dark'\]\) \.panel\[data-widget-id='wallpaper'\] \.wallpaperHint/);
  assert.match(css,/:global\(\[data-theme='dark'\]\) \.panel\[data-widget-id='activity'\] \.activityRow/);
});

// Regression from ERP Route Render Sweep (2026-11-23): the dark activity
// action rendered at 4.28:1 against the shell's translucent glass.
test('activity widget action uses full-contrast white in dark theme',()=>{
  const rule=css.match(/:global\(\[data-theme='dark'\]\) \.panel\[data-widget-id='activity'\] \.textAction\s*\{([^}]*)\}/)?.[1];
  assert.ok(rule,'Activity action needs an explicit dark-theme foreground');
  assert.match(rule,/color:\s*#fff\s*;/i);
});
