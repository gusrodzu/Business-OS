import {Plus, X} from 'lucide-react';
import {Button, Input} from '../../../../design-system/components';
import styles from './AccountingManualEntryForm.module.css';

/** Controlled manual entry editor; all accounting operations stay in the page. */
export default function AccountingManualEntryForm({
  value, onChange, onUpdateLine, openPeriods, postingAccounts,
  debit, credit, money, saving, onClose, onSubmit,
}) {
  return (
    <div className={styles.overlay}>
      <form className={`${styles.modal} ${styles.large}`} onSubmit={onSubmit}>
        <header>
          <div><span>Diario</span><h2>Nueva póliza manual</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar formulario"><X /></button>
        </header>
        <div className={styles.modalBody}>
          <div className={styles.grid2}>
            <label>Periodo
              <select required value={value.periodId} onChange={(e) => onChange((current) => ({...current, periodId: e.target.value}))}>
                <option value="">Selecciona</option>
                {openPeriods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}
              </select>
            </label>
            <Input label="Fecha" type="date" required value={value.entryDate} onChange={(e) => onChange((current) => ({...current, entryDate: e.target.value}))} />
          </div>
          <Input label="Concepto" required value={value.concept} onChange={(e) => onChange((current) => ({...current, concept: e.target.value}))} />
          <div className={styles.lines}>
            {value.lines.map((line, index) => (
              <div className={styles.line} key={index}>
                <label>Cuenta
                  <select required value={line.accountId} onChange={(e) => onUpdateLine(index, 'accountId', e.target.value)}>
                    <option value="">Selecciona</option>
                    {postingAccounts.map((account) => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}
                  </select>
                </label>
                <Input label="Cargo" type="number" min="0" step="0.01" value={line.debit} onChange={(e) => onUpdateLine(index, 'debit', e.target.value)} />
                <Input label="Abono" type="number" min="0" step="0.01" value={line.credit} onChange={(e) => onUpdateLine(index, 'credit', e.target.value)} />
                <button type="button" aria-label={`Eliminar partida ${index + 1}`} onClick={() => onChange((current) => ({...current, lines: current.lines.filter((_, i) => i !== index)}))}><X size={16} /></button>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" icon={Plus} onClick={() => onChange((current) => ({...current, lines: [...current.lines, {accountId: '', concept: '', debit: '', credit: '', reference: ''}]}))}>Agregar partida</Button>
          <div className={styles.totals}>
            <span>Cargos <strong>{money(debit)}</strong></span>
            <span>Abonos <strong>{money(credit)}</strong></span>
            <span>Diferencia <strong>{money(debit - credit)}</strong></span>
          </div>
        </div>
        <footer>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>Guardar póliza</Button>
        </footer>
      </form>
    </div>
  );
}
