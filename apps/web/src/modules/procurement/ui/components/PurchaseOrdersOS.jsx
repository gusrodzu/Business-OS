import {Check, PackageCheck, Plus, Send} from 'lucide-react';
import {Badge, Button, FeedbackMessage} from '../../../../design-system/components';
import WorkspaceOSRecordExplorer from '../../../../layout/workspace-os/WorkspaceOSRecordExplorer';
import osStyles from '../../../../layout/workspace-os/WorkspaceOSRecordExplorer.module.css';

const fallbackStatus = status => [status || 'Sin estado', 'neutral'];
const asDate = value => value && Number.isFinite(new Date(value).getTime())
  ? new Date(value).toLocaleDateString('es-MX') : 'Sin fecha';

export default function PurchaseOrdersOS({
  records, selectedOrder, onSelect, query, onQueryChange,
  status, onStatusChange, statusMap, allCount, onCreate,
  onIssue, onReceive, formatMoney, message,
}) {
  return <>
    {message ? <FeedbackMessage tone={message.type}>{message.text}</FeedbackMessage> : null}
    <WorkspaceOSRecordExplorer
      eyebrow="Compras / Órdenes"
      title="Órdenes de compra"
      description="Consulta solicitudes, proveedores y mercancía por recibir desde una sola vista."
      records={records}
      selectedRecord={selectedOrder}
      onSelect={onSelect}
      query={query}
      onQueryChange={onQueryChange}
      searchPlaceholder="Buscar folio, proveedor o solicitud"
      actions={<Button icon={Plus} onClick={onCreate}>Nueva orden</Button>}
      summary={<>
        <span>Filtradas <strong>{records.length}</strong></span>
        <span>Total de búsqueda <strong>{allCount}</strong></span>
      </>}
      filters={<select value={status} onChange={event => onStatusChange(event.target.value)}
          aria-label="Filtrar órdenes por estado">
          <option value="ALL">Todas las órdenes</option>
          {Object.entries(statusMap).map(([key, info]) =>
            <option value={key} key={key}>{info[0]}</option>)}
        </select>}
      renderListItem={order => {
        const info = statusMap[order.status] || fallbackStatus(order.status);
        return <>
          <span className={osStyles.rowHead}>
            <strong>{order.folio || 'Orden sin folio'}</strong>
            <Badge tone={info[1]}>{info[0]}</Badge>
          </span>
          <span className={osStyles.rowMeta}>{order.supplier?.commercialName || order.supplier?.legalName || 'Proveedor sin nombre'}</span>
          <span className={osStyles.rowMeta}>{asDate(order.orderDate)} · {formatMoney(order.total,order.currency)}</span>
        </>;
      }}
      renderDetail={order => {
        const info = statusMap[order.status] || fallbackStatus(order.status);
        return <>
          <div className={osStyles.recordTitle}><div>
            <h2>{order.folio || 'Orden de compra'}</h2>
            <p>{order.supplier?.commercialName || order.supplier?.legalName || 'Proveedor sin nombre'}</p>
          </div><Badge tone={info[1]}>{info[0]}</Badge></div>
          <dl className={osStyles.detailGrid}>
            <div><dt>Total</dt><dd>{formatMoney(order.total,order.currency)}</dd></div>
            <div><dt>Fecha de orden</dt><dd>{asDate(order.orderDate)}</dd></div>
            <div><dt>Recepción prevista</dt><dd>{asDate(order.expectedDate)}</dd></div>
            <div><dt>Días de crédito</dt><dd>{order.paymentTerms ?? 0}</dd></div>
            <div><dt>Solicitud relacionada</dt><dd>{order.purchaseRequest?.folio || 'Orden directa'}</dd></div>
            <div><dt>Almacén</dt><dd>{order.warehouse?.name || '—'}</dd></div>
          </dl>
          <h3 className={osStyles.sectionTitle}>Partidas ({order.items?.length || 0})</h3>
          {(order.items || []).map((item, index) =>
            <div className={osStyles.itemRow} key={item.id || index}>
              <div><strong>{item.product?.name || 'Producto'}</strong>
                <small>{item.product?.sku || 'Sin SKU'} · {item.quantity} {item.product?.unit || ''} · Recibido: {item.receivedQuantity ?? 0}</small>
              </div><strong>{formatMoney(item.total,order.currency)}</strong>
            </div>)}
          <div className={osStyles.detailActions}>
            {order.status === 'DRAFT' ?
              <Button icon={Send} onClick={() => onIssue(order.id)}>Emitir orden</Button> : null}
            {['ISSUED','PARTIALLY_RECEIVED'].includes(order.status) ?
              <Button icon={PackageCheck} onClick={() => onReceive(order)}>Recibir pendiente</Button> : null}
            {order.status === 'RECEIVED' ?
              <Badge tone="success"><Check size={15} aria-hidden="true"/> Recepción completa</Badge> : null}
          </div>
        </>;
      }}
    />
  </>;
}
