import {ChevronRight, Sparkles} from 'lucide-react';
import styles from '../pages/Dashboard.module.css';

/**
 * Presentational operational insight. Dashboard owns alert priority and navigation.
 */
export default function DashboardInsightBanner({hasAlerts, insight, onViewTasks}) {
  return (
    <section className={styles.insightBanner} data-mobile-section="insight">
      <div className={styles.insightIcon}><Sparkles size={20} /></div>
      <div>
        <strong>{hasAlerts ? 'Requiere tu atención' : 'Operación al día'}</strong>
        <p>{insight}</p>
      </div>
      <button type="button" onClick={onViewTasks}>
        Ver todas las tareas <ChevronRight size={15} />
      </button>
    </section>
  );
}
