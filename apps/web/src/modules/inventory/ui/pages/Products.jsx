import {useEffect,useMemo,useState} from 'react';
import {DollarSign,Edit3,Package,Plus,FileUp} from 'lucide-react';
import {inventoryRequest as apiRequest} from '../../services/inventoryApi';
import {Badge,Button} from '../../../../design-system/components';
import KpiGrid from '../../../../components/KpiGrid';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import {ModuleHeader} from '../../../../components/module-system';
import {BulkActionsBar, EntityDrawer, FilterBar, InlineErrorState, PageSkeleton, SavedViews} from '../../../../ux-foundation/UXFoundation';
import ProductCatalogMobileList from '../components/ProductCatalogMobileList';
import ProductCatalogDesktopTable from '../components/ProductCatalogDesktopTable';
import ProductDetailPanel from '../components/ProductDetailPanel';
import ProductFormDialog from '../components/ProductFormDialog';
import styles from './Catalog.module.css';
import {filterCatalogProducts, countCatalogViews} from '../utils/catalogSelectors';


const emptyForm={categoryId:'',sku:'',name:'',description:'',unit:'PZA',cost:0,price:0,minStock:0,active:true};
const money=v=>Number(v||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});

export default function Products(){
  const [items,setItems]=useState([]);
  const [categories,setCategories]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState(null);
  const [query,setQuery]=useState('');
  const [view,setView]=useState('all');
  const [categoryFilter,setCategoryFilter]=useState('');
  const [selectedIds,setSelectedIds]=useState([]);
  const [message,setMessage]=useState(null);
  const [selected,setSelected]=useState(null);
  const [drawerTab,setDrawerTab]=useState('summary');

  async function loadData(){
    setLoading(true);
    try{
      const result=await apiRequest('/products');
      setItems(result.products??[]);
      setCategories(result.categories??[]);
    }catch(error){
      setMessage({type:'error',text:error.message});
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{loadData();},[]);

  const filtered=useMemo(()=>filterCatalogProducts(items,{query,view,categoryFilter}),[items,query,view,categoryFilter]);
  const viewCounts=useMemo(()=>countCatalogViews(items),[items]);

  async function save(event){
    event.preventDefault();
    setSaving(true);
    try{
      const editing=Boolean(form.id);
      await apiRequest(editing?`/products/${form.id}`:'/products',{
        method:editing?'PUT':'POST',
        body:{...form,cost:Number(form.cost),price:Number(form.price),minStock:Number(form.minStock)}
      });
      setForm(null);
      await loadData();
      setMessage({type:'success',text:editing?'Producto actualizado.':'Producto creado.'});
    }catch(error){
      setMessage({type:'error',text:error.message});
    }finally{
      setSaving(false);
    }
  }

  async function toggle(item){
    try{
      await apiRequest(`/products/${item.id}/status`,{method:'PATCH',body:{active:!item.active}});
      setItems(current=>current.map(row=>row.id===item.id?{...row,active:!row.active}:row));
      if(selected?.id===item.id)setSelected(v=>({...v,active:!v.active}));
    }catch(error){
      setMessage({type:'error',text:error.message});
    }
  }

  async function remove(item){
    if(!window.confirm(`¿Eliminar el producto ${item.name}?`))return;
    try{
      await apiRequest(`/products/${item.id}`,{method:'DELETE'});
      setItems(current=>current.filter(row=>row.id!==item.id));
      setSelectedIds(current=>current.filter(id=>id!==item.id));
      if(selected?.id===item.id)setSelected(null);
    }catch(error){
      setMessage({type:'error',text:error.message});
    }
  }

  async function bulkStatus(active){
    const rows=items.filter(item=>selectedIds.includes(item.id) && item.active!==active);
    if(!rows.length){setSelectedIds([]);return;}
    try{
      await Promise.all(rows.map(item=>apiRequest(`/products/${item.id}/status`,{method:'PATCH',body:{active}})));
      setItems(current=>current.map(item=>selectedIds.includes(item.id)?{...item,active}:item));
      setSelectedIds([]);
      setMessage({type:'success',text:`${rows.length} producto${rows.length===1?'':'s'} actualizado${rows.length===1?'':'s'}.`});
    }catch(error){setMessage({type:'error',text:error.message});}
  }

  if(loading)return <PageSkeleton rows={6}/>;

  const active=items.filter(item=>item.active).length;
  const inventoryValue=items.reduce((sum,item)=>sum+Number(item.cost||0),0);

  return <div className={styles.page}>
    <ModuleHeader
      eyebrow="Inventario · Maestro de producto"
      title="Catálogo de productos"
      description="Define SKU, unidades, costos, precios y niveles mínimos antes de operar existencias."
      actions={<><Button variant="secondary" icon={FileUp} onClick={()=>window.location.assign('/data-hub?entity=PRODUCT')}>Importar productos</Button><Button icon={Plus} onClick={()=>setForm({...emptyForm,categoryId:categories[0]?.id??''})}>Nuevo producto</Button></>}
    />

    {message?<div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>:null}

    <KpiGrid>
      <KpiCard><Package/><span>Productos registrados</span><KpiInfo title="Productos registrados">Total de productos del catálogo.</KpiInfo><strong>{items.length}</strong><small>maestro de producto</small></KpiCard>
      <KpiCard><Package/><span>Productos activos</span><KpiInfo title="Productos activos">Disponibles para compras, ventas e inventario.</KpiInfo><strong>{active}</strong><small>{items.length-active} inactivo(s)</small></KpiCard>
      <KpiCard><DollarSign/><span>Costo catálogo</span><KpiInfo title="Costo catálogo">Suma del costo configurado; no representa valorización de existencias.</KpiInfo><strong>{money(inventoryValue)}</strong><small>referencia del maestro</small></KpiCard>
    </KpiGrid>

    <section className={styles.uxCatalogWorkspace} data-ux-v19="inventory-products">
      <SavedViews active={view} onChange={setView} items={[
        {id:'all',label:'Todos',count:viewCounts.all},
        {id:'active',label:'Activos',count:viewCounts.active},
        {id:'inactive',label:'Inactivos',count:viewCounts.inactive},
        {id:'lowMargin',label:'Margen bajo',count:viewCounts.lowMargin},
      ]}/>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Buscar por nombre, SKU, categoría o unidad"
        chips={[{id:'category',active:Boolean(categoryFilter),label:`Categoría: ${categories.find(row=>row.id===categoryFilter)?.name||''}`,onRemove:()=>setCategoryFilter('')}]} 
        onClear={()=>{setQuery('');setCategoryFilter('');setView('all')}}
      >
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} aria-label="Filtrar categoría">
          <option value="">Todas las categorías</option>
          {categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </FilterBar>
      <BulkActionsBar count={selectedIds.length} onClear={()=>setSelectedIds([])}>
        <button type="button" onClick={()=>bulkStatus(true)}>Activar</button>
        <button type="button" onClick={()=>bulkStatus(false)}>Desactivar</button>
      </BulkActionsBar>
      {message?.type==='error'?<InlineErrorState message={message.text} onRetry={loadData}/>:null}
      <ProductCatalogDesktopTable filtered={filtered} selectedIds={selectedIds} onSelectedIdsChange={setSelectedIds} onOpen={item=>{setSelected(item);setDrawerTab('summary')}} onToggle={toggle} onEdit={item=>setForm({...item,categoryId:item.categoryId||''})} onRemove={remove} money={money} query={query||categoryFilter||view} onClear={()=>{setQuery('');setCategoryFilter('');setView('all')}} />
      <ProductCatalogMobileList
        products={filtered}
        selectedIds={selectedIds}
        onSelectChange={(id, checked) => setSelectedIds(ids => checked ? [...new Set([...ids, id])] : ids.filter(selectedId => selectedId !== id))}
        onOpen={item => {setSelected(item);setDrawerTab('summary')}}
        onToggle={toggle}
        onEdit={item => setForm({...item, categoryId: item.categoryId || ''})}
        onRemove={remove}
        formatMoney={money}
        emptyQuery={query || categoryFilter || view}
        onClear={() => {setQuery('');setCategoryFilter('');setView('all')}}
      />
    </section>

    <EntityDrawer
      open={Boolean(selected)}
      onClose={()=>setSelected(null)}
      eyebrow="Producto"
      title={selected?.name}
      subtitle={selected?.sku}
      status={selected?<Badge tone={selected.active?'success':'neutral'}>{selected.active?'Activo':'Inactivo'}</Badge>:null}
      activeTab={drawerTab}
      onTabChange={setDrawerTab}
      tabs={[{id:'summary',label:'Resumen'},{id:'commercial',label:'Comercial'},{id:'inventory',label:'Inventario'}]}
      actions={selected?<Button size="sm" variant="secondary" onClick={()=>{setForm({...selected,categoryId:selected.categoryId||''});setSelected(null)}}><Edit3 size={15}/> Editar</Button>:null}
      footer={<Button variant="secondary" onClick={()=>setSelected(null)}>Cerrar</Button>}
    >
      <ProductDetailPanel product={selected} activeTab={drawerTab} formatMoney={money}/>
    </EntityDrawer>

    <ProductFormDialog form={form} setForm={setForm} categories={categories} saving={saving} onSubmit={save} onClose={()=>setForm(null)}/>
  </div>;
}
