import styles from '../pages/Pos.module.css';

/** Presentational payment balance. All monetary calculations remain in Pos.jsx. */
export default function PosCheckoutSummary({paid, pending, money}) {
  return <div className={styles.checkoutSummary}>
    <div><span>Pagado</span><strong>{money(paid)}</strong></div>
    <div><span>{pending < 0 ? 'Cambio' : 'Pendiente'}</span><strong className={Math.abs(pending) < 0.01 || pending < 0 ? styles.ok : styles.pending}>{money(Math.abs(pending))}</strong></div>
  </div>;
}
