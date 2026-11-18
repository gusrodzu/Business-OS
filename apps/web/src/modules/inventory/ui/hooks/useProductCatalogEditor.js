import {useState} from 'react';

const emptyForm = {categoryId:'',sku:'',name:'',description:'',unit:'PZA',cost:0,price:0,minStock:0,active:true};

/**
 * Estado de edición y detalle del catálogo. No realiza solicitudes ni
 * modifica operaciones de inventario: solo prepara los datos para la UI.
 */
export function useProductCatalogEditor(categories){
  const [form,setForm] = useState(null);
  const [selected,setSelected] = useState(null);
  const [drawerTab,setDrawerTab] = useState('summary');

  const createProduct = () => setForm({...emptyForm,categoryId:categories[0]?.id??''});
  const editProduct = item => setForm({...item,categoryId:item.categoryId||''});
  const openProduct = item => {
    setSelected(item);
    setDrawerTab('summary');
  };
  const editSelectedProduct = item => {
    editProduct(item);
    setSelected(null);
  };

  return {
    form,setForm,selected,setSelected,drawerTab,setDrawerTab,
    createProduct,editProduct,openProduct,editSelectedProduct
  };
}
