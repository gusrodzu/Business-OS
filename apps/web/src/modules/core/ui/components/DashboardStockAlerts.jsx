import {Box} from 'lucide-react';
import {Badge, Card} from '../../../../design-system/components';
import WidgetHeader from '../pages/DashboardWidgetHeader';
import styles from '../pages/Dashboard.module.css';

/**
 * Presentational stock alerts widget. Data loading and visibility stay in Dashboard.
 * Reuses the existing dashboard CSS Module to preserve responsive layout and themes.
 */
export default function DashboardStockAlerts({products = [], formatNumber}) {
  return (
    <Card className={`${styles.widget} ${styles.stockWidget}`}>
      <WidgetHeader
        title="Alertas de inventario"
        description="Productos por debajo del stock mínimo."
        badge={<Badge tone={products.length ? 'danger' : 'success'}>{products.length} críticas</Badge>}
      />
      <div className={styles.stockList}>
        {products.map((item) => (
          <div key={`${item.sku}-${item.warehouse}`}>
            <span className={styles.stockIcon}><Box size={18} /></span>
            <div><strong>{item.name}</strong><small>{item.sku} · {item.warehouse}</small></div>
            <div className={styles.stockNumbers}><strong>{formatNumber(item.stock)}</strong><small>Mín. {formatNumber(item.min)}</small></div>
          </div>
        ))}
        {!products.length ? <div className={styles.empty}>Sin alertas críticas.</div> : null}
      </div>
    </Card>
  );
}
