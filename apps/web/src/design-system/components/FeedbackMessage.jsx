/**
 * Visual styles remain owned by each module. This shared primitive only
 * guarantees that success/info feedback is announced politely and failures
 * are announced as alerts, without moving keyboard focus.
 */
import styles from './FeedbackMessage.module.css';

export function FeedbackMessage({tone = 'info', className = '', children}) {
  const isError = tone === 'error' || tone === 'danger';

  return (
    <div
      className={`${styles.region} ${className}`.trim()}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {children}
    </div>
  );
}
