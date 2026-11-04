import {Activity, CalendarClock, CheckCircle2, TrendingUp} from 'lucide-react';
import {Card} from '../../../../design-system/components';
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
                    {activities.slice(0, 7).map((item) => {
                      const Icon = activityIcons[item.type] || Activity;
                      const entity =
                        item.prospect?.companyName ||
                        item.prospect?.name ||
                        item.customer?.commercialName ||
                        item.customer?.legalName;

                      return (
                        <article key={item.id}>
                          <div className={styles.activityIcon}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <strong>{item.title}</strong>
                            <p>{item.description || entity || 'Actividad comercial'}</p>
                            <small>
                              {item.createdBy?.firstName || 'Admin'} {item.createdBy?.lastName || 'Demo'}
                              {' · '}
                              {dateTime(item.createdAt)}
                            </small>
                          </div>
                        </article>
                      );
                    })}

                    {!activities.length ? (
                      <div className={styles.empty}>Aún no hay actividad comercial.</div>
                    ) : null}
                  </div>
                </Card>
  );
}
