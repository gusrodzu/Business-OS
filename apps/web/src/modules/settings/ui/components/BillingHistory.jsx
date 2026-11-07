import {RefreshCcw} from 'lucide-react';
import {Card} from '../../../../design-system/components';
import styles from '../pages/Billing.module.css';

/** Display billing history; API operations remain in the page. */
export default function BillingHistory({invoices,changes,formatMoney,formatDate}){
  return <>
    <div className={styles.twoCols}>
      <Card className={styles.panel}>
        <div className={styles.panelHead}><div><span>FACTURAS</span><h3>Historial de cobros</h3></div><RefreshCcw size={18}/></div>
        <div className={styles.list}>{invoices.map(i=><article key={i.id}><div><strong>{i.number}</strong><small>{formatDate(i.createdAt)} · {i.status}</small></div><b>{formatMoney(i.total,i.currency)}</b></article>)}</div>
      </Card>
      <Card className={styles.panel}>
        <div className={styles.panelHead}><div><span>CAMBIOS</span><h3>Historial de plan</h3></div></div>
        <div className={styles.list}>{changes.map(c=><article key={c.id}><div><strong>{c.fromPlan.name} → {c.toPlan.name}</strong><small>{c.type} · {c.status} · {formatDate(c.effectiveAt)}</small></div>{c.chargeAmount!=null?<b>{formatMoney(c.chargeAmount)}</b>:null}</article>)}</div>
      </Card>
    </div>
  </>;
}
