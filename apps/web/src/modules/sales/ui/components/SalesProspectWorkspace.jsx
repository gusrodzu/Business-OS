import {Badge} from '../../../../design-system/components';
import {BulkActionsBar, FilterBar, NoResultsState, SavedViews, SmartTable} from '../../../../ux-foundation/UXFoundation';
import SalesProspectMobileList from './SalesProspectMobileList';
import SalesProspectKanban from './SalesProspectKanban';
import {stages} from '../../utils/prospectStages';
import {formatSalesMoney as money, formatSalesDateTime as dateTime} from '../utils/salesDisplayFormatters';
import styles from './SalesProspectWorkspace.module.css';

const stageTones = {LEAD: 'neutral', CONTACTED: 'warning', QUALIFIED: 'warning', PROPOSAL: 'neutral', WON: 'success', LOST: 'danger'};

export default function SalesProspectWorkspace({
  prospects,
  query,
  setQuery,
  view,
  setView,
  counts,
  stageFilter,
  setStageFilter,
  mode,
  setMode,
  selectedIds,
  setSelectedIds,
  onBulkStage,
  onOpen,
  onStage,
}) {
  const views = [
    {id:'all', label:'Todas', count:counts.all},
    {id:'hot', label:'Alta probabilidad', count:counts.hot},
    {id:'followup', label:'Con seguimiento', count:counts.followup},
    {id:'overdue', label:'Vencidas', count:counts.overdue},
    {id:'won', label:'Ganadas', count:counts.won},
  ];
  const allVisibleSelected = Boolean(prospects.length) && prospects.every((item) => selectedIds.includes(item.id));
  const toggleAll = (checked) => setSelectedIds(checked ? prospects.map((item) => item.id) : []);
  const toggleOne = (id, checked) => setSelectedIds((current) => checked ? [...new Set([...current,id])] : current.filter((item) => item !== id));

  return <section className={styles.uxWorkspace} data-ux-v19="sales-workspace">
    <div className={styles.uxWorkspaceTop}>
      <SavedViews items={views} active={view} onChange={setView}/>
      <div className={styles.uxModeToggle} aria-label="Modo de visualización">
        <button type="button" className={mode === 'table' ? styles.uxModeActive : ''} onClick={() => setMode('table')}>Lista</button>
        <button type="button" className={mode === 'kanban' ? styles.uxModeActive : ''} onClick={() => setMode('kanban')}>Kanban</button>
      </div>
    </div>
    <FilterBar
      query={query}
      onQueryChange={setQuery}
      placeholder="Buscar contacto, empresa, correo o fuente"
      chips={[{id:'stage',active:Boolean(stageFilter),label:`Etapa: ${stages.find((item)=>item.id===stageFilter)?.label || stageFilter}`,onRemove:()=>setStageFilter('')}]} 
      onClear={() => {setQuery('');setStageFilter('');setView('all')}}
    >
      <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} aria-label="Filtrar por etapa">
        <option value="">Todas las etapas</option>
        {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
      </select>
    </FilterBar>
    <BulkActionsBar count={selectedIds.length} onClear={() => setSelectedIds([])}>
      <button type="button" onClick={() => onBulkStage('QUALIFIED')}>Marcar calificadas</button>
      <button type="button" onClick={() => onBulkStage('WON')}>Marcar ganadas</button>
    </BulkActionsBar>
    {mode === 'table' ? <><div className={styles.desktopProspectsTable}><SmartTable selectedCount={selectedIds.length} footer={<><span>{prospects.length} oportunidades visibles</span><span>{selectedIds.length ? `${selectedIds.length} seleccionadas` : 'Selecciona una fila para ver detalle'}</span></>}>
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
      </table> : <NoResultsState query={query || stageFilter || view} onClear={() => {setQuery('');setStageFilter('');setView('all')}}/>}
    </SmartTable></div>
    <SalesProspectMobileList
        prospects={prospects}
        selectedIds={selectedIds}
        onToggle={toggleOne}
        onOpen={onOpen}
        onStage={onStage}
        onClear={() => {setQuery('');setStageFilter('');setView('all')}}
        emptyQuery={query || stageFilter || view}
        stages={stages}
        stageTones={stageTones}
        formatMoney={money}
        formatDateTime={dateTime}
      /></> : <SalesProspectKanban prospects={prospects} stageTones={stageTones} onOpen={onOpen} onStage={onStage} formatMoney={money} formatDateTime={dateTime}/>}
  </section>;
}
