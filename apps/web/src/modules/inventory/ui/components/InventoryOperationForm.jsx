import {ArrowLeftRight, PackagePlus, Plus, X} from 'lucide-react';
import {Button, Input} from '../../../../design-system/components';
import styles from './InventoryOperationForm.module.css';

/** Controlled transfer/adjustment editor. Persistence and stock rules remain in the page. */
export default function InventoryOperationForm({form, warehouses, products, saving, onSubmit, onClose, onChange, onAddItem, onUpdateItem, onRemoveItem, balanceFor, productFor, qty}) {
  return (
    <div className={styles.overlay}><form className={styles.modal} onSubmit={onSubmit}>
      <div className={styles.modalHeader}><div><span>{form.type==='transfer'?'Movimiento interno':'Corrección controlada'}</span><h2>{form.type==='transfer'?'Nueva transferencia':'Nuevo ajuste de inventario'}</h2></div><button type="button" onClick={()=>onClose()}><X/></button></div>
      <div className={styles.modalBody}>
        {form.type==='transfer'?<div className={styles.grid2}><label><span>Almacén origen</span><select required value={form.fromWarehouseId} onChange={e=>onChange(v=>({...v,fromWarehouseId:e.target.value}))}><option value="">Selecciona</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.name} · {w.branch?.name}</option>)}</select></label><label><span>Almacén destino</span><select required value={form.toWarehouseId} onChange={e=>onChange(v=>({...v,toWarehouseId:e.target.value}))}><option value="">Selecciona</option>{warehouses.filter(w=>w.id!==form.fromWarehouseId).map(w=><option key={w.id} value={w.id}>{w.name} · {w.branch?.name}</option>)}</select></label></div>:<div className={styles.grid2}><label><span>Almacén</span><select required value={form.warehouseId} onChange={e=>onChange(v=>({...v,warehouseId:e.target.value}))}><option value="">Selecciona</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.name} · {w.branch?.name}</option>)}</select></label><Input label="Motivo" required value={form.reason} onChange={e=>onChange(v=>({...v,reason:e.target.value}))}/></div>}
        <div className={styles.grid2}><Input label="Fecha" type="date" required value={form.occurredAt} onChange={e=>onChange(v=>({...v,occurredAt:e.target.value}))}/><Input label="Notas generales" value={form.notes} onChange={e=>onChange(v=>({...v,notes:e.target.value}))} placeholder="Opcional"/></div>

        <div className={styles.itemsHeader}><div><h3>Partidas</h3><p>Captura productos y cantidades.</p></div><Button type="button" size="small" variant="secondary" icon={Plus} onClick={onAddItem}>Agregar</Button></div>
        <div className={styles.items}>{form.items.map((item,index)=>{const balance=balanceFor(form.type==='transfer'?form.fromWarehouseId:form.warehouseId,item.productId);const product=productFor(item.productId);return <div className={styles.item} key={index}>
          <label className={styles.productSelect}><span>Producto</span><select required value={item.productId} onChange={e=>onUpdateItem(index,'productId',e.target.value)}><option value="">Selecciona</option>{products.map(p=><option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}</select><small>Disponible: {qty(balance?.quantity)} {product?.unit||''}</small></label>
          {form.type==='adjustment'?<label><span>Tipo</span><select value={item.direction} onChange={e=>onUpdateItem(index,'direction',e.target.value)}><option value="IN">Entrada</option><option value="OUT">Salida</option></select></label>:null}
          <Input label="Cantidad" type="number" min="0.001" step="0.001" required value={item.quantity} onChange={e=>onUpdateItem(index,'quantity',e.target.value)}/>
          {form.type==='adjustment'&&item.direction==='IN'?<Input label="Costo unitario" type="number" min="0" step="0.01" value={item.unitCost} onChange={e=>onUpdateItem(index,'unitCost',e.target.value)}/>:null}
          <button type="button" className={styles.remove} disabled={form.items.length===1} onClick={()=>onRemoveItem(index)}><X size={17}/></button>
        </div>})}</div>
      </div>
      <div className={styles.modalFooter}><Button type="button" variant="ghost" onClick={()=>onClose()}>Cancelar</Button><Button type="submit" loading={saving} icon={form.type==='transfer'?ArrowLeftRight:PackagePlus}>{form.type==='transfer'?'Aplicar transferencia':'Aplicar ajuste'}</Button></div>
    </form></div>
  );
}
