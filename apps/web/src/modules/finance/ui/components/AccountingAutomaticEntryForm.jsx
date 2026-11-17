import {X} from 'lucide-react';
import {Button} from '../../../../design-system/components';
import styles from '../pages/Accounting.module.css';

export default function AccountingAutomaticEntryForm({
  value,
  onChange,
  onClose,
  onSubmit,
  sourceOptions,
  openPeriods,
  money,
  saving,
}) {
  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={onSubmit}>
        <header>
          <div><span>Automatización</span><h2>Generar póliza</h2></div>
          <button type="button" onClick={onClose}><X /></button>
        </header>
        <div className={styles.modalBody}>
          <label>Tipo de documento
            <select value={value.sourceType} onChange={(e) => onChange({...value, sourceType: e.target.value, sourceId: ''})}>
              <option value="SALES_INVOICE">Factura de venta</option>
              <option value="ACCOUNTS_PAYABLE">Factura de proveedor</option>
              <option value="TREASURY_MOVEMENT">Movimiento de Tesorería</option>
              <option value="SALES_CREDIT_NOTE">Nota de crédito</option>
            </select>
          </label>
          <label>Documento
            <select required value={value.sourceId} onChange={(e) => onChange({...value, sourceId: e.target.value})}>
              <option value="">Selecciona</option>
              {(sourceOptions[value.sourceType] || []).filter((s) => !s.posted).map((s) => (
                <option key={s.id} value={s.id}>{s.invoiceNumber || s.folio} · {money(s.total || s.amount)}</option>
              ))}
            </select>
          </label>
          <label>Periodo
            <select required value={value.periodId} onChange={(e) => onChange({...value, periodId: e.target.value})}>
              <option value="">Selecciona</option>
              {openPeriods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <div className={styles.notice}>La póliza se genera en borrador y debe contabilizarse después de revisarla.</div>
        </div>
        <footer>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>Generar póliza</Button>
        </footer>
      </form>
    </div>
  );
}
