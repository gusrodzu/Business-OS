import {Package} from 'lucide-react';
import PosProductCard from './PosProductCard';
import styles from '../pages/Pos.module.css';
import mobileStyles from './PosProductGrid.module.css';

// Grid owns collection and empty state; each card owns record presentation.
export default function PosProductGrid({products,warehouseId,onAddProduct,money}){
  return <div className={`${styles.productGrid} ${mobileStyles.grid}`}>
    {products.map(product=><PosProductCard key={product.id} product={product} warehouseId={warehouseId} onAddProduct={onAddProduct} money={money}/>)}
    {!products.length?<div className={`${styles.emptyProducts} ${mobileStyles.empty}`}><Package size={30}/><strong>No encontramos productos</strong><span>Prueba con otro SKU, nombre o categoría.</span></div>:null}
  </div>;
}
