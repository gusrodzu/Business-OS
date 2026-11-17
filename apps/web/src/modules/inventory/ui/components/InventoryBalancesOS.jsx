import {useNavigate} from 'react-router-dom';
import {Badge, Button} from '../../../../design-system/components';
import WorkspaceOSRecordExplorer from '../../../../layout/workspace-os/WorkspaceOSRecordExplorer';
import osStyles from '../../../../layout/workspace-os/WorkspaceOSRecordExplorer.module.css';

const num = value => Number(value || 0).toLocaleString('es-MX', {maximumFractionDigits: 3});
const money = value => Number(value || 0).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'});
const available = row => Number(row.available ?? row.quantity ?? 0);
const min = row => Number(row.minStock ?? row.product?.minStock ?? 0);
const cost = row => Number(row.averageCost ?? row.product?.cost ?? 0);
const low = row => available(row) <= min(row);

export default function InventoryBalancesOS({
  filtered, selected, onSelect, query, onQueryChange,
  view, onViewChange, viewCounts, warehouses,
  warehouseFilter, onWarehouseChange, summary,
}) {
  const navigate = useNavigate();
  const record = filtered.find(row => row.id === selected?.id) || filtered[0] || null;
  return <WorkspaceOSRecordExplorer
    eyebrow="Inventario / Existencias"
    title="Existencias por almacén"
    description="Consulta, valora y localiza posiciones sin salir de la aplicación."
    records={filtered}
    selectedRecord={record}
    onSelect={onSelect}
    query={query}
    onQueryChange={onQueryChange}
    searchPlaceholder="Buscar producto, SKU o almacén"
    summary={<>
      <span>Posiciones <strong>{num(summary.records)}</strong></span>
      <span>Unidades <strong>{num(summary.units)}</strong></span>
      <span>Stock bajo <strong>{num(summary.lowStock)}</strong></span>
    </>}
    actions={<>
      <Button variant="secondary" onClick={() => navigate('/inventario/productos')}>Catálogo</Button>
      <Button variant="secondary" onClick={() => navigate('/inventario/movimientos')}>Kardex</Button>
    </>}
    filters={<>
      <select value={view} onChange={event => onViewChange(event.target.value)} aria-label="Filtrar existencias por estado">
        <option value="all">Todos ({viewCounts.all})</option>
        <option value="low">Reabastecer ({viewCounts.low})</option>
        <option value="available">Disponibles ({viewCounts.available})</option>
        <option value="empty">Sin existencia ({viewCounts.empty})</option>
      </select>
      <select value={warehouseFilter} onChange={event => onWarehouseChange(event.target.value)} aria-label="Filtrar existencias por almacén">
        <option value="">Todos los almacenes</option>
        {warehouses.map(warehouse => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
      </select>
    </>}
    renderListItem={row => <>
      <span className={osStyles.rowHead}>
        <strong>{row.product?.name || row.product?.sku || 'Producto sin nombre'}</strong>
        <Badge tone={available(row) <= 0 ? 'danger' : low(row) ? 'warning' : 'success'}>
          {available(row) <= 0 ? 'Agotado' : low(row) ? 'Bajo' : 'Disponible'}
        </Badge>
      </span>
      <span className={osStyles.rowMeta}>{row.product?.sku || 'Sin SKU'} · {row.warehouse?.name || 'Sin almacén'}</span>
      <span className={osStyles.rowMeta}>{num(available(row))} {row.product?.unit || 'unidades'} disponibles</span>
    </>}
    renderDetail={row => <>
      <div className={osStyles.recordTitle}>
        <div><h2>{row.product?.name || 'Producto'}</h2>
          <p>{row.product?.sku || 'Sin SKU'} · {row.product?.category?.name || 'Sin categoría'}</p>
        </div>
        <Badge tone={available(row) <= 0 ? 'danger' : low(row) ? 'warning' : 'success'}>
          {available(row) <= 0 ? 'Sin existencia' : low(row) ? 'Reabastecer' : 'Disponible'}
        </Badge>
      </div>
      <dl className={osStyles.detailGrid}>
        <div><dt>Disponible</dt><dd>{num(available(row))} {row.product?.unit}</dd></div>
        <div><dt>Mínimo</dt><dd>{num(min(row))}</dd></div>
        <div><dt>Registrado</dt><dd>{num(row.quantity)}</dd></div>
        <div><dt>Reservado</dt><dd>{num(row.reserved)}</dd></div>
        <div><dt>Costo promedio</dt><dd>{money(cost(row))}</dd></div>
        <div><dt>Valor disponible</dt><dd>{money(available(row) * cost(row))}</dd></div>
        <div><dt>Almacén</dt><dd>{row.warehouse?.name || '—'}</dd></div>
        <div><dt>Sucursal</dt><dd>{row.warehouse?.branch?.name || '—'}</dd></div>
      </dl>
      <div className={osStyles.detailActions}>
        <Button variant="secondary" onClick={() => navigate('/inventario/operaciones')}>Operaciones</Button>
        {low(row) ? <Button onClick={() => navigate('/compras/solicitudes')}>Solicitar compra</Button> : null}
      </div>
    </>}
  />;
}
