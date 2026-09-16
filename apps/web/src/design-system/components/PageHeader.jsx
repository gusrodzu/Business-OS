import styles from './PageHeader.module.css';

export function PageHeader({eyebrow, title, description, actions, className = ''}) {
  return (
    <header className={`${styles.header} ${className}`.trim()} data-bb-page-header="true">
      <div className={styles.copy}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
