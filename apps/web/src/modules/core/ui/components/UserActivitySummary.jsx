import {Activity, Users} from 'lucide-react';
import styles from './UserActivitySummary.module.css';

function getInitials(name = '') {
  return String(name || '').trim().split(/\s+/).filter(Boolean)
    .map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'US';
}

/**
 * UI only: authenticated tenant-scoped activity is supplied by Dashboard.
 * No data loading, navigation, permissions or mutations occur here.
 */
export default function UserActivitySummary({activity}) {
  const active = Number(activity?.activeUsers) || 0;
  const total = Number(activity?.totalUsers) || 0;
  const people = Array.isArray(activity?.users) ? activity.users.slice(0, 5) : [];
  const remaining = Math.max(0, active - 5);

  return (
    <div className={styles.content}>
      <div className={styles.metric}>
        <span className={styles.metricIcon} aria-hidden="true"><Users size={21} /></span>
        <div className={styles.metricCopy}>
          <strong>{active} <span>de {total}</span></strong>
          <small>usuarios activos</small>
        </div>
      </div>
      {people.length > 0 ? (
        <div className={styles.avatars} aria-label="Usuarios con actividad reciente">
          {people.map(item => (
            <span key={item.id} title={item.name} aria-label={item.name} className={styles.avatar}>
              {getInitials(item.name)}
            </span>
          ))}
          {remaining > 0 ? (
            <span className={styles.remaining} aria-label={`${remaining} usuarios activos adicionales`}>+{remaining}</span>
          ) : null}
        </div>
      ) : null}
      <div className={styles.source}>
        <Activity size={14} aria-hidden="true" />
        <span>Información tomada de accesos reales</span>
      </div>
    </div>
  );
}
