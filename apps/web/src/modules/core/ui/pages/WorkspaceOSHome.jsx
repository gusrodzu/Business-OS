import {useEffect, useRef, useState} from 'react';
import {
  ArrowRight, CalendarDays, Check, Grid2X2, Image as ImageIcon,
  PackageX, Settings2, Upload, X,
} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../../../auth/AuthContext';
import {useWorkspaceAppearance, WORKSPACE_WALLPAPERS} from '../../../../framework/useWorkspaceAppearance';
import WorkspaceAppShelf from './WorkspaceAppShelf';
import styles from './WorkspaceOSHome.module.css';

const safeNumber = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
const formatCount = (value) => safeNumber(value).toLocaleString('es-MX');

function PurchasesSparkline({series = [], formatMoney}) {
  const recent = series.slice(-7);
  const values = recent.map((item) => safeNumber(item.total));
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => {
    const x = 8 + (values.length === 1 ? 152 : (304 * index / (values.length - 1)));
    const y = 93 - (value / max) * 77;
    return [x, y];
  });
  const path = points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <div className={styles.purchases}>
      <div className={styles.widgetHeading}>
        <div>
          <span>COMPRAS MENSUALES</span>
          <strong>{recent.length ? formatMoney(values.reduce((sum, value) => sum + value, 0)) : 'Sin registros'}</strong>
        </div>
        <small>{recent.length ? `Últimos ${recent.length} meses` : 'Sin periodo'}</small>
      </div>
      {recent.length ? (
        <svg viewBox="0 0 320 106" preserveAspectRatio="none" role="img" aria-label="Tendencia de compras de los últimos registros mensuales">
          <path className={styles.gridLine} d="M8 95 H312"/>
          <path className={styles.gridLine} d="M8 54 H312"/>
          <path className={styles.graphLine} d={path}/>
          {points.length === 1 ? <circle cx={points[0][0]} cy={points[0][1]} r="3" fill="currentColor"/> : null}
        </svg>
      ) : <p className={styles.empty}>La gráfica aparecerá cuando existan compras registradas.</p>}
    </div>
  );
}

function WallpaperStudio({appearance, updateAppearance, onClose}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled)')]
        .filter((node) => node.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previous?.isConnected) previous.focus({preventScroll: true});
    };
  }, [onClose]);

  function onUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 900000) {
      setError('Usa una imagen JPG, PNG o WebP de máximo 900 KB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateAppearance({wallpaper: 'custom', customImage: reader.result});
        setError('');
      }
    };
    reader.onerror = () => setError('No se pudo abrir la imagen seleccionada.');
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  return (
    <div className={styles.studioOverlay} onMouseDown={(event) => {if (event.target === event.currentTarget) onClose();}}>
      <section ref={dialogRef} className={styles.studioDialog} role="dialog" aria-modal="true" aria-labelledby="workspace-wallpaper-title">
        <header className={styles.studioHeader}>
          <div>
            <span>PERSONALIZA TU ESPACIO</span>
            <h2 id="workspace-wallpaper-title">Wallpaper Studio</h2>
            <p>Elige un fondo para tu escritorio. Tu selección es personal y no afecta a otros usuarios.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar Wallpaper Studio"><X size={20}/></button>
        </header>
        <div className={styles.studioGallery} role="group" aria-label="Fondos de pantalla disponibles">
          {WORKSPACE_WALLPAPERS.map((wallpaper) => (
            <button key={wallpaper.id} type="button" aria-pressed={appearance.wallpaper === wallpaper.id}
              className={styles.wallpaperChoice} onClick={() => {updateAppearance({wallpaper: wallpaper.id}); setError('');}}>
              <span className={styles.wallpaperThumb} data-wallpaper-swatch={wallpaper.id}>
                {appearance.wallpaper === wallpaper.id ? <Check size={19} aria-hidden="true"/> : null}
              </span>
              <span>{wallpaper.name}</span>
            </button>
          ))}
          {appearance.customImage ? (
            <button type="button" className={styles.wallpaperChoice} aria-pressed={appearance.wallpaper === 'custom'}
              onClick={() => updateAppearance({wallpaper:'custom'})}>
              <span className={styles.wallpaperThumb} style={{backgroundImage: `url("${appearance.customImage}")`}}>
                {appearance.wallpaper === 'custom' ? <Check size={19} aria-hidden="true"/> : null}
              </span>
              <span>Mi imagen</span>
            </button>
          ) : null}
        </div>
        <label className={styles.upload}>
          <Upload size={19} aria-hidden="true"/>
          <span>Subir mi propio fondo (JPG, PNG o WebP · máx. 900 KB)</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onUpload}/>
        </label>
        {error ? <p className={styles.uploadError} role="alert">{error}</p> : null}
        <div className={styles.studioFooter}>
          <small>Se guarda en este navegador para el usuario y empresa actuales.</small>
          <button type="button" onClick={onClose}>Listo</button>
        </div>
      </section>
    </div>
  );
}

export default function WorkspaceOSHome({data, metrics = [], firstName, offlineDemo, formatMoney, onOpenControlCenter}) {
  const navigate = useNavigate();
  const {user} = useAuth();
  const {appearance, updateAppearance} = useWorkspaceAppearance(user, offlineDemo);
  const [studioOpen, setStudioOpen] = useState(false);
  const companyName = data?.company?.name || user?.company?.name || 'Empresa activa';
  const name = firstName || 'bienvenido';
  const pendingRequests = safeNumber(data?.kpis?.pendingRequests);
  const criticalStock = safeNumber(data?.kpis?.criticalStock);
  const agenda = (data?.agenda || []).slice(0, 3);
  const today = new Intl.DateTimeFormat('es-MX', {weekday:'long', day:'numeric', month:'long'}).format(new Date());

  return (
    <div className={styles.home} data-os-home="true">
      <div className={styles.greeting}>
        <span className={styles.greetingRule} aria-hidden="true"/>
        <h1>Buenos días, {name}</h1>
        <p>{companyName}</p>
        <span className={styles.workspaceTag}>{today}{offlineDemo ? ' · Datos simulados' : ''}</span>
      </div>

      <div className={styles.homeGrid}>
        <div className={styles.leftColumn}>
          <WorkspaceAppShelf variant="os"/>
          <div className={styles.workspaceActions}>
            <button type="button" onClick={() => setStudioOpen(true)}>
              <ImageIcon size={18} aria-hidden="true"/> Personalizar escritorio <ArrowRight size={17} aria-hidden="true"/>
            </button>
            <button type="button" onClick={onOpenControlCenter}>
              <Grid2X2 size={18} aria-hidden="true"/> Abrir Centro de control <ArrowRight size={17} aria-hidden="true"/>
            </button>
          </div>
        </div>

        <div className={styles.widgets}>
          <section className={styles.controlCard} aria-labelledby="workspace-control-heading">
            <div className={styles.widgetHeading}>
              <h2 id="workspace-control-heading">Centro de control</h2>
              <button type="button" onClick={onOpenControlCenter}>Ver detalles <ArrowRight size={16} aria-hidden="true"/></button>
            </div>
            {metrics.length ? (
              <div className={styles.metricGrid}>
                {metrics.slice(0, 2).map((metric) => (
                  <div key={metric.id} className={styles.metric}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    {metric.change ? <small>{metric.change}</small> : null}
                  </div>
                ))}
              </div>
            ) : <p className={styles.empty}>Personaliza tus indicadores desde el Centro de control.</p>}
            <PurchasesSparkline series={data?.monthlyPurchases || []} formatMoney={formatMoney}/>
          </section>
          <section className={styles.wallpaperCard} aria-labelledby="workspace-wallpaper-heading">
            <div className={styles.widgetHeading}>
              <h2 id="workspace-wallpaper-heading">Wallpaper Studio</h2>
              <ImageIcon size={18} aria-hidden="true"/>
            </div>
            <div className={styles.wallpaperPreview} data-wallpaper-swatch={appearance.wallpaper}
              style={appearance.wallpaper === 'custom' && appearance.customImage
                ? {backgroundImage: `url("${appearance.customImage}")`} : undefined}/>
            <p>Personaliza el fondo de tu espacio de trabajo.</p>
            <button type="button" onClick={() => setStudioOpen(true)}>
              <Settings2 size={16} aria-hidden="true"/> Personalizar escritorio <ArrowRight size={16} aria-hidden="true"/>
            </button>
          </section>
          <section className={styles.tasksCard} aria-labelledby="workspace-tasks-heading">
            <div className={styles.widgetHeading}>
              <h2 id="workspace-tasks-heading"><Check size={19} aria-hidden="true"/> Prioridades</h2>
              <span>{formatCount(pendingRequests + criticalStock)}</span>
            </div>
            <button type="button" onClick={() => navigate('/tareas')}>
              <span>Solicitudes pendientes</span><strong>{formatCount(pendingRequests)}</strong><ArrowRight size={16} aria-hidden="true"/>
            </button>
            <button type="button" onClick={() => navigate('/inventario/existencias')}>
              <span>Productos con stock crítico</span><strong>{formatCount(criticalStock)}</strong><PackageX size={16} aria-hidden="true"/>
            </button>
          </section>
          <section className={styles.agendaCard} aria-labelledby="workspace-agenda-heading">
            <div className={styles.widgetHeading}>
              <h2 id="workspace-agenda-heading"><CalendarDays size={19} aria-hidden="true"/> Agenda financiera</h2>
              <button type="button" onClick={() => navigate('/finanzas/flujo-efectivo')}>Ver todo <ArrowRight size={16} aria-hidden="true"/></button>
            </div>
            {agenda.length ? agenda.map((item, index) => (
              <div key={item.id || index} className={styles.agendaItem}>
                <time dateTime={item.date}>{item.date ? new Date(item.date).toLocaleDateString('es-MX',{day:'numeric',month:'short'}) : '—'}</time>
                <span>{item.title}</span>
                <strong>{formatMoney(item.amount)}</strong>
              </div>
            )) : <p className={styles.empty}>No hay vencimientos próximos.</p>}
          </section>
        </div>
      </div>
      {studioOpen ? (
        <WallpaperStudio appearance={appearance} updateAppearance={updateAppearance} onClose={() => setStudioOpen(false)}/>
      ) : null}
    </div>
  );
}
