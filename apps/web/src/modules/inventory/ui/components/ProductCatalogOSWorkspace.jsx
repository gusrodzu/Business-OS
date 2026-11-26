import {useState} from 'react';
import {
  ArrowLeft, ArrowRight, Boxes, Check, Edit3, FileUp, Package,
  Plus, Tag, Trash2, Warehouse,
} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import {OSFilterRail, OSWorkspaceSearch, OSWorkspaceSplit} from '../../../../layout/os/primitives/OSWorkspaceControls';
import {getProductCatalogMargin} from '../utils/productCatalogMargin';
import {getProductCatalogMetrics} from '../utils/productCatalogMetrics';
import styles from './ProductCatalogOSWorkspace.module.css';

const VIEWS = [
  {id:'all',label:'Todos'},
  {id:'active',label:'Activos'},
  {id:'inactive',label:'Inactivos'},
  {id:'lowMargin',label:'Margen bajo'},
];
const number = (value) => Number(value || 0).toLocaleString('es-MX', {maximumFractionDigits:3});

/**
 * Read-only shell around the existing catalog commands. Data, filtering, tenant
 * isolation and all mutations remain owned by Products.jsx and its hooks.
 * "Costo de catálogo" is a configuration total, NOT inventory valuation.
 */
export default function ProductCatalogOSWorkspace({
  products = [], records = [], categories = [], query = '', view = 'all', viewCounts = {},
  categoryFilter = '', selectedIds = [], setSelectedIds, onQueryChange, onViewChange,
  onCategoryChange, onClearFilters, onCreate, onImport, onOpenBalances,
  onEdit, onOpenFullDetail, onToggle, onRemove, onBulkStatus, formatMoney,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const selected = records.find((item) => item.id === selectedId) || records[0] || null;
  const metrics = getProductCatalogMetrics(products);
  const margin = selected ? getProductCatalogMargin(selected) : null;
  const selection = new Set(selectedIds);

  function changeFilter(callback, next) {
    callback(next);
    setMobileDetail(false);
  }

  function clearFilters() {
    onClearFilters();
    setMobileDetail(false);
  }

  function openRecord(product) {
    setSelectedId(product.id);
    setMobileDetail(true);
  }

  function toggleSelection(id, checked) {
    setSelectedIds((current) => checked
      ? [...new Set([...current, id])]
      : current.filter((item) => item !== id));
  }

  return (
    <section className={styles.root} data-os-catalog-workspace="true"
      data-mobile-detail={mobileDetail ? 'true' : 'false'}
      aria-label="Catálogo de productos Workspace OS">
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1>Catálogo de productos</h1>
          <p>Maestro de productos y configuración comercial</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.outlined} onClick={onOpenBalances}>
            <Warehouse size={18} aria-hidden="true"/> Existencias
          </button>
          <button type="button" className={styles.outlined} onClick={onImport}>
            <FileUp size={18} aria-hidden="true"/> Importar
          </button>
          <button type="button" className={styles.primary} onClick={onCreate}>
            <Plus size={19} aria-hidden="true"/> Nuevo producto
          </button>
        </div>
      </header>

      <div className={styles.metrics} aria-label="Indicadores del catálogo">
        <div><Package size={21} aria-hidden="true"/><span>Productos registrados</span><strong>{number(products.length)}</strong></div>
        <div><Check size={21} aria-hidden="true"/><span>Productos activos</span><strong>{number(metrics.active)}</strong></div>
        <div><Tag size={21} aria-hidden="true"/><span>Categorías disponibles</span><strong>{number(categories.length)}</strong></div>
        <div><Boxes size={21} aria-hidden="true"/><span>Costo configurado*</span><strong>{formatMoney(metrics.catalogCost)}</strong></div>
      </div>
      <p className={styles.metricNote}>*Suma referencial de costos unitarios del catálogo; no representa valor de existencias.</p>

      <div className={styles.filters}>
        <OSFilterRail label="Vista de productos"
          items={VIEWS.map((option) => ({...option, count:viewCounts[option.id] ?? 0}))}
          value={view} onChange={(next) => changeFilter(onViewChange, next)}
        />
        <div className={styles.searchRow}>
          <OSWorkspaceSearch value={query}
            label="Buscar productos" placeholder="Buscar nombre, SKU o categoría"
            onChange={(next) => changeFilter(onQueryChange, next)}
          />
          <label className={styles.categoryControl}>
            <span className={styles.srOnly}>Categoría del producto</span>
            <select value={categoryFilter} onChange={(event) => changeFilter(onCategoryChange, event.target.value)}>
              <option value="">Todas las categorías</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        </div>
      </div>

      {selectedIds.length > 0 ? (
        <div className={styles.bulk} role="group" aria-label="Acciones de productos seleccionados">
          <strong>{selectedIds.length} seleccionado(s)</strong>
          <button type="button" onClick={() => onBulkStatus(true)}>Activar</button>
          <button type="button" onClick={() => onBulkStatus(false)}>Desactivar</button>
          <button type="button" onClick={() => setSelectedIds([])}>Limpiar selección</button>
        </div>
      ) : null}

      <OSWorkspaceSplit mobileDetail={mobileDetail}>
        <section className={styles.master} aria-labelledby="os-catalog-list-title">
          <div className={styles.paneHeading}>
            <div><h2 id="os-catalog-list-title">Productos</h2><p>{records.length} registros visibles</p></div>
            <Package size={20} aria-hidden="true"/>
          </div>
          <div className={styles.rows}>
            {records.map((product) => {
              const prices = getProductCatalogMargin(product);
              return (
                <div data-os-record="true" className={styles.record} key={product.id} data-selected={selected?.id === product.id ? 'true' : 'false'}>
                  <label className={styles.selectRecord}>
                    <span className={styles.srOnly}>Seleccionar {product.name}</span>
                    <input type="checkbox" checked={selection.has(product.id)}
                      onChange={(event) => toggleSelection(product.id, event.target.checked)}/>
                  </label>
                  <button type="button" className={styles.recordOpen} onClick={() => openRecord(product)}
                    aria-pressed={selected?.id === product.id}
                    aria-label={'Ver producto ' + (product.name || product.sku || 'sin nombre')}>
                    <span className={styles.productIcon}><Package size={19} aria-hidden="true"/></span>
                    <span className={styles.recordInfo}>
                      <strong>{product.name || 'Producto sin nombre'}</strong>
                      <small>{product.sku || 'Sin SKU'} · {product.category?.name || 'Sin categoría'}</small>
                      <span className={styles.recordStatus}>
                        <Badge tone={product.active ? 'success' : 'neutral'}>{product.active ? 'Activo' : 'Inactivo'}</Badge>
                        {prices.marginPct <= 15 ? <span className={styles.marginWarning}>Margen {prices.marginPct}%</span> : null}
                      </span>
                    </span>
                    <span className={styles.recordPrice}>
                      <strong>{formatMoney(product.price)}</strong>
                      <small>Venta / {product.unit || 'unidad'}</small>
                      <ArrowRight size={16} aria-hidden="true"/>
                    </span>
                  </button>
                </div>
              );
            })}
            {!records.length ? (
              <div className={styles.empty}>
                <Package size={25} aria-hidden="true"/>
                <strong>Sin productos con estos filtros</strong>
                <p>Prueba otra búsqueda, categoría o estado.</p>
                <button type="button" onClick={clearFilters}>Limpiar filtros</button>
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.detail} aria-label="Detalle del producto">
          <div className={styles.paneHeading}>
            <button type="button" className={styles.back} onClick={() => setMobileDetail(false)}>
              <ArrowLeft size={18} aria-hidden="true"/> Volver a productos
            </button>
            {selected ? <div className={styles.detailTitle}>
              <div><h2>{selected.name || 'Producto sin nombre'}</h2>
                <p>SKU {selected.sku || 'Sin SKU'}</p></div>
              <Badge tone={selected.active ? 'success' : 'neutral'}>{selected.active ? 'Activo' : 'Inactivo'}</Badge>
            </div> : <h2>Selecciona un producto</h2>}
          </div>
          {selected ? (
            <div className={styles.detailContent}>
              <div className={styles.productHero}>
                <span className={styles.heroIcon}><Package size={28} aria-hidden="true"/></span>
                <div><span>Categoría</span><strong>{selected.category?.name || 'Sin categoría'}</strong>
                  <small>{selected.description || 'Sin descripción adicional'}</small>
                </div>
              </div>
              <div className={styles.statGrid}>
                <div><span>Precio de venta</span><strong>{formatMoney(selected.price)}</strong></div>
                <div><span>Costo unitario</span><strong>{formatMoney(selected.cost)}</strong></div>
                <div><span>Margen configurado</span><strong>{margin.marginPct}%</strong><small>{formatMoney(margin.margin)} / unidad</small></div>
                <div><span>Stock mínimo</span><strong>{number(selected.minStock)} {selected.unit || ''}</strong></div>
              </div>
              <section className={styles.info}>
                <h3><Tag size={19} aria-hidden="true"/> Información del producto</h3>
                <dl>
                  <div><dt>Categoría</dt><dd>{selected.category?.name || 'Sin categoría'}</dd></div>
                  <div><dt>Unidad de medida</dt><dd>{selected.unit || 'No configurada'}</dd></div>
                  <div><dt>SKU</dt><dd>{selected.sku || 'No configurado'}</dd></div>
                  <div><dt>Estado</dt><dd>{selected.active ? 'Activo' : 'Inactivo'}</dd></div>
                </dl>
              </section>
              <div className={styles.detailActions}>
                <button type="button" className={styles.primary} onClick={() => onEdit(selected)}>
                  <Edit3 size={17} aria-hidden="true"/> Editar producto
                </button>
                <button type="button" className={styles.outlined} onClick={() => onOpenFullDetail(selected)}>
                  <Package size={17} aria-hidden="true"/> Ficha completa
                </button>
                <button type="button" className={styles.outlined} onClick={() => onToggle(selected)}>
                  {selected.active ? 'Desactivar' : 'Activar'}
                </button>
                <button type="button" className={styles.danger} onClick={() => onRemove(selected)}>
                  <Trash2 size={17} aria-hidden="true"/> Eliminar
                </button>
              </div>
              <p className={styles.detailHint}>Las existencias reales se consultan por almacén en la aplicación Existencias.</p>
            </div>
          ) : <div className={styles.empty}>Elige un producto para consultar su ficha.</div>}
        </section>
      </OSWorkspaceSplit>
    </section>
  );
}
