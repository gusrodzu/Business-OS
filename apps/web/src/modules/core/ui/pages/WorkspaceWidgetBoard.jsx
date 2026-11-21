import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Activity, ArrowRight, Image as ImageIcon, LayoutDashboard,
  PackagePlus, ScanLine, ShoppingBag, ShoppingCart, FolderPlus,
  TrendingUp, Zap,
} from 'lucide-react';
import {wallpaperBackground} from '../../../../layout/os/workspaceWallpapers';
import styles from './WorkspaceWidgetBoard.module.css';

const SIZES = ['compact', 'medium', 'expanded'];
const SIZE_LABELS = {compact:'Compacto', medium:'Mediano', expanded:'Expandido'};
const DEFAULT_SIZES = {
  control:'medium',
  wallpaper:'medium',
  activity:'compact',
  shortcuts:'compact',
};
const WIDGETS = [
  {id:'control', title:'Centro de control', Icon:LayoutDashboard},
  {id:'wallpaper', title:'Wallpaper Studio', Icon:ImageIcon},
  {id:'activity', title:'Actividad reciente', Icon:Activity},
  {id:'shortcuts', title:'Accesos rápidos', Icon:Zap},
];
const QUICK_ACTIONS = [
  {label:'Ir a Ventas', path:'/ventas', Icon:ShoppingBag},
  {label:'Ir a Compras', path:'/compras', Icon:ShoppingCart},
  {label:'Inventario', path:'/inventario', Icon:PackagePlus},
  {label:'Proyectos', path:'/proyectos', Icon:FolderPlus},
];

function readSizes(storageKey) {
  if (!storageKey || typeof window === 'undefined') return {...DEFAULT_SIZES};
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
    return Object.fromEntries(Object.keys(DEFAULT_SIZES).map((id) => [
      id,
      SIZES.includes(saved?.[id]) ? saved[id] : DEFAULT_SIZES[id],
    ]));
  } catch {
    return {...DEFAULT_SIZES};
  }
}

function PurchaseSparkline({purchases}) {
  const values = purchases.slice(-6).map((row) => Math.max(0, Number(row.total) || 0));
  if (!values.length) return <p className={styles.empty}>Sin compras registradas en el periodo.</p>;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = 12 + index * (296 / Math.max(1, values.length - 1));
    const y = 97 - value / max * 70;
    return x + ',' + y;
  }).join(' ');
  return (
    <svg className={styles.sparkline} viewBox="0 0 320 115" role="img"
      aria-label="Tendencia de compras de los últimos seis registros disponibles">
      <title>Compras mensuales</title>
      <path d="M12 27H308 M12 62H308 M12 97H308"
        fill="none" stroke="#e4e7ed" strokeWidth="1"/>
      <polyline points={points} fill="none" stroke="#7564de" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round"/>
      {values.length === 1
        ? <circle cx="12" cy={97 - values[0] / max * 70} r="4" fill="#7564de"/>
        : null}
    </svg>
  );
}

function WidgetContent({
  id, metrics, purchases, wallpaper, notifications, recentRequests,
  agenda, criticalStock, onOpenWallpaper, onOpenControlCenter,
}) {
  const navigate = useNavigate();

  if (id === 'control') {
    return (
      <div className={styles.widgetBody}>
        <div className={styles.metrics}>
          {metrics.slice(0, 2).map((metric, index) => (
            <div className={styles.metric} key={metric.id || index}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.change}</small>
            </div>
          ))}
          {!metrics.length
            ? <p className={styles.empty}>Elige tus indicadores en el Centro de control.</p>
            : null}
        </div>
        <div className={styles.trendTitle}>
          <span><TrendingUp size={16} aria-hidden="true"/> Compras mensuales</span>
          <small>Últimos seis registros</small>
        </div>
        <PurchaseSparkline purchases={purchases}/>
        <button type="button" className={styles.textAction}
          onClick={onOpenControlCenter}>Abrir panel <ArrowRight size={15} aria-hidden="true"/></button>
      </div>
    );
  }

  if (id === 'wallpaper') {
    return (
      <div className={styles.widgetBody}>
        <button type="button" onClick={onOpenWallpaper} className={styles.wallpaperPreview}
          style={{backgroundImage:wallpaperBackground(wallpaper)}}
          aria-label="Abrir personalización del escritorio">
          <span className={styles.previewOverlay}>Personalizar fondo <ArrowRight size={15} aria-hidden="true"/></span>
        </button>
        <p className={styles.wallpaperHint}>Tu espacio, tu fondo. Personaliza tu escritorio empresarial.</p>
        <button type="button" className={styles.wallpaperAction} onClick={onOpenWallpaper}>
          Personalizar escritorio <ArrowRight size={15} aria-hidden="true"/>
        </button>
      </div>
    );
  }

  if (id === 'activity') {
    const notices = notifications.slice(0, 3);
    const rows = notices.length
      ? notices.map((item, index) => ({key:item.id || index, label:item.title || item.message || 'Aviso operativo'}))
      : recentRequests.slice(0, 3).map((item, index) => ({
        key:item.id || index,
        label:item.folio ? 'Revisar solicitud ' + item.folio : 'Revisar solicitud de compras',
      }));
    return (
      <div className={styles.widgetBody}>
        <div className={styles.activityList}>
          {rows.map((item) => (
            <div key={item.key} className={styles.activityRow}>
              <span className={styles.activityBullet} aria-hidden="true"/>
              <span>{item.label}</span>
            </div>
          ))}
          {!rows.length && Number(criticalStock) > 0 ? (
            <button type="button" className={styles.activityRow}
              onClick={() => navigate('/inventario/existencias')}>
              <span className={styles.activityBullet} aria-hidden="true"/>
              <span>{criticalStock} artículos con stock crítico</span>
            </button>
          ) : null}
          {!rows.length && !(Number(criticalStock) > 0)
            ? <p className={styles.empty}>Sin avisos ni solicitudes recientes.</p> : null}
        </div>
        <button type="button" className={styles.textAction}
          onClick={() => navigate('/tareas')}>Ver tareas <ArrowRight size={15} aria-hidden="true"/></button>
      </div>
    );
  }

  return (
    <div className={styles.widgetBody}>
      <div className={styles.quickGrid}>
        {QUICK_ACTIONS.map(({label, path, Icon}) => (
          <button type="button" key={path} onClick={() => navigate(path)}>
            <Icon size={20} aria-hidden="true"/>
            <span>{label}</span>
          </button>
        ))}
      </div>
      {agenda.length ? (
        <button type="button" className={styles.textAction}
          onClick={() => navigate('/finanzas/flujo-efectivo')}>
          Ver {agenda.length} vencimientos próximos <ArrowRight size={15} aria-hidden="true"/>
        </button>
      ) : null}
    </div>
  );
}

/**
 * Workspace widgets adapt their density to their allocated grid area.
 * Layout preferences are local presentation state; no business data is stored.
 */
export default function WorkspaceWidgetBoard({
  storageKey, metrics = [], purchases = [], notifications = [],
  recentRequests = [], agenda = [], criticalStock = 0,
  wallpaper, onOpenWallpaper, onOpenControlCenter,
}) {
  const [sizes, setSizes] = useState(() => readSizes(storageKey));

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(sizes));
    } catch {
      // Private browsing or a restricted storage quota must not break widgets.
    }
  }, [sizes, storageKey]);

  function resizeWidget(id, size) {
    if (!SIZES.includes(size)) return;
    setSizes((previous) => ({...previous, [id]:size}));
  }

  return (
    <section className={styles.board} data-os-widget-board="true" aria-label="Widgets del escritorio">
      {WIDGETS.map(({id, title, Icon}) => (
        <section className={styles.panel} key={id} data-widget-id={id}
          data-widget-size={sizes[id]} aria-labelledby={'os-widget-' + id}>
          <header className={styles.heading}>
            <div className={styles.headingTitle}>
              <Icon size={19} aria-hidden="true"/>
              <h2 id={'os-widget-' + id}>{title}</h2>
            </div>
            <details className={styles.sizeControl}>
              <summary title={'Cambiar tamaño de ' + title}>
                <ScanLine size={17} aria-hidden="true"/>
                <span className={styles.srOnly}>Cambiar tamaño de {title}, tamaño actual: {SIZE_LABELS[sizes[id]]}</span>
              </summary>
              <div className={styles.sizeMenu} role="group" aria-label={'Tamaño de ' + title}>
                {SIZES.map((size) => (
                  <button key={size} type="button" aria-pressed={sizes[id] === size}
                    onClick={(event) => {
                      resizeWidget(id, size);
                      event.currentTarget.closest('details').open = false;
                    }}>
                    {SIZE_LABELS[size]}
                  </button>
                ))}
              </div>
            </details>
          </header>
          <WidgetContent id={id} metrics={metrics} purchases={purchases}
            notifications={notifications} recentRequests={recentRequests}
            agenda={agenda} criticalStock={criticalStock} wallpaper={wallpaper}
            onOpenWallpaper={onOpenWallpaper} onOpenControlCenter={onOpenControlCenter}/>
        </section>
      ))}
    </section>
  );
}
