import {Edit3, Trash2} from 'lucide-react';
import {Switch} from '../../../../design-system/components';
import styles from './ProductCatalogMobileList.module.css';

/** Product-specific mobile actions. Permissions and mutations remain with the parent page. */
export default function ProductCatalogMobileActions({
  product, selected, onSelectChange, onToggle, onEdit, onRemove,
}) {
  return (
    <>
      <label className={styles.mobileSelect}>
        <input
          type="checkbox"
          aria-label={`Seleccionar producto ${product.name}`}
          checked={selected}
          onChange={event => onSelectChange(product.id, event.target.checked)}
        />
        Seleccionar
      </label>
      <label className={styles.mobileStatus}>
        <span>Activo</span>
        <Switch size="sm" checked={product.active} onChange={() => onToggle(product)} aria-label={`Cambiar estado de ${product.name}`} />
      </label>
      <button type="button" className={styles.mobileAction} onClick={() => onEdit(product)} aria-label={`Editar producto ${product.name}`}>
        <Edit3 size={16} aria-hidden="true" /> Editar
      </button>
      <button type="button" className={styles.mobileAction} onClick={() => onRemove(product)} aria-label={`Eliminar producto ${product.name}`}>
        <Trash2 size={16} aria-hidden="true" /> Eliminar
      </button>
    </>
  );
}
