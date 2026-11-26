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
} from 'lucide-react';
import {operationsRequest as apiRequest} from '../../services/operationsApi';
import {Badge, Button, Input} from '../../../../design-system/components';
import {
  EmptyState,
  EntityDrawer,
  FilterBar,
  InlineErrorState,
  PageHeader,
  PageSkeleton,
} from '../../../../ux-foundation/UXFoundation';
import styles from './TaskCenter.module.css';

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
    } finally { setLoading(false); }
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
    return groups[view].filter(item=>!q||normalize([item.title,item.subtitle,item.reference,item.category,item.rawType,statusLabels[item.status],priorityLabels[item.priority]].join(' ')).includes(q));
  },[groups,query,view]);
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

  if (loading) return <div className={styles.page}><PageSkeleton rows={6}/></div>;

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
    

    <div className={styles.taskLayout} data-task-center="true">
    <aside className={styles.taskSidebar} aria-label="Vistas de tareas">
      <h2>Mi trabajo</h2>
    <section className={styles.summaryGrid} aria-label="Resumen de tareas">
      {summaryViews.map(({key,Icon,tone})=><button key={key} type="button" data-task-filter={key} data-attention={key==='critical'&&counts.critical>0} aria-pressed={view===key} onClick={()=>selectView(key)} className={view===key?styles.summaryActive:''}>
        <span className={styles[tone]}><Icon size={17} aria-hidden="true"/></span>
        <span className={styles.summaryLabel}>{viewLabels[key]}</span>
        <strong>{counts[key]}</strong>
        <ChevronRight size={14} aria-hidden="true"/>
      </button>)}
    </section>
    </aside>

    <section className={styles.workspace} aria-label={viewLabels[view]}>
      <header className={styles.workspaceHead}>
        <div><h2>{viewLabels[view]}</h2><p role="status" data-task-result-count={filtered.length}>{filtered.length} {filtered.length===1?'tarea':'tareas'}{query.trim()?' de '+counts[view]+' en esta vista':' en esta vista'}</p></div>
        <Button variant="secondary" icon={RefreshCw} disabled={loading||saving} onClick={load}>Actualizar</Button>
      </header>
      <FilterBar query={query} onQueryChange={setQuery} placeholder="Buscar por folio, tarea o proceso…"/>
      {view!=='mine'?<div className={styles.filterNotice}><span>Filtro: <strong>{viewLabels[view]}</strong></span><button type="button" onClick={()=>selectView('mine')}><X size={15} aria-hidden="true"/> Quitar filtro</button></div>:null}
      <div className={styles.taskList} data-task-list="true">
        {!filtered.length ? <EmptyState title={query.trim()?"No encontramos tareas":"No hay tareas en esta vista"} description={query.trim()?"Prueba con otra búsqueda.":"Selecciona otro bloque del resumen o vuelve a Mi bandeja."} action={query.trim()?{label:"Limpiar búsqueda",onClick:()=>setQuery("")}:view!=='mine'?{label:"Ver todas",onClick:()=>selectView('mine')}:undefined}/> : filtered.map((task) => (
          <button type="button" key={task.id} data-task-record={task.id} className={styles.taskRow} onClick={() => {setSelected(task); setComment(''); setDecisionError('');}}>
            <span className={`${styles.taskIcon} ${styles[`priority_${task.priority}`]}`}>{task.kind === 'approval' ? <FileCheck2 size={18}/> : <PackageX size={18}/>}</span>
            <div className={styles.taskMain}><div><strong>{task.category}{task.reference!==task.category && task.reference!==task.title ? ` · ${task.reference}` : ''}</strong>{task.priority === 'critical' ? <Badge tone="danger">Crítica</Badge> : task.priority === 'high' ? <Badge tone="warning">Alta</Badge> : <Badge tone="info">Normal</Badge>}</div><h3>{task.title}</h3><p>{task.subtitle}</p></div>
            <div className={styles.taskDue}><strong>{task.dueLabel}</strong><small>{task.date ? formatDate(task.date) : statusLabels[task.status]||'Pendiente'}</small></div>
            <ChevronRight size={18}/>
          </button>
        ))}
      </div>
    </section>
    </div>

    <EntityDrawer
      open={Boolean(selected)}
      onClose={() => {if(!saving)setSelected(null);}}
      eyebrow={selected?.kind === 'approval' ? 'Aprobación' : 'Inventario'}
      title={selected?.title}
      subtitle={selected?.reference}
      status={selected ? <Badge tone={selected.priority === 'critical' ? 'danger' : selected.priority === 'high' ? 'warning' : 'info'}>{selected.priority === 'critical' ? 'Crítica' : selected.priority === 'high' ? 'Alta' : 'Normal'}</Badge> : null}
      footer={selected?.kind === 'approval' && selected?.source?.status === 'PENDING' ? <><Button variant="secondary" disabled={saving} onClick={() => decide('reject')} icon={XCircle}>Rechazar</Button><Button disabled={saving} onClick={() => decide('approve')} icon={CheckCircle2}>Aprobar</Button></> : <Button onClick={() => {navigate(selected?.route || '/'); setSelected(null);}}>Abrir módulo</Button>}
    >
      {selected ? <div className={styles.drawerContent}>
        {decisionError ? <StatusMessage type="error" title="No se pudo completar la decisión" message={decisionError} onDismiss={()=>setDecisionError('')}/> : null}
        <section><h3>Resumen</h3><dl><div><dt>Referencia</dt><dd>{selected.reference}</dd></div><div><dt>Estado</dt><dd>{statusLabels[selected.status] || selected.status}</dd></div><div><dt>Prioridad</dt><dd>{priorityLabels[selected.priority] || selected.priority}</dd></div>{selected.source?.amount != null ? <div><dt>Importe</dt><dd>{money(selected.source.amount, selected.source.currency)}</dd></div> : null}</dl></section>
        <section><h3>Contexto</h3><p>{selected.subtitle}</p></section>
        {selected.kind === 'approval' && selected.source?.status === 'PENDING' ? <section><h3>Comentario de decisión</h3><Input label="Comentario opcional" value={comment} onChange={(event) => setComment(event.target.value)} /></section> : null}
        <button type="button" className={styles.openModule} disabled={saving} onClick={() => {navigate(selected.route); setSelected(null);}}>Ver registro relacionado <ChevronRight size={15}/></button>
      </div> : null}
    </EntityDrawer>
  </div>;
}
