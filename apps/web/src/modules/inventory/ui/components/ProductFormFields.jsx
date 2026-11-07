import {Input,Switch} from '../../../../design-system/components';
import styles from './ProductFormDialog.module.css';

// Presentation only: the parent owns form state, validation and persistence.
export default function ProductFormFields({form,setForm,categories}){
  return <div className={styles.modalBody}>
    <div className={styles.grid2}>
      <Input label="SKU" value={form.sku} onChange={e=>setForm(v=>({...v,sku:e.target.value.toUpperCase()}))} required/>
      <label className={styles.selectField}><span>Categoría</span><select value={form.categoryId||''} onChange={e=>setForm(v=>({...v,categoryId:e.target.value}))}><option value="">Sin categoría</option>{categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    </div>
    <Input label="Nombre" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} required/>
    <Input label="Descripción" value={form.description||''} onChange={e=>setForm(v=>({...v,description:e.target.value}))}/>
    <div className={styles.grid2}><Input label="Unidad" value={form.unit} onChange={e=>setForm(v=>({...v,unit:e.target.value.toUpperCase()}))}/><Input label="Stock mínimo" type="number" min="0" step="0.001" value={form.minStock} onChange={e=>setForm(v=>({...v,minStock:e.target.value}))}/></div>
    <div className={styles.grid2}><Input label="Costo" type="number" min="0" step="0.01" value={form.cost} onChange={e=>setForm(v=>({...v,cost:e.target.value}))}/><Input label="Precio de venta" type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm(v=>({...v,price:e.target.value}))}/></div>
    <div className={styles.statusField}><div><strong>Producto activo</strong><p>Disponible en compras, inventario y movimientos.</p></div><Switch checked={form.active} onChange={active=>setForm(v=>({...v,active}))}/></div>
  </div>;
}
