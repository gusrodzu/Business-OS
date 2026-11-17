import {formatProductMoney} from '../utils/formatProductMoney';
import {getProductCatalogMetrics} from '../utils/productCatalogMetrics';
import {DollarSign,Package} from 'lucide-react';
import KpiGrid from '../../../../components/KpiGrid';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import styles from './ProductCatalogMetrics.module.css';



/** Presentational catalog summary; inventory valuation is intentionally not calculated here. */
export default function ProductCatalogMetrics({products}){
  const {active,catalogCost}=getProductCatalogMetrics(products);

  return <KpiGrid>
    <KpiCard><Package/><span>Productos registrados</span><KpiInfo title="Productos registrados">Total de productos del catálogo.</KpiInfo><strong className={styles.value}>{products.length}</strong><small>maestro de producto</small></KpiCard>
    <KpiCard><Package/><span>Productos activos</span><KpiInfo title="Productos activos">Disponibles para compras, ventas e inventario.</KpiInfo><strong className={styles.value}>{active}</strong><small>{products.length-active} inactivo(s)</small></KpiCard>
    <KpiCard><DollarSign/><span>Costo catálogo</span><KpiInfo title="Costo catálogo">Suma del costo configurado; no representa valorización de existencias.</KpiInfo><strong className={styles.value}>{formatProductMoney(catalogCost)}</strong><small>referencia del maestro</small></KpiCard>
  </KpiGrid>;
}
