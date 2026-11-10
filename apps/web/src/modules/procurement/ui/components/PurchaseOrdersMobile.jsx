import {ChevronRight, Search} from 'lucide-react';
import {useMemo, useState} from 'react';
import {Badge} from '../../../../design-system/components';
import styles from './PurchaseOrdersMobile.module.css';

const filters = [
  {value: 'ALL', label: 'Todas'},
  {value: 'DRAFT', label: 'Borradores'},
  {value: 'ISSUED', label: 'Emitidas'},
  {value: 'PARTIALLY_RECEIVED', label: 'Parciales'},
  {value: 'RECEIVED', label: 'Recibidas'},
  {value: 'CANCELLED', label: 'Canceladas'},
];

export default function PurchaseOrdersMobile({orders, query, onQueryChange, onOpen, statusMap, formatMoney}) {
  const [status, setStatus] = useState('ALL');
  const visible = useMemo(() => orders.filter(order => status === 'ALL' || order.status === status), [orders, status]);

  return <section className={styles.mobile} aria-label="Listado móvil de órdenes de compra">
    <label className={styles.search}>
      <Search size={18} aria-hidden="true" />
      <span className={styles.srOnly}>Buscar órdenes</span>
      <input type="search" value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Buscar orden o proveedor" />
    </label>
    <div className={styles.filters} role="group" aria-label="Filtrar órdenes por estado">
      {filters.map(filter => <button key={filter.value} type="button" className={status === filter.value ? styles.selected : styles.chip} aria-pressed={status === filter.value} onClick={() => setStatus(filter.value)}>{filter.label}</button>)}
    </div>
    <p className={styles.count}>{visible.length} {visible.length === 1 ? 'orden' : 'órdenes'}</p>
    <div className={styles.list}>
      {visible.map(order => {
        const state = statusMap[order.status] || [order.status, 'neutral'];
        return <button key={order.id} type="button" className={styles.record} onClick={() => onOpen(order)} aria-label={`Ver orden ${order.folio}`}>
          <span className={styles.recordTop}><strong>{order.folio}</strong><Badge tone={state[1]}>{state[0]}</Badge></span>
          <span className={styles.supplier}>{order.supplier?.commercialName || order.supplier?.legalName || 'Proveedor sin nombre'}</span>
          <span className={styles.recordBottom}><span>{order.purchaseRequest?.folio || 'Compra directa'} · {order.warehouse?.name || 'Sin almacén'}</span><strong>{formatMoney(order.total, order.currency)}</strong><ChevronRight size={18} aria-hidden="true" /></span>
        </button>;
      })}
      {!visible.length && <div className={styles.empty}>No hay órdenes para estos filtros.</div>}
    </div>
  </section>;
}
