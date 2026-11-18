import {useEffect, useMemo, useState} from 'react';
import {
  FilePlus2,
  Landmark,
  Plus,
  Search,
} from 'lucide-react';
import {financeRequest as apiRequest} from '../../services/financeApi';
import {Button, Card, Input} from '../../../../design-system/components';
import styles from './Accounting.module.css';
import AccountingOverviewKpis from '../components/AccountingOverviewKpis';
import AccountingEntriesTable from '../components/AccountingEntriesTable';
import AccountingAccountsTable from '../components/AccountingAccountsTable';
import AccountingTrialBalanceTable from '../components/AccountingTrialBalanceTable';
import AccountingPeriodsTable from '../components/AccountingPeriodsTable';
import AccountingPeriodForm from '../components/AccountingPeriodForm';
import AccountingAccountForm from '../components/AccountingAccountForm';
import AccountingAutomaticEntryForm from '../components/AccountingAutomaticEntryForm';
import AccountingManualEntryForm from '../components/AccountingManualEntryForm';

import {ModuleTabs} from '../../../../components/module-system';
const money = (value) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(value || 0));

const date = (value) =>
  value ? new Date(value).toLocaleDateString('es-MX') : '—';

const accountBlank = () => ({
  parentId: '',
  code: '',
  name: '',
  type: 'ASSET',
  nature: 'DEBIT',
  level: 1,
  allowsPosting: true,
  active: true,
});

const periodBlank = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    name: now.toLocaleDateString('es-MX', {month: 'long', year: 'numeric'}),
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const entryBlank = (periodId = '') => ({
  periodId,
  entryDate: new Date().toISOString().slice(0, 10),
  concept: '',
  notes: '',
  lines: [
    {accountId: '', concept: '', debit: '', credit: '', reference: ''},
    {accountId: '', concept: '', debit: '', credit: '', reference: ''},
  ],
});

export default function Accounting() {
  const [data, setData] = useState({
    accounts: [],
    periods: [],
    entries: [],
    trialBalance: [],
    sources: {},
    stats: {},
  });
  const [tab, setTab] = useState('entries');
  const [query, setQuery] = useState('');
  const [accountModal, setAccountModal] = useState(null);
  const [periodModal, setPeriodModal] = useState(null);
  const [entryModal, setEntryModal] = useState(null);
  const [autoModal, setAutoModal] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await apiRequest('/accounting');
    setData(response);
  }

  useEffect(() => {
    load().catch((error) => setMessage(['error', error.message]));
  }, []);

  const openPeriods = data.periods.filter((item) => item.status === 'OPEN');
  const postingAccounts = data.accounts.filter((item) => item.active && item.allowsPosting);

  const visibleEntries = useMemo(
    () =>
      data.entries.filter((item) =>
        `${item.folio} ${item.concept} ${item.sourceFolio || ''}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [data.entries, query],
  );

  async function saveAccount(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/accounting/accounts', {
        method: 'POST',
        body: {...accountModal, parentId: accountModal.parentId || null},
      });
      setAccountModal(null);
      setMessage(['success', 'Cuenta contable creada']);
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    } finally {
      setSaving(false);
    }
  }

  async function savePeriod(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/accounting/periods', {method: 'POST', body: periodModal});
      setPeriodModal(null);
      setMessage(['success', 'Periodo contable creado']);
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    } finally {
      setSaving(false);
    }
  }

  function updateLine(index, field, value) {
    setEntryModal((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) =>
        lineIndex === index ? {...line, [field]: value} : line,
      ),
    }));
  }

  async function saveEntry(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/accounting/entries', {
        method: 'POST',
        body: {
          ...entryModal,
          notes: entryModal.notes || null,
          lines: entryModal.lines.map((line) => ({
            ...line,
            debit: Number(line.debit || 0),
            credit: Number(line.credit || 0),
            concept: line.concept || null,
            reference: line.reference || null,
          })),
        },
      });
      setEntryModal(null);
      setMessage(['success', 'Póliza creada en borrador']);
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    } finally {
      setSaving(false);
    }
  }

  async function createAutomatic(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/accounting/entries/automatic', {
        method: 'POST',
        body: autoModal,
      });
      setAutoModal(null);
      setMessage(['success', 'Póliza automática generada']);
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    } finally {
      setSaving(false);
    }
  }

  async function postEntry(entry) {
    if (!window.confirm(`¿Contabilizar la póliza ${entry.folio}?`)) return;
    try {
      await apiRequest(`/accounting/entries/${entry.id}/post`, {method: 'PATCH'});
      setMessage(['success', 'Póliza contabilizada']);
      await load();
    } catch (error) {
      setMessage(['error', error.message]);
    }
  }

  const debit = entryModal?.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0) || 0;
  const credit = entryModal?.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0) || 0;

  const sourceOptions = {
    SALES_INVOICE: data.sources.salesInvoices || [],
    ACCOUNTS_PAYABLE: data.sources.payables || [],
    TREASURY_MOVEMENT: data.sources.movements || [],
    SALES_CREDIT_NOTE: data.sources.creditNotes || [],
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Finanzas</span>
          <h1>Contabilidad</h1>
          <p>Catálogo de cuentas, periodos, pólizas y balanza de comprobación.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" icon={FilePlus2} onClick={() => setAutoModal({sourceType: 'SALES_INVOICE', sourceId: '', periodId: openPeriods[0]?.id || ''})}>
            Póliza automática
          </Button>
          <Button icon={Plus} onClick={() => setEntryModal(entryBlank(openPeriods[0]?.id || ''))}>
            Nueva póliza
          </Button>
        </div>
      </header>

      {message ? <div className={`${styles.message} ${styles[message[0]]}`}>{message[1]}</div> : null}

      <AccountingOverviewKpis stats={data.stats} money={money} />

      <Card className={styles.workspace}>
        <ModuleTabs
          active={tab}
          onChange={setTab}
          items={[
            {id:'entries',label:'Pólizas'},
            {id:'accounts',label:'Catálogo de cuentas'},
            {id:'balance',label:'Balanza'},
            {id:'periods',label:'Periodos'}
          ]}
        />

        <div className={styles.toolbar}>
          <div>
            <h2>{tab === 'entries' ? 'Diario contable' : tab === 'accounts' ? 'Catálogo de cuentas' : tab === 'balance' ? 'Balanza de comprobación' : 'Periodos contables'}</h2>
            <p>Información financiera integrada y trazable.</p>
          </div>
          {tab === 'entries' ? (
            <label className={styles.search}><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar póliza o concepto" /></label>
          ) : tab === 'accounts' ? (
            <Button variant="secondary" icon={Plus} onClick={() => setAccountModal(accountBlank())}>Nueva cuenta</Button>
          ) : tab === 'periods' ? (
            <Button variant="secondary" icon={Plus} onClick={() => setPeriodModal(periodBlank())}>Nuevo periodo</Button>
          ) : null}
        </div>

        <div className={styles.tableWrap}>
          {tab === 'entries' ? (
            <AccountingEntriesTable entries={visibleEntries} money={money} date={date} onPostEntry={postEntry} />
          ) : tab === 'accounts' ? (
            <AccountingAccountsTable accounts={data.accounts} />
          ) : tab === 'balance' ? (
            <AccountingTrialBalanceTable rows={data.trialBalance} money={money} />
          ) : (
            <AccountingPeriodsTable periods={data.periods} date={date} />
          )}
        </div>
      </Card>

      {accountModal ? <AccountingAccountForm value={accountModal} accounts={data.accounts} onChange={setAccountModal} onClose={() => setAccountModal(null)} onSubmit={saveAccount} saving={saving} /> : null}

      {periodModal ? <AccountingPeriodForm value={periodModal} onChange={setPeriodModal} onClose={() => setPeriodModal(null)} onSubmit={savePeriod} saving={saving} /> : null}

      {entryModal ? (
        <AccountingManualEntryForm
          value={entryModal}
          onChange={setEntryModal}
          onUpdateLine={updateLine}
          openPeriods={openPeriods}
          postingAccounts={postingAccounts}
          debit={debit}
          credit={credit}
          money={money}
          saving={saving}
          onClose={() => setEntryModal(null)}
          onSubmit={saveEntry}
        />
      ) : null}

      {autoModal ? (
        <AccountingAutomaticEntryForm
          value={autoModal}
          onChange={setAutoModal}
          onClose={() => setAutoModal(null)}
          onSubmit={createAutomatic}
          sourceOptions={sourceOptions}
          openPeriods={openPeriods}
          money={money}
          saving={saving}
        />
      ) : null}
    </div>
  );
}
