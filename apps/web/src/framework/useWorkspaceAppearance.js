import {useCallback, useEffect, useMemo, useState} from 'react';

const STORAGE_PREFIX = 'business-os.appearance.v1';
const CHANGED_EVENT = 'business-os:appearance-changed';
const WALLPAPER_IDS = new Set(['obsidian', 'sand', 'aurora', 'forest', 'custom']);

export const WORKSPACE_WALLPAPERS = [
  {id: 'obsidian', name: 'Obsidian'},
  {id: 'sand', name: 'Sand'},
  {id: 'aurora', name: 'Aurora'},
  {id: 'forest', name: 'Forest'},
];

const DEFAULT_APPEARANCE = Object.freeze({wallpaper: 'obsidian', customImage: null});

function sanitizeAppearance(value) {
  if (!value || typeof value !== 'object') return DEFAULT_APPEARANCE;
  const wallpaper = WALLPAPER_IDS.has(value.wallpaper) ? value.wallpaper : 'obsidian';
  // Uploaded files are local image data only. Do not read external URLs from storage.
  const customImage = typeof value.customImage === 'string'
    && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value.customImage)
    && value.customImage.length < 1500000
    ? value.customImage : null;
  return {wallpaper: wallpaper === 'custom' && !customImage ? 'obsidian' : wallpaper, customImage};
}

function readAppearance(key) {
  try {
    return sanitizeAppearance(JSON.parse(window.localStorage.getItem(key) || 'null'));
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function useWorkspaceAppearance(user, offlineDemo = false) {
  // Appearance belongs to the person AND tenant; never carry a company's
  // uploaded background across a workspace switch.
  const companyId = String(user?.companyId || user?.company?.id || 'none');
  const userId = String(user?.id || user?.email || 'anonymous');
  const scope = useMemo(
    () => `${STORAGE_PREFIX}:${offlineDemo ? 'offline' : 'online'}:${companyId}:${userId}`,
    [offlineDemo, companyId, userId],
  );
  const [snapshot, setSnapshot] = useState(() => ({scope, value: readAppearance(scope)}));
  const appearance = snapshot.scope === scope ? snapshot.value : readAppearance(scope);

  useEffect(() => {
    setSnapshot({scope, value: readAppearance(scope)});
    function sync(event) {
      if (event.type === CHANGED_EVENT && event.detail?.scope !== scope) return;
      if (event.type === 'storage' && event.key !== scope) return;
      setSnapshot({scope, value: readAppearance(scope)});
    }
    window.addEventListener(CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [scope]);

  const updateAppearance = useCallback((patch) => {
    const next = sanitizeAppearance({...readAppearance(scope), ...patch});
    try {
      window.localStorage.setItem(scope, JSON.stringify(next));
    } catch {
      // Private browsing/quota should not prevent an in-session preview.
    }
    setSnapshot({scope, value: next});
    window.dispatchEvent(new CustomEvent(CHANGED_EVENT, {detail: {scope}}));
    return next;
  }, [scope]);

  return {appearance, updateAppearance};
}
