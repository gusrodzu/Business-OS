import {ArrowDownRight, ArrowUpRight, Plus} from 'lucide-react';
import {Button} from '../../../../design-system/components';
import KpiCard from '../../../../components/KpiCard';
import styles from './Dashboard.module.css';

/** Presentation only: metric selection and customization stay in Dashboard. */
export default function DashboardMetricsPanel({kpis, onCustomize}) {
  return (
    <>
      {kpis.length > 0 ? (
      <section id="business-os-mobile-metrics" data-mobile-section="metrics" className={styles.kpiGrid} aria-label="Indicadores principales" data-dashboard-kpi-grid="cards">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <KpiCard
              key={item.id}
              data-dashboard-kpi={item.id}
              className={`${styles.kpiCard} ${styles[`kpi${item.tone[0].toUpperCase()}${item.tone.slice(1)}`] || ''}`}
            >
              <div className={`${styles.kpiIcon} ${styles[item.tone] || ''}`}>
                {Icon ? <Icon size={20} aria-hidden="true" /> : null}
              </div>
              <div className={styles.kpiMeta}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <span className={`${styles.change} ${styles[item.trend] || ''}`}>
                {item.trend === 'up' ? <ArrowUpRight size={14} aria-hidden="true" /> : null}
                {item.trend === 'down' ? <ArrowDownRight size={14} aria-hidden="true" /> : null}
                {item.change}
              </span>
            </KpiCard>
          );
        })}
      </section>
      ) : (
        <section id="business-os-mobile-metrics" data-mobile-section="metrics" className={styles.kpiEmpty} aria-label="Indicadores principales" data-dashboard-kpi-empty="true">
          <div>
            <h2>Tu panel de indicadores está vacío</h2>
            <p>Agrega las tarjetas de indicadores que necesitas consultar.</p>
          </div>
          <Button variant="secondary" icon={Plus} onClick={() => onCustomize()}>
            Agregar indicadores
          </Button>
        </section>
      )}

    </>
  );
}
