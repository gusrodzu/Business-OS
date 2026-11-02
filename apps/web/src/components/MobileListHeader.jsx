import styles from './MobileListHeader.module.css';

/** Presentation only: reusable list heading for mobile record collections. */
export default function MobileListHeader({title, count}) {
  return (
    <header className={styles.heading}>
      <h2>{title}</h2>
      {typeof count === 'number' ? (
        <span className={styles.count}>{new Intl.NumberFormat('es-MX').format(count)} visibles</span>
      ) : null}
    </header>
  );
}
