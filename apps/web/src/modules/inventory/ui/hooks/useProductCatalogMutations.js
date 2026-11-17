import {useState} from 'react';
import {inventoryRequest as apiRequest} from '../../services/inventoryApi';

/**
 * Mutaciones del catálogo. Mantiene los endpoints y las actualizaciones optimistas
 * existentes; la página sigue siendo dueña del formulario, selección y drawer.
 */
export function useProductCatalogMutations({
  form,setForm,items,setItems,selected,setSelected,
  selectedIds,setSelectedIds,setMessage,loadData
}){
  const [saving,setSaving]=useState(false);

  async function save(event){
    event.preventDefault();
    setSaving(true);
    try{
      const editing=Boolean(form.id);
      await apiRequest(editing?`/products/${form.id}`:'/products',{
        method:editing?'PUT':'POST',
        body:{...form,cost:Number(form.cost),price:Number(form.price),minStock:Number(form.minStock)}
      });
      setForm(null);
      await loadData();
      setMessage({type:'success',text:editing?'Producto actualizado.':'Producto creado.'});
    }catch(error){
      setMessage({type:'error',text:error.message});
    }finally{
      setSaving(false);
    }
  }

  async function toggle(item){
    try{
      await apiRequest(`/products/${item.id}/status`,{method:'PATCH',body:{active:!item.active}});
      setItems(current=>current.map(row=>row.id===item.id?{...row,active:!row.active}:row));
      if(selected?.id===item.id)setSelected(v=>({...v,active:!v.active}));
    }catch(error){
      setMessage({type:'error',text:error.message});
    }
  }

  async function remove(item){
    if(!window.confirm(`¿Eliminar el producto ${item.name}?`))return;
    try{
      await apiRequest(`/products/${item.id}`,{method:'DELETE'});
      setItems(current=>current.filter(row=>row.id!==item.id));
      setSelectedIds(current=>current.filter(id=>id!==item.id));
      if(selected?.id===item.id)setSelected(null);
    }catch(error){
      setMessage({type:'error',text:error.message});
    }
  }

  async function bulkStatus(active){
    const rows=items.filter(item=>selectedIds.includes(item.id) && item.active!==active);
    if(!rows.length){setSelectedIds([]);return;}
    try{
      await Promise.all(rows.map(item=>apiRequest(`/products/${item.id}/status`,{method:'PATCH',body:{active}})));
      setItems(current=>current.map(item=>selectedIds.includes(item.id)?{...item,active}:item));
      setSelectedIds([]);
      setMessage({type:'success',text:`${rows.length} producto${rows.length===1?'':'s'} actualizado${rows.length===1?'':'s'}.`});
    }catch(error){setMessage({type:'error',text:error.message});}
  }


  return {saving,save,toggle,remove,bulkStatus};
}
