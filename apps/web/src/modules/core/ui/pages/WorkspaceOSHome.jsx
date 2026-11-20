import {ArrowRight, CalendarDays, ClipboardCheck, Image as ImageIcon, Layers3, LayoutDashboard, TrendingUp, Activity, Zap, ShoppingCart, PackagePlus, FolderPlus, ShoppingBag} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import WorkspaceAppShelf from './WorkspaceAppShelf';
import {wallpaperBackground} from '../../../../layout/os/workspaceWallpapers';
import styles from './WorkspaceOSHome.module.css';

function PurchaseSparkline({purchases = []}) {
  const values = purchases.slice(-6).map((row) => Math.max(0, Number(row.total) || 0));
  if (!values.length) return <p className={styles.chartEmpty}>Sin compras registradas en el periodo.</p>;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = 15 + index * (290 / Math.max(1, values.length - 1));
    const y = 96 - (value / max) * 69;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg className={styles.sparkline} viewBox="0 0 320 115" role="img" aria-label="Tendencia de compras de los últimos seis meses con registros">
      <title>Compras mensuales · últimos registros disponibles</title>
      <path d="M15 27H305 M15 62H305 M15 96H305" fill="none" stroke="#d9dde4" strokeWidth="1"/>
      <polyline points={points} stroke="#17191d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {values.length === 1 ? <circle cx="15" cy={96 - (values[0] / max) * 69} r="4" fill="#17191d"/> : null}
    </svg>
  );
}

export default function WorkspaceOSHome({
  firstName, companyName, metrics = [], purchases = [], notifications = [],
  recentRequests = [], agenda = [], criticalStock = 0, offlineDemo, wallpaper, onOpenWallpaper, onOpenControlCenter,
}) {
  const navigate = useNavigate();
  const alerts = notifications.slice(0, 3);
  const tasks = alerts.length
    ? alerts.map((item, index) => ({key: item.id || index, label: item.title || item.message || 'Aviso operativo'}))
    : recentRequests.slice(0, 3).map((item, index) => ({
      key: item.id || index,
      label: item.folio ? `Revisar solicitud ${item.folio}` : 'Revisar solicitud de compras',
    }));
  const selectedMetrics = metrics.slice(0, 2);
  return (
    <div className={styles.home} data-business-os-desktop-home="true">
      <header className={styles.welcome}>
        <div className={styles.welcomeCopy}>
          <span className={styles.kicker}>TU ESPACIO DE TRABAJO</span>
          <h1>Buenos días, {firstName || 'bienvenido'}</h1>
          <p>{companyName || 'Empresa activa'}{offlineDemo ? ' · Modo demostración' : ''}</p>
        </div>
        <button type="button" className={styles.workspacePill} onClick={onOpenWallpaper}>
          <Layers3 size={17} aria-hidden="true"/> Personalizar escritorio <ArrowRight size={16} aria-hidden="true"/>
        </button>
      </header>

      <div className={styles.appsRegion}>
        <WorkspaceAppShelf variant="os" />
      </div>

      <div className={styles.bentoLeft}>
      <section className={styles.controlCard} aria-labelledby="os-control-heading">
        <div className={styles.cardHeading}>
          <div><LayoutDashboard size={19} aria-hidden="true"/><h2 id="os-control-heading">Centro de control</h2></div>
          <button type="button" onClick={onOpenControlCenter}>Abrir panel <ArrowRight size={15}/></button>
        </div>
        <div className={styles.metrics}>
          {selectedMetrics.map((metric) => (
            <div className={styles.metric} key={metric.id}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.change}</small>
            </div>
          ))}
          {!selectedMetrics.length ? <p className={styles.chartEmpty}>Personaliza tus indicadores desde el Centro de control.</p> : null}
        </div>
        <div className={styles.trendHead}>
          <span><TrendingUp size={16} aria-hidden="true"/> Compras mensuales</span>
          <small>Últimos seis registros</small>
        </div>
        <PurchaseSparkline purchases={purchases} />
      </section>

      <section className={styles.tasksCard} aria-labelledby="os-tasks-heading">
        <div className={styles.cardHeading}>
          <div><Activity size={19} aria-hidden="true"/><h2 id="os-tasks-heading">Actividad reciente</h2></div>
          <button type="button" onClick={() => navigate('/tareas')}>Ver tareas <ArrowRight size={15}/></button>
        </div>
        <div className={styles.list}>
          {tasks.map((item) => (
            <div className={styles.listRow} key={item.key}>
              <span className={styles.listBullet} aria-hidden="true"/><span>{item.label}</span>
            </div>
          ))}
          {!tasks.length && Number(criticalStock) > 0 ? (
            <button type="button" className={styles.listRow} onClick={() => navigate('/inventario/existencias')}>
              <span className={styles.listBullet} aria-hidden="true"/><span>{criticalStock} artículos con stock crítico</span>
            </button>
          ) : null}
          {!tasks.length && !(Number(criticalStock) > 0) ? <p className={styles.empty}>Sin avisos ni solicitudes recientes.</p> : null}
        </div>
      </section>
      </div>
      <div className={styles.bentoRight}>
      <section className={styles.wallpaperCard} aria-labelledby="os-wallpaper-card-heading">
        <div className={styles.cardHeading}>
          <div><ImageIcon size={19} aria-hidden="true"/><h2 id="os-wallpaper-card-heading">Wallpaper Studio</h2></div>
        </div>
        <div className={styles.wallpaperPreview} style={{backgroundImage: wallpaperBackground(wallpaper)}} aria-hidden="true"/>
        <p>Tu espacio, tu fondo. Personaliza tu escritorio empresarial.</p>
        <button type="button" onClick={onOpenWallpaper}>Personalizar escritorio <ArrowRight size={15} aria-hidden="true"/></button>
      </section>

      <section className={styles.agendaCard} aria-labelledby="os-agenda-heading">
        <div className={styles.cardHeading}>
          <div><Zap size={19} aria-hidden="true"/><h2 id="os-agenda-heading">Accesos rápidos</h2></div>
        </div>
        <div className={styles.quickGrid}>
          <button type="button" onClick={() => navigate('/ventas')}><ShoppingBag size={21} aria-hidden="true"/> Nueva venta</button>
          <button type="button" onClick={() => navigate('/compras')}><ShoppingCart size={21} aria-hidden="true"/> Registrar compra</button>
          <button type="button" onClick={() => navigate('/inventario')}><PackagePlus size={21} aria-hidden="true"/> Agregar producto</button>
          <button type="button" onClick={() => navigate('/proyectos')}><FolderPlus size={21} aria-hidden="true"/> Crear proyecto</button>
        </div>
        {agenda.length ? <button type="button" className={styles.agendaLink} onClick={() => navigate('/finanzas/flujo-efectivo')}>Ver {agenda.length} vencimientos próximos <ArrowRight size={15}/></button> : null}
      </section>
      </div>
    </div>
  );
}
