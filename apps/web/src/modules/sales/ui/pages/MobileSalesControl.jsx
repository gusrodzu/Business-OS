import {ArrowRight, ClipboardList, Plus, ShoppingBag, Target} from 'lucide-react';
import styles from './MobileSalesControl.module.css';

const count = (value) =>
  value === null || value === undefined || !Number.isFinite(Number(value))
    ? '—' : new Intl.NumberFormat('es-MX').format(Number(value));

export default function MobileSalesControl({summary, onQuotes, onPipeline, onNewProspect}) {
  const hasAttention = Number(summary?.openQuotes || 0) + Number(summary?.activeOrders || 0) > 0;
  return (
    <section className={styles.control} aria-label="Tu centro comercial móvil" data-mobile-sales-control="true">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>VENTAS / WORKSPACE</span>
        <h2>Tu operación comercial</h2>
        <p>Prospectos, cotizaciones y pedidos en un solo lugar.</p>
      </div>
      <div className={styles.priority}>
        <div className={styles.priorityHeading}>
          <div>
            <span>EN TU RADAR</span>
            <strong>{hasAttention ? 'Seguimientos pendientes' : 'Resumen de actividad'}</strong>
          </div>
          <span className={styles.priorityIcon} aria-hidden="true"><ShoppingBag size={21}/></span>
        </div>
        <div className={styles.numbers}>
          <div>
            <ClipboardList size={17} aria-hidden="true"/>
            <span>Cotizaciones abiertas</span>
            <strong>{count(summary?.openQuotes)}</strong>
          </div>
          <div>
            <ShoppingBag size={17} aria-hidden="true"/>
            <span>Pedidos activos</span>
            <strong>{count(summary?.activeOrders)}</strong>
          </div>
        </div>
        <button type="button" className={styles.primaryAction} onClick={onQuotes}>
          Abrir cotizaciones y pedidos <ArrowRight size={17} aria-hidden="true"/>
        </button>
      </div>
      <nav className={styles.actions} aria-label="Acciones comerciales rápidas">
        <button type="button" onClick={onPipeline}><Target size={18} aria-hidden="true"/> Ver pipeline</button>
        <button type="button" onClick={onNewProspect}><Plus size={18} aria-hidden="true"/> Nuevo prospecto</button>
      </nav>
    </section>
  );
}
