import {Badge} from '../../../../design-system/components';
import styles from './ProductDetailPanel.module.css';

/** Presentational product detail tabs; data and drawer state stay in Products. */
export default function ProductDetailPanel({product, activeTab, formatMoney}){
  if(!product)return null;
  const selected=product;
  const money=formatMoney;
  return <>
      {selected&&activeTab==='summary'?<div className={styles.detailGrid}><div><span>Estado</span><strong><Badge tone={selected.active?'success':'neutral'}>{selected.active?'Activo':'Inactivo'}</Badge></strong></div><div><span>Categoría</span><strong>{selected.category?.name||'Sin categoría'}</strong></div><div><span>Unidad</span><strong>{selected.unit}</strong></div><div><span>Descripción</span><strong>{selected.description||'Sin descripción'}</strong></div></div>:null}
      {selected&&activeTab==='commercial'?<div className={styles.detailGrid}><div><span>Costo</span><strong>{money(selected.cost)}</strong></div><div><span>Precio de venta</span><strong>{money(selected.price)}</strong></div><div><span>Margen unitario</span><strong>{money(Number(selected.price)-Number(selected.cost))}</strong></div><div><span>Margen porcentual</span><strong>{Number(selected.price)>0?`${Math.round(((Number(selected.price)-Number(selected.cost))/Number(selected.price))*100)}%`:'0%'}</strong></div></div>:null}
      {selected&&activeTab==='inventory'?<div className={styles.detailGrid}><div><span>Stock mínimo</span><strong>{Number(selected.minStock)} {selected.unit}</strong></div><div><span>SKU</span><strong>{selected.sku}</strong></div><div><span>Uso</span><strong>Compras · Ventas · Inventario</strong></div><div><span>Control</span><strong>Disponible para trazabilidad por almacén</strong></div></div>:null}
  </>;
}
