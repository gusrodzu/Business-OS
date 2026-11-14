import {useCallback, useEffect, useMemo, useState} from 'react';
import {useAuth} from '../../auth/AuthContext';
import {dashboardPreferencesKey} from '../../components/honeycombPreferences';

export const wallpaperPresets = [
  {
    id: 'obsidian',
    name: 'Obsidiana',
    background: 'url("/wallpapers/obsidian.svg")',
  },
  {
    id: 'slate',
    name: 'Pizarra',
    background: 'radial-gradient(ellipse at 84% 15%,rgba(187,200,224,.24),transparent 44%),linear-gradient(148deg,#171c25 10%,#465264 47%,#141b26 90%)',
  },
  {
    id: 'sand',
    name: 'Arena',
    background: 'radial-gradient(ellipse at 25% 25%,rgba(255,255,255,.52),transparent 47%),linear-gradient(140deg,#b9afa3,#d7c5ac 55%,#817c79)',
  },
  {
    id: 'midnight',
    name: 'Noche',
    background: 'radial-gradient(ellipse at 72% 28%,rgba(103,128,157,.42),transparent 42%),linear-gradient(145deg,#060a10,#1c2c42 58%,#070b12)',
  },
];

const DEFAULT = 'obsidian';
const CHANGED_EVENT = 'business-os:workspace-wallpaper-changed';
const presets = new Set(wallpaperPresets.map((item) => item.id));

function readPreference(key) {
  try {
    const saved = window.localStorage.getItem(key) || DEFAULT;
    const image = window.localStorage.getItem(`${key}:custom-image`) || '';
    return {key, selected: saved === 'custom' && image ? 'custom' : presets.has(saved) ? saved : DEFAULT, customImage: image};
  } catch {
    return {key, selected: DEFAULT, customImage: ''};
  }
}

export function useWorkspaceWallpaper() {
  const {user, offlineDemo} = useAuth();
  // Same isolation used for dashboard customization: distinct user, company and demo.
  const key = useMemo(
    () => `business-os.workspace.wallpaper.v1:${dashboardPreferencesKey(user, offlineDemo)}`,
    [user, offlineDemo],
  );
  const [stored, setStored] = useState(() => readPreference(key));
  const current = stored.key === key ? stored : readPreference(key);

  useEffect(() => {
    setStored(readPreference(key));
    const sync = (event) => {
      if (event.type === CHANGED_EVENT && event.detail?.key !== key) return;
      if (event.type === 'storage' && event.key !== key && event.key !== `${key}:custom-image`) return;
      setStored(readPreference(key));
    };
    window.addEventListener(CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [key]);

  const selectWallpaper = useCallback((selected, customImage) => {
    if (selected !== 'custom' && !presets.has(selected)) return false;
    if (selected === 'custom' && (typeof customImage !== 'string' || !customImage.startsWith('data:image/'))) return false;
    try {
      if (selected === 'custom') window.localStorage.setItem(`${key}:custom-image`, customImage);
      window.localStorage.setItem(key, selected);
    } catch {
      return false;
    }
    const next = {key, selected, customImage: selected === 'custom' ? customImage : readPreference(key).customImage};
    setStored(next);
    window.dispatchEvent(new CustomEvent(CHANGED_EVENT, {detail: {key}}));
    return true;
  }, [key]);

  const selectedPreset = wallpaperPresets.find((item) => item.id === current.selected) || wallpaperPresets[0];
  const background = current.selected === 'custom'
    ? `url("${current.customImage}")` : selectedPreset.background;

  return {
    wallpaper: current.selected,
    customImage: current.customImage,
    background,
    selectWallpaper,
  };
}
