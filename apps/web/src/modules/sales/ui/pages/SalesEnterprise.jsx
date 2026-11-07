import {useEffect, useMemo, useState} from 'react';
import {
  FileText,
  LayoutDashboard,
  Plus,
  ShoppingBag,
  Target,
} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {salesRequest as apiRequest} from '../../services/salesApi';
import {formatSalesMoney as money} from '../utils/salesDisplayFormatters';
import {filterSalesProspects, countSalesProspects} from '../../utils/prospectSelectors';
import {Badge, Button} from '../../../../design-system/components';
import Sales from './Sales';
import MobileSalesControl from './MobileSalesControl';
import SalesProspectWorkspace from '../components/SalesProspectWorkspace';
import SalesProspectDetailDrawer from '../components/SalesProspectDetailDrawer';
import SalesPipelineFunnel from '../components/SalesPipelineFunnel';
import SalesRecentActivity from '../components/SalesRecentActivity';
import SalesOverviewLists from '../components/SalesOverviewLists';
import styles from './SalesEnterprise.module.css';
import SalesEnterpriseMetrics from '../components/SalesEnterpriseMetrics';
import SalesProspectFormDialog from '../components/SalesProspectFormDialog';
import {stages} from '../../utils/prospectStages';

import {ModuleHeader,ModuleTabs} from '../../../../components/module-system';
const blankProspect = () => ({
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

export default function SalesEnterprise() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [inlineMobileTabs, setInlineMobileTabs] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const sync = () => setInlineMobileTabs(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const [data, setData] = useState({
    summary: {},
    pipeline: [],
    prospects: [],
    quotes: [],
    orders: [],
    receivables: [],
    activities: [],
  });
  const [query, setQuery] = useState('');
  const [pipelineView, setPipelineView] = useState('all');
  const [stageFilter, setStageFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [drawerTab, setDrawerTab] = useState('summary');
  const [pipelineMode, setPipelineMode] = useState('table');
  const [prospectModal, setProspectModal] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await apiRequest('/sales-enterprise/dashboard');
    setData(response);
  }

  useEffect(() => {
    load().catch((error) => setMessage(['error', error.message]));
  }, []);

  const filteredProspects = useMemo(
    () => filterSalesProspects(data.prospects, {query, stageFilter, pipelineView}),
    [data.prospects, query, pipelineView, stageFilter],
  );

  const pipelineCounts = useMemo(
    () => countSalesProspects(data.prospects),
    [data.prospects],
  );

  async function saveProspect(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const method = prospectModal.id ? 'PUT' : 'POST';
      const url = prospectModal.id
        ? `/sales-enterprise/prospects/${prospectModal.id}`
        : '/sales-enterprise/prospects';

      await apiRequest(url, {
        method,
        body: {
          ...prospectModal,
          estimatedValue: Number(prospectModal.estimatedValue || 0),
          probability: Number(prospectModal.probability || 0),
          nextActionAt: prospectModal.nextActionAt || null,
          companyName: prospectModal.companyName || null,
          email: prospectModal.email || null,
          phone: prospectModal.phone || null,
          source: prospectModal.source || null,
          notes: prospectModal.notes || null,
        },
      });

      setProspectModal(null);
      setMessage(['success', 'Prospecto guardado correctamente']);
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
    const rows = data.prospects.filter((item) => selectedIds.includes(item.id));
    if (!rows.length) return;
    try {
      await Promise.all(rows.map((item) => apiRequest(`/sales-enterprise/prospects/${item.id}/stage`, {method:'PATCH', body:{stage}})));
      setSelectedIds([]);
      setMessage(['success', `${rows.length} oportunidad${rows.length === 1 ? '' : 'es'} actualizada${rows.length === 1 ? '' : 's'}`]);
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    }
  }

  function openProspectDrawer(prospect) {
    setSelectedProspect(prospect);
    setDrawerTab('summary');
  }

  function editProspect(prospect) {
    setProspectModal({
      ...prospect,
      estimatedValue: Number(prospect.estimatedValue || 0),
      nextActionAt: prospect.nextActionAt ? new Date(prospect.nextActionAt).toISOString().slice(0,16) : '',
    });
    setSelectedProspect(null);
  }

  return (
    <div className={styles.page} data-sales-view={tab}>
      <div className={styles.desktopHeader}>
      <ModuleHeader
        eyebrow="Ventas"
        title="Centro comercial"
        description="Prospectos, cotizaciones, pedidos, cartera y actividad en una sola experiencia."
        actions={<>
          <Button variant="secondary" icon={FileText} onClick={() => setTab('operations')}>
            Nueva cotización
          </Button>
          <Button icon={Plus} onClick={() => setProspectModal(blankProspect())}>
            Nuevo prospecto
          </Button>
        </>}
      />
      </div>

      {message ? (
        <div className={`${styles.message} ${styles[message[0]]}`}>
          {message[1]}
        </div>
      ) : null}

      <ModuleTabs
        inline={inlineMobileTabs}
        label="Vistas comerciales"
        active={tab}
        onChange={setTab}
        items={[
          {id:'overview',label:'Resumen',icon:LayoutDashboard},
          {id:'pipeline',label:'Pipeline',icon:Target,count:data.prospects?.length||0},
          {id:'operations',label:'Cotizaciones y pedidos',icon:ShoppingBag}
        ]}
      />

      {tab === 'overview' ? (
        <MobileSalesControl
          summary={data.summary}
          onQuotes={() => setTab('operations')}
          onPipeline={() => setTab('pipeline')}
          onNewProspect={() => setProspectModal(blankProspect())}
        />
      ) : null}

      {tab === 'operations' ? (
        <Sales />
      ) : (
        <>
          <SalesEnterpriseMetrics summary={data.summary} />

          {tab === 'overview' ? (
            <>
              <section className={styles.mainGrid}>
                <SalesPipelineFunnel pipeline={data.pipeline} stages={stages} formatMoney={money} onOpenPipeline={() => setTab('pipeline')} />
                <SalesRecentActivity activities={data.activities} />
              </section>

              <SalesOverviewLists
                quotes={data.quotes}
                receivables={data.receivables}
                onOpenQuotes={() => setTab('operations')}
                onOpenReceivables={() => navigate('/finanzas/cuentas-por-cobrar')}
              />
            </>
          ) : (
            <SalesProspectWorkspace
              prospects={filteredProspects}
              allProspects={data.prospects}
              query={query}
              setQuery={setQuery}
              view={pipelineView}
              setView={setPipelineView}
              counts={pipelineCounts}
              stageFilter={stageFilter}
              setStageFilter={setStageFilter}
              mode={pipelineMode}
              setMode={setPipelineMode}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onBulkStage={bulkChangeStage}
              onOpen={openProspectDrawer}
              onStage={changeStage}
            />
          )}
        </>
      )}

      <SalesProspectDetailDrawer
        selectedProspect={selectedProspect}
        drawerTab={drawerTab}
        setDrawerTab={setDrawerTab}
        onClose={() => setSelectedProspect(null)}
        onEdit={editProspect}
        onCreateQuote={() => { setSelectedProspect(null); setTab('operations'); }}
      />

      <SalesProspectFormDialog
        prospectModal={prospectModal}
        setProspectModal={setProspectModal}
        onSubmit={saveProspect}
        saving={saving}
        onClose={() => setProspectModal(null)}
      />
    </div>
  );
}
