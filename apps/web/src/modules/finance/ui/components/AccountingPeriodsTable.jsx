import {Badge} from '../../../../design-system/components';
import styles from './AccountingPeriodsTable.module.css';

export default function AccountingPeriodsTable({periods, date}) {
  return (
    <table className={styles.table}>
      <thead><tr><th>Periodo</th><th>Inicio</th><th>Fin</th><th>Estado</th><th></th></tr></thead>
      <tbody>
        {periods.map((period) => (
          <tr key={period.id}>
            <td><strong>{period.name}</strong></td>
            <td>{date(period.startDate)}</td>
            <td>{date(period.endDate)}</td>
            <td><Badge tone={period.status === 'OPEN' ? 'success' : 'neutral'}>{period.status}</Badge></td>
            <td></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
