import {useState} from 'react';
import {
  AlertTriangle, ArrowLeft, ArrowRight, Boxes, ChevronRight, CircleDollarSign,
  Package, Warehouse,
} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import {OSFilterRail, OSWorkspaceSearch, OSWorkspaceSplit} from '../../../../layout/os/primitives/OSWorkspaceControls';
import styles from './InventoryOSWorkspace.module.css';

const count = (value) => Number(value || 0).toLocaleString('es-MX', {maximumFractionDigits: 3});
const money = (value) => Number(value || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'});
const available = (row) => Number(row.available ?? row.quantity ?? 0);
const minimum = (row) => Number(row.minStock ?? row.product?.minStock ?? 0);
const cost = (row) => Number(row.averageCost ?? row.product?.cost ?? 0);
const health = (row) => available(row) <= 0
  ? {label: 'Sin existencia', tone: 'danger'} : available(row) <= minimum(row)
    ? {label: 'Reabastecer', tone: 'warning'} : {label: 'Disponible', tone: 'success'};

const filters = [
  {id: 'all', label: 'Todas'},
  {id: 'low', label: 'Stock bajo'},
  {id: 'available', label: 'Disponibles'},
  {id: 'empty', label: 'Sin existencia'},
];

/**
 * Presentation-only Inventory OS application. InventoryBalances owns fetching,
 * tenant scope, filter criteria and warehouse data. No stock mutation is performed here.
 */
export default function InventoryOSWorkspace({
  records = [], warehouses = [], summary = {}, view = 'all', viewCounts = {},
  warehouseFilter = '', query = '', onQueryChange, onWarehouseChange,
  onViewChange, onClearFilters, onOpenCatalog, onOpenMovements, onPurchaseRequest,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const selected = records.find((item) => item.id === selectedId) || records[0] || null;
  const state = selected ? health(selected) : null;

  function changeCriteria(fn, value) {
    fn(value);
    setShowMobileDetail(false);
  }

  function selectRecord(item) {
    setSelectedId(item.id);
    setShowMobileDetail(true);
  }

  function clear() {
    onClearFilters();
    setShowMobileDetail(false);
  }

  return (
    <section className={styles.root} data-os-inventory-workspace="true"
      data-mobile-detail={showMobileDetail ? 'true' : 'false'}
      aria-label="Espacio de trabajo de Inventario">
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Existencias</h1>
          <p>Control de productos y almacenes</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={onOpenCatalog}><Package size={18} aria-hidden="true"/> Productos</button>
          <button type="button" onClick={onOpenMovements}><ArrowRight size={18} aria-hidden="true"/> Movimientos</button>
        </div>
      </header>

      <div className={styles.metrics} aria-label="Indicadores de existencias">
        <div><Boxes size={20} aria-hidden="true"/><span>Posiciones</span><strong>{count(summary.records)}</strong></div>
        <div><Warehouse size={20} aria-hidden="true"/><span>Unidades disponibles</span><strong>{count(summary.units)}</strong></div>
        <div><CircleDollarSign size={20} aria-hidden="true"/><span>Valor de inventario</span><strong>{money(summary.value)}</strong></div>
        <div><AlertTriangle size={20} aria-hidden="true"/><span>Stock bajo</span><strong>{count(summary.lowStock)}</strong></div>
      </div>

      <div className={styles.controls}>
        <OSFilterRail className={styles.filterRail} label="Filtrar posiciones"
          items={filters.map((filter) => ({...filter, count:viewCounts[filter.id] ?? 0}))}
          value={view} onChange={(next) => changeCriteria(onViewChange, next)}
        />
        <div className={styles.searchFilters}>
          <OSWorkspaceSearch className={styles.search} value={query}
            label="Buscar inventario" placeholder="Buscar producto, SKU o almacén..."
            onChange={(next) => changeCriteria(onQueryChange, next)}
          />
          <label className={styles.warehouseFilter}>
            <span className={styles.srOnly}>Almacén</span>
            <select value={warehouseFilter}
              onChange={(event) => changeCriteria(onWarehouseChange, event.target.value)}>
              <option value="">Todos los almacenes</option>
              {warehouses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        </div>
      </div>

      <OSWorkspaceSplit mobileDetail={showMobileDetail}>
        <section className={styles.master} aria-labelledby="os-inventory-list">
          <div className={styles.paneHeading}>
            <div><h2 id="os-inventory-list">Productos por almacén</h2><p>{records.length} posiciones visibles</p></div>
            <Warehouse size={19} aria-hidden="true"/>
          </div>
          <div className={styles.rows}>
            {records.map((row) => {
              const status = health(row);
              return (
                <button type="button" key={row.id}
                  className={[styles.record, selected?.id === row.id ? styles.selectedRecord : ''].filter(Boolean).join(' ')}
                  aria-pressed={selected?.id === row.id} onClick={() => selectRecord(row)}>
                  <span className={styles.productIcon}><Package size={18} aria-hidden="true"/></span>
                  <span className={styles.recordText}>
                    <strong>{row.product?.name || row.product?.sku || 'Producto'}</strong>
                    <small>{row.product?.sku || 'Sin SKU'} · {row.warehouse?.name || 'Sin almacén'}</small>
                    <span><Badge tone={status.tone}>{status.label}</Badge></span>
                  </span>
                  <span className={styles.recordAmounts}>
                    <strong>{count(available(row))} {row.product?.unit || ''}</strong>
                    <small>{money(available(row) * cost(row))}</small>
                    <ChevronRight size={16} className={styles.chevron} aria-hidden="true"/>
                  </span>
                </button>
              );
            })}
            {!records.length ? (
              <div className={styles.empty}>
                <Package size={25} aria-hidden="true"/>
                <strong>No hay productos con esos filtros</strong>
                <p>Prueba otra búsqueda, estado o almacén.</p>
                <button type="button" onClick={clear}>Limpiar filtros</button>
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.detail} aria-label="Detalle de existencia">
          <div className={styles.paneHeading}>
            <button type="button" className={styles.back} onClick={() => setShowMobileDetail(false)}>
              <ArrowLeft size={19} aria-hidden="true"/> Volver a la lista
            </button>
            {selected ? (
              <div className={styles.detailHeading}>
                <div><h2>{selected.product?.name || selected.product?.sku || 'Producto'}</h2>
                  <p>{selected.product?.sku || 'Sin SKU'} · {selected.product?.category?.name || 'Sin categoría'}</p>
                </div>
                <Badge tone={state.tone}>{state.label}</Badge>
              </div>
            ) : <h2>Detalle de producto</h2>}
          </div>

          {selected ? (
            <div className={styles.detailBody}>
              <section className={styles.productOverview} aria-label="Ubicación del producto">
                <span className={styles.heroIcon}><Package size={30} aria-hidden="true"/></span>
                <div><small>Almacén</small><strong>{selected.warehouse?.name || 'Sin almacén'}</strong>
                  <span>{selected.warehouse?.branch?.name || 'Sin sucursal asignada'}</span></div>
              </section>
              <div className={styles.statGrid}>
                <div><span>Disponible</span><strong>{count(available(selected))} {selected.product?.unit || ''}</strong></div>
                <div><span>Stock mínimo</span><strong>{count(minimum(selected))}</strong></div>
                <div><span>Existencia registrada</span><strong>{count(selected.quantity)}</strong></div>
                <div><span>Reservado</span><strong>{count(selected.reserved)}</strong></div>
              </div>
              <section className={styles.valuation}>
                <h3><CircleDollarSign size={19} aria-hidden="true"/> Valuación</h3>
                <dl>
                  <div><dt>Costo promedio</dt><dd>{money(cost(selected))}</dd></div>
                  <div><dt>Valor disponible</dt><dd>{money(available(selected) * cost(selected))}</dd></div>
                  <div><dt>Valor total registrado</dt><dd>{money(Number(selected.quantity || 0) * cost(selected))}</dd></div>
                </dl>
              </section>
              <div className={styles.detailActions}>
                {available(selected) <= minimum(selected) ? (
                  <button className={styles.primaryAction} type="button" onClick={onPurchaseRequest}>
                    <AlertTriangle size={18} aria-hidden="true"/> Crear solicitud de compra
                  </button>
                ) : null}
                <button className={styles.secondaryAction} type="button" onClick={onOpenCatalog}>
                  <Package size={18} aria-hidden="true"/> Ver catálogo
                </button>
              </div>
            </div>
          ) : <div className={styles.empty}>Selecciona una posición de inventario para consultar sus datos.</div>}
        </section>
      </OSWorkspaceSplit>
    </section>
  );
}
