import {Badge} from '../../../../design-system/components';
import styles from './AccountingAccountsTable.module.css';

export default function AccountingAccountsTable({accounts}) {
  return (
    <table className={styles.table}>
      <thead><tr><th>Código</th><th>Cuenta</th><th>Tipo</th><th>Naturaleza</th><th>Nivel</th><th>Movimiento</th><th>Estado</th></tr></thead>
      <tbody>{accounts.map((account) => (
        <tr key={account.id}>
          <td><strong>{account.code}</strong></td>
          <td>{account.name}<small>{account.parent ? `${account.parent.code} · ${account.parent.name}` : ''}</small></td>
          <td>{account.type}</td>
          <td>{account.nature}</td>
          <td>{account.level}</td>
          <td>{account.allowsPosting ? 'Sí' : 'No'}</td>
          <td><Badge tone={account.active ? 'success' : 'neutral'}>{account.active ? 'Activa' : 'Inactiva'}</Badge></td>
        </tr>
      ))}</tbody>
    </table>
  );
}
