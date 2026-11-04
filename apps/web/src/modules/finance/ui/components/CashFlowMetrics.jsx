import {ArrowDownRight, ArrowUpRight, CircleDollarSign, TrendingDown, TrendingUp, WalletCards} from 'lucide-react';
import KpiInfo from '../../../../components/KpiInfo';
import KpiCard from '../../../../components/KpiCard';
import styles from './CashFlowMetrics.module.css';

/** Read-only projection summary; calculation and loading remain in CashFlow. */
export default function CashFlowMetrics({summary, money}) {
  return (
      <section className={styles.metrics}>
        <KpiCard>
          <WalletCards />
          <span>Liquidez actual</span><KpiInfo title="Liquidez disponible">Saldo consolidado actual de cajas y cuentas bancarias activas.</KpiInfo>
          <strong>{money(summary.openingBalance)}</strong>
          <small>Saldo consolidado en cajas y bancos</small>
        </KpiCard>
        <KpiCard>
          <ArrowUpRight />
          <span>Cobros proyectados</span><KpiInfo title="Entradas previstas">Saldo de cuentas por cobrar con vencimiento dentro del periodo.</KpiInfo>
          <strong>{money(summary.totalReceivables)}</strong>
          <small>Cuentas por cobrar dentro del periodo</small>
        </KpiCard>
        <KpiCard>
          <ArrowDownRight />
          <span>Pagos proyectados</span><KpiInfo title="Salidas previstas">Saldo de cuentas por pagar con vencimiento dentro del periodo.</KpiInfo>
          <strong>{money(summary.totalPayables)}</strong>
          <small>Cuentas por pagar dentro del periodo</small>
        </KpiCard>
        <KpiCard>
          {Number(summary.netProjection) >= 0 ? (
            <TrendingUp />
          ) : (
            <TrendingDown />
          )}
          <span>Variación proyectada</span><KpiInfo title="Cambio neto esperado">Diferencia entre el saldo final proyectado y la liquidez actual.</KpiInfo>
          <strong>{money(summary.netProjection)}</strong>
          <small>Cambio esperado contra el saldo actual</small>
        </KpiCard>
        <KpiCard>
          <CircleDollarSign />
          <span>Saldo final proyectado</span><KpiInfo title="Liquidez futura">Saldo estimado al final del periodo considerando operaciones y escenarios.</KpiInfo>
          <strong>{money(summary.projectedClosingBalance)}</strong>
          <small>
            Mínimo del periodo: {money(summary.minimumBalance)}
          </small>
        </KpiCard>
      </section>
  );
}
