import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  AlertTriangle,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  Inbox,
  PackageX,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {apiRequest} from '../../../../api';
import {Badge, Button, Input} from '../../../../design-system/components';
import {
  EmptyState,
  EntityDrawer,
  FilterBar,
  InlineErrorState,
  PageHeader,
  PageSkeleton,
  SavedViews,
} from '../../../../ux-foundation/UXFoundation';
import styles from './TaskCenter.module.css';

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
  const [data, setData] = useState({workflows:[], requests:[], inbox:[], requestedByMe:[], summary:{}});
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('mine');
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    reference: request.entityFolio || request.entityType || 'Aprobación',
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
    priority: Number(item.stock || 0) <= 0 ? 'critical' : 'high',
    dueLabel: 'Atender hoy',
    status: 'OPEN',
    route: '/inventario/existencias',
  })), [dashboard]);

  const allTasks = useMemo(() => [...approvalTasks, ...stockTasks], [approvalTasks, stockTasks]);
  const filtered = useMemo(() => {
    let rows = allTasks;
    if (view === 'approvals') rows = rows.filter((item) => item.kind === 'approval');
    if (view === 'critical') rows = rows.filter((item) => item.priority === 'critical');
    if (view === 'next') rows = rows.filter((item) => item.priority !== 'critical');
    const q = query.trim().toLowerCase();
    if (q) rows = rows.filter((item) => `${item.title} ${item.subtitle} ${item.reference}`.toLowerCase().includes(q));
    return rows;
  }, [allTasks, query, view]);

  const counts = useMemo(() => ({
    mine: allTasks.length,
    approvals: approvalTasks.length,
    critical: allTasks.filter((item) => item.priority === 'critical').length,
    next: allTasks.filter((item) => item.priority !== 'critical').length,
  }), [allTasks, approvalTasks]);

  async function decide(action) {
    const request = selected?.source;
    if (!request?.id || selected.kind !== 'approval') return;
    setSaving(true); setMessage('');
    try {
      await apiRequest(`/approvals/requests/${request.id}/${action}`, {method:'POST', body:{comment: comment || null}});
      setMessage(action === 'approve' ? 'Solicitud aprobada.' : 'Solicitud rechazada.');
      setSelected(null); setComment(''); await load();
    } catch (err) { setMessage(err.message || 'No fue posible completar la decisión.'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className={styles.page}><PageSkeleton rows={6}/></div>;

  return <div className={styles.page} data-ux-v19="task-center">
    <PageHeader
      breadcrumbs={['Trabajo', 'Centro de tareas']}
      title="Centro de tareas"
      description="Una bandeja única para aprobaciones, alertas y trabajo que requiere tu atención."
      favorite={{path:'/tareas', label:'Tareas'}}
      status={<span className={styles.statusPill}><span/> {counts.critical ? `${counts.critical} crítico${counts.critical === 1 ? '' : 's'}` : 'Todo bajo control'}</span>}
      actions={<Button variant="secondary" icon={RefreshCw} onClick={load}>Actualizar</Button>}
    />

    {error ? <InlineErrorState message={error} onRetry={load}/> : null}
    {message ? <div className={styles.flash}>{message}</div> : null}

    <section className={styles.summaryGrid}>
      <button onClick={() => setView('mine')} className={view === 'mine' ? styles.summaryActive : ''}><span className={styles.iconBlue}><Inbox size={19}/></span><div><strong>{counts.mine}</strong><small>Asignadas a mí</small></div><ChevronRight size={16}/></button>
      <button onClick={() => setView('approvals')} className={view === 'approvals' ? styles.summaryActive : ''}><span className={styles.iconViolet}><ShieldCheck size={19}/></span><div><strong>{counts.approvals}</strong><small>Aprobaciones</small></div><ChevronRight size={16}/></button>
      <button onClick={() => setView('critical')} className={view === 'critical' ? styles.summaryActive : ''}><span className={styles.iconRed}><AlertTriangle size={19}/></span><div><strong>{counts.critical}</strong><small>Críticas</small></div><ChevronRight size={16}/></button>
      <button onClick={() => setView('next')} className={view === 'next' ? styles.summaryActive : ''}><span className={styles.iconAmber}><CalendarClock size={19}/></span><div><strong>{counts.next}</strong><small>Próximas</small></div><ChevronRight size={16}/></button>
    </section>

    <section className={styles.workspace}>
      <header className={styles.workspaceHead}>
        <div><span>PRIORIDAD OPERATIVA</span><h2>Trabajo que requiere atención</h2><p>Resuelve primero lo importante y conserva el contexto del proceso.</p></div>
        <SavedViews active={view} onChange={setView} items={[
          {id:'mine',label:'Todas',count:counts.mine,icon:Inbox},
          {id:'approvals',label:'Aprobaciones',count:counts.approvals,icon:FileCheck2},
          {id:'critical',label:'Críticas',count:counts.critical,icon:AlertTriangle},
          {id:'next',label:'Próximas',count:counts.next,icon:Clock3},
        ]}/>
      </header>
      <FilterBar query={query} onQueryChange={setQuery} placeholder="Buscar por folio, tarea o proceso…"/>
      <div className={styles.taskList}>
        {!filtered.length ? <EmptyState title="No hay tareas en esta vista" description="Cuando aparezca trabajo pendiente lo verás aquí."/> : filtered.map((task) => (
          <button type="button" key={task.id} className={styles.taskRow} onClick={() => {setSelected(task); setComment('');}}>
            <span className={`${styles.taskIcon} ${styles[`priority_${task.priority}`]}`}>{task.kind === 'approval' ? <FileCheck2 size={18}/> : <PackageX size={18}/>}</span>
            <div className={styles.taskMain}><div><strong>{task.reference}</strong>{task.priority === 'critical' ? <Badge tone="danger">Crítica</Badge> : task.priority === 'high' ? <Badge tone="warning">Alta</Badge> : <Badge tone="info">Normal</Badge>}</div><h3>{task.title}</h3><p>{task.subtitle}</p></div>
            <div className={styles.taskDue}><strong>{task.dueLabel}</strong><small>{task.date ? formatDate(task.date) : 'Pendiente'}</small></div>
            <ChevronRight size={18}/>
          </button>
        ))}
      </div>
    </section>

    <EntityDrawer
      open={Boolean(selected)}
      onClose={() => setSelected(null)}
      eyebrow={selected?.kind === 'approval' ? 'Aprobación' : 'Inventario'}
      title={selected?.title}
      subtitle={selected?.reference}
      status={selected ? <Badge tone={selected.priority === 'critical' ? 'danger' : selected.priority === 'high' ? 'warning' : 'info'}>{selected.priority === 'critical' ? 'Crítica' : selected.priority === 'high' ? 'Alta' : 'Normal'}</Badge> : null}
      tabs={[{id:'detail',label:'Detalle'},{id:'activity',label:'Actividad'}]}
      activeTab="detail"
      footer={selected?.kind === 'approval' && selected?.source?.status === 'PENDING' ? <><Button variant="secondary" disabled={saving} onClick={() => decide('reject')} icon={XCircle}>Rechazar</Button><Button disabled={saving} onClick={() => decide('approve')} icon={CheckCircle2}>Aprobar</Button></> : <Button onClick={() => {navigate(selected?.route || '/'); setSelected(null);}}>Abrir módulo</Button>}
    >
      {selected ? <div className={styles.drawerContent}>
        <section><h3>Resumen</h3><dl><div><dt>Referencia</dt><dd>{selected.reference}</dd></div><div><dt>Estado</dt><dd>{selected.status}</dd></div><div><dt>Prioridad</dt><dd>{selected.priority}</dd></div>{selected.source?.amount != null ? <div><dt>Importe</dt><dd>{money(selected.source.amount, selected.source.currency)}</dd></div> : null}</dl></section>
        <section><h3>Contexto</h3><p>{selected.subtitle}</p></section>
        {selected.kind === 'approval' && selected.source?.status === 'PENDING' ? <section><h3>Comentario de decisión</h3><Input label="Comentario opcional" value={comment} onChange={(event) => setComment(event.target.value)} /></section> : null}
        <button type="button" className={styles.openModule} onClick={() => {navigate(selected.route); setSelected(null);}}>Ver registro relacionado <ChevronRight size={15}/></button>
      </div> : null}
    </EntityDrawer>
  </div>;
}
