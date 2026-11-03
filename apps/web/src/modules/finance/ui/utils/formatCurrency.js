/** Consistent display formatting for finance views; does not alter monetary calculations. */
export function formatFinanceCurrency(value, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
