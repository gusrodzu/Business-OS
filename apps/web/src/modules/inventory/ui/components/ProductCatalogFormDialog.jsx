import {X} from 'lucide-react';
import {Button,Input,Switch} from '../../../../design-system/components';
import styles from '../../../../pages/Catalog.module.css';

export default function ProductCatalogFormDialog({form,categories,saving,onSubmit,onClose,onChange}){
  if(!form)return null;
  return     <div className={styles.overlay} onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
      <form className={styles.modal} onSubmit={onSubmit}>
        <div className={styles.modalHeader}><div><span>{form.id?'Editar registro':'Nuevo registro'}</span><h2>{form.id?'Editar producto':'Crear producto'}</h2></div><button type="button" onClick={()=>onClose()}><X size={20}/></button></div>
        <div className={styles.modalBody}>
          <div className={styles.grid2}>
            <Input label="SKU" value={form.sku} onChange={e=>onChange(v=>({...v,sku:e.target.value.toUpperCase()}))} required/>
            <label className={styles.selectField}><span>Categoría</span><select value={form.categoryId||''} onChange={e=>onChange(v=>({...v,categoryId:e.target.value}))}><option value="">Sin categoría</option>{categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          </div>
          <Input label="Nombre" value={form.name} onChange={e=>onChange(v=>({...v,name:e.target.value}))} required/>
          <Input label="Descripción" value={form.description||''} onChange={e=>onChange(v=>({...v,description:e.target.value}))}/>
          <div className={styles.grid2}><Input label="Unidad" value={form.unit} onChange={e=>onChange(v=>({...v,unit:e.target.value.toUpperCase()}))}/><Input label="Stock mínimo" type="number" min="0" step="0.001" value={form.minStock} onChange={e=>onChange(v=>({...v,minStock:e.target.value}))}/></div>
          <div className={styles.grid2}><Input label="Costo" type="number" min="0" step="0.01" value={form.cost} onChange={e=>onChange(v=>({...v,cost:e.target.value}))}/><Input label="Precio de venta" type="number" min="0" step="0.01" value={form.price} onChange={e=>onChange(v=>({...v,price:e.target.value}))}/></div>
          <div className={styles.statusField}><div><strong>Producto activo</strong><p>Disponible en compras, inventario y movimientos.</p></div><Switch checked={form.active} onChange={active=>onChange(v=>({...v,active}))}/></div>
        </div>
        <div className={styles.modalFooter}><Button type="button" variant="ghost" onClick={()=>onClose()}>Cancelar</Button><Button type="submit" loading={saving}>Guardar producto</Button></div>
      </form>
    </div>;
}
