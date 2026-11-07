import {Badge} from '../../../../design-system/components';
import {stages} from '../../utils/prospectStages';
import styles from './SalesProspectWorkspace.module.css';

// Presentational Kanban; stage changes and detail navigation are owned by the workspace.
export default function SalesProspectKanban({prospects, stageTones, onOpen, onStage, formatMoney, formatDateTime}) {
  return (
    <div className={styles.uxKanban}>
      {stages.map((stage) => {
        const rows = prospects.filter((item) => item.stage === stage.id);
        return <section key={stage.id} className={styles.column}>
          <header><span>{stage.label}</span><strong>{rows.length}</strong></header>
          <div className={styles.cards}>{rows.map((prospect) => <article key={prospect.id} onClick={() => onOpen(prospect)}>
            <div className={styles.prospectTop}><span className={styles.prospectAvatar}>{prospect.name?.slice(0,1).toUpperCase()}</span><Badge tone={stageTones[prospect.stage]}>{prospect.probability || 0}%</Badge></div>
            <h3>{prospect.companyName || prospect.name}</h3><p>{prospect.companyName ? prospect.name : prospect.email || 'Sin contacto'}</p><strong>{formatMoney(prospect.estimatedValue)}</strong><small>{prospect.nextActionAt ? `Próxima acción: ${formatDateTime(prospect.nextActionAt)}` : 'Sin próxima acción'}</small>
            <select value={prospect.stage} onClick={(event)=>event.stopPropagation()} onChange={(event)=>{event.stopPropagation();onStage(prospect,event.target.value)}}>{stages.map((entry)=><option key={entry.id} value={entry.id}>{entry.label}</option>)}</select>
          </article>)}{!rows.length ? <div className={styles.columnEmpty}>Sin oportunidades</div> : null}</div>
        </section>;
      })}
    </div>
  );
}
