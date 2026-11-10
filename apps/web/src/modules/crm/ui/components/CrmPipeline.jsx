import {ArrowRight, CalendarClock, Search} from 'lucide-react';
import {Badge, Card} from '../../../../design-system/components';
import styles from '../pages/Crm.module.css';

export default function CrmPipeline({prospects, query, setQuery, onEdit, onStage, onActivity, onConvert, stages, stageTone, money, dateTime, initials, isConverted}) {
  return (
    <Card className={styles.pipelineCard}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.cardEyebrow}>Kanban comercial</span>
          <h2>Pipeline de oportunidades</h2>
        </div>
        <SearchBox value={query} onChange={setQuery} />
      </div>
      <div className={styles.kanban}>
        {stages.map((stage) => {
          const items = prospects.filter((item) => item.stage === stage.id);
          return (
            <section className={styles.column} key={stage.id}>
              <header>
                <div><span>{stage.label}</span><strong>{money(items.reduce((sum, item) => sum + Number(item.estimatedValue || 0), 0))}</strong></div>
                <i>{items.length}</i>
              </header>
              <div className={styles.cards}>
                {items.map((item) => (
                  <article key={item.id}>
                    <div className={styles.prospectTop}>
                      <span className={styles.avatar}>{initials(item.name)}</span>
                      <Badge tone={stageTone[item.stage]}>{item.probability}%</Badge>
                    </div>
                    <button className={styles.cardTitle} type="button" onClick={() => onEdit({...item, estimatedValue: String(item.estimatedValue), nextActionAt: item.nextActionAt ? item.nextActionAt.slice(0, 16) : ''})}>
                      <strong>{item.companyName || item.name}</strong>
                      <small>{item.name}</small>
                    </button>
                    <strong className={styles.amount}>{money(item.estimatedValue)}</strong>
                    <div className={styles.cardMeta}>
                      <span>{item.source || 'Sin fuente'}</span>
                      <span>{item.nextActionAt ? dateTime(item.nextActionAt) : 'Sin seguimiento'}</span>
                    </div>
                    <select value={item.stage} onChange={(event) => onStage(item, event.target.value)}>
                      {stages.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                    <div className={styles.cardActions}>
                      <button type="button" onClick={() => onActivity(item)}><CalendarClock size={14} /> Seguimiento</button>
                      {item.stage === 'WON' && !isConverted(item) ? (
                        <button type="button" onClick={() => onConvert(item)}><ArrowRight size={14} /> Cliente</button>
                      ) : null}
                    </div>
                  </article>
                ))}
                {!items.length ? <Empty text="Sin oportunidades" /> : null}
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}


function SearchBox({value, onChange}) {
  return (
    <label className={styles.search}>
      <Search size={16} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Buscar lead, empresa o contacto…" />
    </label>
  );
}
