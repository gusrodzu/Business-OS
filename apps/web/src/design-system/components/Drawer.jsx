import {useEffect, useRef} from 'react';
import {X} from 'lucide-react';
import {createPortal} from 'react-dom';
import styles from './Drawer.module.css';

export function Drawer({open,onClose,title,children,footer,side='right'}) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const drawer = ref.current;
    drawer?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        if (drawer?.contains(document.activeElement)) closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = Array.from(drawer?.querySelectorAll(
        'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
      ) || []).filter((element) => element.getClientRects().length > 0 && window.getComputedStyle(element).visibility !== 'hidden');
      if (!nodes.length) {
        event.preventDefault();
        drawer?.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === drawer)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !drawer?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className={styles.layer}>
      <button type="button" className={styles.scrim} aria-label="Cerrar panel" onClick={onClose}/>
      <aside ref={ref} tabIndex={-1} className={`${styles.drawer} ${side === 'left' ? styles.left : ''}`} role="dialog" aria-modal="true" aria-label={title || 'Panel lateral'}>
        <header>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={20} aria-hidden="true"/></button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer>{footer}</footer> : null}
      </aside>
    </div>,
    document.body,
  );
}
