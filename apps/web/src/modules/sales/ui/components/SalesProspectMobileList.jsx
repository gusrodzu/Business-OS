import {Badge} from '../../../../design-system/components';
import MobileRecordCard from '../../../../components/MobileRecordCard';
import MobileListHeader from '../../../../components/MobileListHeader';
import {NoResultsState} from '../../../../ux-foundation/UXFoundation';
import styles from './SalesProspectMobileList.module.css';
import SalesProspectMobileActions from './SalesProspectMobileActions';

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
      <MobileListHeader title="Oportunidades" count={prospects.length}/>
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
          actions={<SalesProspectMobileActions
            prospect={prospect}
            selected={selectedIds.includes(prospect.id)}
            stages={stages}
            onToggle={onToggle}
            onStage={onStage}
          />}
        />
      )) : (
        <NoResultsState query={emptyQuery}
          onClear={onClear}/>
      )}
    </section>
  );
}
