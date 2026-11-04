import {BadgeDollarSign, CircleDollarSign, FileText, ShoppingBag, Users} from 'lucide-react';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import {formatSalesMoney as money} from '../utils/salesDisplayFormatters';
import styles from './SalesEnterpriseMetrics.module.css';

// Presentational summary only. All data loading and commercial actions remain in SalesEnterprise.
export default function SalesEnterpriseMetrics({summary = {}}) {
  const data = {summary};
  return (
          <section className={styles.metrics}>
            <KpiCard>
              <BadgeDollarSign />
              <span>Ventas del mes</span><KpiInfo title="Ventas mensuales">Importe de pedidos confirmados o entregados durante el mes actual.</KpiInfo>
              <strong>{money(data.summary.monthSales)}</strong>
              <small>Pedidos confirmados y entregados</small>
            </KpiCard>
            <KpiCard>
              <FileText />
              <span>Cotizaciones abiertas</span><KpiInfo title="Propuestas abiertas">Cotizaciones en borrador o enviadas pendientes de resolución.</KpiInfo>
              <strong>{data.summary.openQuotes || 0}</strong>
              <small>{data.summary.conversionRate || 0}% de conversión</small>
            </KpiCard>
            <KpiCard>
              <ShoppingBag />
              <span>Pedidos activos</span><KpiInfo title="Pedidos en operaci\u00f3n">Pedidos confirmados o parcialmente entregados.</KpiInfo>
              <strong>{data.summary.activeOrders || 0}</strong>
              <small>Pendientes de cierre</small>
            </KpiCard>
            <KpiCard>
              <CircleDollarSign />
              <span>Cobranza pendiente</span><KpiInfo title="Saldo por cobrar">Saldo abierto de las cuentas por cobrar comerciales.</KpiInfo>
              <strong>{money(data.summary.openReceivables)}</strong>
              <small>Cuentas por cobrar abiertas</small>
            </KpiCard>
            <KpiCard>
              <Users />
              <span>Prospectos activos</span><KpiInfo title="Oportunidades abiertas">Prospectos que todavía no están marcados como ganados o perdidos.</KpiInfo>
              <strong>{data.summary.prospects || 0}</strong>
              <small>{data.summary.customers || 0} clientes activos</small>
            </KpiCard>
          </section>
  );
}
