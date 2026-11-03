import {BadgeCheck, BookOpen, CalendarDays, FilePlus2, Scale} from 'lucide-react';
import KpiInfo from '../../../../components/KpiInfo';
import KpiCard from '../../../../components/KpiCard';
import styles from './AccountingOverviewKpis.module.css';

/** Read-only accounting summary. Financial state and API operations remain in the page. */
export default function AccountingOverviewKpis({stats, money}) {
  return (
    <section className={styles.metrics}>
        <KpiCard><BookOpen /><span>Cuentas activas</span><KpiInfo title="Cat\u00e1logo contable">Número de cuentas activas disponibles para registrar cargos y abonos.</KpiInfo><strong>{stats.accounts || 0}</strong></KpiCard>
        <KpiCard><CalendarDays /><span>Periodos abiertos</span><KpiInfo title="Periodos contables">Periodos que todavía permiten crear y contabilizar pólizas.</KpiInfo><strong>{stats.openPeriods || 0}</strong></KpiCard>
        <KpiCard><FilePlus2 /><span>Pólizas en borrador</span><KpiInfo title="P\u00f3lizas pendientes">Pólizas capturadas que aún no afectan la balanza de comprobación.</KpiInfo><strong>{stats.draftEntries || 0}</strong></KpiCard>
        <KpiCard><BadgeCheck /><span>Pólizas contabilizadas</span><KpiInfo title="P\u00f3lizas aplicadas">Pólizas revisadas y contabilizadas que ya afectan los saldos contables.</KpiInfo><strong>{stats.postedEntries || 0}</strong></KpiCard>
        <KpiCard><Scale /><span>Diferencia global</span><KpiInfo title="Control de cuadratura">Diferencia entre cargos y abonos contabilizados. Debe permanecer en cero.</KpiInfo><strong>{money(Number(stats.totalDebit || 0) - Number(stats.totalCredit || 0))}</strong></KpiCard>
    </section>
  );
}
