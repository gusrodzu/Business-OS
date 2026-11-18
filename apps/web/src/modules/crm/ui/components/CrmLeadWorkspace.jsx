import {CalendarClock, UserPlus} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import {BulkActionsBar, FilterBar, NoResultsState, SavedViews, SmartTable} from '../../../../ux-foundation/UXFoundation';
import CrmLeadMobileList from './CrmLeadMobileList';
import styles from './CrmLeadWorkspace.module.css';

export default function CrmLeadWorkspace({prospects, query, setQuery, view, setView, counts, stageFilter, setStageFilter, selectedIds, setSelectedIds, onBulkStage, onOpen, onActivity, onConvert, stages, stageTone, money, dateTime, initials, isConverted}) {
  const views=[
    {id:'all',label:'Todos',count:counts.all},
    {id:'open',label:'Abiertos',count:counts.open},
    {id:'hot',label:'Alta probabilidad',count:counts.hot},
    {id:'followup',label:'Con seguimiento',count:counts.followup},
    {id:'won',label:'Ganados',count:counts.won},
  ];
  const allSelected=Boolean(prospects.length)&&prospects.every(item=>selectedIds.includes(item.id));
  return <section className={styles.uxLeadWorkspace} data-ux-v19="crm-leads">
    <SavedViews active={view} onChange={setView} items={views}/>
    <FilterBar query={query} onQueryChange={setQuery} placeholder="Buscar lead, empresa, correo, teléfono o fuente" chips={[{id:'stage',active:Boolean(stageFilter),label:`Etapa: ${stages.find(item=>item.id===stageFilter)?.label||stageFilter}`,onRemove:()=>setStageFilter('')}]} onClear={()=>{setQuery('');setStageFilter('');setView('all')}}>
      <select value={stageFilter} onChange={event=>setStageFilter(event.target.value)} aria-label="Filtrar etapa"><option value="">Todas las etapas</option>{stages.map(stage=><option key={stage.id} value={stage.id}>{stage.label}</option>)}</select>
    </FilterBar>
    <BulkActionsBar count={selectedIds.length} onClear={()=>setSelectedIds([])}><button type="button" onClick={()=>onBulkStage('QUALIFIED')}>Marcar calificadas</button><button type="button" onClick={()=>onBulkStage('WON')}>Marcar ganadas</button></BulkActionsBar>
    <CrmLeadMobileList
      prospects={prospects}
      selectedIds={selectedIds}
      onSelectionChange={(id, checked) => setSelectedIds(ids => checked
        ? [...new Set([...ids, id])]
        : ids.filter(current => current !== id))}
      onOpen={onOpen}
      onActivity={onActivity}
      onConvert={onConvert}
      isConverted={isConverted}
      stageTone={stageTone}
      stages={stages}
      formatMoney={money}
      formatDateTime={dateTime}
      emptyQuery={query || stageFilter || view}
      onClear={() => {setQuery('');setStageFilter('');setView('all')}}
    />
    <div className={styles.desktopLeadTable}>
    <SmartTable selectedCount={selectedIds.length} footer={<><span>{prospects.length} oportunidades visibles</span><span>{selectedIds.length?`${selectedIds.length} seleccionadas`:'Abre una fila para ver contexto'}</span></>}>
      {prospects.length?<table><thead><tr><th className={styles.uxCheck}><input type="checkbox" aria-label="Seleccionar todas" checked={allSelected} onChange={event=>setSelectedIds(event.target.checked?prospects.map(item=>item.id):[])}/></th><th>Contacto</th><th>Empresa</th><th>Etapa</th><th>Valor</th><th>Probabilidad</th><th>Próximo paso</th><th>Acciones</th></tr></thead><tbody>
        {prospects.map(item=><tr key={item.id} onClick={()=>onOpen(item)} className={styles.uxClickableRow}>
          <td className={styles.uxCheck} onClick={event=>event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={event=>setSelectedIds(ids=>event.target.checked?[...new Set([...ids,item.id])]:ids.filter(id=>id!==item.id))}/></td>
          <td><div className={styles.uxContact}><span>{initials(item.name)}</span><div><strong>{item.name}</strong><small>{item.email||item.phone||'Sin contacto'}</small></div></div></td><td>{item.companyName||'—'}</td><td><Badge tone={stageTone[item.stage]}>{stages.find(stage=>stage.id===item.stage)?.label}</Badge></td><td><strong>{money(item.estimatedValue)}</strong></td><td>{item.probability}%</td><td>{item.nextActionAt?dateTime(item.nextActionAt):'Sin fecha'}</td>
          <td onClick={event=>event.stopPropagation()}><div className={styles.rowActions}><button type="button" title="Registrar seguimiento" onClick={()=>onActivity(item)}><CalendarClock size={16}/></button>{item.stage==='WON'&&!isConverted(item)?<button type="button" title="Convertir a cliente" onClick={()=>onConvert(item)}><UserPlus size={16}/></button>:null}</div></td>
        </tr>)}
      </tbody></table>:<NoResultsState query={query||stageFilter||view} onClear={()=>{setQuery('');setStageFilter('');setView('all')}}/>}
    </SmartTable>
    </div>
  </section>;
}


