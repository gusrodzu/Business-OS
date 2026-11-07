import {formatProductMoney} from '../utils/formatProductMoney';
import {useState} from 'react';
import {Plus,FileUp} from 'lucide-react';
import {Button} from '../../../../design-system/components';
import {ModuleHeader} from '../../../../components/module-system';
import {PageSkeleton} from '../../../../ux-foundation/UXFoundation';
import ProductCatalogWorkspace from '../components/ProductCatalogWorkspace';
import ProductCatalogMetrics from '../components/ProductCatalogMetrics';
import ProductDetailDrawer from '../components/ProductDetailDrawer';
import ProductFormDialog from '../components/ProductFormDialog';
import styles from './Catalog.module.css';
import {useProductCatalogView} from '../hooks/useProductCatalogView';
import {useProductCatalogData} from '../hooks/useProductCatalogData';
import {useProductCatalogMutations} from '../hooks/useProductCatalogMutations';


const emptyForm={categoryId:'',sku:'',name:'',description:'',unit:'PZA',cost:0,price:0,minStock:0,active:true};


export default function Products(){
  const {items,setItems,categories,loading,message,setMessage,loadData}=useProductCatalogData();
  const [form,setForm]=useState(null);
  const {query,setQuery,view,setView,categoryFilter,setCategoryFilter,selectedIds,setSelectedIds,filtered,viewCounts}=useProductCatalogView(items);
  const [selected,setSelected]=useState(null);
  const [drawerTab,setDrawerTab]=useState('summary');

  const {saving,save,toggle,remove,bulkStatus}=useProductCatalogMutations({
    form,setForm,items,setItems,selected,setSelected,
    selectedIds,setSelectedIds,setMessage,loadData
  });

  if(loading)return <PageSkeleton rows={6}/>;

  return <div className={styles.page}>
    <ModuleHeader
      eyebrow="Inventario · Maestro de producto"
      title="Catálogo de productos"
      description="Define SKU, unidades, costos, precios y niveles mínimos antes de operar existencias."
      actions={<><Button variant="secondary" icon={FileUp} onClick={()=>window.location.assign('/data-hub?entity=PRODUCT')}>Importar productos</Button><Button icon={Plus} onClick={()=>setForm({...emptyForm,categoryId:categories[0]?.id??''})}>Nuevo producto</Button></>}
    />

    {message?<div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>:null}

    <ProductCatalogMetrics products={items}/>

    <ProductCatalogWorkspace
      view={view} setView={setView} viewCounts={viewCounts} query={query} setQuery={setQuery}
      categories={categories} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
      selectedIds={selectedIds} setSelectedIds={setSelectedIds} bulkStatus={bulkStatus}
      message={message} loadData={loadData} filtered={filtered}
      onOpen={item=>{setSelected(item);setDrawerTab('summary')}} toggle={toggle}
      onEdit={item=>setForm({...item,categoryId:item.categoryId||''})} remove={remove} money={formatProductMoney}
    />

    <ProductDetailDrawer
      product={selected}
      activeTab={drawerTab}
      onTabChange={setDrawerTab}
      onClose={()=>setSelected(null)}
      onEdit={item=>{setForm({...item,categoryId:item.categoryId||''});setSelected(null)}}
      formatMoney={formatProductMoney}
    />

    <ProductFormDialog form={form} setForm={setForm} categories={categories} saving={saving} onSubmit={save} onClose={()=>setForm(null)}/>
  </div>;
}
