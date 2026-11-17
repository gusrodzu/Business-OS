import {FilterBar, SavedViews} from '../../../../ux-foundation/UXFoundation';
import {stages} from '../../utils/prospectStages';
import styles from './SalesProspectWorkspaceControls.module.css';

export default function SalesProspectWorkspaceControls({
  query, setQuery, view, setView, counts,
  stageFilter, setStageFilter, mode, setMode,
}) {
  const views = [
    {id:'all', label:'Todas', count:counts.all},
    {id:'hot', label:'Alta probabilidad', count:counts.hot},
    {id:'followup', label:'Con seguimiento', count:counts.followup},
    {id:'overdue', label:'Vencidas', count:counts.overdue},
    {id:'won', label:'Ganadas', count:counts.won},
  ];
  const clearFilters = () => {
    setQuery('');
    setStageFilter('');
    setView('all');
  };

  return <>
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
      onClear={clearFilters}
    >
      <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} aria-label="Filtrar por etapa">
        <option value="">Todas las etapas</option>
        {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
      </select>
    </FilterBar>
  </>;
}
