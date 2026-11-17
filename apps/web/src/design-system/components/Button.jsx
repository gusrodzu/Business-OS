import styles from './Button.module.css';

const VARIANT_ALIASES = {
  primary: 'filled',
  secondary: 'outlined',
  ghost: 'text',
  danger: 'danger',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  const resolvedVariant = VARIANT_ALIASES[variant] || variant;
  const classes = [styles.button, styles[resolvedVariant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props} aria-busy={loading ? "true" : props["aria-busy"]}>
      <span className={styles.stateLayer} aria-hidden="true" />
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {!loading && Icon && iconPosition === 'left' ? <Icon size={18} aria-hidden="true" /> : null}
      <span className={styles.label}>{loading ? 'Procesando…' : children}</span>
      {!loading && Icon && iconPosition === 'right' ? <Icon size={18} aria-hidden="true" /> : null}
    </button>
  );
}
