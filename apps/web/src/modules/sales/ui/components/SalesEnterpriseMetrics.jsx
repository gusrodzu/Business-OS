import {BadgeDollarSign, CircleDollarSign, FileText, ShoppingBag, Users} from 'lucide-react';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import {formatSalesMoney as money} from '../utils/salesDisplayFormatters';
import styles from './SalesEnterpriseMetrics.module.css';

// Keep metric definitions local: only this overview consumes them.
// Data loading and commercial actions remain in SalesEnterprise.
export default function SalesEnterpriseMetrics({summary = {}}) {
  const metrics = [
    {
      key: 'monthSales',
      Icon: BadgeDollarSign,
      label: 'Ventas del mes',
      infoTitle: 'Ventas mensuales',
      info: 'Importe de pedidos confirmados o entregados durante el mes actual.',
      value: money(summary.monthSales),
      detail: 'Pedidos confirmados y entregados',
    },
    {
      key: 'openQuotes',
      Icon: FileText,
      label: 'Cotizaciones abiertas',
      infoTitle: 'Propuestas abiertas',
      info: 'Cotizaciones en borrador o enviadas pendientes de resolución.',
      value: summary.openQuotes || 0,
      detail: `${summary.conversionRate || 0}% de conversión`,
    },
    {
      key: 'activeOrders',
      Icon: ShoppingBag,
      label: 'Pedidos activos',
      infoTitle: 'Pedidos en operación',
      info: 'Pedidos confirmados o parcialmente entregados.',
      value: summary.activeOrders || 0,
      detail: 'Pendientes de cierre',
    },
    {
      key: 'openReceivables',
      Icon: CircleDollarSign,
      label: 'Cobranza pendiente',
      infoTitle: 'Saldo por cobrar',
      info: 'Saldo abierto de las cuentas por cobrar comerciales.',
      value: money(summary.openReceivables),
      detail: 'Cuentas por cobrar abiertas',
    },
    {
      key: 'prospects',
      Icon: Users,
      label: 'Prospectos activos',
      infoTitle: 'Oportunidades abiertas',
      info: 'Prospectos que todavía no están marcados como ganados o perdidos.',
      value: summary.prospects || 0,
      detail: `${summary.customers || 0} clientes activos`,
    },
  ];

  return (
    <section className={styles.metrics}>
      {metrics.map(({key, Icon, label, infoTitle, info, value, detail}) => (
        <KpiCard key={key}>
          <Icon />
          <span>{label}</span>
          <KpiInfo title={infoTitle}>{info}</KpiInfo>
          <strong>{value}</strong>
          <small>{detail}</small>
        </KpiCard>
      ))}
    </section>
  );
}
