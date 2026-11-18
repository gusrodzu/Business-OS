import {useMemo, useState} from 'react';
import {ArrowRight, FileText, Plus, Search, ShoppingBag, X} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import styles from './SalesOSDocuments.module.css';

const orderActions = {DRAFT: ['Confirmar pedido','CONFIRMED'], CONFIRMED: ['Marcar entregado','DELIVERED'], DELIVERED: ['Marcar facturado','INVOICED']};

function humanDate(value) {
  if (!value) return 'Fecha no indicada';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Fecha no indicada'
    : new Intl.DateTimeFormat('es-MX', {dateStyle: 'short'}).format(parsed);
}

function tone(status) {
  if (['DELIVERED','INVOICED','ACCEPTED','CONVERTED'].includes(status)) return 'success';
  if (['CONFIRMED','SENT','PARTIALLY_DELIVERED'].includes(status)) return 'info';
  if (['REJECTED','EXPIRED','CANCELLED'].includes(status)) return 'danger';
  if (status === 'DRAFT') return 'muted';
  return 'warning';
}

/** Read-only master/detail shell around the existing Sales domain actions. */
export default function SalesOSDocuments({
  orders = [], quotes = [], orderLabels = {}, quoteLabels = {}, formatMoney,
  onNewQuote, onOpenDetail, onUpdateOrder, onUpdateQuote, onConvertQuote,
}) {
  const navigate = useNavigate();
  const [kind, setKind] = useState('orders');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const records = kind === 'orders' ? orders : quotes;
  const statuses = kind === 'orders' ? orderLabels : quoteLabels;

  const filtered = useMemo(() => records.filter((record) => {
    const matchesStatus = status === 'ALL' || record.status === status;
    const label = `${record.folio || ''} ${record.customer?.commercialName || record.customer?.legalName || ''}`.toLocaleLowerCase('es');
    return matchesStatus && label.includes(query.toLocaleLowerCase('es').trim());
  }), [records, status, query]);
  const selected = filtered.find((record) => record.id === selectedId) || filtered[0] || null;
  const selectedName = selected?.customer?.commercialName || selected?.customer?.legalName || 'Cliente no especificado';

  function changeKind(next) {
    setKind(next);
    setQuery('');
    setStatus('ALL');
    setSelectedId(null);
  }

  const orderAction = selected && kind === 'orders' ? orderActions[selected.status] : null;

  return (
    <section className={styles.shell} aria-label="Documentos de Ventas">
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>BUSINESS OS · VENTAS</span>
          <h2>Ventas</h2>
          <p>Pedidos y cotizaciones de la empresa activa.</p>
        </div>
        <button type="button" className={styles.primaryAction} onClick={onNewQuote}>
          <Plus size={18} aria-hidden="true"/> Nueva cotización
        </button>
      </header>
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="group" aria-label="Tipos de documento">
          <button type="button" className={kind === 'orders' ? styles.tabActive : ''} aria-pressed={kind === 'orders'} onClick={() => changeKind('orders')}>Pedidos <span>{orders.length}</span></button>
          <button type="button" className={kind === 'quotes' ? styles.tabActive : ''} aria-pressed={kind === 'quotes'} onClick={() => changeKind('quotes')}>Cotizaciones <span>{quotes.length}</span></button>
        </div>
        <label className={styles.search}>
          <Search size={17} aria-hidden="true"/>
          <input type="search" placeholder="Buscar folio o cliente" aria-label="Buscar pedidos y cotizaciones"
            value={query} onChange={(event) => setQuery(event.target.value)}/>
          {query ? <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X size={16}/></button> : null}
        </label>
      </div>
      <div className={styles.statuses} role="group" aria-label="Filtrar por estado">
        <button type="button" className={status === 'ALL' ? styles.statusActive : ''} aria-pressed={status === 'ALL'} onClick={() => setStatus('ALL')}>
          Todos <span>{records.length}</span>
        </button>
        {Object.entries(statuses).map(([key, label]) => {
          const count = records.filter((record) => record.status === key).length;
          if (!count) return null;
          return <button key={key} type="button" className={status === key ? styles.statusActive : ''}
            aria-pressed={status === key} onClick={() => setStatus(key)}>{label} <span>{count}</span></button>;
        })}
      </div>
      <div className={styles.split}>
        <section className={styles.list} aria-labelledby="os-sales-list-title">
          <header className={styles.listHead}>
            <h3 id="os-sales-list-title">{kind === 'orders' ? 'Pedidos' : 'Cotizaciones'}</h3>
            <span>{filtered.length} registros</span>
          </header>
          <div className={styles.listRows}>
            {filtered.map((record) => {
              const active = selected?.id === record.id;
              return (
                <button type="button" key={record.id} className={styles.listRow} data-selected={active ? 'true' : 'false'}
                  aria-pressed={active} onClick={() => setSelectedId(record.id)}>
                  <span className={styles.documentIcon}><FileText size={18} aria-hidden="true"/></span>
                  <span className={styles.recordText}>
                    <strong>{record.folio}</strong>
                    <small>{record.customer?.commercialName || record.customer?.legalName || 'Cliente no especificado'}</small>
                    <small>{humanDate(kind === 'orders' ? record.orderDate : record.quoteDate)}</small>
                  </span>
                  <span className={styles.recordValue}>
                    <strong>{formatMoney(record.total)}</strong>
                    <span className={styles.status} data-tone={tone(record.status)}>{statuses[record.status] || record.status}</span>
                  </span>
                </button>
              );
            })}
            {!filtered.length ? <div className={styles.empty}>No hay documentos que coincidan con la búsqueda o el filtro.</div> : null}
          </div>
        </section>
        <article className={styles.detail} aria-label={selected ? `Detalle de ${selected.folio}` : 'Selecciona un documento'}>
          {selected ? (
            <>
              <header className={styles.detailHeader}>
                <div><span>{kind === 'orders' ? 'Pedido de venta' : 'Cotización comercial'}</span><h3>{selected.folio}</h3><small>{humanDate(kind === 'orders' ? selected.orderDate : selected.quoteDate)}</small></div>
                <span className={styles.status} data-tone={tone(selected.status)}>{statuses[selected.status] || selected.status}</span>
              </header>
              <div className={styles.customer}>
                <span>Cliente</span>
                <strong>{selectedName}</strong>
                {selected.customer?.code ? <small>{selected.customer.code}</small> : null}
              </div>
              <div className={styles.lineItems}>
                <h4>Artículos ({selected.items?.length || 0})</h4>
                {(selected.items || []).map((item, index) => (
                  <div className={styles.lineItem} key={item.id || index}>
                    <span><strong>{item.product?.name || item.description || 'Artículo'}</strong><small>{item.product?.sku || 'Sin SKU'}</small></span>
                    <span>{Number(item.quantity) || 0} × {formatMoney(item.unitPrice)}</span>
                    <strong>{formatMoney(item.total)}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.totals}>
                <span>Total del documento</span><strong>{formatMoney(selected.total)}</strong>
              </div>
              <footer className={styles.detailActions}>
                <button type="button" className={styles.secondaryAction}
                  onClick={() => onOpenDetail({type: kind === 'orders' ? 'order' : 'quote', item: selected})}>
                  Ver detalle completo <ArrowRight size={16} aria-hidden="true"/>
                </button>
                {orderAction ? <button type="button" className={styles.darkAction}
                  onClick={() => onUpdateOrder(selected, orderAction[1])}>{orderAction[0]}</button> : null}
                {kind === 'quotes' && selected.status === 'DRAFT' ? <button type="button" className={styles.darkAction}
                  onClick={() => onUpdateQuote(selected, 'SENT')}>Enviar cotización</button> : null}
                {kind === 'quotes' && selected.status === 'SENT' ? <button type="button" className={styles.darkAction}
                  onClick={() => onUpdateQuote(selected, 'ACCEPTED')}>Aceptar cotización</button> : null}
                {kind === 'quotes' && ['SENT','ACCEPTED'].includes(selected.status) ? <button type="button" className={styles.secondaryAction}
                  onClick={() => onConvertQuote(selected)}>Crear pedido</button> : null}
                {kind === 'orders' ? <button type="button" className={styles.secondaryAction}
                  onClick={() => navigate('/ventas/cobranza')}>Ir a cobranza</button> : null}
              </footer>
            </>
          ) : (
            <div className={styles.emptyDetail}><ShoppingBag size={32} aria-hidden="true"/><strong>Sin documento seleccionado</strong><span>Selecciona un registro de la lista.</span></div>
          )}
        </article>
      </div>
    </section>
  );
}
