import {X} from 'lucide-react';
import {Button, Input} from '../../../../design-system/components';
import {stages} from '../../utils/prospectStages';
import styles from './SalesProspectFormDialog.module.css';

/** Presentational editor: state and persistence remain in SalesEnterprise. */
export default function SalesProspectFormDialog({prospectModal, setProspectModal, onSubmit, saving, onClose}) {
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
                  onChange={(event) =>
                    setProspectModal((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Empresa"
                  value={prospectModal.companyName || ''}
                  onChange={(event) =>
                    setProspectModal((current) => ({
                      ...current,
                      companyName: event.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.grid2}>
                <Input
                  label="Correo"
                  type="email"
                  value={prospectModal.email || ''}
                  onChange={(event) =>
                    setProspectModal((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Teléfono"
                  value={prospectModal.phone || ''}
                  onChange={(event) =>
                    setProspectModal((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.grid3}>
                <label>
                  Etapa
                  <select
                    value={prospectModal.stage}
                    onChange={(event) =>
                      setProspectModal((current) => ({
                        ...current,
                        stage: event.target.value,
                      }))
                    }
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
                  onChange={(event) =>
                    setProspectModal((current) => ({
                      ...current,
                      estimatedValue: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Probabilidad %"
                  type="number"
                  min="0"
                  max="100"
                  value={prospectModal.probability}
                  onChange={(event) =>
                    setProspectModal((current) => ({
                      ...current,
                      probability: event.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.grid2}>
                <Input
                  label="Origen"
                  placeholder="Referido, web, evento..."
                  value={prospectModal.source || ''}
                  onChange={(event) =>
                    setProspectModal((current) => ({
                      ...current,
                      source: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Próxima acción"
                  type="datetime-local"
                  value={prospectModal.nextActionAt || ''}
                  onChange={(event) =>
                    setProspectModal((current) => ({
                      ...current,
                      nextActionAt: event.target.value,
                    }))
                  }
                />
              </div>

              <label>
                Notas
                <textarea
                  rows="4"
                  value={prospectModal.notes || ''}
                  onChange={(event) =>
                    setProspectModal((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
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
