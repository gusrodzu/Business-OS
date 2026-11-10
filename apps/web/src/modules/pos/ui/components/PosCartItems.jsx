import {Package, ShoppingCart, Trash2} from 'lucide-react';
import styles from '../pages/Pos.module.css';

/** Presentación del ticket: el estado y las reglas de stock permanecen en Pos. */
export default function PosCartItems({cart, money, onChangeQuantity, onRemoveItem}) {
  return (
      <div className={styles.cart}>
        {cart.map(item=><article key={item.productId}>
          <span className={styles.cartVisual}><Package size={20}/></span>
          <div className={styles.cartCopy}><strong>{item.name}</strong><small>SKU: {item.sku}</small><b>{money(item.unitPrice)}</b></div>
          <div className={styles.cartLineTotal}>{money(item.quantity*item.unitPrice-(item.discount||0))}</div>
          <div className={styles.quantityControl}><button type="button" aria-label={`Restar ${item.name}`} onClick={()=>onChangeQuantity(item,-1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={`Sumar ${item.name}`} onClick={()=>onChangeQuantity(item,1)}>+</button></div>
          <button className={styles.removeButton} type="button" aria-label={`Quitar ${item.name}`} onClick={()=>onRemoveItem(item.productId)}><Trash2 size={15}/></button>
        </article>)}
        {!cart.length?<div className={styles.emptyCart}><span className={styles.emptyCartIcon}><ShoppingCart size={30}/></span><strong>Tu ticket está vacío</strong><span>Agrega productos del catálogo para comenzar la venta.</span></div>:null}
      </div>
  );
}
