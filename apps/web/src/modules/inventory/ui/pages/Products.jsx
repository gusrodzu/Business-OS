import {formatProductMoney} from '../utils/formatProductMoney';
import {Plus,FileUp} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Button} from '../../../../design-system/components';
import {ModuleHeader} from '../../../../components/module-system';
import {PageSkeleton} from '../../../../ux-foundation/UXFoundation';
import ProductCatalogWorkspace from '../components/ProductCatalogWorkspace';
import ProductCatalogOSWorkspace from '../components/ProductCatalogOSWorkspace';
import ProductCatalogMetrics from '../components/ProductCatalogMetrics';
import ProductDetailDrawer from '../components/ProductDetailDrawer';
import ProductFormDialog from '../components/ProductFormDialog';
import styles from './Catalog.module.css';
import {useProductCatalogView} from '../hooks/useProductCatalogView';
import {useProductCatalogData} from '../hooks/useProductCatalogData';
import {useProductCatalogMutations} from '../hooks/useProductCatalogMutations';
import {useProductCatalogEditor} from '../hooks/useProductCatalogEditor';


export default function Products(){
  const navigate=useNavigate();
  const osMode=useLocation().pathname==='/inventario/productos';
  const {items,setItems,categories,loading,message,setMessage,loadData}=useProductCatalogData();
  const {query,setQuery,view,setView,categoryFilter,setCategoryFilter,selectedIds,setSelectedIds,filtered,viewCounts}=useProductCatalogView(items);
  const {form,setForm,selected,setSelected,drawerTab,setDrawerTab,createProduct,editProduct,openProduct,editSelectedProduct}=useProductCatalogEditor(categories);

  const {saving,save,toggle,remove,bulkStatus}=useProductCatalogMutations({
    form,setForm,items,setItems,selected,setSelected,
    selectedIds,setSelectedIds,setMessage,loadData
  });

  if(loading)return <PageSkeleton rows={6}/>;

  return <div className={styles.page} data-catalog-os-view={osMode ? 'true' : 'false'}>
    {message?<div className={[styles.message, styles[message.type]].filter(Boolean).join(' ')} role="status">{message.text}</div>:null}

    {osMode ? <ProductCatalogOSWorkspace
      products={items}
      records={filtered}
      categories={categories}
      query={query}
      onQueryChange={setQuery}
      view={view}
      onViewChange={setView}
      viewCounts={viewCounts}
      categoryFilter={categoryFilter}
      onCategoryChange={setCategoryFilter}
      onClearFilters={()=>{setQuery('');setView('all');setCategoryFilter('')}}
      selectedIds={selectedIds}
      setSelectedIds={setSelectedIds}
      onBulkStatus={bulkStatus}
      onCreate={createProduct}
      onImport={()=>navigate('/data-hub?entity=PRODUCT')}
      onOpenBalances={()=>navigate('/inventario/existencias')}
      onEdit={editProduct}
      onOpenFullDetail={openProduct}
      onToggle={toggle}
      onRemove={remove}
      formatMoney={formatProductMoney}
    /> : <>
    <ModuleHeader
      eyebrow="Inventario · Maestro de producto"
      title="Catálogo de productos"
      description="Define SKU, unidades, costos, precios y niveles mínimos antes de operar existencias."
      actions={<><Button variant="secondary" icon={FileUp} onClick={()=>window.location.assign('/data-hub?entity=PRODUCT')}>Importar productos</Button><Button icon={Plus} onClick={createProduct}>Nuevo producto</Button></>}
    />

    <ProductCatalogMetrics products={items}/>

    <ProductCatalogWorkspace
      view={view} setView={setView} viewCounts={viewCounts} query={query} setQuery={setQuery}
      categories={categories} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
      selectedIds={selectedIds} setSelectedIds={setSelectedIds} bulkStatus={bulkStatus}
      message={message} loadData={loadData} filtered={filtered}
      onOpen={openProduct} toggle={toggle}
      onEdit={editProduct} remove={remove} money={formatProductMoney}
    />

    </>}

    <ProductDetailDrawer
      product={selected}
      activeTab={drawerTab}
      onTabChange={setDrawerTab}
      onClose={()=>setSelected(null)}
      onEdit={editSelectedProduct}
      formatMoney={formatProductMoney}
    />

    <ProductFormDialog form={form} setForm={setForm} categories={categories} saving={saving} onSubmit={save} onClose={()=>setForm(null)}/>
  </div>;
}
