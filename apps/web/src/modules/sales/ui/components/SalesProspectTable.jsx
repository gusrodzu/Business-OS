import {Badge} from '../../../../design-system/components';
import {NoResultsState, SmartTable} from '../../../../ux-foundation/UXFoundation';
import {stages} from '../../utils/prospectStages';
import styles from './SalesProspectWorkspace.module.css';

export default function SalesProspectTable({prospects, selectedIds, allVisibleSelected, onToggleAll, onToggleOne, onOpen, onClear, emptyQuery, stageTones, formatMoney, formatDateTime}) {
  const money = formatMoney;
  const dateTime = formatDateTime;
  const query = emptyQuery;
  const stageFilter = '';
  const view = '';
  const toggleAll = onToggleAll;
  const toggleOne = onToggleOne;
  return (<div className={styles.desktopProspectsTable}><SmartTable selectedCount={selectedIds.length} footer={<><span>{prospects.length} oportunidades visibles</span><span>{selectedIds.length ? `${selectedIds.length} seleccionadas` : 'Selecciona una fila para ver detalle'}</span></>}>
      {prospects.length ? <table>
        <thead><tr><th><input type="checkbox" aria-label="Seleccionar todas las oportunidades" checked={allVisibleSelected} onChange={(event)=>toggleAll(event.target.checked)}/></th><th>Oportunidad</th><th>Etapa</th><th>Valor</th><th>Probabilidad</th><th>Próxima acción</th><th>Origen</th></tr></thead>
        <tbody>{prospects.map((prospect) => <tr key={prospect.id} onClick={() => onOpen(prospect)} className={styles.uxClickableRow}>
          <td onClick={(event)=>event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(prospect.id)} onChange={(event)=>toggleOne(prospect.id,event.target.checked)}/></td>
          <td><strong>{prospect.companyName || prospect.name}</strong><small>{prospect.companyName ? prospect.name : prospect.email || 'Sin contacto'}</small></td>
          <td><Badge tone={stageTones[prospect.stage]}>{stages.find((item)=>item.id===prospect.stage)?.label || prospect.stage}</Badge></td>
          <td><strong>{money(prospect.estimatedValue)}</strong></td>
          <td>{prospect.probability || 0}%</td>
          <td>{prospect.nextActionAt ? dateTime(prospect.nextActionAt) : 'Sin programar'}</td>
          <td>{prospect.source || '—'}</td>
        </tr>)}</tbody>
      </table> : <NoResultsState query={query || stageFilter || view} onClear={onClear}/>}
    </SmartTable></div>);
}
