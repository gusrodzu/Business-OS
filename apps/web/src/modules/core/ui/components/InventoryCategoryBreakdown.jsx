import styles from './InventoryCategoryBreakdown.module.css';

/**
 * Presentational breakdown of the current tenant's inventory valuation.
 * The parent owns authorization, data fetching, currency and routing.
 */
export default function InventoryCategoryBreakdown({
  totalFormatted,
  categories = [],
  formatNumber,
}) {
  return (
    <div className={styles.breakdown} aria-label="Distribución del inventario por categoría">
      <div className={styles.total}>
        <span className={styles.eyebrow}>VALOR TOTAL</span>
        <strong>{totalFormatted}</strong>
        <small>Inventario registrado</small>
      </div>
      {categories.length ? (
        <div className={styles.list}>
          {categories.map((item, index) => {
            const value = Number(item.percent);
            const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
            const label = item.label || 'Sin categoría';
            return (
              <div className={styles.entry} key={item.label || `category-${index}`}>
                <div className={styles.entryHead}>
                  <span>{label}</span>
                  <strong>{formatNumber(item.percent)}%</strong>
                </div>
                <div
                  className={styles.track}
                  role="meter"
                  aria-label={`Participación de ${label}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                >
                  <span className={styles.fill} style={{width: `${percent}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
      ) : <p className={styles.empty}>Sin categorías con valor registrado.</p>}
    </div>
  );
}
