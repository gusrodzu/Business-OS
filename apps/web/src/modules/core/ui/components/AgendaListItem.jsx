import {ChevronRight} from 'lucide-react';
import styles from './AgendaListItem.module.css';

// Read-only visual row. The Dashboard keeps the data source and destination.
export default function AgendaListItem({date, title, meta, tone = 'amber'}) {
  const parsed = new Date(date);
  const validDate = !Number.isNaN(parsed.getTime());
  const day = validDate ? String(parsed.getDate()).padStart(2, '0') : '—';
  const month = validDate
    ? new Intl.DateTimeFormat('es-MX', {month: 'short'}).format(parsed).replace('.', '').slice(0, 3).toUpperCase()
    : '—';

  return (
    <div className={styles.item}>
      <span className={`${styles.date} ${tone === 'blue' ? styles.receivable : styles.payable}`}>
        <strong>{day}</strong>
        <small>{month}</small>
      </span>
      <div className={styles.details}>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
      <ChevronRight size={16} aria-hidden="true" className={styles.arrow}/>
    </div>
  );
}
