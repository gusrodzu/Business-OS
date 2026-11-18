import styles from './AccountingTrialBalanceTable.module.css';

// Presentation only: balance calculations and data access remain in Accounting.
export default function AccountingTrialBalanceTable({rows, money}) {
  return (
    <table className={styles.table}>
      <thead><tr><th>Código</th><th>Cuenta</th><th>Tipo</th><th>Cargos</th><th>Abonos</th><th>Saldo</th></tr></thead>
      <tbody>
        {rows.length ? rows.map((row) => (
          <tr key={row.accountId}>
            <td><strong>{row.code}</strong></td><td>{row.name}</td><td>{row.type}</td>
            <td>{money(row.debit)}</td><td>{money(row.credit)}</td>
            <td><strong>{money(row.balance)}</strong></td>
          </tr>
        )) : (
          <tr><td colSpan={6} className={styles.empty}>Contabiliza pólizas para generar la balanza.</td></tr>
        )}
      </tbody>
    </table>
  );
}
