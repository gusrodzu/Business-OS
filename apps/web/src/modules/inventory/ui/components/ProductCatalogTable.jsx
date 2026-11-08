import {Edit3,Trash2} from 'lucide-react';
import {Badge,Switch} from '../../../../design-system/components';
import {DataTableFrame} from '../../../../components/module-system';
import styles from '../../../../pages/Catalog.module.css';

const money=value=>Number(value||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});

export default function ProductCatalogTable({products,onSelect,onEdit,onToggle,onRemove}){
  return <DataTableFrame empty={!products.length?'No se encontraron productos.':null}>
    <table>
      <thead><tr><th>Producto</th><th>Categoría</th><th>Unidad</th><th>Costos</th><th>Mínimo</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        {products.map(item=><tr key={item.id} onClick={()=>onSelect(item)} style={{cursor:'pointer'}}>
          <td><strong>{item.name}</strong><small>{item.sku}</small></td>
          <td>{item.category?.name||'Sin categoría'}</td>
          <td>{item.unit}</td>
          <td><strong>{money(item.cost)}</strong><small>Venta {money(item.price)}</small></td>
          <td>{Number(item.minStock)}</td>
          <td><div className={styles.status} onClick={event=>event.stopPropagation()}><Badge tone={item.active?'success':'neutral'}>{item.active?'Activo':'Inactivo'}</Badge><Switch size="sm" checked={item.active} onChange={()=>onToggle(item)}/></div></td>
          <td><div className={styles.actions} onClick={event=>event.stopPropagation()}><button type="button" data-ui-icon="true" onClick={()=>onEdit(item)} aria-label={`Editar ${item.name}`}><Edit3 size={17}/></button><button type="button" data-ui-icon="true" onClick={()=>onRemove(item)} aria-label={`Eliminar ${item.name}`}><Trash2 size={17}/></button></div></td>
        </tr>)}
      </tbody>
    </table>
  </DataTableFrame>;
}
