import {AlertTriangle,Boxes,CircleDollarSign,Warehouse} from 'lucide-react';
import {useEffect,useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {inventoryRequest as apiRequest} from '../../services/inventoryApi';
import {Badge,Button} from '../../../../design-system/components';
import KpiGrid from '../../../../components/KpiGrid';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import {ModuleHeader} from '../../../../components/module-system';
import {EntityDrawer,FilterBar,InlineErrorState,NoResultsState,PageSkeleton,SavedViews,SmartTable} from '../../../../ux-foundation/UXFoundation';
import styles from './Inventory.module.css';

const num=v=>Number(v||0).toLocaleString('es-MX',{maximumFractionDigits:3});
const money=v=>Number(v||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
const availableOf=b=>Number(b.available ?? b.quantity ?? 0);
const minOf=b=>Number(b.minStock ?? b.product?.minStock ?? 0);
const costOf=b=>Number(b.averageCost ?? b.product?.cost ?? 0);
const isLow=b=>availableOf(b)<=minOf(b);

export default function InventoryBalances(){
  const navigate=useNavigate();
  const [balances,setBalances]=useState([]);
  const [summary,setSummary]=useState({});
  const [loading,setLoading]=useState(true);
  const [query,setQuery]=useState('');
  const [view,setView]=useState('all');
  const [warehouseFilter,setWarehouseFilter]=useState('');
  const [selected,setSelected]=useState(null);
  const [drawerTab,setDrawerTab]=useState('summary');
  const [error,setError]=useState('');

  async function load(){
    setLoading(true);setError('');
    try{
      const d=await apiRequest('/inventory/balances');
      setBalances(d.balances||[]);setSummary(d.summary||{});
    }catch(e){setError(e.message);}finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);

  const warehouses=useMemo(()=>Array.from(new Map(balances.filter(b=>b.warehouse?.id).map(b=>[b.warehouse.id,b.warehouse])).values()),[balances]);
  const computedSummary=useMemo(()=>({
    records:Number(summary.records ?? balances.length),
    units:Number(summary.units ?? balances.reduce((sum,b)=>sum+availableOf(b),0)),
    value:Number(summary.value ?? balances.reduce((sum,b)=>sum+availableOf(b)*costOf(b),0)),
    lowStock:Number(summary.lowStock ?? balances.filter(isLow).length),
  }),[summary,balances]);
  const viewCounts=useMemo(()=>({
    all:balances.length,
    low:balances.filter(isLow).length,
    available:balances.filter(b=>availableOf(b)>minOf(b)).length,
    empty:balances.filter(b=>availableOf(b)<=0).length,
  }),[balances]);

  const warehouseDistribution=useMemo(()=>{
    const grouped=new Map();
    for(const balance of balances){
      const id=balance.warehouse?.id||'unassigned';
      const entry=grouped.get(id)||{id,name:balance.warehouse?.name||'Sin almacén',units:0,positions:0};
      entry.units+=Math.max(0,availableOf(balance));
      entry.positions+=1;
      grouped.set(id,entry);
    }
    const entries=[...grouped.values()].sort((a,b)=>b.units-a.units).slice(0,6);
    const maximum=Math.max(1,...entries.map(entry=>entry.units));
    return entries.map(entry=>({...entry,width:Math.max(entry.units?4:0,entry.units/maximum*100)}));
  },[balances]);

  const restockPriority=useMemo(()=>balances.filter(isLow)
    .sort((a,b)=>(minOf(b)-availableOf(b))-(minOf(a)-availableOf(a)))
    .slice(0,5),[balances]);

  const filtered=useMemo(()=>{
    const q=query.toLowerCase().trim();
    return balances.filter(b=>{
      if(q && ![b.product?.sku,b.product?.name,b.product?.category?.name,b.warehouse?.name,b.warehouse?.branch?.name].join(' ').toLowerCase().includes(q)) return false;
      if(warehouseFilter && b.warehouse?.id!==warehouseFilter) return false;
      if(view==='low' && !isLow(b)) return false;
      if(view==='available' && isLow(b)) return false;
      if(view==='empty' && availableOf(b)>0) return false;
      return true;
    });
  },[balances,query,warehouseFilter,view]);

  if(loading)return <PageSkeleton rows={7}/>;

  return <div className={styles.page}>
    <ModuleHeader eyebrow="Inventario · Control de existencias" title="Existencias" description="Consulta inventario por producto, almacén y sucursal con valorización, alertas y acciones de reabastecimiento." />

    {error?<InlineErrorState message={error} onRetry={load}/>:null}

    <div className={styles.vaultDashboard} data-design-reference="warehouse-vault">
      <div className={styles.vaultKpis}>
        <KpiGrid>
          <KpiCard><Boxes/><span>Posiciones</span><KpiInfo title="Posiciones de inventario">Combinaciones de producto y almacén con saldo registrado.</KpiInfo><strong>{num(computedSummary.records)}</strong><small>producto × almacén</small></KpiCard>
          <KpiCard><Warehouse/><span>Unidades disponibles</span><KpiInfo title="Existencia total">Suma de las unidades disponibles en todos los almacenes.</KpiInfo><strong>{num(computedSummary.units)}</strong><small>existencia consolidada</small></KpiCard>
          <KpiCard><CircleDollarSign/><span>Valor de inventario</span><KpiInfo title="Valuación de inventario">Existencia multiplicada por el costo promedio.</KpiInfo><strong>{money(computedSummary.value)}</strong><small>costo promedio</small></KpiCard>
          <KpiCard><AlertTriangle/><span>Stock bajo</span><KpiInfo title="Productos por reabastecer">Posiciones cuya existencia es igual o menor al mínimo configurado.</KpiInfo><strong>{num(computedSummary.lowStock)}</strong><small>requieren atención</small></KpiCard>
        </KpiGrid>
      </div>

      <div className={styles.vaultAnalytics}>
        <section className={styles.vaultChartCard} aria-label="Disponibilidad de inventario por almacén">
          <header className={styles.vaultCardHeader}>
            <div><span className={styles.vaultEyebrow}>Análisis de inventario</span><h2>Distribución por almacén</h2><p>Unidades disponibles en cada almacén, sin proyecciones.</p></div>
            <span className={styles.vaultCounter}>{warehouses.length} almacenes</span>
          </header>
          {warehouseDistribution.length ? (
            <div className={styles.vaultBarList}>
              {warehouseDistribution.map(item=><div className={styles.vaultBarItem} key={item.id}>
                <div className={styles.vaultBarLabels}><span title={item.name}>{item.name}</span><strong>{num(item.units)} unidades</strong></div>
                <div className={styles.vaultBarTrack} role="img" aria-label={`${item.name}: ${num(item.units)} unidades disponibles`}><span style={{width:`${item.width}%`}}/></div>
              </div>)}
            </div>
          ) : <p className={styles.vaultEmpty}>Todavía no hay movimientos de inventario para comparar almacenes.</p>}
          <footer className={styles.vaultChartFooter}><span className={styles.vaultLegendDot}/> Existencia disponible · datos del inventario actual</footer>
        </section>
        <section className={styles.vaultRestockCard} aria-label="Recomendaciones de reabastecimiento">
          <header className={styles.vaultCardHeader}>
            <div><span className={styles.vaultEyebrow}>Atención prioritaria</span><h2>Reabastecimiento</h2><p>Productos con existencias iguales o inferiores al mínimo.</p></div>
            <span className={styles.vaultCounter}>{viewCounts.low} alertas</span>
          </header>
          {restockPriority.length ? <div className={styles.vaultRestockList}>
            {restockPriority.map(item=><button key={item.id} type="button" className={styles.vaultRestockItem} onClick={()=>{setSelected(item);setDrawerTab('summary')}}>
              <span className={styles.vaultProductMark}>{(item.product?.name||'?').slice(0,1).toUpperCase()}</span>
              <span className={styles.vaultProductCopy}><strong>{item.product?.name||item.product?.sku||'Producto'}</strong><small>{item.warehouse?.name||'Sin almacén'} · mínimo {num(minOf(item))}</small></span>
              <span className={availableOf(item)<=0?styles.vaultCritical:styles.vaultLow}>{num(availableOf(item))}</span>
            </button>)}
          </div>:<p className={styles.vaultEmpty}>No hay posiciones con stock bajo en este momento.</p>}
          <div className={styles.vaultRestockActions}>
            <Button variant="secondary" onClick={()=>setView('low')}>Ver alertas</Button>
            <Button onClick={()=>navigate('/compras/solicitudes')}>Solicitar compra</Button>
          </div>
        </section>
      </div>
    </div>

    <section className={styles.uxInventoryWorkspace} data-ux-v19="inventory-balances">
      <div className={styles.vaultTableHeading}>
        <div><span className={styles.vaultEyebrow}>Detalle operativo</span><h2>Existencias por producto</h2><p>Consulta, filtra y abre cualquier posición para ver su valoración y ubicación.</p></div>
        <Button variant="secondary" onClick={()=>navigate('/inventario/productos')}>Ver catálogo</Button>
      </div>
      <SavedViews active={view} onChange={setView} items={[
        {id:'all',label:'Todo el inventario',count:viewCounts.all},
        {id:'low',label:'Reabastecer',count:viewCounts.low},
        {id:'available',label:'Disponible',count:viewCounts.available},
        {id:'empty',label:'Sin existencia',count:viewCounts.empty},
      ]}/>
      <FilterBar query={query} onQueryChange={setQuery} placeholder="Buscar producto, SKU, categoría, almacén o sucursal" chips={[{id:'warehouse',active:Boolean(warehouseFilter),label:`Almacén: ${warehouses.find(w=>w.id===warehouseFilter)?.name||''}`,onRemove:()=>setWarehouseFilter('')}]} onClear={()=>{setQuery('');setWarehouseFilter('');setView('all')}}>
        <select value={warehouseFilter} onChange={e=>setWarehouseFilter(e.target.value)} aria-label="Filtrar por almacén"><option value="">Todos los almacenes</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
      </FilterBar>
      <div className={styles.vaultTable}>
      <SmartTable ariaLabel="Existencias por producto y almacén" footer={<><span>{filtered.length} posiciones visibles</span><span>{viewCounts.low} requieren atención</span></>}>
        {filtered.length?<table><thead><tr><th>Producto</th><th>Almacén</th><th>Disponible</th><th>Mínimo</th><th>Costo promedio</th><th>Valor</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
          {filtered.map(b=>{const low=isLow(b);const available=availableOf(b);const min=minOf(b);const cost=costOf(b);return <tr key={b.id} onClick={()=>{setSelected(b);setDrawerTab('summary')}} className={styles.uxClickableRow}>
            <td><strong>{b.product?.name}</strong><small>{b.product?.sku} · {b.product?.category?.name||'Sin categoría'}</small></td>
            <td><strong>{b.warehouse?.name}</strong><small>{b.warehouse?.branch?.name||'Sin sucursal'}</small></td>
            <td><strong>{num(available)}</strong> {b.product?.unit}</td><td>{num(min)}</td><td>{money(cost)}</td><td><strong>{money(available*cost)}</strong></td><td><Badge tone={available<=0?'danger':low?'warning':'success'}>{available<=0?'Sin existencia':low?'Reabastecer':'Disponible'}</Badge></td>
            <td><Button type="button" variant="secondary" size="sm" aria-label={`Ver detalle de ${b.product?.name || 'producto'} en ${b.warehouse?.name || 'almacén'}`} onClick={(event)=>{event.stopPropagation();setSelected(b);setDrawerTab('summary')}}>Ver</Button></td>
          </tr>})}
        </tbody></table>:<NoResultsState query={query||warehouseFilter||view} onClear={()=>{setQuery('');setWarehouseFilter('');setView('all')}}/>}
      </SmartTable>
      </div>
    </section>

    <EntityDrawer open={Boolean(selected)} onClose={()=>setSelected(null)} eyebrow="Posición de inventario" title={selected?.product?.name} subtitle={`${selected?.product?.sku||''} · ${selected?.warehouse?.name||''}`} status={selected?<Badge tone={availableOf(selected)<=0?'danger':isLow(selected)?'warning':'success'}>{availableOf(selected)<=0?'Sin existencia':isLow(selected)?'Reabastecer':'Disponible'}</Badge>:null} tabs={[{id:'summary',label:'Resumen'},{id:'valuation',label:'Valuación'},{id:'location',label:'Ubicación'}]} activeTab={drawerTab} onTabChange={setDrawerTab} footer={selected?<><Button variant="secondary" onClick={()=>setSelected(null)}>Cerrar</Button>{isLow(selected)?<Button onClick={()=>navigate('/compras/solicitudes')}>Crear SOLPED</Button>:null}</>:null}>
      {selected&&drawerTab==='summary'?<div className={styles.uxDrawerGrid}><div><span>Disponible</span><strong>{num(availableOf(selected))} {selected.product?.unit}</strong></div><div><span>Stock mínimo</span><strong>{num(minOf(selected))}</strong></div><div><span>Existencia registrada</span><strong>{num(selected.quantity)}</strong></div><div><span>Reservado</span><strong>{num(selected.reserved)}</strong></div></div>:null}
      {selected&&drawerTab==='valuation'?<div className={styles.uxDrawerGrid}><div><span>Costo promedio</span><strong>{money(costOf(selected))}</strong></div><div><span>Valor disponible</span><strong>{money(availableOf(selected)*costOf(selected))}</strong></div><div><span>Valor total</span><strong>{money(Number(selected.quantity||0)*costOf(selected))}</strong></div><div><span>Estado de reabasto</span><strong>{isLow(selected)?'Requiere compra':'Nivel saludable'}</strong></div></div>:null}
      {selected&&drawerTab==='location'?<div className={styles.uxDrawerGrid}><div><span>Almacén</span><strong>{selected.warehouse?.name||'—'}</strong></div><div><span>Sucursal</span><strong>{selected.warehouse?.branch?.name||'—'}</strong></div><div><span>Producto</span><strong>{selected.product?.name||'—'}</strong></div><div><span>SKU</span><strong>{selected.product?.sku||'—'}</strong></div></div>:null}
    </EntityDrawer>
  </div>;
}
