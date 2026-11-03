import {Badge} from '../../../../design-system/components';
import styles from './AccountingEntriesTable.module.css';

/** Read-only ledger rows; posting remains owned by the accounting page. */
export default function AccountingEntriesTable({entries, money, date, onPostEntry}) {
  const visibleEntries = entries;
  const postEntry = onPostEntry;
  return (
    <table><thead><tr><th>Folio</th><th>Fecha</th><th>Concepto</th><th>Origen</th><th>Cargos</th><th>Abonos</th><th>Estado</th><th></th></tr></thead>
              <tbody>{visibleEntries.length ? visibleEntries.map((entry) => {
                const totals = entry.lines.reduce((r, l) => ({debit: r.debit + Number(l.debit), credit: r.credit + Number(l.credit)}), {debit: 0, credit: 0});
                return <tr key={entry.id}><td><strong>{entry.folio}</strong></td><td>{date(entry.entryDate)}</td><td>{entry.concept}</td><td>{entry.sourceFolio || 'Manual'}</td><td>{money(totals.debit)}</td><td>{money(totals.credit)}</td><td><Badge tone={entry.status === 'POSTED' ? 'success' : 'warning'}>{entry.status}</Badge></td><td>{entry.status === 'DRAFT' ? <button className={styles.postAction} onClick={() => postEntry(entry)}>Contabilizar</button> : null}</td></tr>;
              }) : <tr><td colSpan="8" className={styles.empty}>No hay pólizas.</td></tr>}</tbody></table>
  );
}
