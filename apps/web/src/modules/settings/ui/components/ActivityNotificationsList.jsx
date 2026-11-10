import {CheckCheck, Info, Trash2, Bell, ShieldCheck, Megaphone} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import styles from '../pages/ActivityCenter.module.css';

const typeTones = {INFO: 'neutral', SUCCESS: 'success', WARNING: 'warning', ERROR: 'danger'};
const typeIcons = {INFO: Info, SUCCESS: ShieldCheck, WARNING: Megaphone, ERROR: Bell};

export default function ActivityNotificationsList({notifications, formatDate, onMarkRead, onRemove}) {
  return (
          <div className={styles.notificationList}>
            {notifications.length ? (
              notifications.map((item) => {
                const Icon = typeIcons[item.type] ?? Info;

                return (
                  <article
                    className={`${styles.notification} ${
                      !item.read ? styles.unread : ''
                    }`}
                    key={item.id}
                  >
                    <div className={styles.notificationIcon}>
                      <Icon size={20} />
                    </div>

                    <div className={styles.notificationBody}>
                      <div className={styles.notificationTitle}>
                        <strong>{item.title}</strong>
                        <Badge tone={typeTones[item.type]}>{item.type}</Badge>
                      </div>
                      <p>{item.message}</p>
                      <small>{formatDate(item.createdAt)}</small>
                    </div>

                    <div className={styles.notificationActions}>
                      {!item.read ? (
                        <button onClick={() => onMarkRead(item)}>
                          <CheckCheck size={17} /> Leída
                        </button>
                      ) : null}
                      {item.link ? <a href={item.link}>Abrir</a> : null}
                      <button onClick={() => onRemove(item)}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className={styles.empty}>No hay notificaciones para mostrar.</div>
            )}
          </div>
  );
}
