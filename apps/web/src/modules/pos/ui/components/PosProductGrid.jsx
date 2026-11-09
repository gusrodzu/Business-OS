import {Package, Plus} from 'lucide-react';
import {getStock} from '../utils/posCatalogSelectors';
import styles from '../pages/Pos.module.css';
import mobileStyles from './PosProductGrid.module.css';

// Presentational catalog grid. Stock validation and cart updates remain in Pos.
export default function PosProductGrid({products,warehouseId,onAddProduct,money}){
  return <div className={`${styles.productGrid} ${mobileStyles.grid}`}>
    {products.map(product=>{
      const stock=getStock(product,warehouseId);
      const price=Number(product.salePrice||product.price||0);
      const stockClass=stock<=0?styles.stockDanger:stock<=Number(product.minStock||0)?styles.stockWarning:styles.stockOk;
      return <article data-ui-surface="card" key={product.id} className={`${styles.productCard} ${mobileStyles.card}`}>
        <div className={`${styles.productVisual} ${mobileStyles.visual}`}>
          {product.imageUrl?<img src={product.imageUrl} alt=""/>:<Package size={42}/>}
          <em className={`${styles.stockBadge} ${stockClass}`}>Stock {stock.toLocaleString('es-MX',{maximumFractionDigits:0})}</em>
        </div>
        <span className={`${styles.productCategory} ${mobileStyles.category}`}>{product.category?.name||'General'}</span>
        <strong>{product.name}</strong>
        <small>SKU: {product.sku}</small>
        <b>{money(price)}</b>
        <button className={`${styles.addProductButton} ${mobileStyles.addButton}`} type="button" disabled={stock<=0&&Boolean(warehouseId)} onClick={()=>onAddProduct(product)} aria-label={`Agregar ${product.name} al ticket`}><Plus size={17}/>{stock<=0&&warehouseId?'Sin stock':'Agregar'}</button>
      </article>;
    })}
    {!products.length?<div className={`${styles.emptyProducts} ${mobileStyles.empty}`}><Package size={30}/><strong>No encontramos productos</strong><span>Prueba con otro SKU, nombre o categoría.</span></div>:null}
  </div>;
}
