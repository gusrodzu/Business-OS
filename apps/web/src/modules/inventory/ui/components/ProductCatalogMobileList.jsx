import {Badge} from '../../../../design-system/components';
import MobileRecordCard from '../../../../components/MobileRecordCard';
import MobileListHeader from '../../../../components/MobileListHeader';
import {NoResultsState} from '../../../../ux-foundation/UXFoundation';
import styles from './ProductCatalogMobileList.module.css';
import ProductCatalogMobileActions from './ProductCatalogMobileActions';
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
            actions={<ProductCatalogMobileActions
              product={item}
              selected={selectedIds.includes(item.id)}
              onSelectChange={onSelectChange}
              onToggle={onToggle}
              onEdit={onEdit}
              onRemove={onRemove}
            />}
          />
        );
      }) : <NoResultsState query={emptyQuery} onClear={onClear} />}
    </div>
  );
}
