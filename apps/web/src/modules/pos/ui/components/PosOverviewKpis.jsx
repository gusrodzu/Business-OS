import {Store,CircleDollarSign,ReceiptText,WalletCards} from 'lucide-react';
import KpiCard from '../../../../components/KpiCard';
import KpiGrid from '../../../../components/KpiGrid';
import KpiInfo from '../../../../components/KpiInfo';

// POS page owns data fetching; this component renders the existing operational KPIs.
export default function PosOverviewKpis({summary,terminalCount,money}){
  return <KpiGrid>
<KpiCard><Store/><span>Cajas abiertas</span><KpiInfo title="Cajas abiertas">Sesiones POS actualmente abiertas.</KpiInfo><strong>{summary.openSessions||0}</strong><small>{terminalCount} terminales</small></KpiCard>
      <KpiCard><CircleDollarSign/><span>Venta de hoy</span><KpiInfo title="Venta de hoy">Tickets pagados desde el inicio del día.</KpiInfo><strong>{money(summary.totalToday)}</strong><small>{summary.tickets||0} tickets</small></KpiCard>
      <KpiCard><ReceiptText/><span>Ticket promedio</span><KpiInfo title="Ticket promedio">Venta total del día entre número de tickets.</KpiInfo><strong>{money(summary.avgTicket)}</strong><small>Promedio operativo</small></KpiCard>
      <KpiCard><WalletCards/><span>Pagos electrónicos</span><KpiInfo title="Pagos electrónicos">Cobros de hoy por tarjeta y otros medios electrónicos.</KpiInfo><strong>{money(summary.cardToday)}</strong><small>Efectivo {money(summary.cashToday)}</small></KpiCard>
      </KpiGrid>;
}
