import {AlertTriangle,Boxes,CircleDollarSign,Warehouse} from 'lucide-react';
import {useEffect,useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiRequest} from '../../../../api';
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

    <KpiGrid>
      <KpiCard><Boxes/><span>Posiciones</span><KpiInfo title="Posiciones de inventario">Combinaciones de producto y almacén con saldo registrado.</KpiInfo><strong>{computedSummary.records}</strong><small>producto × almacén</small></KpiCard>
      <KpiCard><Warehouse/><span>Unidades disponibles</span><KpiInfo title="Existencia total">Suma de las unidades disponibles en todos los almacenes.</KpiInfo><strong>{num(computedSummary.units)}</strong><small>existencia consolidada</small></KpiCard>
      <KpiCard><CircleDollarSign/><span>Valor de inventario</span><KpiInfo title="Valuación de inventario">Existencia multiplicada por el costo promedio.</KpiInfo><strong>{money(computedSummary.value)}</strong><small>costo promedio</small></KpiCard>
      <KpiCard><AlertTriangle/><span>Stock bajo</span><KpiInfo title="Productos por reabastecer">Posiciones cuya existencia es igual o menor al mínimo configurado.</KpiInfo><strong>{computedSummary.lowStock}</strong><small>requieren atención</small></KpiCard>
    </KpiGrid>

    <section className={styles.uxInventoryWorkspace} data-ux-v19="inventory-balances">
      <SavedViews active={view} onChange={setView} items={[
        {id:'all',label:'Todo el inventario',count:viewCounts.all},
        {id:'low',label:'Reabastecer',count:viewCounts.low},
        {id:'available',label:'Disponible',count:viewCounts.available},
        {id:'empty',label:'Sin existencia',count:viewCounts.empty},
      ]}/>
      <FilterBar query={query} onQueryChange={setQuery} placeholder="Buscar producto, SKU, categoría, almacén o sucursal" chips={[{id:'warehouse',active:Boolean(warehouseFilter),label:`Almacén: ${warehouses.find(w=>w.id===warehouseFilter)?.name||''}`,onRemove:()=>setWarehouseFilter('')}]} onClear={()=>{setQuery('');setWarehouseFilter('');setView('all')}}>
        <select value={warehouseFilter} onChange={e=>setWarehouseFilter(e.target.value)} aria-label="Filtrar por almacén"><option value="">Todos los almacenes</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
      </FilterBar>
      <SmartTable footer={<><span>{filtered.length} posiciones visibles</span><span>{viewCounts.low} requieren atención</span></>}>
        {filtered.length?<table><thead><tr><th>Producto</th><th>Almacén</th><th>Disponible</th><th>Mínimo</th><th>Costo promedio</th><th>Valor</th><th>Estado</th></tr></thead><tbody>
          {filtered.map(b=>{const low=isLow(b);const available=availableOf(b);const min=minOf(b);const cost=costOf(b);return <tr key={b.id} onClick={()=>{setSelected(b);setDrawerTab('summary')}} className={styles.uxClickableRow}>
            <td><strong>{b.product?.name}</strong><small>{b.product?.sku} · {b.product?.category?.name||'Sin categoría'}</small></td>
            <td><strong>{b.warehouse?.name}</strong><small>{b.warehouse?.branch?.name||'Sin sucursal'}</small></td>
            <td><strong>{num(available)}</strong> {b.product?.unit}</td><td>{num(min)}</td><td>{money(cost)}</td><td><strong>{money(available*cost)}</strong></td><td><Badge tone={available<=0?'danger':low?'warning':'success'}>{available<=0?'Sin existencia':low?'Reabastecer':'Disponible'}</Badge></td>
          </tr>})}
        </tbody></table>:<NoResultsState query={query||warehouseFilter||view} onClear={()=>{setQuery('');setWarehouseFilter('');setView('all')}}/>}
      </SmartTable>
    </section>

    <EntityDrawer open={Boolean(selected)} onClose={()=>setSelected(null)} eyebrow="Posición de inventario" title={selected?.product?.name} subtitle={`${selected?.product?.sku||''} · ${selected?.warehouse?.name||''}`} status={selected?<Badge tone={availableOf(selected)<=0?'danger':isLow(selected)?'warning':'success'}>{availableOf(selected)<=0?'Sin existencia':isLow(selected)?'Reabastecer':'Disponible'}</Badge>:null} tabs={[{id:'summary',label:'Resumen'},{id:'valuation',label:'Valuación'},{id:'location',label:'Ubicación'}]} activeTab={drawerTab} onTabChange={setDrawerTab} footer={selected?<><Button variant="secondary" onClick={()=>setSelected(null)}>Cerrar</Button>{isLow(selected)?<Button onClick={()=>navigate('/compras/solicitudes')}>Crear SOLPED</Button>:null}</>:null}>
      {selected&&drawerTab==='summary'?<div className={styles.uxDrawerGrid}><div><span>Disponible</span><strong>{num(availableOf(selected))} {selected.product?.unit}</strong></div><div><span>Stock mínimo</span><strong>{num(minOf(selected))}</strong></div><div><span>Existencia registrada</span><strong>{num(selected.quantity)}</strong></div><div><span>Reservado</span><strong>{num(selected.reserved)}</strong></div></div>:null}
      {selected&&drawerTab==='valuation'?<div className={styles.uxDrawerGrid}><div><span>Costo promedio</span><strong>{money(costOf(selected))}</strong></div><div><span>Valor disponible</span><strong>{money(availableOf(selected)*costOf(selected))}</strong></div><div><span>Valor total</span><strong>{money(Number(selected.quantity||0)*costOf(selected))}</strong></div><div><span>Estado de reabasto</span><strong>{isLow(selected)?'Requiere compra':'Nivel saludable'}</strong></div></div>:null}
      {selected&&drawerTab==='location'?<div className={styles.uxDrawerGrid}><div><span>Almacén</span><strong>{selected.warehouse?.name||'—'}</strong></div><div><span>Sucursal</span><strong>{selected.warehouse?.branch?.name||'—'}</strong></div><div><span>Producto</span><strong>{selected.product?.name||'—'}</strong></div><div><span>SKU</span><strong>{selected.product?.sku||'—'}</strong></div></div>:null}
    </EntityDrawer>
  </div>;
}
