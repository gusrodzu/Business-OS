import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUp,
  Banknote,
  Boxes,
  CalendarRange,
  CheckCircle2,
  CircleDollarSign,
  Database,
  FileText,
  BadgeCheck,
  BarChart3,
  Gauge,
  Landmark,
  RefreshCw,
  Scale,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import {operationsRequest as apiRequest} from '../../services/operationsApi';
import {Badge, Button, Card, Input} from '../../../../design-system/components';
import styles from './Reports.module.css';

import KpiGrid from '../../../../components/KpiGrid';
import KpiInfo from '../../../../components/KpiInfo';
import KpiCard from '../../../../components/KpiCard';

const currency = (value, code = 'MXN') =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const number = (value) =>
  new Intl.NumberFormat('es-MX', {maximumFractionDigits: 1}).format(Number(value || 0));

const initialRange = () => {
  const now = new Date();
  return {
    from: `${now.getFullYear()}-01-01`,
    to: now.toISOString().slice(0, 10),
  };
};

function csvCell(value) {
  const text = String(value ?? '').replaceAll('"', '""');
  return `"${text}"`;
}

function trendLabel(change) {
  const value = Number(change || 0);
  if (value === 0) return 'Sin cambio vs periodo anterior';
  return `${value > 0 ? '+' : ''}${number(value)}% vs periodo anterior`;
}

function Trend({change}) {
  const value = Number(change || 0);
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : ArrowRight;
  const tone = value > 0 ? styles.trendUp : value < 0 ? styles.trendDown : styles.trendFlat;
  return (
    <span data-kpi-role="trend" className={`${styles.kpiTrend} ${tone}`}>
      <Icon size={13} aria-hidden="true" />
      {trendLabel(value)}
    </span>
  );
}

function severityTone(severity) {
  if (severity === 'CRITICAL') return 'danger';
  if (severity === 'HIGH') return 'warning';
  if (severity === 'MEDIUM') return 'info';
  return 'neutral';
}

function severityLabel(severity) {
  return {
    CRITICAL: 'Crítica',
    HIGH: 'Alta',
    MEDIUM: 'Media',
    LOW: 'Baja',
  }[severity] || severity;
}

function healthLabel(status) {
  return {
    HEALTHY: 'Saludable',
    ATTENTION: 'Requiere atención',
    RISK: 'En riesgo',
  }[status] || 'Sin evaluación';
}

function decisionValue(item, currencyCode) {
  if (item.valueType === 'currency') return currency(item.value, currencyCode);
  if (item.valueType === 'percent') return `${number(item.value)}%`;
  return number(item.value);
}

export default function Reports() {
  const navigate = useNavigate();
  const [range, setRange] = useState(initialRange);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await apiRequest(
        `/reports/executive?from=${range.from}&to=${range.to}`,
      );
      setData(response);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const maxMonthly = useMemo(() => {
    if (!data?.monthly?.length) return 1;
    return Math.max(
      ...data.monthly.flatMap((row) => [
        row.sales,
        row.collections,
        row.purchases,
        row.payroll,
      ]),
      1,
    );
  }, [data]);

  function exportCsv() {
    if (!data) return;

    const summary = data.summary ?? {};
    const comparison = data.comparison ?? {};
    const rows = [
      ['REPORTE EJECUTIVO BUZZBEE', ''],
      ['Empresa', data.company?.name || ''],
      ['Periodo', `${range.from} a ${range.to}`],
      ['Generado', data.generatedAt ? new Date(data.generatedAt).toLocaleString('es-MX') : ''],
      [],
      ['INDICADORES', 'Valor', 'Variación vs periodo anterior'],
      ['Ventas', summary.salesTotal, comparison.salesTotal?.changePct ?? 0],
      ['Cobranza', summary.collectionsTotal, comparison.collectionsTotal?.changePct ?? 0],
      ['Compras', summary.purchaseTotal, comparison.purchaseTotal?.changePct ?? 0],
      ['Balance comercial (ventas - compras)', summary.commercialBalance, comparison.commercialBalance?.changePct ?? 0],
      ['Liquidez', summary.liquidity, ''],
      ['Saldo por cobrar', summary.receivableBalance, ''],
      ['Saldo por pagar', summary.payableBalance, ''],
      ['Inventario', summary.inventoryValue, ''],
      ['Nómina', summary.payrollNet, comparison.payrollNet?.changePct ?? 0],
      [],
      ['PRESUPUESTO', 'Valor'],
      ['Planeado', summary.budgetPlanned],
      ['Ejecutado', summary.budgetActual],
      ['Variación', summary.budgetVariance],
      ['Utilización %', summary.budgetUtilization],
      [],
      ['SALUD DEL NEGOCIO', 'Valor'],
      ['Score', data.health?.score ?? 0],
      ['Estado', healthLabel(data.health?.status)],
      [],
      ['DECISIONES', 'Severidad', 'Detalle', 'Valor'],
      ...(data.decisions ?? []).map((item) => [
        item.title,
        severityLabel(item.severity),
        item.detail,
        decisionValue(item, data.company?.currency || 'MXN'),
      ]),
      [],
      ['EVOLUCIÓN MENSUAL', 'Ventas', 'Cobranza', 'Compras', 'Nómina'],
      ...(data.monthly ?? []).map((row) => [
        row.label,
        row.sales,
        row.collections,
        row.purchases,
        row.payroll,
      ]),
      [],
      ['PROVEEDORES', 'Órdenes', 'Total'],
      ...(data.supplierSpend ?? []).map((row) => [row.name, row.orders, row.total]),
      [],
      ['CLIENTES', 'Facturas abiertas', 'Saldo'],
      ...(data.customerBalances ?? []).map((row) => [row.name, row.invoices, row.balance]),
      [],
      ['CAPITAL HUMANO', 'Empleados', 'Nómina mensual estimada'],
      ...(data.departments ?? []).map((row) => [row.name, row.employees, row.payroll]),
      [],
      ['STOCK CRÍTICO', 'SKU', 'Almacén', 'Existencia', 'Mínimo'],
      ...(data.lowStock ?? []).map((row) => [
        row.product,
        row.sku,
        `${row.warehouse} · ${row.branch}`,
        row.quantity,
        row.minStock,
      ]),
    ];

    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `reporte-ejecutivo-${range.from}-${range.to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const summary = data?.summary ?? {};
  const comparison = data?.comparison ?? {};
  const currencyCode = data?.company?.currency || 'MXN';
  const health = data?.health ?? {score: 0, status: 'ATTENTION', factors: {}};
  const generatedAt = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleString('es-MX', {dateStyle: 'medium', timeStyle: 'short'})
    : '—';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Centro ejecutivo · Dirección</span>
          <h1>Reporte ejecutivo</h1>
          <p>
            Ventas, cobranza, compras, liquidez, presupuesto, inventario y capital humano
            conectados en una sola vista para tomar decisiones.
          </p>
          <div className={styles.freshness}>
            <CheckCircle2 size={14} />
            <span>Datos conectados · actualizado {generatedAt}</span>
            <Badge tone="neutral">{data?.dataSources?.length ?? 0} fuentes</Badge>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Button variant="secondary" icon={ArrowDownToLine} onClick={exportCsv} disabled={!data}>
            Exportar ejecutivo
          </Button>
          <Button icon={RefreshCw} onClick={load} loading={loading}>
            Actualizar
          </Button>
        </div>
      </header>

      <Card className={styles.filters}>
        <div className={styles.filterTitle}>
          <CalendarRange size={20} />
          <div>
            <strong>Periodo de análisis</strong>
            <span>Las variaciones se comparan contra un periodo anterior de la misma duración.</span>
          </div>
        </div>
        <Input
          label="Desde"
          type="date"
          value={range.from}
          onChange={(event) =>
            setRange((current) => ({...current, from: event.target.value}))
          }
        />
        <Input
          label="Hasta"
          type="date"
          value={range.to}
          onChange={(event) =>
            setRange((current) => ({...current, to: event.target.value}))
          }
        />
        <Button onClick={load} loading={loading}>
          Aplicar periodo
        </Button>
      </Card>

      {message ? <div className={styles.error}>{message}</div> : null}

      <KpiGrid>
        <KpiCard onClick={() => navigate('/ventas')} ariaLabel="Abrir Ventas">
          <TrendingUp />
          <span>Ventas del periodo</span>
          <KpiInfo title="Ventas confirmadas">Importe de órdenes de venta confirmadas dentro del periodo.</KpiInfo>
          <strong>{currency(summary.salesTotal, currencyCode)}</strong>
          <Trend change={comparison.salesTotal?.changePct} />
        </KpiCard>

        <KpiCard onClick={() => navigate('/ventas/cobranza')} ariaLabel="Abrir Cobranza">
          <CircleDollarSign />
          <span>Cobranza del periodo</span>
          <KpiInfo title="Cobros recibidos">Pagos de clientes registrados dentro del periodo seleccionado.</KpiInfo>
          <strong>{currency(summary.collectionsTotal, currencyCode)}</strong>
          <Trend change={comparison.collectionsTotal?.changePct} />
        </KpiCard>

        <KpiCard onClick={() => navigate('/finanzas/tesoreria')} ariaLabel="Abrir Tesorería">
          <Landmark />
          <span>Liquidez disponible</span>
          <KpiInfo title="Disponibilidad de tesorería">Saldo actual consolidado de las cuentas activas de Tesorería.</KpiInfo>
          <strong>{currency(summary.liquidity, currencyCode)}</strong>
          <span data-kpi-role="trend" className={`${styles.kpiTrend} ${styles.trendFlat}`}>
            Entradas {currency(summary.cashIn, currencyCode)} · salidas {currency(summary.cashOut, currencyCode)}
          </span>
        </KpiCard>

        <KpiCard onClick={() => navigate('/ventas')} ariaLabel="Abrir Ventas para revisar balance comercial">
          <Scale />
          <span>Balance comercial</span>
          <KpiInfo title="Ventas menos compras">Diferencia ejecutiva entre ventas y compras del periodo; no sustituye la utilidad contable.</KpiInfo>
          <strong>{currency(summary.commercialBalance, currencyCode)}</strong>
          <Trend change={comparison.commercialBalance?.changePct} />
        </KpiCard>

        <KpiCard onClick={() => navigate('/finanzas/cuentas-por-cobrar')} ariaLabel="Abrir Cuentas por cobrar">
          <WalletCards />
          <span>Saldo por cobrar</span>
          <KpiInfo title="Cartera al cierre">Saldo abierto calculado con documentos emitidos y pagos registrados hasta el cierre del periodo.</KpiInfo>
          <strong>{currency(summary.receivableBalance, currencyCode)}</strong>
          <span data-kpi-role="trend" className={`${styles.kpiTrend} ${summary.overdueReceivables > 0 ? styles.trendDown : styles.trendFlat}`}>
            Vencido {currency(summary.overdueReceivables, currencyCode)}
          </span>
        </KpiCard>

        <KpiCard onClick={() => navigate('/finanzas/cuentas-por-pagar')} ariaLabel="Abrir Cuentas por pagar">
          <Banknote />
          <span>Saldo por pagar</span>
          <KpiInfo title="Deuda al cierre">Saldo pendiente con proveedores reconstruido con pagos registrados hasta el cierre del periodo.</KpiInfo>
          <strong>{currency(summary.payableBalance, currencyCode)}</strong>
          <span data-kpi-role="trend" className={`${styles.kpiTrend} ${summary.overduePayables > 0 ? styles.trendDown : styles.trendFlat}`}>
            Vencido {currency(summary.overduePayables, currencyCode)}
          </span>
        </KpiCard>

        <KpiCard onClick={() => navigate('/finanzas/presupuestos')} ariaLabel="Abrir Presupuestos">
          <Gauge />
          <span>Ejecución presupuestal</span>
          <KpiInfo title="Presupuesto vs gasto">Compara el presupuesto activo con la ejecución administrativa del periodo.</KpiInfo>
          <strong>{summary.budgetPlanned > 0 ? `${number(summary.budgetUtilization)}%` : 'Sin presupuesto'}</strong>
          <span data-kpi-role="trend" className={`${styles.kpiTrend} ${summary.budgetUtilization > 100 ? styles.trendDown : styles.trendFlat}`}>
            {currency(summary.budgetActual, currencyCode)} de {currency(summary.budgetPlanned, currencyCode)}
          </span>
        </KpiCard>

        <KpiCard onClick={() => navigate('/recursos-humanos/prenomina')} ariaLabel="Abrir Nómina">
          <Users />
          <span>Nómina del periodo</span>
          <KpiInfo title="Costo de nómina">Importe neto de periodos de nómina dentro del rango seleccionado.</KpiInfo>
          <strong>{currency(summary.payrollNet, currencyCode)}</strong>
          <Trend change={comparison.payrollNet?.changePct} />
        </KpiCard>
      </KpiGrid>

      <section className={styles.executiveGrid}>
        <Card className={styles.healthCard}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Pulso ejecutivo</span>
              <h2>Salud del negocio</h2>
              <p>Score calculado con cartera, pagos, inventario, presupuesto, liquidez y aprobaciones.</p>
            </div>
            <Badge tone={health.status === 'HEALTHY' ? 'success' : health.status === 'RISK' ? 'danger' : 'warning'}>
              {healthLabel(health.status)}
            </Badge>
          </div>

          <div className={styles.healthBody}>
            <div className={styles.healthScore}>
              <strong>{health.score}</strong>
              <span>/ 100</span>
            </div>
            <div className={styles.healthProgress}>
              <span style={{width: `${Math.max(0, Math.min(100, health.score))}%`}} />
            </div>
            <div className={styles.healthFacts}>
              <div>
                <span>Cartera vencida</span>
                <strong>{number((health.factors?.overdueReceivables || 0) * 100)}%</strong>
              </div>
              <div>
                <span>Deuda vencida</span>
                <strong>{number((health.factors?.overduePayables || 0) * 100)}%</strong>
              </div>
              <div>
                <span>Aprobaciones</span>
                <strong>{health.factors?.pendingApprovals ?? 0}</strong>
              </div>
              <div>
                <span>Presupuesto</span>
                <strong>{number(health.factors?.budgetUtilization || 0)}%</strong>
              </div>
            </div>
          </div>
        </Card>

        <Card className={styles.decisionsCard}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Acción requerida</span>
              <h2>Decisiones que requieren tu atención</h2>
              <p>Priorizadas por impacto para que Dirección vaya directo al origen.</p>
            </div>
            <AlertTriangle size={22} />
          </div>

          <div className={styles.decisionList}>
            {(data?.decisions ?? []).map((item) => (
              <button key={item.id} type="button" onClick={() => navigate(item.route)}>
                <span className={styles.decisionIcon}>
                  <AlertTriangle size={17} />
                </span>
                <span className={styles.decisionCopy}>
                  <span className={styles.decisionTop}>
                    <strong>{item.title}</strong>
                    <Badge tone={severityTone(item.severity)}>{severityLabel(item.severity)}</Badge>
                  </span>
                  <small>{item.detail}</small>
                </span>
                <span className={styles.decisionValue}>{decisionValue(item, currencyCode)}</span>
                <ArrowRight size={16} className={styles.decisionArrow} />
              </button>
            ))}
            {!data?.decisions?.length ? (
              <div className={styles.healthyEmpty}>
                <CheckCircle2 size={20} />
                <div>
                  <strong>Sin decisiones críticas pendientes</strong>
                  <span>Los indicadores principales no presentan alertas ejecutivas.</span>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </section>

      <section className={styles.mainGrid}>
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Tendencia</span>
              <h2>Evolución mensual</h2>
              <p>Ventas, cobranza, compras y nómina dentro del periodo.</p>
            </div>
            <Badge tone="neutral">{data?.monthly?.length ?? 0} meses</Badge>
          </div>

          <div className={styles.chart}>
            {(data?.monthly ?? []).map((row) => (
              <div className={styles.month} key={row.key}>
                <div className={styles.bars}>
                  <span
                    className={styles.salesBar}
                    style={{height: `${Math.max(5, row.sales / maxMonthly * 100)}%`}}
                    title={`Ventas: ${currency(row.sales, currencyCode)}`}
                  />
                  <span
                    className={styles.collectionBar}
                    style={{height: `${Math.max(5, row.collections / maxMonthly * 100)}%`}}
                    title={`Cobranza: ${currency(row.collections, currencyCode)}`}
                  />
                  <span
                    className={styles.purchaseBar}
                    style={{height: `${Math.max(5, row.purchases / maxMonthly * 100)}%`}}
                    title={`Compras: ${currency(row.purchases, currencyCode)}`}
                  />
                  <span
                    className={styles.payrollBar}
                    style={{height: `${Math.max(5, row.payroll / maxMonthly * 100)}%`}}
                    title={`Nómina: ${currency(row.payroll, currencyCode)}`}
                  />
                </div>
                <small>{row.label}</small>
              </div>
            ))}
            {!data?.monthly?.length ? (
              <div className={styles.empty}>No hay movimientos en el periodo.</div>
            ) : null}
          </div>

          <div className={styles.legend}>
            <span><i className={styles.salesLegend} />Ventas</span>
            <span><i className={styles.collectionLegend} />Cobranza</span>
            <span><i className={styles.purchaseLegend} />Compras</span>
            <span><i className={styles.payrollLegend} />Nómina</span>
          </div>
        </Card>

        <Card className={styles.snapshotCard}>
          <div className={`${styles.cardHeader} ${styles.snapshotHeader}`}>
            <div>
              <span className={styles.sectionEyebrow}>Foto operativa</span>
              <h2>Resumen de operación</h2>
              <p>Indicadores que complementan la lectura financiera.</p>
            </div>
            <div className={styles.snapshotHeroIcon} aria-hidden="true">
              <Boxes size={24} strokeWidth={2.15} />
            </div>
          </div>
          <div className={styles.snapshotList}>
            <button className={styles.snapshotMetric} type="button" data-ui-surface="row" onClick={() => navigate('/inventario/existencias')}>
              <span className={`${styles.snapshotMetricIcon} ${styles.snapshotToneBlue}`} aria-hidden="true"><Database size={20} /></span>
              <span className={styles.snapshotMetricLabel}>Valor de inventario</span>
              <strong className={`${styles.snapshotMetricValue} ${styles.snapshotMoney}`}>{currency(summary.inventoryValue, currencyCode)}</strong>
            </button>
            <button className={styles.snapshotMetric} type="button" data-ui-surface="row" onClick={() => navigate('/recursos-humanos')}>
              <span className={`${styles.snapshotMetricIcon} ${styles.snapshotToneGreen}`} aria-hidden="true"><Users size={20} /></span>
              <span className={styles.snapshotMetricLabel}>Empleados activos</span>
              <strong className={styles.snapshotMetricValue}>{summary.activeEmployees ?? 0}</strong>
            </button>
            <button className={styles.snapshotMetric} type="button" data-ui-surface="row" onClick={() => navigate('/compras/solicitudes')}>
              <span className={`${styles.snapshotMetricIcon} ${styles.snapshotToneOrange}`} aria-hidden="true"><FileText size={20} /></span>
              <span className={styles.snapshotMetricLabel}>SOLPED pendientes</span>
              <strong className={styles.snapshotMetricValue}>{summary.pendingPurchaseRequests ?? 0}</strong>
            </button>
            <button className={styles.snapshotMetric} type="button" data-ui-surface="row" onClick={() => navigate('/aprobaciones')}>
              <span className={`${styles.snapshotMetricIcon} ${styles.snapshotTonePurple}`} aria-hidden="true"><BadgeCheck size={20} /></span>
              <span className={styles.snapshotMetricLabel}>Aprobaciones pendientes</span>
              <strong className={styles.snapshotMetricValue}>{summary.pendingApprovals ?? 0}</strong>
            </button>
            <button className={styles.snapshotMetric} type="button" data-ui-surface="row" onClick={() => navigate('/finanzas/tesoreria')}>
              <span className={`${styles.snapshotMetricIcon} ${styles.snapshotToneIndigo}`} aria-hidden="true"><BarChart3 size={20} /></span>
              <span className={styles.snapshotMetricLabel}>Flujo neto de tesorería</span>
              <strong className={`${styles.snapshotMetricValue} ${styles.snapshotMoney}`}>{currency(Number(summary.cashIn || 0) - Number(summary.cashOut || 0), currencyCode)}</strong>
            </button>
          </div>
        </Card>
      </section>

      <section className={styles.tablesGrid}>
        <Card className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Principales proveedores</h2>
              <p>Ordenados por compras del periodo.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/compras/proveedores')}>Ver módulo</Button>
          </div>
          <div className={styles.tableScroll}>
            <table>
              <thead><tr><th>Proveedor</th><th>Órdenes</th><th>Total</th></tr></thead>
              <tbody>
                {(data?.supplierSpend ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.orders}</td>
                    <td><strong>{currency(row.total, currencyCode)}</strong></td>
                  </tr>
                ))}
                {!data?.supplierSpend?.length ? (
                  <tr><td colSpan="3" className={styles.emptyCell}>Sin compras registradas.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Saldos de clientes</h2>
              <p>Clientes con mayor saldo abierto al cierre.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/finanzas/cuentas-por-cobrar')}>Ver cartera</Button>
          </div>
          <div className={styles.tableScroll}>
            <table>
              <thead><tr><th>Cliente</th><th>Facturas</th><th>Saldo</th></tr></thead>
              <tbody>
                {(data?.customerBalances ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.invoices}</td>
                    <td><strong>{currency(row.balance, currencyCode)}</strong></td>
                  </tr>
                ))}
                {!data?.customerBalances?.length ? (
                  <tr><td colSpan="3" className={styles.emptyCell}>Sin saldos registrados.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className={styles.tablesGrid}>
        <Card className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Capital humano por área</h2>
              <p>Plantilla y nómina mensual estimada.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/recursos-humanos')}>Ver RR. HH.</Button>
          </div>
          <div className={styles.tableScroll}>
            <table>
              <thead><tr><th>Departamento</th><th>Empleados</th><th>Nómina mensual</th></tr></thead>
              <tbody>
                {(data?.departments ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.employees}</td>
                    <td><strong>{currency(row.payroll, currencyCode)}</strong></td>
                  </tr>
                ))}
                {!data?.departments?.length ? (
                  <tr><td colSpan="3" className={styles.emptyCell}>Sin información de plantilla.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Stock crítico</h2>
              <p>Productos por debajo o al nivel mínimo.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventario/existencias')}>Ver inventario</Button>
          </div>
          <div className={styles.tableScroll}>
            <table>
              <thead><tr><th>Producto</th><th>Almacén</th><th>Existencia</th></tr></thead>
              <tbody>
                {(data?.lowStock ?? []).map((row) => (
                  <tr key={`${row.sku}-${row.warehouse}`}>
                    <td><strong>{row.product}</strong><small>{row.sku}</small></td>
                    <td>{row.warehouse}<small>{row.branch}</small></td>
                    <td><Badge tone="danger">{row.quantity} / mín. {row.minStock}</Badge></td>
                  </tr>
                ))}
                {!data?.lowStock?.length ? (
                  <tr><td colSpan="3" className={styles.emptyCell}>No hay alertas de inventario.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
