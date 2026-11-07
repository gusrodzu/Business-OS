import {useEffect, useState} from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDollarSign,
  LayoutDashboard,
  ListTodo,
  Plus,
  Search,
  Target,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {crmRequest as apiRequest} from '../../services/crmApi';
import {LeadModal, ActivityModal, ConversionModal} from '../components/CrmDialogs';
import CrmOverviewKpis from '../components/CrmOverviewKpis';
import CrmLeadMobileList from '../components/CrmLeadMobileList';
import CrmActivities from '../components/CrmActivities';
import CrmLeadWorkspace from '../components/CrmLeadWorkspace';
import CrmProspectDetailDrawer from '../components/CrmProspectDetailDrawer';
import useCrmLeadView from '../hooks/useCrmLeadView';
import {Badge, Button, Card} from '../../../../design-system/components';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import {ModuleTabs} from '../../../../components/module-system';
import {BulkActionsBar, FilterBar, NoResultsState, PageHeader, PageSkeleton, SavedViews, SmartTable} from '../../../../ux-foundation/UXFoundation';
import styles from './Crm.module.css';
import {getCrmOverviewMetrics} from '../utils/crmOverviewMetrics';

const stages = [
  {id: 'LEAD', label: 'Lead'},
  {id: 'CONTACTED', label: 'Contactado'},
  {id: 'QUALIFIED', label: 'Calificado'},
  {id: 'PROPOSAL', label: 'Propuesta'},
  {id: 'WON', label: 'Ganado'},
  {id: 'LOST', label: 'Perdido'},
];

const stageTone = {
  LEAD: 'neutral',
  CONTACTED: 'info',
  QUALIFIED: 'warning',
  PROPOSAL: 'warning',
  WON: 'success',
  LOST: 'danger',
};

const activityTypeLabel = {
  NOTE: 'Nota',
  CALL: 'Llamada',
  EMAIL: 'Correo',
  MEETING: 'Reunión',
  TASK: 'Tarea',
  STATUS_CHANGE: 'Cambio de etapa',
};

const blankLead = () => ({
  name: '',
  companyName: '',
  email: '',
  phone: '',
  stage: 'LEAD',
  estimatedValue: '',
  probability: 10,
  source: '',
  nextActionAt: '',
  notes: '',
});

const blankActivity = (prospectId = '') => ({
  prospectId,
  type: 'TASK',
  title: '',
  description: '',
  dueAt: '',
});

const money = (value) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const dateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Sin fecha';

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function isConverted(prospect) {
  return prospect.activities?.some(
    (activity) => activity.customerId && activity.title === 'Prospecto convertido a cliente',
  );
}

export default function Crm() {
  const [tab, setTab] = useState('overview');
  const [dashboard, setDashboard] = useState({
    summary: {},
    pipeline: [],
    prospects: [],
    activities: [],
  });
  const [prospects, setProspects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [leadView, setLeadView] = useState('all');
  const [stageFilter, setStageFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [drawerTab, setDrawerTab] = useState('summary');
  const [leadModal, setLeadModal] = useState(null);
  const [activityModal, setActivityModal] = useState(null);
  const [conversionModal, setConversionModal] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [crmData, prospectData, customerData] = await Promise.all([
        apiRequest('/sales-enterprise/dashboard'),
        apiRequest('/sales-enterprise/prospects'),
        apiRequest('/customers'),
      ]);
      setDashboard(crmData);
      setProspects(prospectData.prospects || []);
      setCustomers(customerData.customers || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch((error) => {
      setMessage(['error', error.message]);
      setLoading(false);
    });
  }, []);

  const {openProspects, weightedPipeline, won, lost, winRate, overdueActivities, pendingActivities, thisMonthLeads} = getCrmOverviewMetrics(prospects, dashboard.activities);

  const {filteredProspects, leadCounts} = useCrmLeadView({prospects, query, leadView, stageFilter});

  const pipelineValue = stages.reduce((acc, stage) => {
    acc[stage.id] = prospects
      .filter((item) => item.stage === stage.id)
      .reduce((sum, item) => sum + Number(item.estimatedValue || 0), 0);
    return acc;
  }, {});

  async function saveLead(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const editing = Boolean(leadModal.id);
      await apiRequest(
        editing
          ? `/sales-enterprise/prospects/${leadModal.id}`
          : '/sales-enterprise/prospects',
        {
          method: editing ? 'PUT' : 'POST',
          body: {
            ...leadModal,
            estimatedValue: Number(leadModal.estimatedValue || 0),
            probability: Number(leadModal.probability || 0),
            companyName: leadModal.companyName || null,
            email: leadModal.email || null,
            phone: leadModal.phone || null,
            source: leadModal.source || null,
            nextActionAt: leadModal.nextActionAt || null,
            notes: leadModal.notes || null,
          },
        },
      );
      setLeadModal(null);
      setMessage(['success', editing ? 'Oportunidad actualizada' : 'Lead creado correctamente']);
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    } finally {
      setSaving(false);
    }
  }

  async function changeStage(prospect, stage) {
    try {
      await apiRequest(`/sales-enterprise/prospects/${prospect.id}/stage`, {
        method: 'PATCH',
        body: {stage},
      });
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    }
  }

  async function bulkChangeStage(stage) {
    const rows = prospects.filter((item) => selectedIds.includes(item.id));
    if (!rows.length) return;
    try {
      await Promise.all(rows.map((item) => apiRequest(`/sales-enterprise/prospects/${item.id}/stage`, {method:'PATCH',body:{stage}})));
      setSelectedIds([]);
      setMessage(['success', `${rows.length} oportunidad${rows.length === 1 ? '' : 'es'} actualizada${rows.length === 1 ? '' : 's'}`]);
      await load();
    } catch (error) { setMessage(['error', error.message]); }
  }

  function editFromDrawer(prospect) {
    setLeadModal({...prospect, estimatedValue:String(prospect.estimatedValue ?? ''), nextActionAt:prospect.nextActionAt ? prospect.nextActionAt.slice(0,16) : ''});
    setSelectedProspect(null);
  }

  async function saveActivity(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/sales-enterprise/activities', {
        method: 'POST',
        body: {
          ...activityModal,
          prospectId: activityModal.prospectId || null,
          description: activityModal.description || null,
          dueAt: activityModal.dueAt || null,
        },
      });
      setActivityModal(null);
      setMessage(['success', 'Seguimiento registrado']);
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActivity(activity) {
    try {
      await apiRequest(`/sales-enterprise/activities/${activity.id}/complete`, {
        method: 'PATCH',
      });
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    }
  }

  function openConversion(prospect) {
    const slug = (prospect.companyName || prospect.name)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 5)
      .toUpperCase();
    setConversionModal({
      prospectId: prospect.id,
      prospectName: prospect.name,
      code: `CRM-${slug || 'CLI'}`,
      legalName: prospect.companyName || prospect.name,
      commercialName: prospect.companyName || '',
      taxId: '',
      contactName: prospect.name,
      email: prospect.email || '',
      phone: prospect.phone || '',
      address: '',
      creditDays: 0,
      creditLimit: 0,
    });
  }

  async function convertProspect(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const {prospectId, prospectName, ...body} = conversionModal;
      const response = await apiRequest(
        `/sales-enterprise/prospects/${prospectId}/convert`,
        {
          method: 'POST',
          body: {
            ...body,
            commercialName: body.commercialName || null,
            taxId: body.taxId || null,
            contactName: body.contactName || null,
            email: body.email || null,
            phone: body.phone || null,
            address: body.address || null,
            creditDays: Number(body.creditDays || 0),
            creditLimit: Number(body.creditLimit || 0),
          },
        },
      );
      setConversionModal(null);
      setMessage([
        'success',
        `${prospectName} se convirtió en el cliente ${response.customer.code}`,
      ]);
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !prospects.length) return <PageSkeleton rows={6}/>;

  return (
    <div className={styles.page}>
      <PageHeader
        breadcrumbs={['Comercial','CRM']}
        title="Centro de relaciones comerciales"
        description="Gestiona leads, oportunidades, seguimientos y conversiones a cliente desde un espacio conectado con Ventas y Finanzas."
        favorite={{path:'/crm',label:'CRM'}}
        actions={<>
          <Button variant="secondary" icon={CalendarClock} onClick={() => setActivityModal(blankActivity())}>Nueva actividad</Button>
          <Button icon={UserPlus} onClick={() => setLeadModal(blankLead())}>Nuevo lead</Button>
        </>}
      />

      {message ? (
        <div className={`${styles.message} ${styles[message[0]]}`}>
          <span>{message[1]}</span>
          <button type="button" onClick={() => setMessage(null)}><X size={16} /></button>
        </div>
      ) : null}

      <ModuleTabs
        active={tab}
        onChange={setTab}
        items={[
          {id:'overview',label:'Resumen',icon:LayoutDashboard},
          {id:'pipeline',label:'Pipeline',icon:Target},
          {id:'leads',label:'Leads y oportunidades',icon:Users},
          {id:'activities',label:'Actividades',icon:ListTodo,count:overdueActivities.length||undefined}
        ]}
      />

      <CrmOverviewKpis
        prospects={prospects}
        openProspects={openProspects}
        weightedPipeline={weightedPipeline}
        winRate={winRate}
        won={won}
        lost={lost}
        thisMonthLeads={thisMonthLeads}
        overdueActivities={overdueActivities}
        pendingActivities={pendingActivities}
      />

      {tab === 'overview' ? (
        <Overview
          prospects={prospects}
          activities={dashboard.activities}
          customers={customers}
          pipelineValue={pipelineValue}
          onOpenPipeline={() => setTab('pipeline')}
          onOpenActivities={() => setTab('activities')}
          onEdit={setLeadModal}
          onConvert={openConversion}
        />
      ) : null}

      {tab === 'pipeline' ? (
        <Pipeline
          prospects={filteredProspects}
          query={query}
          setQuery={setQuery}
          onEdit={setLeadModal}
          onStage={changeStage}
          onActivity={(prospect) => setActivityModal(blankActivity(prospect.id))}
          onConvert={openConversion}
        />
      ) : null}

      {tab === 'leads' ? (
        <CrmLeadWorkspace
          prospects={filteredProspects}
          query={query}
          setQuery={setQuery}
          view={leadView}
          setView={setLeadView}
          counts={leadCounts}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onBulkStage={bulkChangeStage}
          onOpen={(prospect) => {setSelectedProspect(prospect);setDrawerTab('summary')}}
          onActivity={(prospect) => setActivityModal(blankActivity(prospect.id))}
          onConvert={openConversion}
          stages={stages}
          stageTone={stageTone}
          money={money}
          dateTime={dateTime}
          initials={initials}
          isConverted={isConverted}
        />
      ) : null}

      {tab === 'activities' ? (
        <CrmActivities
          activityTypeLabel={activityTypeLabel}
          dateTime={dateTime}
          activities={dashboard.activities}
          prospects={prospects}
          onCreate={() => setActivityModal(blankActivity())}
          onToggle={toggleActivity}
        />
      ) : null}

      <CrmProspectDetailDrawer
        prospect={selectedProspect}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        onClose={() => setSelectedProspect(null)}
        onEdit={editFromDrawer}
        onActivity={(prospect) => {setActivityModal(blankActivity(prospect.id));setSelectedProspect(null);}}
        onConvert={(prospect) => {openConversion(prospect);setSelectedProspect(null);}}
        activities={dashboard.activities}
        stages={stages}
        stageTone={stageTone}
        money={money}
        dateTime={dateTime}
        activityTypeLabel={activityTypeLabel}
        isConverted={isConverted}
      />

      {leadModal ? (
        <LeadModal
          value={leadModal}
          setValue={setLeadModal}
          onClose={() => setLeadModal(null)}
          onSubmit={saveLead}
          saving={saving}
          stages={stages}
        />
      ) : null}

      {activityModal ? (
        <ActivityModal
          value={activityModal}
          setValue={setActivityModal}
          prospects={prospects}
          onClose={() => setActivityModal(null)}
          onSubmit={saveActivity}
          saving={saving}
          activityTypeLabel={activityTypeLabel}
        />
      ) : null}

      {conversionModal ? (
        <ConversionModal
          value={conversionModal}
          setValue={setConversionModal}
          onClose={() => setConversionModal(null)}
          onSubmit={convertProspect}
          saving={saving}
        />
      ) : null}
    </div>
  );
}

function Overview({prospects, activities, customers, pipelineValue, onOpenPipeline, onOpenActivities, onEdit, onConvert}) {
  const open = prospects.filter((item) => !['WON', 'LOST'].includes(item.stage));
  const next = [...open]
    .filter((item) => item.nextActionAt)
    .sort((a, b) => new Date(a.nextActionAt) - new Date(b.nextActionAt))
    .slice(0, 5);
  const recentActivities = activities.slice(0, 6);
  const max = Math.max(1, ...Object.values(pipelineValue));

  return (
    <div className={styles.overviewGrid}>
      <Card className={styles.pipelineSummary}>
        <CardHeader eyebrow="Pronóstico" title="Embudo comercial" action="Ver pipeline" onAction={onOpenPipeline} />
        <div className={styles.funnel}>
          {stages.filter((stage) => !['LOST'].includes(stage.id)).map((stage) => {
            const count = prospects.filter((item) => item.stage === stage.id).length;
            const value = pipelineValue[stage.id] || 0;
            return (
              <div key={stage.id}>
                <div className={styles.funnelTop}>
                  <span>{stage.label}</span>
                  <strong>{money(value)}</strong>
                  <small>{count} oportunidades</small>
                </div>
                <div className={styles.funnelTrack}><i style={{width: `${Math.max(value ? 8 : 0, (value / max) * 100)}%`}} /></div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className={styles.nextActions}>
        <CardHeader eyebrow="Prioridad" title="Próximos seguimientos" action="Ver agenda" onAction={onOpenActivities} />
        <div className={styles.nextList}>
          {next.map((item) => (
            <button key={item.id} type="button" onClick={() => onEdit({...item, estimatedValue: String(item.estimatedValue), nextActionAt: item.nextActionAt ? item.nextActionAt.slice(0, 16) : ''})}>
              <span className={styles.avatar}>{initials(item.name)}</span>
              <div><strong>{item.name}</strong><small>{item.companyName || 'Sin empresa'}</small></div>
              <time>{dateTime(item.nextActionAt)}</time>
            </button>
          ))}
          {!next.length ? <Empty text="No hay seguimientos próximos." /> : null}
        </div>
      </Card>

      <Card className={styles.hotOpportunities}>
        <CardHeader eyebrow="Oportunidades" title="Mayor potencial" action="Ver todas" onAction={onOpenPipeline} />
        <div className={styles.opportunityList}>
          {[...open].sort((a, b) => Number(b.estimatedValue) - Number(a.estimatedValue)).slice(0, 5).map((item) => (
            <article key={item.id}>
              <div className={styles.avatar}>{initials(item.name)}</div>
              <div className={styles.opportunityCopy}>
                <strong>{item.companyName || item.name}</strong>
                <small>{item.name} · {item.probability}% prob.</small>
              </div>
              <div className={styles.opportunityValue}>
                <strong>{money(item.estimatedValue)}</strong>
                <Badge tone={stageTone[item.stage]}>{stages.find((stage) => stage.id === item.stage)?.label}</Badge>
              </div>
            </article>
          ))}
        </div>
      </Card>

      <Card className={styles.activityCard}>
        <CardHeader eyebrow="Actividad" title="Últimos contactos" action="Registrar" onAction={onOpenActivities} />
        <div className={styles.activityFeed}>
          {recentActivities.map((item) => (
            <article key={item.id}>
              <span className={styles.activityIcon}>{item.completedAt ? <Check size={15} /> : <Activity size={15} />}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description || activityTypeLabel[item.type]}</p>
                <small>
                  {item.prospect?.companyName || item.prospect?.name || item.customer?.commercialName || item.customer?.legalName || 'Actividad comercial'} · {dateTime(item.createdAt)}
                </small>
              </div>
            </article>
          ))}
          {!recentActivities.length ? <Empty text="Todavía no hay actividad comercial." /> : null}
        </div>
      </Card>

      <Card className={styles.customerCard}>
        <CardHeader eyebrow="Base comercial" title="Clientes conectados" />
        <div className={styles.customerMetric}>
          <span><Building2 size={23} /></span>
          <div><strong>{customers.filter((item) => item.active).length}</strong><small>clientes activos</small></div>
        </div>
        <p>Las conversiones del CRM crean clientes directamente en la base financiera y comercial del ERP.</p>
        <div className={styles.wonList}>
          {prospects.filter((item) => item.stage === 'WON').slice(0, 3).map((item) => (
            <div key={item.id}>
              <span>{initials(item.name)}</span>
              <div><strong>{item.companyName || item.name}</strong><small>{isConverted(item) ? 'Cliente creado' : 'Pendiente de convertir'}</small></div>
              {!isConverted(item) ? <button type="button" onClick={() => onConvert(item)}>Convertir</button> : <CheckCircle2 size={17} />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Pipeline({prospects, query, setQuery, onEdit, onStage, onActivity, onConvert}) {
  return (
    <Card className={styles.pipelineCard}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.cardEyebrow}>Kanban comercial</span>
          <h2>Pipeline de oportunidades</h2>
        </div>
        <SearchBox value={query} onChange={setQuery} />
      </div>
      <div className={styles.kanban}>
        {stages.map((stage) => {
          const items = prospects.filter((item) => item.stage === stage.id);
          return (
            <section className={styles.column} key={stage.id}>
              <header>
                <div><span>{stage.label}</span><strong>{money(items.reduce((sum, item) => sum + Number(item.estimatedValue || 0), 0))}</strong></div>
                <i>{items.length}</i>
              </header>
              <div className={styles.cards}>
                {items.map((item) => (
                  <article key={item.id}>
                    <div className={styles.prospectTop}>
                      <span className={styles.avatar}>{initials(item.name)}</span>
                      <Badge tone={stageTone[item.stage]}>{item.probability}%</Badge>
                    </div>
                    <button className={styles.cardTitle} type="button" onClick={() => onEdit({...item, estimatedValue: String(item.estimatedValue), nextActionAt: item.nextActionAt ? item.nextActionAt.slice(0, 16) : ''})}>
                      <strong>{item.companyName || item.name}</strong>
                      <small>{item.name}</small>
                    </button>
                    <strong className={styles.amount}>{money(item.estimatedValue)}</strong>
                    <div className={styles.cardMeta}>
                      <span>{item.source || 'Sin fuente'}</span>
                      <span>{item.nextActionAt ? dateTime(item.nextActionAt) : 'Sin seguimiento'}</span>
                    </div>
                    <select value={item.stage} onChange={(event) => onStage(item, event.target.value)}>
                      {stages.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                    <div className={styles.cardActions}>
                      <button type="button" onClick={() => onActivity(item)}><CalendarClock size={14} /> Seguimiento</button>
                      {item.stage === 'WON' && !isConverted(item) ? (
                        <button type="button" onClick={() => onConvert(item)}><ArrowRight size={14} /> Cliente</button>
                      ) : null}
                    </div>
                  </article>
                ))}
                {!items.length ? <Empty text="Sin oportunidades" /> : null}
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}


function SearchBox({value, onChange}) {
  return (
    <label className={styles.search}>
      <Search size={16} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Buscar lead, empresa o contacto…" />
    </label>
  );
}

function CardHeader({eyebrow, title, action, onAction}) {
  return (
    <header className={styles.cardHeader}>
      <div><span className={styles.cardEyebrow}>{eyebrow}</span><h2>{title}</h2></div>
      {action ? <button type="button" onClick={onAction}>{action} <ArrowRight size={15} /></button> : null}
    </header>
  );
}

function Empty({text}) {
  return <div className={styles.empty}>{text}</div>;
}
