export const WORKSPACE_WALLPAPERS = [
  {
    id: 'obsidian',
    label: 'Obsidian',
    background: 'radial-gradient(ellipse at 76% 3%,rgba(189,198,212,.38),transparent 40%),radial-gradient(ellipse at 0% 88%,rgba(106,119,139,.38),transparent 38%),linear-gradient(139deg,#101317 0%,#292f38 39%,#07090d 60%,#353c46 84%,#111419 100%)',
  },
  {
    id: 'sand',
    label: 'Sand',
    background: 'radial-gradient(ellipse at 75% 24%,rgba(255,255,255,.56),transparent 46%),radial-gradient(ellipse at 16% 82%,rgba(170,142,117,.38),transparent 50%),linear-gradient(125deg,#6a6059,#d4c3b1 52%,#8e8176)',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    background: 'radial-gradient(ellipse at 76% 21%,rgba(77,118,197,.62),transparent 46%),radial-gradient(ellipse at 20% 76%,rgba(80,54,125,.65),transparent 46%),linear-gradient(140deg,#080e1d,#1c2946 54%,#070d19)',
  },
];

export function wallpaperBackground(selection) {
  if (selection?.kind === 'custom' && typeof selection.data === 'string'
    && selection.data.startsWith('data:image/jpeg;base64,')
    && selection.data.length < 1200000) {
    return `url("${selection.data}")`;
  }
  return WORKSPACE_WALLPAPERS.find((item) => item.id === selection?.id)?.background
    || WORKSPACE_WALLPAPERS[0].background;
}

export function readWorkspaceWallpaper(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || 'null');
    if (value?.kind === 'custom' && typeof value.data === 'string'
      && value.data.startsWith('data:image/jpeg;base64,') && value.data.length < 1200000) return value;
    if (value?.kind === 'preset' && WORKSPACE_WALLPAPERS.some((item) => item.id === value.id)) return value;
  } catch { /* Storage may be blocked or contain an older format. */ }
  return {kind: 'preset', id: 'obsidian'};
}
