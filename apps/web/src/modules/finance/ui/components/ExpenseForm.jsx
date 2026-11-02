import {Button,Card,Input} from '../../../../../design-system/components';
import styles from './ExpenseForm.module.css';

// Presentational only: the page owns form state, validation and the API mutation.
export default function ExpenseForm({form,setForm,categories,onSubmit,onCancel}){
  return <Card className={styles.formCard}><form onSubmit={onSubmit} className={styles.form}>
      <label>Categoría<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{categories.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <Input label="Concepto" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
      <Input label="Comercio / proveedor" value={form.merchant} onChange={e=>setForm({...form,merchant:e.target.value})}/>
      <Input label="Fecha" type="date" value={form.expenseDate} onChange={e=>setForm({...form,expenseDate:e.target.value})}/>
      <Input label="Importe" type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/>
      <Input label="IVA" type="number" step="0.01" value={form.taxAmount} onChange={e=>setForm({...form,taxAmount:e.target.value})}/>
      <label>Método<select value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})}><option value="PERSONAL_CARD">Tarjeta personal</option><option value="CORPORATE_CARD">Tarjeta corporativa</option><option value="CASH">Efectivo</option><option value="TRANSFER">Transferencia</option><option value="OTHER">Otro</option></select></label>
      <Input label="Folio comprobante" value={form.receiptNumber} onChange={e=>setForm({...form,receiptNumber:e.target.value})}/>
      <div className={styles.formActions}><Button type="button" variant="secondary" onClick={()=>onCancel()}>Cancelar</Button><Button type="submit">Guardar gasto</Button></div>

    </form></Card>;
}
