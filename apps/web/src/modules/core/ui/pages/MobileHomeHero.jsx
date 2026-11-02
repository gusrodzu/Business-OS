import {ArrowRight, ClipboardCheck, PackageX, Plus, Settings2, Sparkles} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import styles from './MobileHomeHero.module.css';

// Keep the company heading separate from the operational panels so the app
// launcher can appear in the first viewport instead of below a tall card.
export default function MobileHomeHero({firstName, companyName, roleName, offlineDemo}) {
  return (
    <section className={styles.mobileHero} data-business-os-mobile-home="true" aria-label="Inicio de tu espacio de trabajo">
      <div className={styles.intro}>
        <span className={styles.eyebrow}><Sparkles size={14} aria-hidden="true"/> BUSINESS OS / WORKSPACE</span>
        <h1>Hola, {firstName || 'bienvenido'} <span aria-hidden="true">👋</span></h1>
        <div className={styles.context}>
          <span className={styles.company}>{companyName || 'Empresa activa'}</span>
          <span className={styles.dot} aria-hidden="true"/>
          <span>{roleName || 'Colaborador'}</span>
          {offlineDemo ? <span className={styles.demo}>Datos simulados</span> : null}
        </div>
      </div>
    </section>
  );
}

export function MobileHomePriority({pendingRequests, criticalStock, onCustomize}) {
  const navigate = useNavigate();
  const pending = Number.isFinite(Number(pendingRequests)) ? Math.max(0, Number(pendingRequests)) : null;
  const stock = Number.isFinite(Number(criticalStock)) ? Math.max(0, Number(criticalStock)) : null;
  const needsAttention = (pending || 0) + (stock || 0) > 0;

  return (
    <section className={styles.mobilePriority} aria-label="Prioridades y acciones del negocio">
      <div className={styles.priority} aria-label="Prioridades de la empresa">
        <div className={styles.priorityHead}>
          <div>
            <span>PARA HOY</span>
            <h2>{needsAttention ? 'Prioridades del negocio' : 'Todo bajo control'}</h2>
          </div>
          <span className={styles.priorityIcon} aria-hidden="true"><Sparkles size={19}/></span>
        </div>
        <p>{needsAttention ? 'Revisa la operación que necesita atención.' : 'Consulta los registros y próximos pendientes.'}</p>
        <div className={styles.priorityStats}>
          <div className={styles.priorityStat}>
            <ClipboardCheck size={17} aria-hidden="true"/>
            <span>Solicitudes</span>
            <strong>{pending == null ? '—' : pending.toLocaleString('es-MX')}</strong>
            <small>Pendientes</small>
          </div>
          <div className={styles.priorityStat}>
            <PackageX size={17} aria-hidden="true"/>
            <span>Inventario</span>
            <strong>{stock == null ? '—' : stock.toLocaleString('es-MX')}</strong>
            <small>Stock crítico</small>
          </div>
        </div>
        <button type="button" className={styles.priorityAction} onClick={() => navigate('/tareas')}>
          Revisar tareas <ArrowRight size={17} aria-hidden="true"/>
        </button>
      </div>
      <div className={styles.quickActions} aria-label="Acciones del workspace">
        <button type="button" onClick={() => navigate('/compras/solicitudes')}>
          <Plus size={17} aria-hidden="true"/> Nueva solicitud
        </button>
        <button type="button" onClick={onCustomize}>
          <Settings2 size={17} aria-hidden="true"/> Personalizar
        </button>
      </div>

    </section>
  );
}
