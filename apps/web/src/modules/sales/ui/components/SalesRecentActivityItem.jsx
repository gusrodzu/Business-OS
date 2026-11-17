import {Activity, CalendarClock, CheckCircle2, TrendingUp} from 'lucide-react';
import {formatSalesDateTime as dateTime} from '../utils/salesDisplayFormatters';
import styles from './SalesRecentActivity.module.css';

const activityIcons = {
  NOTE: Activity,
  CALL: Activity,
  EMAIL: Activity,
  MEETING: CalendarClock,
  TASK: CheckCircle2,
  STATUS_CHANGE: TrendingUp,
};

/** Presentational row; the parent owns ordering and the seven-item limit. */
export default function SalesRecentActivityItem({activity}) {
  const Icon = activityIcons[activity.type] || Activity;
  const entity =
    activity.prospect?.companyName ||
    activity.prospect?.name ||
    activity.customer?.commercialName ||
    activity.customer?.legalName;

  return (
    <article>
      <div className={styles.activityIcon}>
        <Icon size={16} />
      </div>
      <div>
        <strong>{activity.title}</strong>
        <p>{activity.description || entity || 'Actividad comercial'}</p>
        <small>
          {activity.createdBy?.firstName || 'Admin'} {activity.createdBy?.lastName || 'Demo'}
          {' · '}
          {dateTime(activity.createdAt)}
        </small>
      </div>
    </article>
  );
}
