import {X} from 'lucide-react';
import {Button, Input} from '../../../../design-system/components';
import {stages} from '../../utils/prospectStages';
import styles from './SalesProspectFormDialog.module.css';

/** Presentational editor: state and persistence remain in SalesEnterprise. */
export default function SalesProspectFormDialog({prospectModal, setProspectModal, onSubmit, saving, onClose}) {
  const updateField = (field) => (event) => {
    const value = event.target.value;
    setProspectModal((current) => ({...current, [field]: value}));
  };

  if (!prospectModal) return null;
  return (
        <div className={styles.overlay}>
          <form className={styles.modal} onSubmit={onSubmit}>
            <header>
              <div>
                <span>Pipeline comercial</span>
                <h2>{prospectModal.id ? 'Editar prospecto' : 'Nuevo prospecto'}</h2>
              </div>
              <button type="button" onClick={onClose}>
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.grid2}>
                <Input
                  label="Nombre del contacto"
                  required
                  value={prospectModal.name}
                  onChange={updateField('name')}
                />
                <Input
                  label="Empresa"
                  value={prospectModal.companyName || ''}
                  onChange={updateField('companyName')}
                />
              </div>

              <div className={styles.grid2}>
                <Input
                  label="Correo"
                  type="email"
                  value={prospectModal.email || ''}
                  onChange={updateField('email')}
                />
                <Input
                  label="Teléfono"
                  value={prospectModal.phone || ''}
                  onChange={updateField('phone')}
                />
              </div>

              <div className={styles.grid3}>
                <label>
                  Etapa
                  <select
                    value={prospectModal.stage}
                    onChange={updateField('stage')}
                  >
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  label="Valor estimado"
                  type="number"
                  min="0"
                  step="0.01"
                  value={prospectModal.estimatedValue}
                  onChange={updateField('estimatedValue')}
                />
                <Input
                  label="Probabilidad %"
                  type="number"
                  min="0"
                  max="100"
                  value={prospectModal.probability}
                  onChange={updateField('probability')}
                />
              </div>

              <div className={styles.grid2}>
                <Input
                  label="Origen"
                  placeholder="Referido, web, evento..."
                  value={prospectModal.source || ''}
                  onChange={updateField('source')}
                />
                <Input
                  label="Próxima acción"
                  type="datetime-local"
                  value={prospectModal.nextActionAt || ''}
                  onChange={updateField('nextActionAt')}
                />
              </div>

              <label>
                Notas
                <textarea
                  rows="4"
                  value={prospectModal.notes || ''}
                  onChange={updateField('notes')}
                />
              </label>
            </div>

            <footer>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Guardar prospecto
              </Button>
            </footer>
          </form>
        </div>
  );
}
