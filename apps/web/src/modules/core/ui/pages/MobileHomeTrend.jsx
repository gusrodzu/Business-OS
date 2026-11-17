import styles from './MobileHomeTrend.module.css';

const asAmount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

function monthLabel(item) {
  const year = Number(item?.year);
  const month = Number(item?.month);
  const date = Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12
    ? new Date(Date.UTC(year, month - 1, 1))
    : item?.date ? new Date(item.date) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('es-MX', {month: 'short', timeZone: 'UTC'}).format(date).replace('.', '')
    : '—';
}

/**
 * Pure presentation of already loaded tenant-scoped Dashboard data.
 * The chart shows purchases, not sales, so labels and amounts stay truthful.
 */
export default function MobileHomeTrend({metrics = [], purchases = [], formatMoney}) {
  const series = purchases.slice(-6);
  const values = series.map((item) => asAmount(item?.total));
  const hasData = series.length > 0;
  const max = Math.max(1, ...values);
  const width = 320;
  const height = 112;
  const left = 8;
  const right = width - 8;
  const top = 10;
  const bottom = height - 12;
  const points = values.map((value, index) => ({
    x: left + (values.length === 1 ? (right - left) / 2 : index * (right - left) / (values.length - 1)),
    y: bottom - (value / max) * (bottom - top),
  }));
  const line = points.map(({x, y}, index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const area = points.length > 1
    ? `${line} L ${points[points.length - 1].x.toFixed(2)} ${bottom} L ${points[0].x.toFixed(2)} ${bottom} Z`
    : '';
  const total = values.reduce((sum, value) => sum + value, 0);

  return (
    <div className={styles.trend}>
      {metrics.length ? (
        <div className={styles.metrics} aria-label="Indicadores favoritos de la empresa">
          {metrics.slice(0, 2).map((item) => (
            <div className={styles.metric} key={item.id}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.change}</small>
            </div>
          ))}
        </div>
      ) : null}
      <div className={styles.chartHeading}>
        <div>
          <span>COMPRAS · ÚLTIMOS REGISTROS MENSUALES</span>
          <strong>{hasData ? formatMoney(total) : 'Sin datos disponibles'}</strong>
        </div>
        <span className={styles.period}>{series.length ? `${series.length} ${series.length === 1 ? 'mes' : 'meses'}` : 'Sin periodo'}</span>
      </div>
      {hasData ? (
        <div className={styles.chart} role="img"
          aria-label={`Compras mensuales de los últimos ${series.length} registros; total ${formatMoney(total)}`}>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.gridLine} d={`M ${left} ${bottom} L ${right} ${bottom}`}/>
            <path className={styles.gridLine} d={`M ${left} ${(top + bottom) / 2} L ${right} ${(top + bottom) / 2}`}/>
            {area ? <path className={styles.area} d={area}/> : null}
            <path className={styles.line} d={line} />
            {points.length === 1 ? <circle className={styles.point} cx={points[0].x} cy={points[0].y} r="3"/> : null}
          </svg>
          <div className={styles.months} aria-hidden="true">
            {series.map((item, index) => (
              <span key={item.key || `${item.year || 'y'}-${item.month || index}`}>{monthLabel(item)}</span>
            ))}
          </div>
        </div>
      ) : (
        <p className={styles.empty}>Cuando existan compras registradas, su evolución aparecerá aquí.</p>
      )}
    </div>
  );
}
