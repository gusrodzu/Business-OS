import {Edit3, Trash2} from 'lucide-react';
import {Badge, Switch} from '../../../../design-system/components';
import MobileRecordCard from '../../../../components/MobileRecordCard';
import MobileListHeader from '../../../../components/MobileListHeader';
import {NoResultsState} from '../../../../ux-foundation/UXFoundation';
import styles from './ProductCatalogMobileList.module.css';
import {getProductCatalogMargin} from '../utils/productCatalogMargin';

/**
 * Presentational mobile catalog. Data fetching, permissions and mutations stay
 * in Products; this component only renders the supplied records and actions.
 */
export default function ProductCatalogMobileList({
  products,
  selectedIds,
  onSelectChange,
  onOpen,
  onToggle,
  onEdit,
  onRemove,
  formatMoney,
  emptyQuery,
  onClear,
}) {
  return (
    <div className={styles.mobileCatalog} aria-label="Productos del catálogo">
      <MobileListHeader title="Productos" count={products.length}/>
      {products.length ? products.map(item => {
        const {margin, marginPct} = getProductCatalogMargin(item);

        return (
          <MobileRecordCard
            key={item.id}
            title={item.name}
            subtitle={`SKU ${item.sku}`}
            status={<Badge tone={item.active ? 'success' : 'neutral'}>{item.active ? 'Activo' : 'Inactivo'}</Badge>}
            fields={[
              {label: 'Categoría', value: item.category?.name || 'Sin categoría'},
              {label: 'Unidad', value: item.unit},
              {label: 'Costo', value: formatMoney(item.cost)},
              {label: 'Venta', value: formatMoney(item.price)},
              {label: 'Margen', value: `${marginPct}% · ${formatMoney(margin)} / unidad`},
              {label: 'Stock mínimo', value: `${Number(item.minStock)} ${item.unit}`},
            ]}
            onOpen={() => onOpen(item)}
            actions={
              <>
                <label className={styles.mobileSelect}>
                  <input
                    type="checkbox"
                    aria-label={`Seleccionar producto ${item.name}`}
                    checked={selectedIds.includes(item.id)}
                    onChange={event => onSelectChange(item.id, event.target.checked)}
                  />
                  Seleccionar
                </label>
                <label className={styles.mobileStatus}>
                  <span>Activo</span>
                  <Switch size="sm" checked={item.active} onChange={() => onToggle(item)} aria-label={`Cambiar estado de ${item.name}`} />
                </label>
                <button type="button" className={styles.mobileAction} onClick={() => onEdit(item)} aria-label={`Editar producto ${item.name}`}>
                  <Edit3 size={16} aria-hidden="true" /> Editar
                </button>
                <button type="button" className={styles.mobileAction} onClick={() => onRemove(item)} aria-label={`Eliminar producto ${item.name}`}>
                  <Trash2 size={16} aria-hidden="true" /> Eliminar
                </button>
              </>
            }
          />
        );
      }) : <NoResultsState query={emptyQuery} onClear={onClear} />}
    </div>
  );
}
