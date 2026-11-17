import {useEffect, useRef} from 'react';
import {Grid2X2, X} from 'lucide-react';
import WorkspaceAppShelf from '../../modules/core/ui/pages/WorkspaceAppShelf';
import styles from './WorkspaceOSAppDrawer.module.css';

/**
 * Native modal semantics provide focus containment, Escape support and a
 * consistent full-screen launcher across Pocket, Touch and Desktop OS.
 * Entitlements and route destinations remain owned by WorkspaceAppShelf.
 */
export default function WorkspaceOSAppDrawer({open, onClose}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus({preventScroll: true});
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      id="workspace-os-app-drawer"
      ref={dialogRef}
      className={styles.drawer}
      aria-labelledby="workspace-os-drawer-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClose={() => { if (open) onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className={styles.surface}>
        <header className={styles.header}>
          <div className={styles.brand}><span className={styles.brandIcon}><Grid2X2 size={22} aria-hidden="true"/></span>
            <div><span className={styles.eyebrow}>BUSINESS OS</span><h1 id="workspace-os-drawer-title">Todas las aplicaciones</h1></div>
          </div>
          <button type="button" ref={closeRef} className={styles.close}
            aria-label="Cerrar aplicaciones" onClick={onClose}>
            <X size={22} aria-hidden="true"/>
          </button>
        </header>
        <div className={styles.scroll}>
          <WorkspaceAppShelf variant="drawer" onLaunch={onClose}/>
        </div>
      </div>
    </dialog>
  );
}
