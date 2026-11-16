import {useState} from 'react';
import {
  ArrowLeft, CalendarDays, CheckCircle2, ChevronRight, FileText,
  Package2, Plus, ShoppingBag, UserRound,
} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import {OSFilterRail, OSWorkspaceSearch, OSWorkspaceSplit} from '../../../../layout/os/primitives/OSWorkspaceControls';
import styles from './SalesOSWorkspace.module.css';

const quoteLabels = {
  DRAFT: 'Borrador', SENT: 'Enviada', ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada', EXPIRED: 'Vencida', CONVERTED: 'Convertida', CANCELLED: 'Cancelada',
};
const orderLabels = {
  DRAFT: 'Borrador', CONFIRMED: 'Confirmado', PARTIALLY_DELIVERED: 'Entrega parcial',
  DELIVERED: 'Entregado', INVOICED: 'Facturado', CANCELLED: 'Cancelado',
};
const tones = {
  DRAFT: 'neutral', SENT: 'warning', ACCEPTED: 'success', REJECTED: 'danger',
  EXPIRED: 'danger', CONVERTED: 'success', CANCELLED: 'neutral',
  CONFIRMED: 'warning', PARTIALLY_DELIVERED: 'warning', DELIVERED: 'success', INVOICED: 'success',
};

const formatMoney = (value, code = 'MXN') => {
  try {
    return new Intl.NumberFormat('es-MX', {style: 'currency', currency: code}).format(Number(value || 0));
  } catch {
    return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(Number(value || 0));
  }
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime())
    ? parsed.toLocaleDateString('es-MX', {day: 'numeric', month: 'short', year: 'numeric'})
    : 'Sin fecha';
};

/**
 * OS presentation layer. All tenant-scoped fetching, mutations and dialogs stay
 * in Sales.jsx. Never fabricate payment, print or invoice endpoints for mock fidelity.
 */
export default function SalesOSWorkspace({
  tab, onTabChange, records = [], allRecords = [], totalQuotes = 0, totalOrders = 0,
  query, onQueryChange, status, onStatusChange, onNewQuote,
  onOpenDrawer, onUpdateQuoteStatus, onConvertQuote, onUpdateOrderStatus,
}) {
  const [selectedByTab, setSelectedByTab] = useState({quotes: null, orders: null});
  const [mobileDetail, setMobileDetail] = useState(false);
  const isQuote = tab === 'quotes';
  const labels = isQuote ? quoteLabels : orderLabels;
  const selected = records.find((record) => record.id === selectedByTab[tab]) || records[0] || null;
  const selectedCustomer = selected?.customer;
  const items = Array.isArray(selected?.items) ? selected.items : [];
  const code = selected?.currency || 'MXN';

  function changeTab(next) {
    onTabChange(next);
    setMobileDetail(false);
  }

  function changeStatus(next) {
    onStatusChange(next);
    setMobileDetail(false);
  }

  function changeQuery(next) {
    onQueryChange(next);
    setMobileDetail(false);
  }

  function openDocument(item) {
    setSelectedByTab((current) => ({...current, [tab]: item.id}));
    setMobileDetail(true);
  }

  function actions() {
    if (!selected) return null;
    if (isQuote) {
      return (
        <>
          {selected.status === 'DRAFT' ? (
            <button type="button" className={styles.primaryAction} onClick={() => onUpdateQuoteStatus(selected, 'SENT')}>
              <CheckCircle2 size={18} aria-hidden="true"/> Marcar enviada
            </button>
          ) : null}
          {selected.status === 'SENT' ? (
            <button type="button" className={styles.primaryAction} onClick={() => onUpdateQuoteStatus(selected, 'ACCEPTED')}>
              <CheckCircle2 size={18} aria-hidden="true"/> Aceptar cotización
            </button>
          ) : null}
          {['SENT', 'ACCEPTED'].includes(selected.status) ? (
            <button type="button" className={styles.secondaryAction} onClick={() => onConvertQuote(selected)}>
              <ShoppingBag size={18} aria-hidden="true"/> Crear pedido
            </button>
          ) : null}
        </>
      );
    }
    const next = {
      DRAFT: ['CONFIRMED', 'Confirmar pedido'],
      CONFIRMED: ['DELIVERED', 'Registrar entrega'],
      DELIVERED: ['INVOICED', 'Marcar facturado'],
    }[selected.status];
    return next ? (
      <button type="button" className={styles.primaryAction} onClick={() => onUpdateOrderStatus(selected, next[0])}>
        <CheckCircle2 size={18} aria-hidden="true"/> {next[1]}
      </button>
    ) : null;
  }

  return (
    <section className={styles.root} data-os-sales-workspace="true" data-mobile-detail={mobileDetail ? 'true' : 'false'}
      aria-label="Espacio de trabajo de Ventas">
      <header className={styles.toolbar}>
        <div className={styles.topTabs} role="group" aria-label="Tipo de documento">
          <button type="button" onClick={() => changeTab('orders')} aria-pressed={!isQuote}
            className={!isQuote ? styles.tabActive : ''}>
            Pedidos <span>{totalOrders}</span>
          </button>
          <button type="button" onClick={() => changeTab('quotes')} aria-pressed={isQuote}
            className={isQuote ? styles.tabActive : ''}>
            Cotizaciones <span>{totalQuotes}</span>
          </button>
        </div>
        <OSWorkspaceSearch className={styles.search} value={query}
          onChange={changeQuery} label="Buscar documento, folio o cliente"
          placeholder="Buscar folio o cliente…" />
        <button className={styles.newButton} type="button" onClick={onNewQuote}>
          <Plus size={19} aria-hidden="true"/> Nueva cotización
        </button>
      </header>

      <OSFilterRail className={styles.filters} label="Filtrar por estado"
        value={status} onChange={changeStatus}
        items={[
          {id:'ALL',label:'Todos',count:allRecords.length},
          ...Object.entries(labels).map(([id,label]) => ({
            id,label,count:allRecords.filter((item) => item.status === id).length,
          })).filter((item) => item.count > 0),
        ]}
      />

      <OSWorkspaceSplit mobileDetail={mobileDetail}>
        <section className={styles.master} aria-labelledby="os-sales-list-heading">
          <div className={styles.paneHeading}>
            <div><h1 id="os-sales-list-heading">{isQuote ? 'Cotizaciones' : 'Pedidos'}</h1>
              <p>{records.length} registros visibles</p></div>
            <FileText size={19} aria-hidden="true"/>
          </div>
          <div className={styles.rows}>
            {records.map((item) => (
              <button key={item.id} type="button" className={[styles.record, selected?.id === item.id ? styles.recordSelected : ''].join(' ')}
                aria-pressed={selected?.id === item.id} onClick={() => openDocument(item)}>
                <span className={styles.recordIcon}><FileText size={19} aria-hidden="true"/></span>
                <span className={styles.recordMain}>
                  <strong>{item.folio || 'Sin folio'}</strong>
                  <small>{item.customer?.commercialName || item.customer?.legalName || 'Cliente sin nombre'}</small>
                  <span className={styles.recordBadge}>
                    <Badge tone={tones[item.status] || 'neutral'}>{labels[item.status] || item.status}</Badge>
                  </span>
                </span>
                <span className={styles.recordRight}>
                  <strong>{formatMoney(item.total, item.currency)}</strong>
                  <small>{formatDate(isQuote ? item.quoteDate : item.orderDate)}</small>
                  <ChevronRight className={styles.recordChevron} size={16} aria-hidden="true"/>
                </span>
              </button>
            ))}
            {!records.length ? (
              <div className={styles.empty}>
                <FileText size={24} aria-hidden="true"/>
                <strong>Sin documentos con estos filtros</strong>
                <p>Cambia el estado seleccionado o limpia la búsqueda.</p>
                <button type="button" onClick={() => {changeStatus('ALL'); changeQuery('');}}>Limpiar filtros</button>
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.detail} aria-label={selected ? 'Detalle del documento seleccionado' : 'Detalle de documento'}>
          <div className={styles.paneHeading}>
            <button className={styles.back} type="button" onClick={() => setMobileDetail(false)}>
              <ArrowLeft size={18} aria-hidden="true"/> Volver a la lista
            </button>
            {selected ? (
              <div className={styles.detailTitle}>
                <div><h2>{isQuote ? 'Cotización' : 'Pedido'} {selected.folio}</h2>
                  <p><CalendarDays size={14} aria-hidden="true"/>{formatDate(isQuote ? selected.quoteDate : selected.orderDate)}</p></div>
                <Badge tone={tones[selected.status] || 'neutral'}>{labels[selected.status] || selected.status}</Badge>
              </div>
            ) : <h2>Detalle del documento</h2>}
          </div>

          {selected ? (
            <div className={styles.detailBody}>
              <div className={styles.customer}>
                <div className={styles.customerIcon}><UserRound size={22} aria-hidden="true"/></div>
                <div><small>Cliente</small>
                  <strong>{selectedCustomer?.commercialName || selectedCustomer?.legalName || 'Cliente sin nombre'}</strong>
                  {selectedCustomer?.code ? <span>{selectedCustomer.code}</span> : null}
                </div>
                <div className={styles.documentDates}>
                  <small>{isQuote ? 'Válida hasta' : 'Entrega programada'}</small>
                  <strong>{formatDate(isQuote ? selected.validUntil : selected.deliveryDate)}</strong>
                </div>
              </div>

              <div className={styles.itemsHeading}><h3><Package2 size={20} aria-hidden="true"/> Artículos ({items.length})</h3></div>
              <div className={styles.itemsTableWrap}>
                <table className={styles.itemsTable}>
                  <thead><tr><th scope="col">Producto</th><th scope="col">Cantidad</th><th scope="col">Precio unitario</th><th scope="col">Importe</th></tr></thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td><strong>{item.product?.name || item.description || 'Producto'}</strong>
                          <small>{item.product?.sku || item.description || 'Sin SKU'}</small></td>
                        <td>{Number(item.quantity || 0).toLocaleString('es-MX')}</td>
                        <td>{formatMoney(item.unitPrice, code)}</td>
                        <td><strong>{formatMoney(item.total, code)}</strong></td>
                      </tr>
                    ))}
                    {!items.length ? <tr><td colSpan={4}>Este documento no tiene partidas registradas.</td></tr> : null}
                  </tbody>
                </table>
              </div>

              <div className={styles.totals}>
                <div><span>Subtotal</span><strong>{formatMoney(selected.subtotal, code)}</strong></div>
                <div><span>Impuestos</span><strong>{formatMoney(selected.taxTotal, code)}</strong></div>
                <div className={styles.grandTotal}><span>Total</span><strong>{formatMoney(selected.total, code)}</strong></div>
              </div>
              {selected.notes ? <p className={styles.notes}><strong>Notas:</strong> {selected.notes}</p> : null}
              <div className={styles.detailActions}>
                {actions()}
                <button type="button" className={styles.secondaryAction} onClick={() => onOpenDrawer(selected, isQuote ? 'quote' : 'order')}>
                  <FileText size={18} aria-hidden="true"/> Ver ficha completa
                </button>
              </div>
            </div>
          ) : <div className={styles.detailEmpty}>Selecciona un documento de la lista para consultar su detalle.</div>}
        </section>
      </OSWorkspaceSplit>
    </section>
  );
}
