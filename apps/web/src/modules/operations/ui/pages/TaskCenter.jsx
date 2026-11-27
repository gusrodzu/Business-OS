import {useNotify,StatusMessage} from '../../../../design-system/components/StatusNotifications';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Inbox,
  PackageX,
  RefreshCw,
  ShieldCheck,
  XCircle,
  X,
  ClipboardList,
  Layers,
  MessageSquare,
  Link2,
  Tag,
  Clock3,
  Flag,
  Coins,
  ArrowDownWideNarrow,
} from 'lucide-react';
import {operationsRequest as apiRequest} from '../../services/operationsApi';
import {Badge, Button} from '../../../../design-system/components';
import {
  EmptyState,
  EntityDrawer,
  FilterBar,
  InlineErrorState,
  PageHeader,
  PageSkeleton,
} from '../../../../ux-foundation/UXFoundation';
import styles from './TaskCenter.module.css';
import AppNavigationRail from '../../../../layout/os/primitives/AppNavigationRail';

const taskTypes={PURCHASE_REQUEST:"Solicitud de compra",EXPENSE:"Gasto",PURCHASE_ORDER:"Orden de compra",PAYMENT:"Pago",INVOICE:"Factura"};
const statusLabels={PENDING:"Pendiente",OPEN:"Abierta",APPROVED:"Aprobada",REJECTED:"Rechazada",COMPLETED:"Completada"};
const priorityLabels={normal:"Normal",high:"Alta",critical:"Crítica"};
const viewLabels={mine:"Mi bandeja",approvals:"Aprobaciones",critical:"Críticas",next:"No críticas"};
const summaryViews=[{key:"mine",Icon:Inbox,tone:"iconBlue"},{key:"approvals",Icon:ShieldCheck,tone:"iconViolet"},{key:"critical",Icon:AlertTriangle,tone:"iconRed"},{key:"next",Icon:CalendarClock,tone:"iconAmber"}];
const normalize=value=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es-MX");
const money = (value, currency='MXN') => new Intl.NumberFormat('es-MX', {style:'currency', currency, maximumFractionDigits:0}).format(Number(value || 0));
const formatDate = (value) => value ? new Intl.DateTimeFormat('es-MX', {dateStyle:'medium', timeStyle:'short'}).format(new Date(value)) : '—';

function priorityFromRequest(request) {
  const title = `${request?.title || ''} ${request?.description || ''}`.toLowerCase();
  if (title.includes('urgente') || title.includes('vencid')) return 'critical';
  if (request?.amount && Number(request.amount) >= 50000) return 'high';
  return 'normal';
}

export default function TaskCenter() {
  const navigate = useNavigate();
  const {notify,confirm} = useNotify();
  const [data, setData] = useState({workflows:[], requests:[], inbox:[], requestedByMe:[], summary:{}});
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized,setInitialized]=useState(false);
  const [sort,setSort]=useState('inbox');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('mine');
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [decisionError, setDecisionError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const [approvalData, dashboardData] = await Promise.all([
        apiRequest('/approvals/dashboard'),
        apiRequest('/dashboard').catch(() => null),
      ]);
      setData(approvalData || {workflows:[],requests:[],inbox:[],requestedByMe:[],summary:{}});
      setDashboard(dashboardData);
    } catch (err) {
      setError(err.message || 'No fue posible cargar las tareas.');
    } finally { setLoading(false); setInitialized(true); }
  }

  useEffect(() => { load(); }, []);

  const approvalTasks = useMemo(() => (data.inbox || []).map((request) => ({
    id: `approval:${request.id}`,
    kind: 'approval',
    source: request,
    title: request.title || request.entityFolio || 'Solicitud por aprobar',
    subtitle: request.description || request.workflow?.name || 'Aprobación pendiente',
    reference: request.entityFolio || taskTypes[request.entityType] || 'Aprobación',
    category: taskTypes[request.entityType] || 'Aprobación',
    rawType: request.entityType,
    priority: priorityFromRequest(request),
    dueLabel: 'Requiere decisión',
    date: request.requestedAt,
    status: request.status || 'PENDING',
    route: request.entityType?.includes('PURCHASE') ? '/compras/solicitudes' : '/aprobaciones',
  })), [data.inbox]);

  const stockTasks = useMemo(() => (dashboard?.criticalProducts || []).slice(0, 6).map((item, index) => ({
    id: `stock:${item.sku || index}`,
    kind: 'inventory',
    source: item,
    title: `Revisar stock de ${item.name}`,
    subtitle: `${item.warehouse || 'Almacén'} · Actual ${item.stock ?? 0} / mínimo ${item.min ?? 0}`,
    reference: item.sku || 'Inventario',
    category: 'Inventario',
    priority: Number(item.stock || 0) <= 0 ? 'critical' : 'high',
    dueLabel: 'Atender hoy',
    status: 'OPEN',
    route: '/inventario/existencias',
  })), [dashboard]);

  const allTasks = useMemo(() => [...approvalTasks, ...stockTasks], [approvalTasks, stockTasks]);
  // Summary counts and the unsearched result list share a single collection.
  const groups = useMemo(() => ({
    mine: allTasks,
    approvals: approvalTasks,
    critical: allTasks.filter(item=>item.priority==='critical'),
    next: allTasks.filter(item=>item.priority!=='critical'),
  }), [allTasks,approvalTasks]);
  const counts = Object.fromEntries(Object.entries(groups).map(([key,rows])=>[key,rows.length]));
  const filtered = useMemo(() => {
    const q=normalize(query).trim();
    const rows=groups[view].filter(item=>!q||normalize([item.title,item.subtitle,item.reference,item.category,item.rawType,statusLabels[item.status],priorityLabels[item.priority]].join(' ')).includes(q));
    const rank={critical:0,high:1,normal:2};
    if(sort==='priority')return [...rows].sort((a,b)=>rank[a.priority]-rank[b.priority]);
    if(sort==='category')return [...rows].sort((a,b)=>a.category.localeCompare(b.category,'es')||a.title.localeCompare(b.title,'es'));
    return rows;
  },[groups,query,view,sort]);
  function selectView(next){setView(next);setQuery('');}

  async function decide(action) {
    const request = selected?.source;
    if (saving || !request?.id || selected.kind !== 'approval' || request.status !== 'PENDING') return;
    setSaving(true); setDecisionError('');
    try {
      const approving=action==='approve';
      const accepted=await confirm({type:approving?'info':'warning',title:approving?'¿Aprobar esta solicitud?':'¿Rechazar esta solicitud?',message:selected.title,confirmLabel:approving?'Aprobar solicitud':'Rechazar solicitud'});
      if(!accepted)return;
      await apiRequest(`/approvals/requests/${request.id}/${action}`, {method:'POST', body:{comment: comment || null}});
      notify({type:'success',title:action === 'approve' ? 'Solicitud aprobada' : 'Solicitud rechazada'});
      setSelected(null); setComment(''); await load();
    } catch (err) { setDecisionError(err.message || 'No fue posible completar la decisión.'); }
    finally { setSaving(false); }
  }

  if (loading&&!initialized) return <div className={styles.page}><PageSkeleton rows={6}/></div>;

  return <div className={styles.page} data-ux-v19="task-center">
    <div className={styles.legacyHeader}><PageHeader
      breadcrumbs={['Trabajo', 'Centro de tareas']}
      title="Centro de tareas"
      description="Trabajo que requiere atención: aprobaciones, alertas e inventario."
      favorite={{path:'/tareas', label:'Tareas'}}
      status={<span className={styles.statusPill}><span/> {counts.critical ? `${counts.critical} crítico${counts.critical === 1 ? '' : 's'}` : 'Todo bajo control'}</span>}
      actions={<Button variant="secondary" icon={RefreshCw} onClick={load}>Actualizar</Button>}
    /></div>

    {error ? <InlineErrorState message={error} onRetry={load}/> : null}
    

    <div className={styles.navigationWorkspace}>
    <AppNavigationRail label="Navegación de Tareas" active={view} onChange={selectView} items={summaryViews.map(({key,Icon})=>({id:key,label:viewLabels[key],Icon,count:counts[key]}))}/>
    <div className={styles.navigationContent}><div className={styles.taskLayout} data-task-center="true">
    <aside className={styles.taskSidebar} aria-label="Resumen de trabajo">
      <div className={styles.inboxIdentity}><span className={styles.inboxGlyph}><ClipboardList size={20} aria-hidden="true"/></span><div><h2>Mi trabajo</h2><p>Centro de tareas</p></div></div>
    <div className={styles.sidebarOverview} aria-label="Resumen operativo">
      <span className={styles.navCaption}>RESUMEN OPERATIVO</span>
      <div className={styles.overviewTotal}><strong>{counts.mine}</strong><span>Tareas en la bandeja</span></div>
      <div className={styles.overviewLine}><span>Requieren aprobación</span><strong>{counts.approvals}</strong></div>
      <div className={styles.overviewLine}><span>Alertas de inventario</span><strong>{stockTasks.length}</strong></div>
      <div className={styles.overviewLine}><span>Prioridad crítica</span><strong>{counts.critical}</strong></div>
    </div>
    </aside>

    <section className={styles.workspace} aria-label={viewLabels[view]}>
      <header className={styles.workspaceHead}>
        <div><span className={styles.workspaceEyebrow}>CENTRO DE TAREAS</span><h2>{viewLabels[view]}</h2><p role="status" data-task-result-count={filtered.length}>{filtered.length} {filtered.length===1?'tarea':'tareas'}{query.trim()?' de '+counts[view]+' en esta vista':' en esta vista'}</p></div>
        <Button variant="secondary" icon={RefreshCw} disabled={loading||saving} onClick={load}>{loading?'Actualizando…':'Actualizar'}</Button>
      </header>
      <div className={styles.inboxToolbar}>
        <FilterBar query={query} onQueryChange={setQuery} placeholder="Buscar por folio, tarea o proceso…"/>
        <label className={styles.sortControl}><ArrowDownWideNarrow size={17} aria-hidden="true"/><span>Ordenar</span><select aria-label="Ordenar tareas" value={sort} onChange={e=>setSort(e.target.value)}><option value="inbox">Bandeja</option><option value="priority">Prioridad</option><option value="category">Categoría</option></select></label>
      </div>
      {view!=='mine'?<div className={styles.filterNotice}><span>Filtro: <strong>{viewLabels[view]}</strong></span><button type="button" onClick={()=>selectView('mine')}><X size={15} aria-hidden="true"/> Quitar filtro</button></div>:null}
      <div className={styles.listHead} aria-hidden="true"><span>Actividad</span><span>Estado y atención</span></div>
      <div className={styles.taskList} data-task-list="true" aria-busy={loading}>
        {!filtered.length ? <EmptyState title={query.trim()?"No encontramos tareas":"No hay tareas en esta vista"} description={query.trim()?"Prueba con otra búsqueda.":"Selecciona otra vista del menú lateral o vuelve a Mi bandeja."} action={query.trim()?{label:"Limpiar búsqueda",onClick:()=>setQuery("")}:view!=='mine'?{label:"Ver todas",onClick:()=>selectView('mine')}:undefined}/> : filtered.map((task) => (
          <button type="button" key={task.id} data-task-record={task.id} data-priority={task.priority} data-kind={task.kind} className={styles.taskRow} onClick={() => {setSelected(task); setComment(''); setDecisionError('');}}>
            <span className={`${styles.taskIcon} ${styles[`priority_${task.priority}`]}`}>{task.kind === 'approval' ? <FileCheck2 size={18}/> : <PackageX size={18}/>}</span>
            <div className={styles.taskMain}><div><strong>{task.category}{task.reference!==task.category && task.reference!==task.title ? ` · ${task.reference}` : ''}</strong>{task.priority === 'critical' ? <Badge tone="danger">Crítica</Badge> : task.priority === 'high' ? <Badge tone="warning">Alta</Badge> : <Badge tone="info">Normal</Badge>}</div><h3>{task.title}</h3><p>{task.subtitle}</p></div>
            <div className={styles.taskDue}><strong>{task.dueLabel}</strong><small className={styles.taskStatus}>{statusLabels[task.status]||'Pendiente'}</small>{task.date&&<small>{formatDate(task.date)}</small>}</div>
            <ChevronRight size={18}/>
          </button>
        ))}
      </div>
    </section>
    </div></div></div>

    <EntityDrawer
      open={Boolean(selected)}
      presentation="centered"
      closeDisabled={saving}
      leadingIcon={selected?.kind==='approval'?FileCheck2:PackageX}
      onClose={() => {if(!saving)setSelected(null);}}
      eyebrow={selected?.kind === 'approval' ? 'Aprobación' : 'Inventario'}
      title={selected?.title}
      subtitle={selected?.reference}
      status={selected ? <><Badge tone={selected.status==='PENDING'?'warning':selected.status==='APPROVED'||selected.status==='COMPLETED'?'success':selected.status==='REJECTED'?'danger':'neutral'}>{statusLabels[selected.status]||selected.status}</Badge><Badge tone={selected.priority==='critical'?'danger':selected.priority==='high'?'warning':'info'}>{priorityLabels[selected.priority]}</Badge></> : null}
      footer={<div className={styles.detailActions} data-task-detail-actions="true">
        <button type="button" data-task-action="cancel" disabled={saving} onClick={()=>setSelected(null)}>Cancelar</button>
        <div className={styles.decisionActions}>
          {selected?.kind==='approval'&&selected?.source?.status==='PENDING'?<>
            <button type="button" data-task-action="reject" disabled={saving} onClick={()=>decide('reject')}><XCircle size={17} aria-hidden="true"/>Rechazar</button>
            <button type="button" data-task-action="approve" disabled={saving} onClick={()=>decide('approve')}><CheckCircle2 size={17} aria-hidden="true"/>Aprobar</button>
          </>:<button type="button" data-task-action="approve" disabled={saving} onClick={()=>{navigate(selected?.route||'/');setSelected(null);}}>Abrir módulo</button>}
        </div>
      </div>}
    >
      {selected ? <div className={styles.drawerContent}>
        {decisionError ? <StatusMessage type="error" title="No se pudo completar la decisión" message={decisionError} onDismiss={()=>setDecisionError('')}/> : null}
        <section><h3><ClipboardList size={18} aria-hidden="true"/>Resumen</h3><dl>
          <div><Tag size={19} aria-hidden="true"/><div><dt>Referencia</dt><dd>{selected.reference}</dd></div></div>
          <div><Clock3 size={19} aria-hidden="true"/><div><dt>Estado</dt><dd>{statusLabels[selected.status]||selected.status}</dd></div></div>
          <div><Flag size={19} aria-hidden="true"/><div><dt>Prioridad</dt><dd>{priorityLabels[selected.priority]||selected.priority}</dd></div></div>
          {selected.source?.amount!=null?<div><Coins size={19} aria-hidden="true"/><div><dt>Importe</dt><dd>{money(selected.source.amount,selected.source.currency)}</dd></div></div>:null}
        </dl></section>
        <section><h3><Layers size={18} aria-hidden="true"/>Contexto</h3><p>{selected.subtitle}</p></section>
        {selected.kind === 'approval' && selected.source?.status === 'PENDING' ? <section><h3><MessageSquare size={18} aria-hidden="true"/>Comentario de decisión</h3><label className={styles.commentField}>Comentario opcional<textarea rows={3} value={comment} disabled={saving} placeholder="Agrega un comentario sobre tu decisión…" onChange={event=>setComment(event.target.value)}/></label></section> : null}
        <button type="button" className={styles.openModule} disabled={saving} onClick={() => {navigate(selected.route); setSelected(null);}}><Link2 size={18} aria-hidden="true"/><span>Ver registro relacionado</span><ChevronRight size={16} aria-hidden="true"/></button>
      </div> : null}
    </EntityDrawer>
  </div>;
}
