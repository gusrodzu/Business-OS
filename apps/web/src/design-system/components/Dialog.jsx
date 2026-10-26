import {useEffect, useId, useRef} from 'react';
import {X} from 'lucide-react';
import {createPortal} from 'react-dom';
import styles from './Dialog.module.css';

const getFocusable = (node) => Array.from(node?.querySelectorAll(
  'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
) || []).filter((element) => element.getClientRects().length > 0 && window.getComputedStyle(element).visibility !== 'hidden');

export function Dialog({open,onClose,title,eyebrow,children,actions,size='md',ariaLabelledby}) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const generatedTitleId = useId();
  const titleId = ariaLabelledby || generatedTitleId;

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const dialog = ref.current;
    (getFocusable(dialog)[0] || dialog)?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        if (dialog?.contains(document.activeElement)) closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      // Recalculate every time: actions can change after validation or API requests.
      const focusable = getFocusable(dialog);
      if (!focusable.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const outside = !dialog?.contains(document.activeElement);
      if (event.shiftKey && (outside || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (outside || document.activeElement === last)) {
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
      <button className={styles.scrim} type="button" aria-label="Cerrar diálogo" onClick={onClose}/>
      <section ref={ref} tabIndex={-1} className={`${styles.dialog} ${styles[size] || ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header>
          <div>
            {eyebrow ? <span>{eyebrow}</span> : null}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Cerrar"><X size={20} aria-hidden="true"/></button>
        </header>
        <div className={styles.body}>{children}</div>
        {actions ? <footer>{actions}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}
