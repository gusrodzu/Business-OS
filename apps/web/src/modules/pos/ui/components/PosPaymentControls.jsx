import {Banknote, CreditCard, WalletCards, CircleDollarSign, MoreHorizontal, Plus, X} from 'lucide-react';
import styles from '../pages/Pos.module.css';

const methodLabel = {CASH:'Efectivo',CARD:'Tarjeta',TRANSFER:'Transferencia',WALLET:'Wallet',CREDIT:'Crédito',OTHER:'Otro'};
const methodIcon = {CASH:Banknote,CARD:CreditCard,TRANSFER:WalletCards,WALLET:WalletCards,CREDIT:CreditCard,OTHER:CircleDollarSign};

/** Presentational payment controls. The parent owns amounts, validation and checkout. */
export default function PosPaymentControls({payments, onQuickPayment, onChangePayment, onRemovePayment, onAddPayment}){
  return <div className={styles.paymentSection}>
    <div className={styles.paymentTitle}><strong>Cobro rápido</strong><span>Selecciona el método y completamos el monto</span></div>
    <div className={styles.paymentMethods}>
      {['CASH','CARD','TRANSFER'].map(method=>{const Icon=methodIcon[method];const active=payments[0]?.method===method;return <button key={method} className={active?styles.paymentMethodActive:styles.paymentMethod} type="button" onClick={()=>onQuickPayment(method)}><Icon size={18}/><span>{methodLabel[method]}</span></button>})}
      <button className={styles.paymentMethod} type="button" onClick={()=>onQuickPayment('OTHER')}><MoreHorizontal size={18}/><span>Otro</span></button>
    </div>
    <details className={styles.advancedPayments}>
      <summary>Dividir pago o agregar referencia</summary>
      <div className={styles.paymentRows}>{payments.map((payment,index)=><div key={index}>
        <select value={payment.method} onChange={e=>onChangePayment(index,'method',e.target.value)}>{Object.entries(methodLabel).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>
        <input type="number" min="0.01" step="0.01" value={payment.amount} onChange={e=>onChangePayment(index,'amount',e.target.value)} placeholder="Monto recibido"/>
        <input value={payment.reference} onChange={e=>onChangePayment(index,'reference',e.target.value)} placeholder="Referencia"/>
        {payments.length>1?<button type="button" onClick={()=>onRemovePayment(index)}><X size={14}/></button>:<button type="button" onClick={()=>onAddPayment('CARD')} title="Agregar forma de pago"><Plus size={14}/></button>}
      </div>)}</div>
    </details>
  </div>;
}
