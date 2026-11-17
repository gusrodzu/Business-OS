import {Boxes,ChevronDown,Filter,Grid2X2,Package,Search,X} from 'lucide-react';
import styles from '../pages/Pos.module.css';

/** Presentational catalog controls. POS owns filtering, stock rules and cart actions. */
export default function PosCatalogControls({productQuery,onProductQueryChange,categoryId,onCategoryChange,inStockOnly,onStockOnlyChange,categories,categoryCounts,filteredProducts,onAddProduct}){
  return <>
          <div className={styles.catalogToolbar} data-ui-pos-toolbar="true">
            <label className={styles.search}>
              <Search size={19}/>
              <input aria-label="Buscar productos" value={productQuery} onChange={e=>onProductQueryChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&filteredProducts.length===1){e.preventDefault();onAddProduct(filteredProducts[0])}}} placeholder="Buscar por nombre, SKU o código de barras…"/>
              {productQuery?<button className={styles.clearSearch} type="button" aria-label="Limpiar búsqueda" onClick={()=>onProductQueryChange('')}><X size={15}/></button>:null}
            </label>
            <label className={styles.categorySelect}>
              <Boxes size={16} aria-hidden="true"/>
              <select aria-label="Filtrar productos por categoría" value={categoryId} onChange={e=>onCategoryChange(e.target.value)}>
                <option value="ALL">Todas las categorías</option>
                {categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <ChevronDown size={15} aria-hidden="true"/>
            </label>
            <button className={styles.filterButton} type="button" aria-pressed={inStockOnly} onClick={()=>onStockOnlyChange(!inStockOnly)}><Filter size={16} aria-hidden="true"/><span>Solo con stock</span></button>
          </div>

          <div className={styles.categoryRail} aria-label="Categorías de productos">
            <button data-ui-surface="card" className={categoryId==='ALL'?styles.categoryActive:styles.categoryCard} onClick={()=>onCategoryChange('ALL')}>
              <span className={styles.categoryIcon}><Grid2X2 size={19}/></span><strong>Todos</strong><small>{categoryCounts.ALL||0}</small>
            </button>
            {categories.slice(0,7).map(category=><button data-ui-surface="card" key={category.id} className={categoryId===category.id?styles.categoryActive:styles.categoryCard} onClick={()=>onCategoryChange(category.id)}>
              <span className={styles.categoryIcon}><Package size={19}/></span><strong>{category.name}</strong><small>{categoryCounts[category.id]||0}</small>
            </button>)}
          </div>


  </>;
}
