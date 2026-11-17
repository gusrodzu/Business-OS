import {Store} from 'lucide-react';
import styles from './PosShiftSummary.module.css';

/**
 * Read-only snapshot of the active register. The POS page owns all session
 * selection, API data and transaction state.
 */
export default function PosShiftSummary({sessionTitle,summary,money}){
  return <section className={styles.shiftBar}>
    <div><span className={styles.shiftIcon}><Store size={17}/></span><span><small>Caja activa</small><strong>{sessionTitle}</strong></span></div>
    <div><small>Venta de hoy</small><strong>{money(summary.totalToday)}</strong></div>
    <div><small>Tickets</small><strong>{summary.tickets||0}</strong></div>
    <div><small>Ticket promedio</small><strong>{money(summary.avgTicket)}</strong></div>
    <div><small>Efectivo</small><strong>{money(summary.cashToday)}</strong></div>
  </section>;
}
