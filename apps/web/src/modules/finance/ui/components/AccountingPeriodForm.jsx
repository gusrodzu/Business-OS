import {X} from 'lucide-react';
import {Button, Input} from '../../../../design-system/components';
import styles from './AccountingPeriodForm.module.css';

/** Controlled period form. Persistence, validation response and modal state remain in Accounting. */
export default function AccountingPeriodForm({value, onChange, onClose, onSubmit, saving}) {
  const change = (field) => (event) => onChange((current) => ({...current, [field]: event.target.value}));

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={onSubmit}>
        <header>
          <div><span>Contabilidad</span><h2>Nuevo periodo</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar formulario"><X /></button>
        </header>
        <div className={styles.modalBody}>
          <Input label="Nombre" required value={value.name} onChange={change('name')} />
          <div className={styles.grid2}>
            <Input label="Inicio" type="date" required value={value.startDate} onChange={change('startDate')} />
            <Input label="Fin" type="date" required value={value.endDate} onChange={change('endDate')} />
          </div>
        </div>
        <footer>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>Crear periodo</Button>
        </footer>
      </form>
    </div>
  );
}
