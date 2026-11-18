import {Badge, Card} from '../../../../design-system/components';
import WidgetHeader from '../pages/DashboardWidgetHeader';
import styles from '../pages/Dashboard.module.css';

const statusTone = {
  Pendiente: 'warning',
  Borrador: 'neutral',
  Aprobada: 'success',
  Rechazada: 'danger',
  Ordenada: 'info',
  Cancelada: 'danger',
};

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase() || 'US';
}

/**
 * Presentation-only dashboard widget. The page owns data loading and navigation.
 */
export default function DashboardRecentRequests({requests = [], currency, formatMoney, onDetail}) {
  return (
    <Card className={`${styles.widget} ${styles.requestsWidget}`}>
      <WidgetHeader title="Solicitudes recientes" description="Últimos movimientos registrados en compras." onDetail={onDetail} />
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Folio</th><th>Área</th><th>Solicitante</th><th>Monto</th><th>Estado</th></tr></thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td><strong>{request.folio}</strong></td>
                <td>{request.area}</td>
                <td><span className={styles.person}><i>{getInitials(request.requester)}</i>{request.requester}</span></td>
                <td>{formatMoney(request.amount, currency)}</td>
                <td><Badge tone={statusTone[request.status] || 'neutral'} dot>{request.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!requests.length ? <div className={styles.empty}>No hay solicitudes registradas.</div> : null}
      </div>
    </Card>
  );
}
