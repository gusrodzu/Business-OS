import {BulkActionsBar} from '../../../../ux-foundation/UXFoundation';
import SalesProspectWorkspaceControls from './SalesProspectWorkspaceControls';
import SalesProspectMobileList from './SalesProspectMobileList';
import SalesProspectTable from './SalesProspectTable';
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
  const allVisibleSelected = Boolean(prospects.length) && prospects.every((item) => selectedIds.includes(item.id));
  const toggleAll = (checked) => setSelectedIds(checked ? prospects.map((item) => item.id) : []);
  const toggleOne = (id, checked) => setSelectedIds((current) => checked ? [...new Set([...current,id])] : current.filter((item) => item !== id));

  return <section className={styles.uxWorkspace} data-ux-v19="sales-workspace">
    <SalesProspectWorkspaceControls
      query={query} setQuery={setQuery}
      view={view} setView={setView} counts={counts}
      stageFilter={stageFilter} setStageFilter={setStageFilter}
      mode={mode} setMode={setMode}
    />
    <BulkActionsBar count={selectedIds.length} onClear={() => setSelectedIds([])}>
      <button type="button" onClick={() => onBulkStage('QUALIFIED')}>Marcar calificadas</button>
      <button type="button" onClick={() => onBulkStage('WON')}>Marcar ganadas</button>
    </BulkActionsBar>
    {mode === 'table' ? <><SalesProspectTable prospects={prospects} selectedIds={selectedIds} allVisibleSelected={allVisibleSelected} onToggleAll={toggleAll} onToggleOne={toggleOne} onOpen={onOpen} onClear={() => {setQuery('');setStageFilter('');setView('all')}} emptyQuery={query || stageFilter || view} stageTones={stageTones} formatMoney={money} formatDateTime={dateTime}/>
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
