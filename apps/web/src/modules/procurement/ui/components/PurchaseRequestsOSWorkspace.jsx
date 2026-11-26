import {useState} from 'react';
import {
  ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronRight,
  ClipboardList, FileText, Package, Plus, Send, ShoppingCart, Users, Warehouse,
} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import {OSFilterRail, OSWorkspaceSearch, OSWorkspaceSplit} from '../../../../layout/os/primitives/OSWorkspaceControls';
import styles from './PurchaseRequestsOSWorkspace.module.css';

const totalOf = (request) => (request.items || []).reduce(
  (sum, item) => sum + Number(item.quantity || 0) * Number(item.estimatedUnitCost || 0), 0,
);

/**
 * Workspace OS · Solicitudes. Presentational only: PurchaseRequests keeps
 * authorization, tenant-scoped API loading, filters, creation and mutations.
 * The existing accessible record dialog remains the sole approval interface.
 */
export default function PurchaseRequestsOSWorkspace({
  records = [], requests = [], metrics = {}, view = 'all',
  query = '', statusFilter = '', priorityFilter = '',
  onViewChange, onQueryChange, onStatusChange, onPriorityChange,
  onClearFilters, onCreate, onOpenFullDetail, onSubmitDraft,
  onOpenOrders, onOpenSuppliers, statusMap = {}, priorityMap = {},
  money, dateTime,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const selected = records.find((item) => item.id === selectedId) || records[0] || null;
  const selectedStatus = selected ? statusMap[selected.status] || [selected.status, 'neutral'] : null;
  const counts = {
    all: requests.length,
    pending: metrics.pending ?? 0,
    approved: metrics.approved ?? 0,
    draft: requests.filter((item) => item.status === 'DRAFT').length,
  };

  function updateFilter(callback, value) {
    callback(value);
    setMobileDetail(false);
  }

  function clearFilters() {
    onClearFilters();
    setMobileDetail(false);
  }

  function selectRecord(request) {
    setSelectedId(request.id);
    setMobileDetail(true);
  }

  return (
    <section className={styles.root} data-os-procurement-requests="true"
      data-mobile-detail={mobileDetail ? 'true' : 'false'}
      aria-label="Espacio de trabajo de Solicitudes de compra">
      <header className={styles.header}>
        <div className={styles.title}>
          <span className={styles.eyebrow}>COMPRAS / SOLICITUDES</span>
          <h1>Solicitudes de compra</h1>
          <p>Revisa necesidades, autoriza solicitudes y continúa con las órdenes de compra.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={onOpenOrders}>
            <ShoppingCart size={18} aria-hidden="true"/> Órdenes
          </button>
          <button type="button" onClick={onOpenSuppliers}>
            <Users size={18} aria-hidden="true"/> Proveedores
          </button>
          <button type="button" className={styles.primaryAction} onClick={onCreate}>
            <Plus size={18} aria-hidden="true"/> Nueva solicitud
          </button>
        </div>
      </header>

      <div className={styles.metrics} aria-label="Indicadores de solicitudes">
        <div><ClipboardList size={19} aria-hidden="true"/><span>Solicitudes</span><strong>{metrics.total ?? 0}</strong></div>
        <div><Send size={19} aria-hidden="true"/><span>Por aprobar</span><strong>{metrics.pending ?? 0}</strong></div>
        <div><CheckCircle2 size={19} aria-hidden="true"/><span>Aprobadas</span><strong>{metrics.approved ?? 0}</strong></div>
        <div><ShoppingCart size={19} aria-hidden="true"/><span>Total estimado</span><strong>{money(metrics.value)}</strong></div>
      </div>

      <div className={styles.controls}>
        <OSFilterRail label="Filtrar solicitudes de compra"
          items={[
            {id: 'all', label: 'Todas', count: counts.all},
            {id: 'pending', label: 'Pendientes', count: counts.pending},
            {id: 'approved', label: 'Aprobadas', count: counts.approved},
            {id: 'draft', label: 'Borradores', count: counts.draft},
          ]}
          value={view} onChange={(next) => updateFilter(onViewChange, next)}/>
        <div className={styles.filterRow}>
          <OSWorkspaceSearch label="Buscar solicitudes de compra"
            value={query} onChange={(next) => updateFilter(onQueryChange, next)}
            placeholder="Buscar folio, título, solicitante o almacén…"/>
          <label className={styles.filterSelect}>
            <span className={styles.srOnly}>Filtrar solicitudes por estado</span>
            <select value={statusFilter}
              onChange={(event) => updateFilter(onStatusChange, event.target.value)}>
              <option value="">Todos los estados</option>
              {Object.entries(statusMap).map(([key, info]) => (
                <option key={key} value={key}>{info[0]}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterSelect}>
            <span className={styles.srOnly}>Filtrar solicitudes por prioridad</span>
            <select value={priorityFilter}
              onChange={(event) => updateFilter(onPriorityChange, event.target.value)}>
              <option value="">Todas las prioridades</option>
              {Object.entries(priorityMap).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <OSWorkspaceSplit mobileDetail={mobileDetail}>
        <section className={styles.master} aria-labelledby="os-purchase-requests-list">
          <div className={styles.paneHeading}>
            <div>
              <h2 id="os-purchase-requests-list">Bandeja de solicitudes</h2>
              <p>{records.length} de {requests.length} solicitudes visibles</p>
            </div>
            <FileText size={20} aria-hidden="true"/>
          </div>
          <div className={styles.rows}>
            {records.map((request) => {
              const status = statusMap[request.status] || [request.status, 'neutral'];
              const requester = [request.requestedBy?.firstName, request.requestedBy?.lastName].filter(Boolean).join(' ');
              return (
                <button key={request.id} type="button"
                  data-os-record="true" className={[styles.record, selected?.id === request.id ? styles.selectedRecord : ''].filter(Boolean).join(' ')}
                  aria-label={'Ver solicitud ' + (request.folio || request.title)}
                  aria-pressed={selected?.id === request.id}
                  onClick={() => selectRecord(request)}>
                  <span className={styles.recordIcon}><FileText size={19} aria-hidden="true"/></span>
                  <span className={styles.recordMain}>
                    <strong>{request.title || request.folio || 'Solicitud'}</strong>
                    <small>{request.folio || 'Sin folio'} · {requester || 'Sin solicitante'}</small>
                    <span className={styles.rowStatus}><Badge tone={status[1]}>{status[0]}</Badge>
                      <small>{priorityMap[request.priority] || request.priority || 'Normal'}</small></span>
                  </span>
                  <span className={styles.recordAmount}>
                    <strong>{money(totalOf(request))}</strong>
                    <small>{(request.items || []).length} partidas</small>
                    <ChevronRight className={styles.chevron} size={17} aria-hidden="true"/>
                  </span>
                </button>
              );
            })}
            {!records.length ? (
              <div className={styles.empty}>
                <ClipboardList size={28} aria-hidden="true"/>
                <strong>Sin solicitudes para esta vista</strong>
                <p>Prueba otros criterios o registra una nueva solicitud.</p>
                <button type="button" onClick={clearFilters}>Limpiar filtros</button>
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.detail} aria-label="Detalle de solicitud de compra">
          <div className={styles.paneHeading}>
            <button type="button" className={styles.back} onClick={() => setMobileDetail(false)}>
              <ArrowLeft size={18} aria-hidden="true"/> Volver a solicitudes
            </button>
            <div className={styles.detailHeading}>
              <div>
                <h2>{selected?.folio || 'Detalle de solicitud'}</h2>
                <p>{selected?.title || 'Selecciona una solicitud para revisar sus datos.'}</p>
              </div>
              {selectedStatus ? <Badge tone={selectedStatus[1]}>{selectedStatus[0]}</Badge> : null}
            </div>
          </div>

          {selected ? (
            <div className={styles.detailBody}>
              <section className={styles.summary} aria-label="Resumen de solicitud">
                <div className={styles.summaryIcon}><FileText size={25} aria-hidden="true"/></div>
                <div>
                  <span>Solicitud · {priorityMap[selected.priority] || selected.priority || 'Normal'}</span>
                  <strong>{selected.title || 'Solicitud sin título'}</strong>
                  <small>{selected.folio || 'Sin folio'} · {selected.warehouse?.name || 'Sin almacén'}</small>
                </div>
              </section>
              <div className={styles.statGrid}>
                <div><span>Valor estimado</span><strong>{money(totalOf(selected))}</strong></div>
                <div><span>Partidas</span><strong>{(selected.items || []).length}</strong></div>
                <div><span>Almacén</span><strong>{selected.warehouse?.name || 'Sin asignar'}</strong></div>
                <div><span>Solicitante</span><strong>{[selected.requestedBy?.firstName, selected.requestedBy?.lastName].filter(Boolean).join(' ') || 'Sin asignar'}</strong></div>
              </div>
              <section className={styles.infoPanel}>
                <h3><CalendarDays size={18} aria-hidden="true"/> Fechas y seguimiento</h3>
                <dl>
                  <div><dt>Creación</dt><dd>{dateTime(selected.createdAt)}</dd></div>
                  <div><dt>Requerida</dt><dd>{dateTime(selected.requiredDate)}</dd></div>
                  <div><dt>Envío a revisión</dt><dd>{dateTime(selected.submittedAt)}</dd></div>
                  <div><dt>Resolución</dt><dd>{dateTime(selected.resolvedAt)}</dd></div>
                </dl>
              </section>
              <section className={styles.infoPanel}>
                <h3><Package size={18} aria-hidden="true"/> Partidas solicitadas</h3>
                <div className={styles.items}>
                  {(selected.items || []).map((item, index) => (
                    <div key={item.id || index}>
                      <span><strong>{item.product?.name || item.product?.sku || 'Producto'}</strong>
                        <small>{Number(item.quantity || 0)} {item.product?.unit || 'unidades'} · {money(item.estimatedUnitCost)} c/u</small></span>
                      <strong>{money(Number(item.quantity || 0) * Number(item.estimatedUnitCost || 0))}</strong>
                    </div>
                  ))}
                  {!selected.items?.length ? <p>No hay partidas registradas.</p> : null}
                </div>
              </section>
              {selected.justification ? (
                <section className={styles.reason}><h3>Justificación</h3><p>{selected.justification}</p></section>
              ) : null}
              <div className={styles.detailActions}>
                <button type="button" onClick={() => onOpenFullDetail(selected)}>
                  <FileText size={18} aria-hidden="true"/> Ver expediente y aprobación
                </button>
                {selected.status === 'DRAFT' ? (
                  <button type="button" className={styles.primaryAction}
                    onClick={() => onSubmitDraft(selected.id)}>
                    <Send size={18} aria-hidden="true"/> Enviar a aprobación
                  </button>
                ) : null}
                {selected.status === 'APPROVED' ? (
                  <button type="button" onClick={onOpenOrders}>
                    <ArrowRight size={18} aria-hidden="true"/> Ir a órdenes
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={styles.empty}>
              <Warehouse size={28} aria-hidden="true"/>
              <strong>Selecciona una solicitud</strong>
              <p>Su resumen y partidas aparecerán aquí.</p>
              <button type="button" onClick={onCreate}>Crear solicitud</button>
            </div>
          )}
        </section>
      </OSWorkspaceSplit>
    </section>
  );
}
