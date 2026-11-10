import {useState} from 'react';
import useSalesEnterpriseDashboard from '../hooks/useSalesEnterpriseDashboard';
import useSalesMobileTabs from '../hooks/useSalesMobileTabs';
import useSalesProspectFilters from '../hooks/useSalesProspectFilters';
import {
  FileText,
  LayoutDashboard,
  Plus,
  ShoppingBag,
  Target,
} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {salesRequest as apiRequest} from '../../services/salesApi';
import {Badge, Button} from '../../../../design-system/components';
import Sales from './Sales';
import MobileSalesControl from './MobileSalesControl';
import SalesProspectWorkspace from '../components/SalesProspectWorkspace';
import SalesProspectDetailDrawer from '../components/SalesProspectDetailDrawer';
import styles from './SalesEnterprise.module.css';
import SalesEnterpriseMetrics from '../components/SalesEnterpriseMetrics';
import SalesEnterpriseOverview from '../components/SalesEnterpriseOverview';
import SalesProspectFormDialog from '../components/SalesProspectFormDialog';
import {createBlankSalesProspect, toSalesProspectForm} from '../utils/salesProspectFormModel';

import {ModuleHeader,ModuleTabs} from '../../../../components/module-system';
export default function SalesEnterprise() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const inlineMobileTabs = useSalesMobileTabs();
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [drawerTab, setDrawerTab] = useState('summary');
  const [pipelineMode, setPipelineMode] = useState('table');
  const [prospectModal, setProspectModal] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const {data, reload: load} = useSalesEnterpriseDashboard((error) => setMessage(['error', error.message]));

  const {
    query, setQuery,
    pipelineView, setPipelineView,
    stageFilter, setStageFilter,
    filteredProspects, pipelineCounts,
  } = useSalesProspectFilters(data.prospects);

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
    setProspectModal(toSalesProspectForm(prospect));
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
          <Button icon={Plus} onClick={() => setProspectModal(createBlankSalesProspect())}>
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
          onNewProspect={() => setProspectModal(createBlankSalesProspect())}
        />
      ) : null}

      {tab === 'operations' ? (
        <Sales />
      ) : (
        <>
          <SalesEnterpriseMetrics summary={data.summary} />

          {tab === 'overview' ? (
            <>
              <SalesEnterpriseOverview
                pipeline={data.pipeline}
                activities={data.activities}
                quotes={data.quotes}
                receivables={data.receivables}
                onOpenPipeline={() => setTab('pipeline')}
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
