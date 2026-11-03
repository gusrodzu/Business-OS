import {CalendarClock, UserPlus} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import MobileRecordCard from '../../../../components/MobileRecordCard';
import MobileListHeader from '../../../../components/MobileListHeader';
import {NoResultsState} from '../../../../ux-foundation/UXFoundation';
import styles from './CrmLeadMobileList.module.css';

// Read-only record summaries; selection and mutations remain in CRM.
export default function CrmLeadMobileList({
  prospects, selectedIds, onSelectionChange, onOpen, onActivity, onConvert,
  isConverted, stageTone, stages, formatMoney, formatDateTime, emptyQuery, onClear,
}) {
  return (
    <div className={styles.mobileLeads} aria-label="Leads y oportunidades">
      <MobileListHeader title="Leads y oportunidades" count={prospects.length}/>
      {prospects.length ? prospects.map(item => {
        const name = item.companyName || item.name;
        return <MobileRecordCard
          key={item.id}
          title={name}
          subtitle={item.companyName ? item.name : item.email || item.phone || 'Sin contacto'}
          status={<Badge tone={stageTone[item.stage]}>{stages.find(stage => stage.id === item.stage)?.label || item.stage}</Badge>}
          fields={[
            {label:'Valor estimado',value:formatMoney(item.estimatedValue)},
            {label:'Probabilidad',value:`${item.probability || 0}%`},
            {label:'Próximo paso',value:item.nextActionAt ? formatDateTime(item.nextActionAt) : 'Sin programar'},
            {label:'Origen',value:item.source || 'Sin fuente'},
          ]}
          onOpen={() => onOpen(item)}
          openLabel={`Ver detalle de ${name}`}
          actions={<>
            <label className={styles.selection}>
              <input type="checkbox" checked={selectedIds.includes(item.id)}
                onChange={event => onSelectionChange(item.id, event.target.checked)}
                aria-label={`Seleccionar oportunidad ${name}`}/>
              Seleccionar
            </label>
            <button type="button" className={styles.action} onClick={() => onActivity(item)}
              aria-label={`Registrar seguimiento de ${name}`}>
              <CalendarClock size={16} aria-hidden="true"/> Seguimiento
            </button>
            {item.stage === 'WON' && !isConverted(item) ? (
              <button type="button" className={styles.action} onClick={() => onConvert(item)}
                aria-label={`Convertir a cliente: ${name}`}>
                <UserPlus size={16} aria-hidden="true"/> Convertir a cliente
              </button>
            ) : null}
          </>}
        />;
      }) : <NoResultsState query={emptyQuery} onClear={onClear}/>}
    </div>
  );
}
