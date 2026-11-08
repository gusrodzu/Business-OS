import styles from '../pages/Inventory.module.css';

const num = value => Number(value || 0).toLocaleString('es-MX', {maximumFractionDigits: 3});

/** Read-only inventory distribution; aggregation stays in the parent page. */
export default function InventoryWarehouseDistribution({warehousesCount, distribution}) {
  return (
        <section className={styles.vaultChartCard} aria-label="Disponibilidad de inventario por almacén">
          <header className={styles.vaultCardHeader}>
            <div><span className={styles.vaultEyebrow}>Análisis de inventario</span><h2>Distribución por almacén</h2><p>Unidades disponibles en cada almacén, sin proyecciones.</p></div>
            <span className={styles.vaultCounter}>{warehousesCount} almacenes</span>
          </header>
          {distribution.length ? (
            <div className={styles.vaultBarList}>
              {distribution.map(item=><div className={styles.vaultBarItem} key={item.id}>
                <div className={styles.vaultBarLabels}><span title={item.name}>{item.name}</span><strong>{num(item.units)} unidades</strong></div>
                <div className={styles.vaultBarTrack} role="img" aria-label={`${item.name}: ${num(item.units)} unidades disponibles`}><span style={{width:`${item.width}%`}}/></div>
              </div>)}
            </div>
          ) : <p className={styles.vaultEmpty}>Todavía no hay movimientos de inventario para comparar almacenes.</p>}
          <footer className={styles.vaultChartFooter}><span className={styles.vaultLegendDot}/> Existencia disponible · datos del inventario actual</footer>
        </section>
  );
}
