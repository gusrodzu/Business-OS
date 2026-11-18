import {useMemo} from 'react';
import {getPosCategories, getPosCategoryCounts, filterPosProducts} from '../utils/posCatalogSelectors';

/**
 * Derives the catalog presentation from existing POS selectors.
 * Search/filter state and all stock/checkout decisions remain in Pos.
 */
export default function usePosCatalogView({products, productQuery, categoryId, inStockOnly, warehouseId}){
  const categories=useMemo(()=>getPosCategories(products),[products]);
  const categoryCounts=useMemo(()=>getPosCategoryCounts(products),[products]);
  const filteredProducts=useMemo(
    ()=>filterPosProducts(products,{productQuery,categoryId,inStockOnly,warehouseId}),
    [products,productQuery,categoryId,inStockOnly,warehouseId]
  );
  return {categories,categoryCounts,filteredProducts};
}
