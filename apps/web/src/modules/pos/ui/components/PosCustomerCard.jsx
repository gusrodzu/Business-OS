import {UserRound} from 'lucide-react';
import legacy from '../pages/Pos.module.css';
import styles from './PosCustomerCard.module.css';

/** Selector presentacional: la selección y los datos pertenecen a Pos. */
export default function PosCustomerCard({customer, customers, customerId, onCustomerChange}) {
  return (
    <div className={`${legacy.customerCard} ${styles.card}`}>
      <span className={legacy.customerIcon}><UserRound size={18}/></span>
      <div className={styles.identity}>
        <small>Cliente</small>
        <strong>{customer?.commercialName||customer?.legalName||'Público general'}</strong>
        <span>{customer?customer.code:'Sin cliente seleccionado'}</span>
      </div>
      <select aria-label="Seleccionar cliente" value={customerId} onChange={e=>onCustomerChange(e.target.value)}>
        <option value="">Cambiar</option>
        {customers.map(item=><option key={item.id} value={item.id}>{item.code} · {item.commercialName||item.legalName}</option>)}
      </select>
    </div>
  );
}
