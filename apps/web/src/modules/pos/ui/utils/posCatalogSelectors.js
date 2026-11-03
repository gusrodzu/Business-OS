export function getStock(product,warehouseId){
  const rows=product.inventoryBalances||[];
  if(warehouseId){
    const row=rows.find(item=>item.warehouseId===warehouseId);
    if(row)return Number(row.quantity||0);
  }
  return rows.reduce((sum,item)=>sum+Number(item.quantity||0),0);
}

export function getPosCategories(products){
  const map=new Map();
  products.forEach(product=>{
    if(product.category?.id)map.set(product.category.id,product.category);
  });
  return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));
}

export function getPosCategoryCounts(products){
  const counts={ALL:products.length};
  products.forEach(product=>{
    if(product.category?.id)counts[product.category.id]=(counts[product.category.id]||0)+1;
  });
  return counts;
}

export function filterPosProducts(products,{productQuery,categoryId,inStockOnly,warehouseId}){
  const q=productQuery.trim().toLowerCase();
  return products.filter(product=>{
    const matchesCategory=categoryId==='ALL'||product.categoryId===categoryId;
    const matchesText=!q||`${product.sku} ${product.name} ${product.category?.name||''}`.toLowerCase().includes(q);
    const matchesStock=!inStockOnly||getStock(product,warehouseId)>0;
    return matchesCategory&&matchesText&&matchesStock;
  }).slice(0,48);
}
