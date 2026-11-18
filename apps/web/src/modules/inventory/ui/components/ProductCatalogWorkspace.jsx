import {BulkActionsBar, FilterBar, InlineErrorState, SavedViews} from '../../../../ux-foundation/UXFoundation';
import ProductCatalogMobileList from './ProductCatalogMobileList';
import ProductCatalogDesktopTable from './ProductCatalogDesktopTable';
import styles from './ProductCatalogWorkspace.module.css';
import {useProductCatalogWorkspaceControls} from '../hooks/useProductCatalogWorkspaceControls';

export default function ProductCatalogWorkspace({
  view, setView, viewCounts, query, setQuery, categories, categoryFilter, setCategoryFilter,
  selectedIds, setSelectedIds, bulkStatus, message, loadData, filtered,
  onOpen, toggle, onEdit, remove, money,
}) {
  const {savedViews,clearFilters,updateMobileSelection} = useProductCatalogWorkspaceControls({
    viewCounts,setView,setQuery,setCategoryFilter,setSelectedIds,
  });

  return (
    <section className={styles.workspace} data-ux-v19="inventory-products">
      <SavedViews active={view} onChange={setView} items={savedViews}/>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Buscar por nombre, SKU, categoría o unidad"
        chips={[{id:'category',active:Boolean(categoryFilter),label:`Categoría: ${categories.find(row=>row.id===categoryFilter)?.name||''}`,onRemove:()=>setCategoryFilter('')}]} 
        onClear={clearFilters}
      >
        <select className={styles.categorySelect} value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} aria-label="Filtrar categoría">
          <option value="">Todas las categorías</option>
          {categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </FilterBar>
      <BulkActionsBar count={selectedIds.length} onClear={()=>setSelectedIds([])}>
        <button type="button" onClick={()=>bulkStatus(true)}>Activar</button>
        <button type="button" onClick={()=>bulkStatus(false)}>Desactivar</button>
      </BulkActionsBar>
      {message?.type==='error'?<InlineErrorState message={message.text} onRetry={loadData}/>:null}
      <ProductCatalogDesktopTable filtered={filtered} selectedIds={selectedIds} onSelectedIdsChange={setSelectedIds} onOpen={onOpen} onToggle={toggle} onEdit={onEdit} onRemove={remove} money={money} query={query||categoryFilter||view} onClear={clearFilters} />
      <ProductCatalogMobileList
        products={filtered}
        selectedIds={selectedIds}
        onSelectChange={updateMobileSelection}
        onOpen={onOpen}
        onToggle={toggle}
        onEdit={onEdit}
        onRemove={remove}
        formatMoney={money}
        emptyQuery={query || categoryFilter || view}
        onClear={clearFilters}
      />
    </section>
  );
}
