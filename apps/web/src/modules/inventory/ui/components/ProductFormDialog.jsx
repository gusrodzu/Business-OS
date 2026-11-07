import {X} from 'lucide-react';
import {Button} from '../../../../design-system/components';
import ProductFormFields from './ProductFormFields';
import styles from './ProductFormDialog.module.css';

// The page owns validation, persistence and product state; this component renders the form only.
export default function ProductFormDialog({form,setForm,categories,saving,onSubmit,onClose}){
  if(!form)return null;
  return <div className={styles.overlay} onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
      <form className={styles.modal} onSubmit={onSubmit}>
        <div className={styles.modalHeader}><div><span>{form.id?'Editar registro':'Nuevo registro'}</span><h2>{form.id?'Editar producto':'Crear producto'}</h2></div><button type="button" onClick={()=>onClose()}><X size={20}/></button></div>
        <ProductFormFields form={form} setForm={setForm} categories={categories}/>
        <div className={styles.modalFooter}><Button type="button" variant="ghost" onClick={()=>onClose()}>Cancelar</Button><Button type="submit" loading={saving}>Guardar producto</Button></div>
      </form>
    </div>;
}
