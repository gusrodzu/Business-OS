import {useEffect, useMemo, useState} from 'react';
import {ArrowRight, Clock3, Command, Search, X} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {adminNavigation, isDiscoverable, navigation, quickActions} from '../data/navigation';
import styles from './CommandPalette.module.css';

const RECENTS_KEY = 'buzzbee.ux.recents';

function flatten(items) {
  return items.flatMap((item) => item.children
    ? item.children.map((child) => ({label:child.label, group:item.label, to:child.to, icon:item.icon}))
    : [{label:item.label, group:'Apps', to:item.to, icon:item.icon}]);
}

function uniqueByRoute(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.group}|${item.to}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function readRecents() {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); } catch { return []; }
}

export default function CommandPalette({open, onClose}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState(readRecents);

  useEffect(() => {
    if (!open) { setQuery(''); setActiveIndex(0); }
    else setRecents(readRecents());
  }, [open]);

  const commands = useMemo(() => [
    ...quickActions.map((item) => ({...item, group:'Acciones rápidas'})),
    ...recents.map((item) => ({label:item.label, to:item.path, group:'Recientes', icon:Clock3})),
    ...uniqueByRoute([...flatten(navigation.filter(isDiscoverable)), ...flatten(adminNavigation.filter(isDiscoverable))]),
  ], [recents]);

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const result = commands.filter((item) => terms.every((term) => `${item.label} ${item.group}`.toLowerCase().includes(term)));
    return result.slice(0, 14);
  }, [commands, query]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKey(event) {
      if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((value) => filtered.length ? (value + 1) % filtered.length : 0); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((value) => filtered.length ? (value - 1 + filtered.length) % filtered.length : 0); }
      if (event.key === 'Enter' && filtered[activeIndex]) { event.preventDefault(); select(filtered[activeIndex]); }
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, filtered, activeIndex]);

  if (!open) return null;

  function select(item) {
    navigate(item.to);
    onClose();
  }

  return (
    <div className={styles.overlay} onMouseDown={onClose} data-ux-v19="command-palette">
      <section className={styles.palette} onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <Search size={20}/>
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar módulos, pantallas y acciones…"/>
          <span><Command size={12}/> K</span>
          <button onClick={onClose} aria-label="Cerrar"><X size={18}/></button>
        </header>

        <div className={styles.results}>
          {filtered.length ? filtered.map((item, index) => {
            const Icon = item.icon;
            return <button key={`${item.group}-${item.label}-${index}`} className={index === activeIndex ? styles.activeResult : ''} onMouseEnter={() => setActiveIndex(index)} onClick={() => select(item)}>
              <span className={styles.icon}>{Icon ? <Icon size={18}/> : null}</span>
              <span className={styles.copy}><strong>{item.label}</strong><small>{item.group}</small></span>
              <ArrowRight size={16}/>
            </button>;
          }) : <div className={styles.empty}>No encontramos resultados para “{query}”.</div>}
        </div>

        <footer><span>↑↓ Navegar</span><span>Enter Abrir</span><span>Esc Cerrar</span></footer>
      </section>
    </div>
  );
}
