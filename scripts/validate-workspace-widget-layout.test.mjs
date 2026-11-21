import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WIDGET_IDS, DEFAULT_WIDGET_SIZES, normalizeWidgetSizes,
  normalizeWidgetOrder, nudgeWidget, reorderWidget, sizeFromDrag,
} from '../apps/web/src/modules/core/ui/pages/workspaceWidgetLayout.js';

test('widget layout restores valid preferences and rejects malformed entries', () => {
  assert.deepEqual(normalizeWidgetSizes(null), DEFAULT_WIDGET_SIZES);
  assert.deepEqual(normalizeWidgetSizes({control:'expanded', wallpaper:'unknown', extra:'compact'}), {
    control:'expanded', wallpaper:'medium', activity:'compact', shortcuts:'compact',
  });
  assert.deepEqual(normalizeWidgetOrder(['shortcuts', 'shortcuts', 'foreign', 'control']),
    ['shortcuts', 'control', 'wallpaper', 'activity']);
  assert.deepEqual(normalizeWidgetOrder('invalid'), WIDGET_IDS);
});

test('reordering is stable, accessible, and never drops a widget', () => {
  const original = [...WIDGET_IDS];
  assert.deepEqual(nudgeWidget(original, 'wallpaper', -1),
    ['wallpaper', 'control', 'activity', 'shortcuts']);
  assert.deepEqual(nudgeWidget(original, 'control', -1), original);
  assert.deepEqual(nudgeWidget(original, 'shortcuts', 1), original);
  assert.deepEqual(reorderWidget(original, 'shortcuts', 'wallpaper'),
    ['control', 'shortcuts', 'wallpaper', 'activity']);
  assert.deepEqual(reorderWidget(original, 'wallpaper', 'wallpaper'), original);
  assert.deepEqual(reorderWidget(original, 'unknown', 'control'), original);
});

test('corner resize snaps to a readable size and stays within bounds', () => {
  assert.equal(sizeFromDrag('compact', 71, 0), 'compact');
  assert.equal(sizeFromDrag('compact', 73, 0), 'medium');
  assert.equal(sizeFromDrag('medium', 0, 76), 'expanded');
  assert.equal(sizeFromDrag('expanded', -80, 0), 'medium');
  assert.equal(sizeFromDrag('expanded', -210, 0), 'compact');
  assert.equal(sizeFromDrag('compact', -999, 0), 'compact');
  assert.equal(sizeFromDrag('expanded', 999, 0), 'expanded');
  assert.equal(sizeFromDrag('medium', 0, 0), 'medium');
});
