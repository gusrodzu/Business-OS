import {Package, Plus} from 'lucide-react';
import {getStock} from '../utils/posCatalogSelectors';
import styles from '../pages/Pos.module.css';
import mobileStyles from './PosProductCard.module.css';

// A single catalog record; the page remains responsible for cart updates.
export default function PosProductCard({product,warehouseId,onAddProduct,money}){
  const stock=getStock(product,warehouseId);
  const price=Number(product.salePrice||product.price||0);
  const stockClass=stock<=0?styles.stockDanger:stock<=Number(product.minStock||0)?styles.stockWarning:styles.stockOk;
  return <article data-ui-surface="card" className={`${styles.productCard} ${mobileStyles.card}`}>
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
}
