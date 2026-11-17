import {X} from 'lucide-react';
import {Button, Input} from '../../../../design-system/components';
import styles from '../pages/ActivityCenter.module.css';

/** Controlled notification editor. Persistence remains in ActivityCenter. */
export default function ActivityNotificationEditor({notification, saving, onChange, onClose, onSubmit}) {
  if (!notification) return null;
  const modal = notification;
  const createNotification = onSubmit;
  return (
        <div className={styles.overlay}>
          <form className={styles.modal} onSubmit={createNotification}>
            <div className={styles.modalHeader}>
              <div>
                <span>Nueva alerta</span>
                <h2>Crear notificación</h2>
              </div>
              <button type="button" onClick={() => onClose()}>
                <X />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label>
                Tipo
                <select
                  value={modal.type}
                  onChange={(event) =>
                    onChange((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                >
                  <option value="INFO">Información</option>
                  <option value="SUCCESS">Éxito</option>
                  <option value="WARNING">Advertencia</option>
                  <option value="ERROR">Error</option>
                </select>
              </label>

              <Input
                label="Título"
                required
                value={modal.title}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />

              <label>
                Mensaje
                <textarea
                  rows="5"
                  required
                  value={modal.message}
                  onChange={(event) =>
                    onChange((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                />
              </label>

              <Input
                label="Enlace interno opcional"
                placeholder="/inventario/existencias"
                value={modal.link}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    link: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.modalFooter}>
              <Button type="button" variant="ghost" onClick={() => onClose()}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Publicar notificación
              </Button>
            </div>
          </form>
        </div>
  );
}
