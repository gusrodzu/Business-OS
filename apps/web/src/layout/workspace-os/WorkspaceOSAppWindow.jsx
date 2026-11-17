import {useState} from 'react';
import {Maximize2, Minimize2, X} from 'lucide-react';
import styles from '../AppShell.module.css';

// Shared application window: chrome is independent of Sales and reusable by
// Inventory, Purchasing and future modules without changing domain handlers.
// On phones, AppShell CSS presents the child route in full-screen app mode.
export default function WorkspaceOSAppWindow({title, Icon, onClose, children}) {
  const [maximized, setMaximized] = useState(false);

  return (
    <section className={styles.osAppWindow} data-maximized={maximized ? 'true' : 'false'}
      aria-label={`Aplicación ${title}`}>
      <header className={styles.osWindowHeader}>
        <span>{Icon ? <Icon size={20} aria-hidden="true"/> : null} {title}</span>
        <div className={styles.osWindowActions}>
          <button type="button" onClick={() => setMaximized((value) => !value)}
            title={maximized ? 'Restaurar ventana' : 'Ampliar ventana'}
            aria-label={`${maximized ? 'Restaurar' : 'Ampliar'} ventana de ${title}`}>
            {maximized ? <Minimize2 size={18} aria-hidden="true"/> : <Maximize2 size={18} aria-hidden="true"/>}
          </button>
          <button type="button" onClick={onClose} title="Volver al escritorio"
            aria-label={`Cerrar ${title} y volver al escritorio`}>
            <X size={19} aria-hidden="true"/>
          </button>
        </div>
      </header>
      <div className={styles.osWindowBody}>{children}</div>
    </section>
  );
}
