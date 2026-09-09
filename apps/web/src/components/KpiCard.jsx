import styles from './KpiCard.module.css';

export default function KpiCard({
  children,
  className = '',
  onClick,
  ariaLabel,
}) {
  function handleKeyDown(event) {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(event);
    }
  }

  return (
    <article
      data-kpi-card="true"
      data-kpi-clickable={onClick ? 'true' : undefined}
      className={`${styles.card} ${className}`.trim()}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? ariaLabel : undefined}
    >
      {children}
    </article>
  );
}
