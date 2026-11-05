import {Badge} from '../../../../design-system/components';
import styles from './ProductDetailPanel.module.css';

/**
 * Read-only product details. Keep all business mutations and drawer state in Products.
 * Field definitions are local to this feature, not a generic form abstraction.
 */
export default function ProductDetailPanel({product, activeTab, formatMoney}){
  if(!product)return null;

  const fields={
    summary:[
      ['Estado', <Badge tone={product.active?'success':'neutral'}>{product.active?'Activo':'Inactivo'}</Badge>],
      ['Categoría', product.category?.name||'Sin categoría'],
      ['Unidad', product.unit],
      ['Descripción', product.description||'Sin descripción']
    ],
    commercial:[
      ['Costo', formatMoney(product.cost)],
      ['Precio de venta', formatMoney(product.price)],
      ['Margen unitario', formatMoney(Number(product.price)-Number(product.cost))],
      ['Margen porcentual', Number(product.price)>0?`${Math.round(((Number(product.price)-Number(product.cost))/Number(product.price))*100)}%`:'0%']
    ],
    inventory:[
      ['Stock mínimo', `${Number(product.minStock)} ${product.unit}`],
      ['SKU', product.sku],
      ['Uso', 'Compras · Ventas · Inventario'],
      ['Control', 'Disponible para trazabilidad por almacén']
    ]
  };

  const visibleFields=fields[activeTab];
  if(!visibleFields)return null;

  return <div className={styles.detailGrid}>
    {visibleFields.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}
  </div>;
}
