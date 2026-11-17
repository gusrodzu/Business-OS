import {ArrowRight, CalendarDays, ClipboardList, PackageX, Settings2} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import WorkspaceAppShelf from './WorkspaceAppShelf';
import styles from './WorkspacePocketHome.module.css';

// Pocket OS is a dedicated phone workspace, not the desktop dashboard squeezed
// into one column. Every number and app still comes from the existing domain.
export default function WorkspacePocketHome({
  firstName, companyName, metrics = [], data,
  formatMoney, onOpenWallpaperStudio, onOpenDashboard,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== '#business-os-mobile-apps') return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('business-os-mobile-apps')?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const pending = Number(data?.kpis?.pendingRequests) || 0;
  const critical = Number(data?.kpis?.criticalStock) || 0;
  const notices = Array.isArray(data?.notifications) ? data.notifications.slice(0, 2) : [];
  const agenda = Array.isArray(data?.agenda) ? data.agenda.slice(0, 2) : [];

  return (
    <div className={styles.pocket} data-business-os-pocket-home="true">
      <header className={styles.hero}>
        <span className={styles.eyebrow}>MI ESPACIO DE TRABAJO</span>
        <h1>{greeting}, {firstName || 'bienvenido'}</h1>
        <p>{companyName || 'Empresa activa'}</p>
        <button type="button" className={styles.personalize}
          onClick={onOpenWallpaperStudio}>
          <Settings2 size={17} aria-hidden="true"/> Personalizar escritorio
        </button>
      </header>

      {metrics.length ? (
        <section className={styles.metrics} aria-label="Indicadores de mi empresa">
          {metrics.slice(0, 2).map((item) => (
            <div key={item.id} className={styles.metric}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.change || 'Indicador del negocio'}</small>
            </div>
          ))}
        </section>
      ) : null}

      <section className={styles.appSpace} aria-label="Lanzador de aplicaciones">
        <WorkspaceAppShelf />
      </section>

      <section className={styles.control} aria-labelledby="pocket-priorities-heading">
        <div className={styles.sectionHeading}>
          <h2 id="pocket-priorities-heading">Centro de control</h2>
          <button type="button" onClick={onOpenDashboard}>
            Ver tablero <ArrowRight size={16} aria-hidden="true"/>
          </button>
        </div>
        <div className={styles.quickGrid}>
          <button type="button" onClick={() => navigate('/compras/solicitudes')}>
            <ClipboardList size={21} aria-hidden="true"/>
            <strong>{pending.toLocaleString('es-MX')}</strong>
            <span>Solicitudes pendientes</span>
          </button>
          <button type="button" onClick={() => navigate('/inventario/existencias')}>
            <PackageX size={21} aria-hidden="true"/>
            <strong>{critical.toLocaleString('es-MX')}</strong>
            <span>Productos con stock crítico</span>
          </button>
        </div>
      </section>

      <section className={styles.activity} aria-labelledby="pocket-activity-heading">
        <div className={styles.sectionHeading}>
          <h2 id="pocket-activity-heading">Actividad reciente</h2>
          <button type="button" onClick={() => navigate('/configuracion/actividad')}>
            Ver actividad <ArrowRight size={16} aria-hidden="true"/>
          </button>
        </div>
        {notices.length ? notices.map((notice, index) => (
          <div key={notice.id || index} className={styles.activityRow}>
            <span className={styles.bullet} aria-hidden="true"/>
            <div><strong>{notice.title || 'Aviso operativo'}</strong>
              <p>{notice.message || 'Consulta los detalles en el centro de actividad.'}</p></div>
          </div>
        )) : <p className={styles.empty}>No hay avisos recientes.</p>}
      </section>

      {agenda.length ? (
        <section className={styles.activity} aria-labelledby="pocket-agenda-heading">
          <div className={styles.sectionHeading}>
            <h2 id="pocket-agenda-heading"><CalendarDays size={18} aria-hidden="true"/> Próximos vencimientos</h2>
            <button type="button" onClick={() => navigate('/finanzas/flujo-efectivo')}>
              Ver flujo <ArrowRight size={16} aria-hidden="true"/>
            </button>
          </div>
          {agenda.map((item, index) => (
            <div key={item.id || index} className={styles.activityRow}>
              <span className={styles.bullet} aria-hidden="true"/>
              <div><strong>{item.title || 'Vencimiento'}</strong>
                <p>{item.date && Number.isFinite(new Date(item.date).getTime())
                  ? new Intl.DateTimeFormat('es-MX', {dateStyle: 'medium'}).format(new Date(item.date))
                  : 'Fecha por confirmar'} · {formatMoney(item.amount)}</p></div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
