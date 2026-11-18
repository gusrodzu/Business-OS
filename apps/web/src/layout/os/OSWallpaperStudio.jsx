import {useEffect, useRef, useState} from 'react';
import {Check, ImagePlus, X} from 'lucide-react';
import {WORKSPACE_WALLPAPERS, wallpaperBackground} from './workspaceWallpapers';
import styles from './OSWallpaperStudio.module.css';

async function optimizeImage(file) {
  if (!file?.type?.startsWith('image/') || file.size > 8 * 1024 * 1024) {
    throw new Error('Selecciona una imagen de hasta 8 MB.');
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = objectUrl;
    });
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo preparar la imagen.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', .74);
    if (data.length >= 1200000) throw new Error('La imagen sigue siendo demasiado grande. Prueba otra.');
    return {kind: 'custom', data};
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function OSWallpaperStudio({selection, appearance = 'classic', onAppearanceChange, onApply, onClose}) {
  const [draft, setDraft] = useState(selection);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    function handleKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab' || !dialogRef.current?.contains(document.activeElement)) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll('button:not(:disabled),input:not(:disabled)'))
        .filter((node) => node.getClientRects().length);
      if (!nodes.length) return;
      if (event.shiftKey && document.activeElement === nodes[0]) {
        event.preventDefault(); nodes[nodes.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) {
        event.preventDefault(); nodes[0].focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      setDraft(await optimizeImage(file));
    } catch (e) {
      setError(e?.message || 'No fue posible procesar la imagen.');
    } finally {
      setBusy(false);
    }
  }

  function apply() {
    setError('');
    const saved = onApply(draft);
    if (saved) onClose();
    else setError('No se pudo guardar el fondo en este navegador. Revisa el espacio disponible.');
  }

  return (
    <div className={styles.backdrop} onMouseDown={(event) => {if (event.target === event.currentTarget) onClose();}}>
      <section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="os-wallpaper-heading">
        <header className={styles.header}>
          <div>
            <span>PERSONALIZACIÓN DEL SISTEMA</span>
            <h2 id="os-wallpaper-heading">Personaliza tu espacio</h2>
            <p>Elige un fondo para tu escritorio. Tus aplicaciones conservan superficies legibles.</p>
          </div>
          <button type="button" ref={closeRef} onClick={onClose} aria-label="Cerrar Wallpaper Studio"><X size={21}/></button>
        </header>
        <div className={styles.content}>
          <div className={styles.preview} style={{backgroundImage: wallpaperBackground(draft)}}>
            <span>Vista previa · Mi escritorio</span>
            <strong>Business OS</strong>
            <div className={styles.previewIcons}><span>Ventas</span><span>Inventario</span><span>Compras</span></div>
          </div>
          <div className={styles.settings}>
            <h3>Temas y colores</h3>
            <p className={styles.note}>Elige un estilo para el dock y los controles de tu escritorio. Se guarda por usuario y empresa.</p>
            <div role="group" aria-label="Tema de Workspace OS" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8,marginBottom:18}}>
              {[
                {id:'classic',label:'Business Classic',color:'#64748b'},
                {id:'midnight',label:'Midnight',color:'#5277c3'},
                {id:'graphite',label:'Graphite',color:'#737d8b'},
                {id:'executive',label:'Executive',color:'#a67c45'},
              ].map((theme) => <button key={theme.id} type="button" aria-pressed={appearance===theme.id}
                onClick={() => {if (!onAppearanceChange?.(theme.id)) setError('El tema se aplicó, pero no se pudo guardar en este navegador.'); else setError('');}}
                style={{minHeight:44,borderRadius:10,padding:'10px',border:appearance===theme.id?'2px solid currentColor':'1px solid #8490a0',background:'transparent',color:'inherit',display:'flex',alignItems:'center',gap:8,textAlign:'left',cursor:'pointer'}}>
                <span aria-hidden="true" style={{background:theme.color,width:20,height:20,borderRadius:6,flexShrink:0}}/>
                <span>{theme.label}</span>
                {appearance===theme.id ? <Check size={16} aria-hidden="true"/> : null}
              </button>)}
            </div>
            <h3>Fondos de pantalla</h3>
            <div className={styles.options}>
              {WORKSPACE_WALLPAPERS.map((item) => {
                const selected = draft?.kind === 'preset' && draft.id === item.id;
                return (
                  <button type="button" key={item.id} aria-pressed={selected}
                    className={selected ? styles.selected : ''}
                    onClick={() => {setDraft({kind: 'preset', id: item.id}); setError('');}}>
                    <span className={styles.thumbnail} style={{backgroundImage: item.background}}>{selected ? <Check size={19}/> : null}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <label className={styles.upload}>
              <ImagePlus size={21} aria-hidden="true"/>
              <span>Subir mi imagen</span>
              <input type="file" accept="image/*" onChange={upload} disabled={busy} aria-label="Subir fondo personalizado"/>
            </label>
            {draft?.kind === 'custom' ? <p className={styles.note}>Fondo personalizado seleccionado.</p> : null}
            <p className={styles.note}>Tu elección se guarda en este navegador, para tu usuario y empresa activa.</p>
            {error ? <p role="alert" className={styles.error}>{error}</p> : null}
          </div>
        </div>
        <footer className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onClose}>Cancelar</button>
          <button type="button" className={styles.apply} disabled={busy} onClick={apply}>
            <Check size={18}/>{busy ? 'Preparando imagen…' : 'Aplicar fondo'}
          </button>
        </footer>
      </section>
    </div>
  );
}
