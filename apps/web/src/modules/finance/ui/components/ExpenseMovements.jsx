import {Banknote, RefreshCw} from 'lucide-react';
import {Badge, Button, Card} from '../../../../design-system/components';
import styles from './ExpenseMovements.module.css';

const formatDate = (value) => value ? new Intl.DateTimeFormat('es-MX', {dateStyle: 'medium'}).format(new Date(value)) : '—';

// Presentation only. Mutations and tenant-scoped data loading stay in Expenses.
export default function ExpenseMovements({expenses, onRefresh, onAction, formatMoney}) {
  return (
    <Card className={styles.tableCard}>
      <div className={styles.tableHeader}><div><h2>Movimientos</h2><p>Gastos, comprobaciones y viáticos registrados.</p></div><Button variant="secondary" onClick={onRefresh}><RefreshCw size={16}/> Actualizar</Button></div>
      <div className={styles.list}>
      {expenses.length===0?<div className={styles.empty}>Aún no hay gastos registrados.</div>:expenses.map(x=><article key={x.id}>
        <div><span>{x.folio} · {x.category?.name}</span><h3>{x.title}</h3><p>{x.merchant||'Sin comercio'} · {formatDate(x.expenseDate)}</p></div>
        <div className={styles.amount}><strong>{formatMoney(x.amount,x.currency)}</strong><Badge tone={x.status==='PAID'||x.status==='APPROVED'?'success':x.status==='REJECTED'?'danger':x.status==='SUBMITTED'?'warning':'neutral'}>{x.status}</Badge></div>
        <div className={styles.actions}>
          {x.status==='DRAFT'?<Button onClick={()=>onAction(x.id,'submit')}>Enviar a aprobación</Button>:null}
          {x.status==='SUBMITTED'?<Button variant="secondary" onClick={()=>onAction(x.id,'sync-approval')}>Sincronizar aprobación</Button>:null}
          {x.status==='APPROVED'?<Button onClick={()=>onAction(x.id,'pay')}><Banknote size={16}/> Marcar pagado</Button>:null}
        </div>
      </article>)}
      </div>
    </Card>
  );
}
