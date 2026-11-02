import {Badge} from '../../../../design-system/components';
import MobileRecordCard from '../../../../components/MobileRecordCard';
import {NoResultsState} from '../../../../ux-foundation/UXFoundation';
import styles from './SalesProspectMobileList.module.css';

// Presentational sales pipeline list; data, selection and mutations remain in the page.
export default function SalesProspectMobileList({
  prospects,
  selectedIds,
  onToggle,
  onOpen,
  onStage,
  onClear,
  emptyQuery,
  stages,
  stageTones,
  formatMoney,
  formatDateTime,
}) {
  return (
    <section className={styles.mobileProspects} aria-label="Oportunidades comerciales">
      <div className={styles.mobileProspectsHeading}><strong>Oportunidades</strong><span>{prospects.length} visibles</span></div>
      {prospects.length ? prospects.map((prospect) => (
        <MobileRecordCard
          key={prospect.id}
          title={prospect.companyName || prospect.name}
          subtitle={prospect.companyName ? prospect.name : prospect.email || 'Sin contacto'}
          status={<Badge tone={stageTones[prospect.stage]}>{stages.find((item) => item.id === prospect.stage)?.label || prospect.stage}</Badge>}
          fields={[
            {label:'Valor estimado',value:formatMoney(prospect.estimatedValue)},
            {label:'Probabilidad',value:`${prospect.probability || 0}%`},
            {label:'Próxima acción',value:prospect.nextActionAt ? formatDateTime(prospect.nextActionAt) : 'Sin programar'},
            {label:'Origen',value:prospect.source || '—'},
          ]}
          onOpen={() => onOpen(prospect)}
          openLabel={`Ver oportunidad ${prospect.companyName || prospect.name}`}
          actions={<>
            <label className={styles.mobileSelection}>
              <input type="checkbox" checked={selectedIds.includes(prospect.id)}
                onChange={(event) => onToggle(prospect.id, event.target.checked)}
                aria-label={`Seleccionar oportunidad ${prospect.companyName || prospect.name}`}/>
              <span>Seleccionar</span>
            </label>
            <label className={styles.mobileStage}>
              <span>Cambiar etapa</span>
              <select value={prospect.stage} onChange={(event) => onStage(prospect, event.target.value)}
                aria-label={`Etapa de ${prospect.companyName || prospect.name}`}>
                {stages.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
              </select>
            </label>
          </>}
        />
      )) : (
        <NoResultsState query={emptyQuery}
          onClear={onClear}/>
      )}
    </section>
  );
}
