import {Badge} from '../../../../design-system/components';
import styles from '../../../../pages/Catalog.module.css';

const money=v=>Number(v||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});

/** Presentational product details; parent owns selection, tabs and edit actions. */
export default function ProductCatalogDetailContent({selected,drawerTab}){
  if(!selected)return null;
  return <>
      {selected&&drawerTab==='summary'?<div className={styles.detailGrid}>
        <div><span>Estado</span><strong><Badge tone={selected.active?'success':'neutral'}>{selected.active?'Activo':'Inactivo'}</Badge></strong></div>
        <div><span>Categoría</span><strong>{selected.category?.name||'Sin categoría'}</strong></div>
        <div><span>Unidad</span><strong>{selected.unit}</strong></div>
        <div><span>Descripción</span><strong>{selected.description||'Sin descripción'}</strong></div>
      </div>:null}
      {selected&&drawerTab==='commercial'?<div className={styles.detailGrid}>
        <div><span>Costo</span><strong>{money(selected.cost)}</strong></div>
        <div><span>Precio de venta</span><strong>{money(selected.price)}</strong></div>
        <div><span>Margen unitario</span><strong>{money(Number(selected.price)-Number(selected.cost))}</strong></div>
      </div>:null}
      {selected&&drawerTab==='inventory'?<div className={styles.detailGrid}>
        <div><span>Stock mínimo</span><strong>{Number(selected.minStock)} {selected.unit}</strong></div>
        <div><span>SKU</span><strong>{selected.sku}</strong></div>
        <div><span>Uso</span><strong>Compras · Ventas · Inventario</strong></div>
      </div>:null}
  </>;
}
