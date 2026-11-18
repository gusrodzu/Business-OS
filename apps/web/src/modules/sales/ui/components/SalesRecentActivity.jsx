import {Card} from '../../../../design-system/components';
import SalesRecentActivityItem from './SalesRecentActivityItem';
import styles from './SalesRecentActivity.module.css';

export default function SalesRecentActivity({activities = []}) {
  return (
    <Card className={styles.activityCard}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardEyebrow}>Actividad</span>
          <h2>Movimiento reciente</h2>
        </div>
      </div>

      <div className={styles.activityList}>
        {activities.slice(0, 7).map((item) => (
          <SalesRecentActivityItem key={item.id} activity={item} />
        ))}

        {!activities.length ? (
          <div className={styles.empty}>Aún no hay actividad comercial.</div>
        ) : null}
      </div>
    </Card>
  );
}
