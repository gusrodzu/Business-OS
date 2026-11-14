import {ArrowRight, CalendarDays, CheckCircle2, ClipboardList, Image as ImageIcon, PackageX, Settings2, ShoppingCart} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import WorkspaceAppShelf from './WorkspaceAppShelf';
import styles from './WorkspaceOSHome.module.css';

function MonthlyTrend({months = [], formatMoney}) {
  const values = months.slice(-7).map((item) => Math.max(0, Number(item?.total) || 0));
  const max = Math.max(...values, 1);
  const coords = values.map((value, index) => [
    values.length === 1 ? 50 : 5 + index * 90 / (values.length - 1),
    76 - value / max * 65,
  ]);
  const path = coords.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const total = values.reduce((sum, value) => sum + value, 0);

  return (
    <div className={styles.chart}>
      <div className={styles.chartTitle}>
        <div><span>Compras mensuales</span><strong>{formatMoney(total)}</strong></div>
        <span>Últimos {values.length} meses disponibles</span>
      </div>
      {values.length ? (
        <svg viewBox="0 0 100 85" preserveAspectRatio="none" role="img"
          aria-label="Tendencia de compras de los últimos meses disponibles">
          {[24, 48, 72].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} className={styles.gridLine}/>)}
          <path d={path} className={styles.chartLine}/>
          {coords.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="1.6" className={styles.chartPoint}/>)}
        </svg>
      ) : <p className={styles.empty}>Todavía no hay compras registradas para graficar.</p>}
    </div>
  );
}

export default function WorkspaceOSHome({
  firstName, companyName, metrics = [], data,
  formatMoney, onOpenWallpaperStudio, onOpenDashboard, wallpaperBackground,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== '#business-os-mobile-apps') return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('business-os-mobile-apps')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const date = new Intl.DateTimeFormat('es-MX', {
    weekday:'long', day:'numeric', month:'long',
  }).format(new Date());
  const pending = Number(data?.kpis?.pendingRequests) || 0;
  const critical = Number(data?.kpis?.criticalStock) || 0;
  const notices = Array.isArray(data?.notifications) ? data.notifications.slice(0, 3) : [];
  const agenda = Array.isArray(data?.agenda) ? data.agenda.slice(0, 3) : [];

  return (
    <div className={styles.desktop} data-business-os-workspace-home="true">
      <header className={styles.welcome}>
        <div>
          <span className={styles.overline}>MI ESCRITORIO · {date}</span>
          <h1>{greeting}, {firstName || 'bienvenido'}</h1>
          <p>{companyName || 'Empresa activa'} · Tu espacio de trabajo empresarial.</p>
          <button type="button" className={styles.workspaceChip} onClick={onOpenWallpaperStudio}>
            <Settings2 size={17} aria-hidden="true"/> Personalizar escritorio
          </button>
        </div>
      </header>

      <section className={styles.launcher} aria-label="Aplicaciones del escritorio">
        <WorkspaceAppShelf variant="os"/>
      </section>

      <section className={styles.control} aria-labelledby="os-control-title">
        <div className={styles.widgetHeader}>
          <h2 id="os-control-title"><ShoppingCart size={19} aria-hidden="true"/> Centro de control</h2>
          <button type="button" onClick={onOpenDashboard}>Ver tablero <ArrowRight size={15} aria-hidden="true"/></button>
        </div>
        {metrics.length ? (
          <div className={styles.metrics}>
            {metrics.slice(0, 2).map((item) => (
              <div className={styles.metric} key={item.id}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.change || 'Indicador del negocio'}</small>
              </div>
            ))}
          </div>
        ) : <p className={styles.empty}>No hay indicadores seleccionados. Puedes elegirlos en el tablero.</p>}
        <MonthlyTrend months={data?.monthlyPurchases || []} formatMoney={formatMoney}/>
      </section>

      <section className={styles.wallpaper} aria-labelledby="os-wallpaper-title">
        <div className={styles.widgetHeader}><h2 id="os-wallpaper-title"><ImageIcon size={19} aria-hidden="true"/> Wallpaper Studio</h2></div>
        <div className={styles.wallpaperPreview} style={{backgroundImage: wallpaperBackground}} aria-hidden="true"/>
        <p>Personaliza el fondo de tu espacio de trabajo.</p>
        <button className={styles.wallpaperButton} type="button" onClick={onOpenWallpaperStudio}>
          <Settings2 size={16} aria-hidden="true"/> Personalizar escritorio <ArrowRight size={16} aria-hidden="true"/>
        </button>
      </section>

      <section className={styles.tasks} aria-labelledby="os-tasks-title">
        <div className={styles.widgetHeader}>
          <h2 id="os-tasks-title"><CheckCircle2 size={19} aria-hidden="true"/> Tareas y avisos</h2>
          <button type="button" onClick={() => navigate('/tareas')}>Ver tareas <ArrowRight size={15} aria-hidden="true"/></button>
        </div>
        <div className={styles.rows}>
          <button type="button" onClick={() => navigate('/compras/solicitudes')}>
            <ClipboardList size={17} aria-hidden="true"/>
            <span>Solicitudes pendientes</span><strong>{pending.toLocaleString('es-MX')}</strong>
          </button>
          <button type="button" onClick={() => navigate('/inventario/existencias')}>
            <PackageX size={17} aria-hidden="true"/>
            <span>Productos con stock crítico</span><strong>{critical.toLocaleString('es-MX')}</strong>
          </button>
          {notices.map((notice, index) => (
            <div key={notice.id || index} className={styles.notice}>
              <CheckCircle2 size={16} aria-hidden="true"/>
              <span><strong>{notice.title || 'Aviso operativo'}</strong><small>{notice.message || 'Consulta las notificaciones.'}</small></span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.agenda} aria-labelledby="os-agenda-title">
        <div className={styles.widgetHeader}>
          <h2 id="os-agenda-title"><CalendarDays size={19} aria-hidden="true"/> Próximos vencimientos</h2>
          <button type="button" onClick={() => navigate('/finanzas/flujo-efectivo')}>Ver flujo <ArrowRight size={15} aria-hidden="true"/></button>
        </div>
        <div className={styles.rows}>
          {agenda.length ? agenda.map((item, index) => (
            <div key={item.id || index} className={styles.agendaRow}>
              <span className={styles.agendaDot} aria-hidden="true"/>
              <div>
                <strong>{item.title || 'Vencimiento financiero'}</strong>
                <small>{item.date && Number.isFinite(new Date(item.date).getTime()) ? new Intl.DateTimeFormat('es-MX', {dateStyle:'medium'}).format(new Date(item.date)) : 'Fecha sin especificar'} · {formatMoney(item.amount)}</small>
              </div>
            </div>
          )) : <p className={styles.empty}>No hay vencimientos próximos.</p>}
        </div>
      </section>
    </div>
  );
}
