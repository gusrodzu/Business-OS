import {ArrowDownRight, ArrowUpRight, Plus} from 'lucide-react';
import {Button} from '../../../../design-system/components';
import KpiCard from '../../../../components/KpiCard';
import styles from './Dashboard.module.css';

/** Presentation only: metric selection and customization stay in Dashboard. */
export default function DashboardMetricsPanel({kpis, onCustomize}) {
  return (
    <>
      {kpis.length > 0 ? (
      <section id="business-os-mobile-metrics" data-mobile-section="metrics" className={styles.kpiGrid} aria-label="Indicadores principales" data-dashboard-kpi-grid="cards" data-mobile-featured-only={kpis.length <= 2 ? 'true' : 'false'}>
        {kpis.length > 2 ? <h2 className={styles.mobileRemainingTitle}>Más indicadores</h2> : null}
        {kpis.map((item, index) => {
          const Icon = item.icon;
          return (
            <KpiCard
              key={item.id}
              data-dashboard-kpi={item.id}
              data-mobile-featured={index < 2 ? 'true' : undefined}
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
        {kpis.length <= 2 ? (
          <p className={styles.mobileFeaturedSummary}>Tus indicadores seleccionados se muestran en el resumen superior.</p>
        ) : null}
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
