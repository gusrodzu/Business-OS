import {Maximize2, Minimize2, Minus, X} from 'lucide-react';
import styles from '../AppShell.module.css';

/**
 * Single OS application window used by Ventas and Inventario and future modules.
 * Window state and navigation remain owned by AppShell; no process manager yet.
 */
export default function OSAppWindow({
  title, Icon, maximized = false, onToggleMaximize, onMinimize, onClose, children,
}) {
  return (
    <section className={[styles.osAppWindow, maximized ? styles.osWindowMaximized : ''].filter(Boolean).join(' ')}
      aria-label={'Aplicación ' + title} data-os-application-window="true">
      <header className={styles.osWindowBar}>
        <div className={styles.osWindowName}>
          <Icon size={21} aria-hidden="true"/>
          <strong>{title}</strong>
        </div>
        <div className={styles.osWindowControls}>
          <button type="button" onClick={onMinimize} title={'Minimizar ' + title}
            aria-label={'Minimizar ' + title + ' y volver al escritorio'}>
            <Minus size={20} aria-hidden="true"/>
          </button>
          <button type="button" onClick={onToggleMaximize}
            aria-label={(maximized ? 'Restaurar ventana de ' : 'Ampliar ventana de ') + title}
            aria-pressed={maximized}>
            {maximized ? <Minimize2 size={18} aria-hidden="true"/> : <Maximize2 size={18} aria-hidden="true"/>}
          </button>
          <button type="button" onClick={onClose} title={'Cerrar ' + title}
            aria-label={'Cerrar ' + title}>
            <X size={19} aria-hidden="true"/>
          </button>
        </div>
      </header>
      <div className={styles.osWindowBody}>{children}</div>
    </section>
  );
}
