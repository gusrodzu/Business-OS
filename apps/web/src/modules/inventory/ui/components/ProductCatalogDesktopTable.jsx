import {Edit3,Trash2} from 'lucide-react';
import {Badge,Switch} from '../../../../design-system/components';
import {NoResultsState,SmartTable} from '../../../../ux-foundation/UXFoundation';
import styles from './ProductCatalogDesktopTable.module.css';

/** Desktop-only catalog table; mutations and selection remain owned by Products. */
export default function ProductCatalogDesktopTable({filtered,selectedIds,onSelectedIdsChange,onOpen,onToggle,onEdit,onRemove,money,query,onClear}) {
  return (
    <div className={styles.desktopCatalog}>
    <SmartTable selectedCount={selectedIds.length} footer={<><span>{filtered.length} productos visibles</span><span>{selectedIds.length?`${selectedIds.length} seleccionados`:'Catálogo maestro · UX v19.1'}</span></>}>
      {filtered.length?<table>
        <thead><tr><th className={styles.uxCheck}><input type="checkbox" aria-label="Seleccionar todos" checked={Boolean(filtered.length)&&filtered.every(item=>selectedIds.includes(item.id))} onChange={e=>onSelectedIdsChange(e.target.checked?filtered.map(item=>item.id):[])}/></th><th>Producto</th><th>Categoría</th><th>Unidad</th><th>Costos</th><th>Margen</th><th>Mínimo</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>{filtered.map(item=>{const margin=Number(item.price||0)-Number(item.cost||0);const marginPct=Number(item.price||0)>0?Math.round((margin/Number(item.price))*100):0;return <tr key={item.id} onClick={()=>{onOpen(item)}} className={styles.uxClickableRow}>
        <td className={styles.uxCheck} onClick={e=>e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={e=>onSelectedIdsChange(ids=>e.target.checked?[...new Set([...ids,item.id])]:ids.filter(id=>id!==item.id))}/></td>
        <td><strong>{item.name}</strong><small>{item.sku}</small></td><td>{item.category?.name||'Sin categoría'}</td><td>{item.unit}</td><td><strong>{money(item.cost)}</strong><small>Venta {money(item.price)}</small></td><td><strong className={marginPct<=15?styles.uxWarningText:styles.uxPositiveText}>{marginPct}%</strong><small>{money(margin)} / unidad</small></td><td>{Number(item.minStock)}</td>
        <td onClick={e=>e.stopPropagation()}><div className={styles.status}><Badge tone={item.active?'success':'neutral'}>{item.active?'Activo':'Inactivo'}</Badge><Switch size="sm" checked={item.active} onChange={()=>onToggle(item)}/></div></td>
        <td onClick={e=>e.stopPropagation()}><div className={styles.actions}><button type="button" data-ui-icon="true" onClick={()=>onEdit(item)} aria-label={`Editar ${item.name}`}><Edit3 size={17}/></button><button type="button" data-ui-icon="true" onClick={()=>onRemove(item)} aria-label={`Eliminar ${item.name}`}><Trash2 size={17}/></button></div></td>
        </tr>})}</tbody>
      </table>:<NoResultsState query={query} onClear={onClear}/>}
    </SmartTable>
    </div>
  );
}
