// Pure, tenant-agnostic widget layout rules. Only display preferences are persisted.
export const WIDGET_IDS = Object.freeze(['control', 'wallpaper', 'activity', 'shortcuts']);
export const WIDGET_SIZES = Object.freeze(['compact', 'medium', 'expanded']);
export const DEFAULT_WIDGET_SIZES = Object.freeze({
  control:'medium', wallpaper:'medium', activity:'compact', shortcuts:'compact',
});

export function normalizeWidgetSizes(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return Object.fromEntries(WIDGET_IDS.map((id) => [
    id, WIDGET_SIZES.includes(source[id]) ? source[id] : DEFAULT_WIDGET_SIZES[id],
  ]));
}

export function normalizeWidgetOrder(input) {
  if (!Array.isArray(input)) return [...WIDGET_IDS];
  return [...new Set(input.filter((id) => WIDGET_IDS.includes(id))), ...WIDGET_IDS.filter((id) => !input.includes(id))];
}

export function reorderWidget(order, draggedId, targetId) {
  const current = normalizeWidgetOrder(order);
  if (draggedId === targetId || !current.includes(draggedId) || !current.includes(targetId)) return current;
  const remaining = current.filter((id) => id !== draggedId);
  remaining.splice(remaining.indexOf(targetId), 0, draggedId);
  return remaining;
}

export function nudgeWidget(order, id, direction) {
  const current = normalizeWidgetOrder(order);
  const index = current.indexOf(id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
  [current[index], current[nextIndex]] = [current[nextIndex], current[index]];
  return current;
}

export function clampWidgetSizeIndex(index) {
  return Math.max(0, Math.min(WIDGET_SIZES.length - 1, index));
}

export function sizeFromDrag(startSize, deltaX, deltaY) {
  const startingIndex = WIDGET_SIZES.indexOf(startSize);
  const index = startingIndex < 0 ? 1 : startingIndex;
  // Diagonal or vertical drag gestures snap to readable content presets.
  const delta = Math.abs(deltaX) >= Math.abs(deltaY) ? deltaX : deltaY;
  const steps = Math.trunc(delta / 72);
  return WIDGET_SIZES[clampWidgetSizeIndex(index + steps)];
}
