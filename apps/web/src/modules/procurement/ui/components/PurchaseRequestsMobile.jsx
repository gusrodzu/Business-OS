import {ChevronRight} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import styles from './PurchaseRequestsMobile.module.css';

// Presentational only: filtering, permissions and mutations stay in PurchaseRequests.
export default function PurchaseRequestsMobile({requests, statusMap, priorityMap, money, onOpen, onResetFilters}) {
  return <div className={styles.list} aria-label="Solicitudes de compra en móvil">
    <div className={styles.heading}><strong>Solicitudes</strong><span>{requests.length} registros</span></div>
    {requests.length ? requests.map(request => {
      const status = statusMap[request.status] || [request.status, 'neutral'];
      const total = (request.items || []).reduce((sum, item) => sum + Number(item.quantity) * Number(item.estimatedUnitCost), 0);
      return <button type="button" key={request.id} className={styles.card} onClick={() => onOpen(request)} aria-label={`Ver solicitud ${request.folio}`}>
        <span className={styles.cardTop}><strong>{request.folio}</strong><Badge tone={status[1]}>{status[0]}</Badge></span>
        <span className={styles.title}>{request.title}</span>
        <span className={styles.meta}>{[request.requestedBy?.firstName, request.requestedBy?.lastName].filter(Boolean).join(' ') || 'Sin solicitante'} · {request.warehouse?.name || 'Sin almacén'}</span>
        <span className={styles.cardBottom}><span><small>{priorityMap[request.priority] || request.priority} · {(request.items || []).length} partidas</small><strong>{money(total)}</strong></span><ChevronRight size={18} aria-hidden="true"/></span>
      </button>;
    }) : <div className={styles.empty}><p>No hay solicitudes para los filtros actuales.</p><button type="button" onClick={onResetFilters}>Limpiar filtros</button></div>}
  </div>;
}
