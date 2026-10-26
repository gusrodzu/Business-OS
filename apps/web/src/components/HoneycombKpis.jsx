import {ArrowDownRight, ArrowUpRight} from 'lucide-react';
import styles from './HoneycombKpis.module.css';

/**
 * Dashboard-only KPI presentation. It consumes existing KPI values and icons,
 * so data adapters, offline fixtures and downstream widgets remain unchanged.
 */
export default function HoneycombKpis({items = [], compact = false}) {
  return (
    <section
      className={`${styles.honeycomb} ${compact ? styles.compact : ''}`.trim()}
      aria-label="Indicadores clave del negocio"
      data-honeycomb-kpis="true"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const TrendIcon = item.trend === 'down' ? ArrowDownRight : ArrowUpRight;
        const toneClass = styles[item.tone] || '';
        return (
          <article
            className={`${styles.cell} ${toneClass}`.trim()}
            key={item.label}
          >
            <div className={styles.content}>
              <div className={styles.icon} aria-hidden="true">
                {Icon ? <Icon size={19} strokeWidth={2.15} /> : null}
              </div>
              <span className={styles.label}>{item.label}</span>
              <strong className={styles.value}>{item.value}</strong>
              <span className={`${styles.change} ${item.trend === 'down' ? styles.down : styles.up}`}>
                <TrendIcon size={13} aria-hidden="true" />
                {item.change}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
