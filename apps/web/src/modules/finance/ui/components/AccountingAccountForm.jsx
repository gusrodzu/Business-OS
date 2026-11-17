import {X} from 'lucide-react';
import {Button, Input} from '../../../../design-system/components';
import styles from './AccountingAccountForm.module.css';

/** Controlled catalog form: API calls and modal state belong to Accounting. */
export default function AccountingAccountForm({value, accounts, onChange, onClose, onSubmit, saving}) {
  const change = (field) => (event) => onChange((current) => ({...current, [field]: event.target.value}));

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={onSubmit}>
        <header>
          <div><span>Catálogo</span><h2>Nueva cuenta</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar formulario"><X /></button>
        </header>
        <div className={styles.modalBody}>
          <div className={styles.grid2}>
            <Input label="Código" required value={value.code} onChange={change('code')} />
            <Input label="Nombre" required value={value.name} onChange={change('name')} />
          </div>
          <div className={styles.grid3}>
            <label>Tipo<select value={value.type} onChange={change('type')}>
              <option value="ASSET">Activo</option><option value="LIABILITY">Pasivo</option>
              <option value="EQUITY">Capital</option><option value="REVENUE">Ingreso</option>
              <option value="EXPENSE">Gasto</option>
            </select></label>
            <label>Naturaleza<select value={value.nature} onChange={change('nature')}>
              <option value="DEBIT">Deudora</option><option value="CREDIT">Acreedora</option>
            </select></label>
            <Input label="Nivel" type="number" min="1" max="10" value={value.level} onChange={change('level')} />
          </div>
          <label>Cuenta padre<select value={value.parentId} onChange={change('parentId')}>
            <option value="">Sin cuenta padre</option>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}
          </select></label>
        </div>
        <footer>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>Crear cuenta</Button>
        </footer>
      </form>
    </div>
  );
}
