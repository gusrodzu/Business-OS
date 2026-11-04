import {Check, Plus} from 'lucide-react';
import {Badge, Button, Card} from '../../../../design-system/components';
import styles from './CrmActivities.module.css';

export default function CrmActivities({activities, prospects, onCreate, onToggle, activityTypeLabel, dateTime}) {
  const sorted = [...activities].sort((a, b) => {
    if (Boolean(a.completedAt) !== Boolean(b.completedAt)) return a.completedAt ? 1 : -1;
    return new Date(a.dueAt || a.createdAt) - new Date(b.dueAt || b.createdAt);
  });
  const now = new Date();

  return (
    <Card className={styles.activitiesCard}>
      <div className={styles.toolbar}>
        <div><span className={styles.cardEyebrow}>Seguimiento</span><h2>Agenda de actividades</h2></div>
        <Button icon={Plus} onClick={onCreate}>Nueva actividad</Button>
      </div>
      <div className={styles.agenda}>
        {sorted.map((item) => {
          const overdue = item.dueAt && !item.completedAt && new Date(item.dueAt) < now;
          const prospect = prospects.find((row) => row.id === item.prospectId);
          return (
            <article className={`${styles.agendaItem} ${item.completedAt ? styles.completed : ''}`} key={item.id}>
              <button className={styles.completeButton} type="button" onClick={() => onToggle(item)} title={item.completedAt ? 'Reabrir actividad' : 'Completar actividad'}>
                {item.completedAt ? <Check size={16} /> : null}
              </button>
              <span className={styles.agendaType}>{activityTypeLabel[item.type] || item.type}</span>
              <div className={styles.agendaCopy}>
                <strong>{item.title}</strong>
                <p>{item.description || 'Sin descripción adicional.'}</p>
                <small>{prospect?.companyName || prospect?.name || item.customer?.commercialName || item.customer?.legalName || 'Actividad general'}</small>
              </div>
              <div className={styles.agendaDate}>
                {overdue ? <Badge tone="danger">Vencida</Badge> : item.completedAt ? <Badge tone="success">Completada</Badge> : <Badge tone="info">Pendiente</Badge>}
                <time>{dateTime(item.dueAt || item.createdAt)}</time>
              </div>
            </article>
          );
        })}
        {!sorted.length ? <div className={styles.empty}>No hay actividades registradas.</div> : null}
      </div>
    </Card>
  );
}

