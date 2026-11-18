/** Pure catalog selectors. Keep the existing filter and badge-count semantics. */
export function filterCatalogProducts(items,{query='',view='all',categoryFilter=''}={}){
  const q=query.trim().toLowerCase();
  return items.filter(item=>{
    if(q && ![item.sku,item.name,item.category?.name,item.unit].filter(Boolean).some(value=>String(value).toLowerCase().includes(q))) return false;
    if(categoryFilter && item.categoryId!==categoryFilter) return false;
    if(view==='active' && !item.active) return false;
    if(view==='inactive' && item.active) return false;
    if(view==='lowMargin' && Number(item.price||0)-Number(item.cost||0) > Number(item.price||0)*0.15) return false;
    return true;
  });
}

export function countCatalogViews(items){
  return {
    all:items.length,
    active:items.filter(item=>item.active).length,
    inactive:items.filter(item=>!item.active).length,
    lowMargin:items.filter(item=>Number(item.price||0)>0 && Number(item.price||0)-Number(item.cost||0)<=Number(item.price||0)*0.15).length,
  };
}
