import {BadgeCheck, BookOpen, CalendarDays, FilePlus2, Scale} from 'lucide-react';
import KpiInfo from '../../../../components/KpiInfo';
import KpiCard from '../../../../components/KpiCard';
import styles from './AccountingOverviewKpis.module.css';

// Keep the visual KPI definitions together; accounting values still come from the page.
const metrics = [
  {
    key: 'accounts',
    label: 'Cuentas activas',
    title: 'Catálogo contable',
    description: 'Número de cuentas activas disponibles para registrar cargos y abonos.',
    icon: BookOpen,
    value: (stats) => stats.accounts || 0,
  },
  {
    key: 'openPeriods',
    label: 'Periodos abiertos',
    title: 'Periodos contables',
    description: 'Periodos que todavía permiten crear y contabilizar pólizas.',
    icon: CalendarDays,
    value: (stats) => stats.openPeriods || 0,
  },
  {
    key: 'draftEntries',
    label: 'Pólizas en borrador',
    title: 'Pólizas pendientes',
    description: 'Pólizas capturadas que aún no afectan la balanza de comprobación.',
    icon: FilePlus2,
    value: (stats) => stats.draftEntries || 0,
  },
  {
    key: 'postedEntries',
    label: 'Pólizas contabilizadas',
    title: 'Pólizas aplicadas',
    description: 'Pólizas revisadas y contabilizadas que ya afectan los saldos contables.',
    icon: BadgeCheck,
    value: (stats) => stats.postedEntries || 0,
  },
  {
    key: 'balanceDifference',
    label: 'Diferencia global',
    title: 'Control de cuadratura',
    description: 'Diferencia entre cargos y abonos contabilizados. Debe permanecer en cero.',
    icon: Scale,
    value: (stats, money) => money(Number(stats.totalDebit || 0) - Number(stats.totalCredit || 0)),
  },
];

/** Read-only accounting summary. Financial state and API operations remain in the page. */
export default function AccountingOverviewKpis({stats, money}) {
  return (
    <section className={styles.metrics}>
      {metrics.map(({key, label, title, description, icon: Icon, value}) => (
        <KpiCard key={key}>
          <Icon />
          <span>{label}</span>
          <KpiInfo title={title}>{description}</KpiInfo>
          <strong>{value(stats, money)}</strong>
        </KpiCard>
      ))}
    </section>
  );
}
