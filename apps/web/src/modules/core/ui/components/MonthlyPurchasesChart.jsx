import {TrendingUp} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import styles from './MonthlyPurchasesChart.module.css';

// Read-only widget visualization. Dashboard owns authenticated data and navigation.
function purchaseMonthDate(item) {
  const year = Number(item?.year);
  const month = Number(item?.month);
  if (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12) {
    return new Date(Date.UTC(year, month - 1, 1));
  }
  const input = item?.date || item?.month;
  if (input == null || input === '') return null;
  const value = new Date(input);
  return Number.isNaN(value.getTime()) ? null : value;
}

function monthInitial(item) {
  const date = purchaseMonthDate(item);
  return date
    ? new Intl.DateTimeFormat('es-MX', {month: 'short'}).format(date).replace('.', '').slice(0, 1).toUpperCase()
    : '—';
}

export default function MonthlyPurchasesChart({totalFormatted, values = [], months = []}) {
  const safeValues = values.length ? values : [0];
  const max = Math.max(...safeValues, 1);
  return (
    <div className={styles.content}>
      <div className={styles.summary}>
        <div>
          <strong>{totalFormatted}</strong>
          <span><TrendingUp size={14} aria-hidden="true"/> últimos 12 meses</span>
        </div>
        <Badge tone="info">{new Date().getFullYear()}</Badge>
      </div>
      <div className={styles.barChart} role="img" aria-label="Gráfica de compras mensuales">
        {safeValues.map((value, index) => (
          <span key={`${value}-${index}`}>
            <i style={{height: `${value ? Math.max(12, (value / max) * 100) : 4}%`}} />
          </span>
        ))}
      </div>
      <div className={styles.monthLabels}>
        {months.map((item, index) => (
          <span key={item.key || item.date || `${item.year || 'y'}-${item.month || index}`}>
            {monthInitial(item)}
          </span>
        ))}
      </div>
    </div>
  );
}
