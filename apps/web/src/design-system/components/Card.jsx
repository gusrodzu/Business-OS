import styles from './Card.module.css';

export function Card({children, className = '', padding = 'md', variant = 'elevated', ...props}) {
  return (
    <section className={`${styles.card} ${styles[padding]} ${styles[variant] || ''} ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
