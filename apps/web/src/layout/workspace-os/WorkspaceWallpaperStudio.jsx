import {useEffect, useRef, useState} from 'react';
import {Check, ImagePlus, SlidersHorizontal, X} from 'lucide-react';
import {wallpaperPresets} from './useWorkspaceWallpaper';
import styles from './WorkspaceWallpaperStudio.module.css';

async function prepareWallpaper(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Selecciona una imagen JPG, PNG o WebP.');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('La imagen debe pesar menos de 8 MB.');
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('No pudimos abrir esa imagen.'));
      img.src = objectUrl;
    });
    const scale = Math.min(1, 1920 / img.naturalWidth, 1080 / img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/webp', .77);
    if (!data.startsWith('data:image/')) throw new Error('No pudimos preparar la imagen.');
    return data;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function WorkspaceWallpaperStudio({open, onClose, wallpaper, customImage, selectWallpaper}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const lastFocused = document.activeElement;
    setMessage('');
    closeRef.current?.focus({preventScroll: true});
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab' || !dialogRef.current?.contains(document.activeElement)) return;
      const controls = Array.from(dialogRef.current.querySelectorAll('button:not(:disabled),input:not(:disabled)'))
        .filter((node) => node.getClientRects().length);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (lastFocused?.isConnected) lastFocused.focus({preventScroll: true});
    };
  }, [open, onClose]);

  if (!open) return null;

  function apply(id, image) {
    if (!selectWallpaper(id, image)) {
      setMessage('No pudimos guardar el fondo en este navegador. Revisa el espacio disponible.');
    } else {
      setMessage('Fondo actualizado para este usuario y empresa.');
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      apply('custom', await prepareWallpaper(file));
    } catch (error) {
      setMessage(error.message || 'No pudimos preparar la imagen.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className={styles.overlay} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="os-wallpaper-title">
        <header className={styles.header}>
          <div>
            <span><SlidersHorizontal size={15} aria-hidden="true"/> BUSINESS OS · PERSONALIZACIÓN</span>
            <h2 id="os-wallpaper-title">Wallpaper Studio</h2>
            <p>Elige el fondo de tu escritorio empresarial. Los cambios se guardan localmente por usuario y empresa.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar Wallpaper Studio"><X size={21}/></button>
        </header>
        <div className={styles.preview} style={{backgroundImage: wallpaper === 'custom' && customImage
          ? `url("${customImage}")`
          : wallpaperPresets.find((preset) => preset.id === wallpaper)?.background || wallpaperPresets[0].background}}>
          <div className={styles.previewContent}>
            <span>Business OS</span>
            <strong>Tu espacio, tu estilo.</strong>
            <small>Vista previa del fondo · El contenido de las aplicaciones conserva su legibilidad.</small>
          </div>
        </div>
        <div className={styles.gallery}>
          <h3>Fondos disponibles</h3>
          <div className={styles.choices}>
            {wallpaperPresets.map((preset) => (
              <button key={preset.id} type="button" aria-pressed={wallpaper === preset.id}
                className={styles.choice} onClick={() => apply(preset.id)}>
                <span className={styles.sample} style={{backgroundImage: preset.background}}>
                  {wallpaper === preset.id ? <Check size={17} aria-hidden="true"/> : null}
                </span>
                <span>{preset.name}</span>
              </button>
            ))}
            {customImage ? (
              <button type="button" className={styles.choice} aria-pressed={wallpaper === 'custom'}
                onClick={() => apply('custom', customImage)}>
                <span className={styles.sample} style={{backgroundImage: `url("${customImage}")`}}>
                  {wallpaper === 'custom' ? <Check size={17} aria-hidden="true"/> : null}
                </span>
                <span>Mi imagen</span>
              </button>
            ) : null}
          </div>
        </div>
        <div className={styles.footer}>
          <label className={styles.upload}>
            <ImagePlus size={18} aria-hidden="true"/>
            {uploading ? 'Procesando…' : 'Subir mi imagen'}
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={handleUpload}/>
          </label>
          <button type="button" className={styles.done} onClick={onClose}>Listo</button>
        </div>
        <p className={styles.status} role="status">{message}</p>
      </section>
    </div>
  );
}
