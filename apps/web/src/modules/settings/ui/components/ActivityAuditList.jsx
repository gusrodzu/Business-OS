import {Badge} from '../../../../design-system/components';
import styles from '../pages/ActivityCenter.module.css';

/** Presentational audit history. Data access and filtering remain in ActivityCenter. */
export default function ActivityAuditList({activity, formatDate}) {
  return (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>Descripción</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {activity.length ? (
                  activity.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>
                        <strong>
                          {item.user
                            ? `${item.user.firstName} ${item.user.lastName}`
                            : 'Sistema'}
                        </strong>
                        <small>{item.user?.email ?? 'Automático'}</small>
                      </td>
                      <td><Badge tone="neutral">{item.action}</Badge></td>
                      <td>{item.entity}</td>
                      <td>{item.description || 'Sin descripción'}</td>
                      <td>{item.ipAddress || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles.emptyCell}>
                      No hay actividad para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
  );
}
