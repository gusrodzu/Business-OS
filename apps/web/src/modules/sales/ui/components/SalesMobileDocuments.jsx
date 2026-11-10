import {useState} from 'react';
import {ArrowDownUp, ChevronRight, Search} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import styles from './SalesMobileDocuments.module.css';

const filters = {
  quotes: [
    {id: 'all', label: 'Todas'},
    {id: 'draft', label: 'Borradores', statuses: ['DRAFT']},
    {id: 'sent', label: 'Enviadas', statuses: ['SENT']},
    {id: 'accepted', label: 'Aceptadas', statuses: ['ACCEPTED']},
    {id: 'closed', label: 'Cerradas', statuses: ['REJECTED', 'EXPIRED', 'CONVERTED', 'CANCELLED']},
  ],
  orders: [
    {id: 'all', label: 'Todos'},
    {id: 'pending', label: 'Por entregar', statuses: ['CONFIRMED', 'PARTIALLY_DELIVERED']},
    {id: 'draft', label: 'Borradores', statuses: ['DRAFT']},
    {id: 'delivered', label: 'Entregados', statuses: ['DELIVERED', 'INVOICED']},
    {id: 'cancelled', label: 'Cancelados', statuses: ['CANCELLED']},
  ],
};

function documentDate(item, isQuote) {
  const value = isQuote ? item.quoteDate : item.orderDate;
  const parsed = value ? new Date(value) : null;
  return parsed && Number.isFinite(parsed.getTime()) ? parsed : null;
}

function dateGroup(date) {
  if (!date) return 'Sin fecha';
  const today = new Date();
  const dayKey = (value) => `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
  if (dayKey(date) === dayKey(today)) return 'Hoy';
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (dayKey(date) === dayKey(yesterday)) return 'Ayer';
  return date.toLocaleDateString('es-MX', {day: 'numeric', month: 'long', year: 'numeric'});
}

/**
 * Presentation-only, mobile document list.
 * The Sales page owns tenant-scoped loading, search, detail and mutations.
 * A key={tab} from Sales resets the local status filter when switching tabs.
 */
export default function SalesMobileDocuments({
  tab, records = [], query, onQueryChange, onOpen, formatMoney,
  statusLabels, statusTones,
}) {
  const isQuote = tab === 'quotes';
  const availableFilters = filters[tab] || filters.orders;
  const [filterId, setFilterId] = useState('all');
  const [oldestFirst, setOldestFirst] = useState(false);
  const activeFilter = availableFilters.find((filter) => filter.id === filterId) || availableFilters[0];

  const filtered = records
    .filter((item) => !activeFilter.statuses || activeFilter.statuses.includes(item.status))
    .slice()
    .sort((left, right) => {
      const a = documentDate(left, isQuote)?.getTime() || 0;
      const b = documentDate(right, isQuote)?.getTime() || 0;
      return oldestFirst ? a - b : b - a;
    });

  const groups = [];
  for (const item of filtered) {
    const label = dateGroup(documentDate(item, isQuote));
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(item);
    else groups.push({label, items: [item]});
  }

  return (
    <section className={styles.root} aria-label={isQuote ? 'Lista móvil de cotizaciones' : 'Lista móvil de pedidos'}>
      <div className={styles.searchBar}>
        <Search size={20} aria-hidden="true" />
        <input
          type="search"
          aria-label={isQuote ? 'Buscar cotizaciones' : 'Buscar pedidos'}
          placeholder={isQuote ? 'Buscar cotización o cliente' : 'Buscar pedido o cliente'}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <button
          type="button"
          className={styles.sortButton}
          aria-label={oldestFirst ? 'Ordenar por más recientes' : 'Ordenar por más antiguos'}
          aria-pressed={oldestFirst}
          title={oldestFirst ? 'Más antiguos primero' : 'Más recientes primero'}
          onClick={() => setOldestFirst((value) => !value)}
        >
          <ArrowDownUp size={20} aria-hidden="true"/>
        </button>
      </div>

      <div className={styles.filterRail} role="group" aria-label="Filtrar por estado">
        {availableFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`${styles.chip} ${activeFilter.id === filter.id ? styles.selected : ''}`}
            aria-pressed={activeFilter.id === filter.id}
            onClick={() => setFilterId(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className={styles.listSummary} role="status">
        {filtered.length} {isQuote ? (filtered.length === 1 ? 'cotización' : 'cotizaciones') : (filtered.length === 1 ? 'pedido' : 'pedidos')}
      </div>

      {groups.length ? groups.map((group) => (
        <div className={styles.group} key={group.label}>
          <h3 className={styles.groupTitle}>{group.label}</h3>
          <div className={styles.rows}>
            {group.items.map((item) => {
              const customer = item.customer?.commercialName || item.customer?.legalName || 'Cliente sin nombre';
              const itemCount = Array.isArray(item.items) ? item.items.length : null;
              return (
                <button
                  type="button"
                  className={styles.record}
                  key={item.id}
                  aria-label={`Abrir ${isQuote ? 'cotización' : 'pedido'} ${item.folio || 'sin folio'}`}
                  onClick={() => onOpen(item)}
                >
                  <span className={styles.recordBody}>
                    <span className={styles.recordTop}>
                      <strong>{item.folio || 'Sin folio'}</strong>
                      <b>{formatMoney(item.total)}</b>
                    </span>
                    <span className={styles.customer}>{customer}</span>
                    <span className={styles.meta}>
                      {itemCount !== null ? `${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}` : ''}
                      {itemCount !== null ? <span aria-hidden="true">·</span> : null}
                      {isQuote ? 'Cotización comercial' : 'Pedido de venta'}
                    </span>
                    <span className={styles.badges}>
                      <Badge tone={statusTones[item.status] || 'neutral'}>
                        {statusLabels[item.status] || item.status || 'Sin estado'}
                      </Badge>
                    </span>
                  </span>
                  <ChevronRight className={styles.chevron} size={18} aria-hidden="true"/>
                </button>
              );
            })}
          </div>
        </div>
      )) : (
        <div className={styles.empty}>
          <strong>No hay {isQuote ? 'cotizaciones' : 'pedidos'} con estos filtros.</strong>
          <span>Prueba otra búsqueda o selecciona «Todos».</span>
          <button type="button" onClick={() => {setFilterId('all'); onQueryChange('');}}>
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
}
