import {useEffect, useMemo, useRef, useState} from 'react';
import {
  Bell,
  CheckCheck,
  Clock3,
  Filter,
  Megaphone,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {settingsRequest as apiRequest} from '../../services/settingsApi';
import {Badge, Button, Card, Input} from '../../../../design-system/components';
import styles from './ActivityCenter.module.css';

import ActivityNotificationEditor from '../components/ActivityNotificationEditor';
import ActivityNotificationsList from '../components/ActivityNotificationsList';
import KpiInfo from '../../../../components/KpiInfo';
import KpiCard from '../../../../components/KpiCard';
import ActivityAuditList from '../components/ActivityAuditList';
const formatDate = (value) =>
  new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const blankNotification = () => ({
  type: 'INFO',
  title: '',
  message: '',
  link: '',
  userId: '',
});

export default function ActivityCenter() {
  const [tab, setTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [activity, setActivity] = useState([]);
  const [filters, setFilters] = useState({entities: [], actions: []});
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const actionLocks = useRef(new Set());
  const createLock = useRef(false);

  async function loadNotifications() {
    const response = await apiRequest('/activity/notifications');
    setNotifications(response.notifications);
    setUnread(response.unread);
  }

  async function loadActivity() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (entity) params.set('entity', entity);
    if (action) params.set('action', action);

    const response = await apiRequest(`/activity/activity?${params}`);
    setActivity(response.logs);
    setFilters(response.filters);
  }

  useEffect(() => {
    Promise.all([loadNotifications(), loadActivity()]).catch((error) =>
      setMessage(['error', error.message]),
    );
  }, []);

  async function refreshActivity() {
    try { await loadActivity(); setMessage(null); }
    catch (error) { setMessage(['error', `No se pudo actualizar la bitácora: ${error.message}`]); }
  }

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((item) =>
        `${item.title} ${item.message}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [notifications, query],
  );

  async function createNotification(event) {
    event.preventDefault();
    if (createLock.current || !modal) return;
    createLock.current = true;
    setSaving(true);
    setMessage(null);

    try {
      await apiRequest('/activity/notifications', {
        method: 'POST',
        body: {
          ...modal,
          link: modal.link || null,
          userId: modal.userId || null,
        },
      });

      setModal(null);
      setMessage(['success', 'Notificación creada.']);
      try { await loadNotifications(); }
      catch (error) { setMessage(['error', `Notificación creada, pero no se pudo actualizar la lista: ${error.message}`]); }
    } catch (error) {
      setMessage(['error', error.message]);
    } finally {
      createLock.current = false;
      setSaving(false);
    }
  }

  async function markRead(item) {
    if (actionLocks.current.has(item.id)) return;
    actionLocks.current.add(item.id);
    try {
    await apiRequest(`/activity/notifications/${item.id}/read`, {
      method: 'PATCH',
    });
    await loadNotifications();
    setMessage(['success', 'Notificación marcada como leída.']);
    } catch (error) { setMessage(['error', error.message]); }
    finally { actionLocks.current.delete(item.id); }
  }

  async function markAllRead() {
    if (actionLocks.current.has('read-all')) return;
    actionLocks.current.add('read-all');
    try {
    await apiRequest('/activity/notifications/read-all', {
      method: 'PATCH',
    });
    await loadNotifications();
    setMessage(['success', 'Todas las notificaciones fueron marcadas como leídas.']);
    } catch (error) { setMessage(['error', error.message]); }
    finally { actionLocks.current.delete('read-all'); }
  }

  async function removeNotification(item) {
    if (actionLocks.current.has(item.id)) return;
    if (!window.confirm(`¿Eliminar la notificación "${item.title}"?`)) return;

    actionLocks.current.add(item.id);
    try {
      await apiRequest(`/activity/notifications/${item.id}`, {
        method: 'DELETE',
      });
      await loadNotifications();
      setMessage(['success', 'Notificación eliminada.']);
    } catch (error) {
      setMessage(['error', error.message]);
    } finally {
      actionLocks.current.delete(item.id);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Control y seguimiento</span>
          <h1>Centro de actividad</h1>
          <p>
            Consulta notificaciones, cambios del sistema y acciones realizadas
            por los usuarios.
          </p>
        </div>

        <Button icon={Megaphone} onClick={() => setModal(blankNotification())}>
          Crear notificación
        </Button>
      </header>

      {message ? (
        <div className={`${styles.message} ${styles[message[0]]}`} role={message[0]==='error'?'alert':'status'}>
          {message[1]}
        </div>
      ) : null}

      <section className={styles.metrics}>
        <KpiCard><Bell /><span>Notificaciones</span><KpiInfo title="Notificaciones registradas">Total de notificaciones generadas por eventos del sistema.</KpiInfo><strong>{notifications.length}</strong></KpiCard>
        <KpiCard><Clock3 /><span>Sin leer</span><KpiInfo title="Notificaciones pendientes">Notificaciones que el usuario todavía no ha marcado como leídas.</KpiInfo><strong>{unread}</strong></KpiCard>
        <KpiCard><ShieldCheck /><span>Eventos auditados</span><KpiInfo title="Eventos de auditor\u00eda">Acciones registradas para conservar trazabilidad operativa.</KpiInfo><strong>{activity.length}</strong></KpiCard>
        <KpiCard><UserRound /><span>Entidades monitoreadas</span><KpiInfo title="Cobertura de auditor\u00eda">Tipos de registros distintos que aparecen en el historial de actividad.</KpiInfo><strong>{filters.entities.length}</strong></KpiCard>
      </section>

      <Card className={styles.workspace}>
        <div className={styles.tabs} role="group" aria-label="Vista de actividad">
          <button
            type="button" aria-pressed={tab==='notifications'} className={tab === 'notifications' ? styles.activeTab : ''}
            onClick={() => setTab('notifications')}
          >
            Notificaciones
            {unread ? <span>{unread}</span> : null}
          </button>
          <button
            type="button" aria-pressed={tab==='activity'} className={tab === 'activity' ? styles.activeTab : ''}
            onClick={() => setTab('activity')}
          >
            Bitácora
          </button>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.search} aria-label="Buscar en actividad">
            <Search size={18} />
            <input
              aria-label={tab === 'notifications' ? 'Buscar notificaciones' : 'Buscar en bitácora'}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                tab === 'notifications'
                  ? 'Buscar notificación'
                  : 'Buscar usuario, acción o descripción'
              }
            />
          </label>

          {tab === 'activity' ? (
            <>
              <label className={styles.selectWrap}>
                <Filter size={17} />
                <select
                  value={entity}
                  onChange={(event) => setEntity(event.target.value)}
                >
                  <option value="">Todas las entidades</option>
                  {filters.entities.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className={styles.selectWrap}>
                <select
                  value={action}
                  onChange={(event) => setAction(event.target.value)}
                >
                  <option value="">Todas las acciones</option>
                  {filters.actions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <Button variant="secondary" onClick={refreshActivity}>
                Aplicar filtros
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              icon={CheckCheck}
              onClick={markAllRead}
              disabled={!unread}
            >
              Marcar todo leído
            </Button>
          )}
        </div>

        {tab === 'notifications' ? (
          <ActivityNotificationsList
            notifications={visibleNotifications}
            formatDate={formatDate}
            onMarkRead={markRead}
            onRemove={removeNotification}
          />
        ) : (
          <ActivityAuditList activity={activity} formatDate={formatDate} />
        )}
      </Card>

      <ActivityNotificationEditor
        notification={modal}
        saving={saving}
        onChange={setModal}
        onClose={() => setModal(null)}
        onSubmit={createNotification}
      />
    </div>
  );
}
