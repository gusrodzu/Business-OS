import {useState} from 'react';
import {ChevronRight, Search} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import styles from './ReceivablesMobileList.module.css';

const filters = [
  {id: 'ALL', label: 'Todas'},
  {id: 'OPEN', label: 'Pendientes', statuses: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE']},
  {id: 'OVERDUE', label: 'Vencidas', statuses: ['OVERDUE']},
  {id: 'PAID', label: 'Cobradas', statuses: ['PAID']},
  {id: 'CANCELLED', label: 'Canceladas', statuses: ['CANCELLED']},
];

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString('es-MX');
};

export default function ReceivablesMobileList({
  invoices = [], query, onQueryChange, onOpen, statuses, formatMoney,
}) {
  const [status, setStatus] = useState('ALL');
  const active = filters.find(item => item.id === status) || filters[0];
  const visible = invoices.filter(item =>
    !active.statuses || active.statuses.includes(item.displayStatus || item.status)
  );

  return (
    <section className={styles.root} aria-label="Cuentas por cobrar en móvil">
      <label className={styles.search}>
        <Search aria-hidden="true" size={19}/>
        <span className={styles.screenReaderOnly}>Buscar factura o cliente</span>
        <input
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Buscar factura o cliente"
        />
      </label>
      <div className={styles.filters} role="group" aria-label="Filtrar facturas por estado">
        {filters.map(filter => (
          <button
            type="button"
            key={filter.id}
            className={status === filter.id ? styles.chipActive : styles.chip}
            aria-pressed={status === filter.id}
            onClick={() => setStatus(filter.id)}
          >{filter.label}</button>
        ))}
      </div>
      <p className={styles.count} role="status">{visible.length} {visible.length === 1 ? 'factura' : 'facturas'}</p>
      <div className={styles.list}>
        {visible.map(invoice => {
          const stage = invoice.displayStatus || invoice.status;
          const state = statuses[stage] || statuses[invoice.status] || [stage || 'Sin estado', 'neutral'];
          return (
            <button
              key={invoice.id}
              type="button"
              className={styles.record}
              onClick={() => onOpen(invoice)}
              aria-label={`Abrir factura ${invoice.invoiceNumber || 'sin folio'}`}
            >
              <span className={styles.heading}>
                <strong>{invoice.invoiceNumber || 'Sin folio'}</strong>
                <Badge tone={state[1]}>{state[0]}</Badge>
              </span>
              <span className={styles.customer}>{invoice.customer?.commercialName || invoice.customer?.legalName || 'Cliente sin nombre'}</span>
              <span className={styles.due}>Vence: {formatDate(invoice.dueDate)}</span>
              <span className={styles.amounts}>
                <span>Saldo <strong>{formatMoney(invoice.balance, invoice.currency)}</strong></span>
                <span>Total <strong>{formatMoney(invoice.total, invoice.currency)}</strong></span>
                <ChevronRight size={19} aria-hidden="true"/>
              </span>
            </button>
          );
        })}
        {!visible.length ? (
          <div className={styles.empty}>
            <strong>No hay facturas con estos filtros.</strong>
            <span>Busca otro cliente o cambia el estado.</span>
            <button type="button" onClick={() => {setStatus('ALL'); onQueryChange('');}}>
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
