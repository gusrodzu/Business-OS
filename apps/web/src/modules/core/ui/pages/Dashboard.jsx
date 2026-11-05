import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Settings2,
  Sparkles,
} from 'lucide-react';
import {useAuth} from '../../../../auth/AuthContext';
import {Badge, Button, Card, PageHeader} from '../../../../design-system/components';
import {quickActions} from '../../../../data/navigation';
import HexQuickActions from '../../../../components/HexQuickActions';
import WorkspaceAppShelf from './WorkspaceAppShelf';
import MobileHomeHero, {MobileHomePriority} from './MobileHomeHero';
import mobileLayout from './MobileHomeLayout.module.css';
import DashboardMetricsPanel from './DashboardMetricsPanel';
import DashboardRecentRequests from '../components/DashboardRecentRequests';
import WidgetHeader from './DashboardWidgetHeader';
import DashboardStockAlerts from '../components/DashboardStockAlerts';
import styles from './Dashboard.module.css';
import {getDashboardMetrics} from '../utils/dashboardMetrics';
import {useDashboardData} from '../hooks/useDashboardData';
import DashboardCustomizer from '../components/DashboardCustomizer';
import {useDashboardPreferences} from '../hooks/useDashboardPreferences';
import MonthlyPurchasesChart from '../components/MonthlyPurchasesChart';
import AgendaListItem from '../components/AgendaListItem';
import InventoryCategoryBreakdown from '../components/InventoryCategoryBreakdown';
import UserActivitySummary from '../components/UserActivitySummary';
import {getDashboardRoleActions} from '../utils/dashboardRoleActions';



const money = (value, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', {style: 'currency', currency, maximumFractionDigits: 0}).format(Number(value || 0));

const number = (value) => new Intl.NumberFormat('es-MX', {maximumFractionDigits: 1}).format(Number(value || 0));

export default function Dashboard() {
  const navigate = useNavigate();
  const {user, offlineDemo} = useAuth();
  const {preferences, visibleWidgets, setPreferences, toggleWidget, toggleMetric, resetDashboard} = useDashboardPreferences(user, offlineDemo);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const dashboardScope = `${user?.companyId || user?.company?.id || 'none'}:${offlineDemo ? 'offline' : 'online'}`;
  const {data, loading, error} = useDashboardData(dashboardScope);

  if (loading) {
    return <div className={styles.page}><Card><p>Cargando información operativa…</p></Card></div>;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Card>
          <h2>No fue posible cargar el panel principal</h2>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </Card>
      </div>
    );
  }

  const currency = data?.company?.currency || 'MXN';
  const monthlyValues = (data?.monthlyPurchases || []).map(item => Number(item.total || 0));
  const purchaseTotal = monthlyValues.reduce((sum, value) => sum + value, 0);
  const recentNotifications = data?.notifications || [];
  const availableMetrics = getDashboardMetrics(data, currency, {money, number});
  const kpis = preferences.selectedMetrics
    .map(id => availableMetrics.find(metric => metric.id === id))
    .filter(Boolean);
  const insight = recentNotifications[0]
    ? `${recentNotifications[0].title}: ${recentNotifications[0].message}`
    : data?.kpis?.criticalStock
      ? `${data.kpis.criticalStock} productos requieren revisión de inventario.`
      : 'La operación no presenta alertas críticas en este momento.';


  const roleName = user?.roles?.[0]?.name || 'Colaborador';
  const roleActions = getDashboardRoleActions(roleName);

  return (
    <div className={`${styles.page} ${mobileLayout.layout} ${preferences.compact ? styles.compact : ''}`}>
      <div className={mobileLayout.mobileHomeFrame}>
        <MobileHomeHero
          firstName={data?.user?.firstName || user?.firstName}
          companyName={data?.company?.name}
          roleName={roleName}
          offlineDemo={offlineDemo}
        />
      </div>
      <div className={mobileLayout.desktopHomeHeader}>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat('es-MX', {weekday: 'long', day: 'numeric', month: 'long'}).format(new Date())}
        title={`¡Buenos días, ${data?.user?.firstName || user?.firstName || 'Usuario'}! 👋`}
        description={`Así va ${data?.company?.name || 'tu empresa'} hoy. Prioridades, operación e inteligencia en un solo lugar.`}
        actions={<>
          <Badge tone="info">Vista · {roleName}</Badge>
          <Badge tone={offlineDemo ? "info" : "success"} dot>{offlineDemo ? "Datos simulados" : "Datos conectados"}</Badge>
          <Button variant="secondary" icon={Settings2} onClick={() => setCustomizerOpen(true)}>Personalizar</Button>
          <Button icon={Plus} onClick={() => navigate('/compras/solicitudes')}>Nueva solicitud</Button>
        </>}
      />
      </div>

      <DashboardRoleActions roleName={roleName} actions={roleActions} onNavigate={navigate} />

      <WorkspaceAppShelf />
      <div className={mobileLayout.mobilePriorityFrame}>
        <MobileHomePriority
          pendingRequests={data?.kpis?.pendingRequests}
          criticalStock={data?.kpis?.criticalStock}
          onCustomize={() => setCustomizerOpen(true)}
        />
      </div>

      <section className={styles.insightBanner} data-mobile-section="insight">
        <div className={styles.insightIcon}><Sparkles size={20} /></div>
        <div><strong>{recentNotifications.length || Number(data?.kpis?.criticalStock) > 0 ? 'Requiere tu atención' : 'Operación al día'}</strong><p>{insight}</p></div>
        <button type="button" onClick={() => navigate('/tareas')}>Ver todas las tareas <ChevronRight size={15} /></button>
      </section>

      <DashboardMetricsPanel kpis={kpis} onCustomize={() => setCustomizerOpen(true)} />

      <section className={styles.dashboardGrid} data-mobile-section="widgets">
        {visibleWidgets.has('requests') ? (
          <DashboardRecentRequests
            requests={data?.recentRequests || []}
            currency={currency}
            formatMoney={money}
            onDetail={() => navigate('/compras/solicitudes')}
          />
        ) : null}

        {visibleWidgets.has('purchaseChart') ? (
          <Card className={`${styles.widget} ${styles.chartWidget}`}>
            <WidgetHeader title="Compras mensuales" description="Monto de órdenes durante los últimos 12 meses." onDetail={() => navigate('/compras/ordenes')} />
            <MonthlyPurchasesChart
              totalFormatted={money(purchaseTotal, currency)}
              values={monthlyValues}
              months={data?.monthlyPurchases || []}
            />
          </Card>
        ) : null}

        {visibleWidgets.has('quickActions') ? (
          <Card className={`${styles.widget} ${styles.quickWidget}`}>
            <WidgetHeader title="Acciones rápidas" description="Atajos para tareas frecuentes." compact />
            <HexQuickActions actions={quickActions} onNavigate={(to) => navigate(to)} />
          </Card>
        ) : null}

        {visibleWidgets.has('stock') ? (
          <DashboardStockAlerts products={data?.criticalProducts || []} formatNumber={number} />
        ) : null}

        {visibleWidgets.has('calendar') ? (
          <Card className={`${styles.widget} ${styles.calendarWidget}`}>
            <WidgetHeader title="Agenda financiera" description="Próximos vencimientos registrados." />
            <div className={styles.calendarList}>
              {(data?.agenda || []).slice(0, 3).map((item) => (
                <AgendaListItem
                  key={item.id}
                  date={item.date}
                  title={item.title}
                  meta={`${item.meta} · ${money(item.amount, currency)}`}
                  tone={item.type === 'RECEIVABLE' ? 'blue' : 'amber'}
                />
              ))}
              {!data?.agenda?.length ? <div className={styles.empty}>No hay vencimientos próximos.</div> : null}
            </div>
            <button className={styles.fullLink} type="button" onClick={() => navigate('/finanzas/flujo-efectivo')}>
              <CalendarDays size={15} /> Ver flujo de efectivo
            </button>
          </Card>
        ) : null}

        {visibleWidgets.has('spend') ? (
          <Card className={`${styles.widget} ${styles.spendWidget}`}>
            <WidgetHeader title="Inventario por categoría" description="Distribución del valor actual del inventario." onDetail={() => navigate('/inventario/existencias')} />
            <InventoryCategoryBreakdown
              totalFormatted={money(data?.kpis?.inventoryValue, currency)}
              categories={data?.categorySpend || []}
              formatNumber={number}
            />
          </Card>
        ) : null}

        {visibleWidgets.has('team') ? (
          <Card className={`${styles.widget} ${styles.teamWidget}`}>
            <WidgetHeader title="Actividad de usuarios" description="Usuarios activos durante las últimas 24 horas." onDetail={() => navigate('/configuracion/usuarios')} />
            <UserActivitySummary activity={data?.activity} />
          </Card>
        ) : null}
      </section>

      {customizerOpen ? (
        <DashboardCustomizer
          preferences={preferences}
          onClose={() => setCustomizerOpen(false)}
          onToggleWidget={toggleWidget}
          onToggleMetric={toggleMetric}
          onCompactChange={(compact) => setPreferences((current) => ({...current, compact}))}
          onReset={resetDashboard}
        />
      ) : null}
    </div>
  );
}

