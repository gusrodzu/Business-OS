import styles from '../pages/Pos.module.css';

/**
 * Presentational ticket totals. Calculations and discount state stay in Pos.
 */
export default function PosTicketTotals({subtotal, discount, tax, total, money, onDiscountChange}) {
  return (
    <div className={styles.ticketTotals}>
      <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
      <div>
        <span>Descuento</span>
        <label className={styles.discountInput}>
          <span>$</span>
          <input
            aria-label="Descuento general"
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={event => onDiscountChange(Number(event.target.value || 0))}
          />
        </label>
        <strong>{money(discount)}</strong>
      </div>
      <div><span>Impuestos (IVA 16%)</span><strong>{money(tax)}</strong></div>
      <div className={styles.totalRow}><span>Total</span><strong>{money(total)}</strong></div>
    </div>
  );
}
