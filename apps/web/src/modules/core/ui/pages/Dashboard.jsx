import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Box,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  GripVertical,
  PackageX,
  Plus,
  Settings2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {apiRequest} from '../../../../api';
import {useAuth} from '../../../../auth/AuthContext';
import {Badge, Button, Card, PageHeader} from '../../../../design-system/components';
import {quickActions} from '../../../../data/navigation';
import HexQuickActions from '../../../../components/HexQuickActions';
import WorkspaceAppShelf from './WorkspaceAppShelf';
import MobileHomeHero, {MobileHomePriority} from './MobileHomeHero';
import mobileLayout from './MobileHomeLayout.module.css';
import KpiCard from '../../../../components/KpiCard';
import {METRIC_CATALOG, dashboardPreferencesKey, defaultDashboardPreferences, normalizeDashboardPreferences, readDashboardPreferences, writeDashboardPreferences} from '../../../../components/honeycombPreferences';
import styles from './Dashboard.module.css';
import DashboardCustomizer, {widgetCatalog} from '../components/DashboardCustomizer';
import MonthlyPurchasesChart from '../components/MonthlyPurchasesChart';
import AgendaListItem from '../components/AgendaListItem';
import InventoryCategoryBreakdown from '../components/InventoryCategoryBreakdown';



const money = (value, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', {style: 'currency', currency, maximumFractionDigits: 0}).format(Number(value || 0));

const number = (value) => new Intl.NumberFormat('es-MX', {maximumFractionDigits: 1}).format(Number(value || 0));

const statusTone = {
  Pendiente: 'warning',
  Borrador: 'neutral',
  Aprobada: 'success',
  Rechazada: 'danger',
  Ordenada: 'info',
  Cancelada: 'danger',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const {user, offlineDemo} = useAuth();
  const preferencesKey = dashboardPreferencesKey(user, offlineDemo);
  const [scopedPreferences, setScopedPreferences] = useState(() => ({
    key: preferencesKey, value: readDashboardPreferences(preferencesKey),
  }));
  const preferences = scopedPreferences.key === preferencesKey
    ? scopedPreferences.value
    : readDashboardPreferences(preferencesKey);
  function setPreferences(update) {
    setScopedPreferences(previous => {
      const current = previous.key === preferencesKey
        ? previous.value
        : readDashboardPreferences(preferencesKey);
      const next = typeof update === 'function' ? update(current) : update;
      return {key:preferencesKey, value:normalizeDashboardPreferences(next)};
    });
  }
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const dashboardScope = `${user?.companyId || user?.company?.id || 'none'}:${offlineDemo ? 'offline' : 'online'}`;
  const [dashboardState, setDashboardState] = useState(() => ({
    scope: dashboardScope, data: null, loading: true, error: '',
  }));
  // Never render a previous tenant's data while a company switch is in flight.
  const scopedDashboard = dashboardState.scope === dashboardScope ? dashboardState : null;
  const data = scopedDashboard?.data || null;
  const loading = !scopedDashboard || scopedDashboard.loading;
  const error = scopedDashboard?.error || '';

  useEffect(() => {
    let active = true;
    apiRequest('/dashboard')
      .then((result) => {
        if (active) setDashboardState({scope: dashboardScope, data: result, loading: false, error: ''});
      })
      .catch((err) => {
        if (active) setDashboardState({
          scope: dashboardScope, data: null, loading: false,
          error: err?.message || 'No se pudo cargar la información',
        });
      });
    return () => { active = false; };
  }, [dashboardScope]);

  useEffect(() => {
    if (scopedPreferences.key === preferencesKey) {
      writeDashboardPreferences(preferencesKey, scopedPreferences.value);
    }
  }, [scopedPreferences, preferencesKey]);

  const visibleWidgets = useMemo(
    () => new Set(widgetCatalog.filter((widget) => !preferences.hiddenWidgets.includes(widget.id)).map((widget) => widget.id)),
    [preferences.hiddenWidgets],
  );

  function toggleWidget(widgetId) {
    setPreferences((current) => ({
      ...current,
      hiddenWidgets: current.hiddenWidgets.includes(widgetId)
        ? current.hiddenWidgets.filter((id) => id !== widgetId)
        : [...current.hiddenWidgets, widgetId],
    }));
  }

  function resetDashboard() {
    setPreferences(defaultDashboardPreferences());
  }

  function toggleMetric(metricId) {
    if (!METRIC_CATALOG.some(item => item.id === metricId)) return;
    setPreferences(current => ({
      ...current,
      selectedMetrics: current.selectedMetrics.includes(metricId)
        ? current.selectedMetrics.filter(id => id !== metricId)
        : [...current.selectedMetrics,metricId],
    }));
  }


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
  const baseKpis = [
    {
      id: 'pendingRequests',
      label: 'Solicitudes pendientes',
      value: number(data?.kpis?.pendingRequests),
      change: 'Por atender',
      trend: 'neutral',
      icon: ClipboardCheck,
      tone: 'blue',
    },
    {
      id: 'ordersThisMonth',
      label: 'Órdenes del mes',
      value: number(data?.kpis?.ordersThisMonth),
      change: `${data?.kpis?.purchaseChange >= 0 ? '+' : ''}${number(data?.kpis?.purchaseChange)}%`,
      trend: data?.kpis?.purchaseChange >= 0 ? 'up' : 'down',
      icon: ShoppingBag,
      tone: 'violet',
    },
    {
      id: 'inventoryValue',
      label: 'Valor de inventario',
      value: money(data?.kpis?.inventoryValue, currency),
      change: 'Valor actual',
      trend: 'neutral',
      icon: CircleDollarSign,
      tone: 'green',
    },
    {
      id: 'criticalStock',
      label: 'Stock crítico',
      value: number(data?.kpis?.criticalStock),
      change: Number(data?.kpis?.criticalStock) > 0 ? 'Requiere atención' : 'Sin alertas',
      trend: 'neutral',
      icon: PackageX,
      tone: 'amber',
    },
  ];

  const monthlyValues = (data?.monthlyPurchases || []).map((item) => Number(item.total || 0));
  const purchaseTotal = monthlyValues.reduce((sum, value) => sum + value, 0);
  const recentNotifications = data?.notifications || [];
  const availableMetrics = [
    ...baseKpis,
    {
      id:'annualPurchases',label:'Compras del año',value:money(purchaseTotal,currency),
      change:'Datos de compras disponibles',trend:'neutral',icon:TrendingUp,tone:'violet',
    },
    {
      id:'recentRequests',label:'Solicitudes recientes',value:number(data?.recentRequests?.length),
      change:'Últimos registros',trend:'neutral',icon:ClipboardCheck,tone:'blue',
    },
    {
      id:'activeUsers',label:'Usuarios activos',value:number(data?.activity?.activeUsers),
      change:`De ${number(data?.activity?.totalUsers)} usuarios`,trend:'neutral',icon:Users,tone:'green',
    },
    {
      id:'pendingAgenda',label:'Próximos vencimientos',value:number(data?.agenda?.length),
      change:'Agenda financiera',trend:'neutral',icon:CalendarDays,tone:'violet',
    },
    {
      id:'notifications',label:'Avisos operativos',value:number(recentNotifications.length),
      change:'Notificaciones registradas',trend:'neutral',icon:Activity,tone:'amber',
    },
    {
      id:'inventoryCategories',label:'Categorías inventariadas',value:number(data?.categorySpend?.length),
      change:'Categorías con registros',trend:'neutral',icon:Box,tone:'green',
    },
  ];
  const kpis = preferences.selectedMetrics
    .map(id => availableMetrics.find(metric => metric.id === id))
    .filter(Boolean);
  const insight = recentNotifications[0]
    ? `${recentNotifications[0].title}: ${recentNotifications[0].message}`
    : data?.kpis?.criticalStock
      ? `${data.kpis.criticalStock} productos requieren revisión de inventario.`
      : 'La operación no presenta alertas críticas en este momento.';


  const roleName = user?.roles?.[0]?.name || 'Colaborador';
  const roleKey = roleName.toLowerCase();
  const roleActions = roleKey.includes('venta')
    ? [{label:'Nueva venta',to:'/ventas'},{label:'Clientes',to:'/terceros'},{label:'Cobranza',to:'/ventas/cobranza'}]
    : roleKey.includes('finanz') || roleKey.includes('contab')
      ? [{label:'Tesorería',to:'/finanzas/tesoreria'},{label:'Cuentas por cobrar',to:'/finanzas/cuentas-por-cobrar'},{label:'Flujo de efectivo',to:'/finanzas/flujo-efectivo'}]
      : roleKey.includes('recursos') || roleKey.includes('rrhh')
        ? [{label:'Empleados',to:'/recursos-humanos'},{label:'Incidencias',to:'/recursos-humanos/operacion'},{label:'Prenómina',to:'/recursos-humanos/prenomina'}]
        : [{label:'Centro de tareas',to:'/tareas'},{label:'Compras',to:'/compras'},{label:'Reportes',to:'/reportes'}];

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

      <section className={styles.roleFocus} data-ux-v19="role-home" data-mobile-section="role">
        <div><span>MI ESPACIO DE TRABAJO</span><strong>Accesos para {roleName}</strong></div>
        <nav>{roleActions.map((item)=><button type="button" key={item.to} onClick={()=>navigate(item.to)}>{item.label}<ChevronRight size={14}/></button>)}</nav>
      </section>

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

      {kpis.length > 0 ? (
      <section id="business-os-mobile-metrics" data-mobile-section="metrics" className={styles.kpiGrid} aria-label="Indicadores principales" data-dashboard-kpi-grid="cards">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <KpiCard
              key={item.id}
              data-dashboard-kpi={item.id}
              className={`${styles.kpiCard} ${styles[`kpi${item.tone[0].toUpperCase()}${item.tone.slice(1)}`] || ''}`}
            >
              <div className={`${styles.kpiIcon} ${styles[item.tone] || ''}`}>
                {Icon ? <Icon size={20} aria-hidden="true" /> : null}
              </div>
              <div className={styles.kpiMeta}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <span className={`${styles.change} ${styles[item.trend] || ''}`}>
                {item.trend === 'up' ? <ArrowUpRight size={14} aria-hidden="true" /> : null}
                {item.trend === 'down' ? <ArrowDownRight size={14} aria-hidden="true" /> : null}
                {item.change}
              </span>
            </KpiCard>
          );
        })}
      </section>
      ) : (
        <section id="business-os-mobile-metrics" data-mobile-section="metrics" className={styles.kpiEmpty} aria-label="Indicadores principales" data-dashboard-kpi-empty="true">
          <div>
            <h2>Tu panel de indicadores está vacío</h2>
            <p>Agrega las tarjetas de indicadores que necesitas consultar.</p>
          </div>
          <Button variant="secondary" icon={Plus} onClick={() => setCustomizerOpen(true)}>
            Agregar indicadores
          </Button>
        </section>
      )}

      <section className={styles.dashboardGrid} data-mobile-section="widgets">
        {visibleWidgets.has('requests') ? (
          <Card className={`${styles.widget} ${styles.requestsWidget}`}>
            <WidgetHeader title="Solicitudes recientes" description="Últimos movimientos registrados en compras." onDetail={() => navigate('/compras/solicitudes')} />
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Folio</th><th>Área</th><th>Solicitante</th><th>Monto</th><th>Estado</th></tr></thead>
                <tbody>
                  {(data?.recentRequests || []).map((request) => (
                    <tr key={request.id}>
                      <td><strong>{request.folio}</strong></td>
                      <td>{request.area}</td>
                      <td><span className={styles.person}><i>{getInitials(request.requester)}</i>{request.requester}</span></td>
                      <td>{money(request.amount, currency)}</td>
                      <td><Badge tone={statusTone[request.status] || 'neutral'} dot>{request.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.recentRequests?.length ? <div className={styles.empty}>No hay solicitudes registradas.</div> : null}
            </div>
          </Card>
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
          <Card className={`${styles.widget} ${styles.stockWidget}`}>
            <WidgetHeader
              title="Alertas de inventario"
              description="Productos por debajo del stock mínimo."
              badge={<Badge tone={data?.criticalProducts?.length ? 'danger' : 'success'}>{data?.criticalProducts?.length || 0} críticas</Badge>}
            />
            <div className={styles.stockList}>
              {(data?.criticalProducts || []).map((item) => (
                <div key={`${item.sku}-${item.warehouse}`}>
                  <span className={styles.stockIcon}><Box size={18} /></span>
                  <div><strong>{item.name}</strong><small>{item.sku} · {item.warehouse}</small></div>
                  <div className={styles.stockNumbers}><strong>{number(item.stock)}</strong><small>Mín. {number(item.min)}</small></div>
                </div>
              ))}
              {!data?.criticalProducts?.length ? <div className={styles.empty}>Sin alertas críticas.</div> : null}
            </div>
          </Card>
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
            <div className={styles.teamMetric}>
              <span><Users size={22} /></span>
              <div><strong>{data?.activity?.activeUsers || 0} de {data?.activity?.totalUsers || 0}</strong><small>usuarios activos</small></div>
            </div>
            <div className={styles.avatarStack}>
              {(data?.activity?.users || []).slice(0, 5).map((item) => <i key={item.id} title={item.name}>{getInitials(item.name)}</i>)}
              {(data?.activity?.activeUsers || 0) > 5 ? <i>+{data.activity.activeUsers - 5}</i> : null}
            </div>
            <div className={styles.activityStatus}><Activity size={14} /><span>Información tomada de accesos reales</span></div>
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

function WidgetHeader({title, description, badge, compact = false, onDetail}) {
  return (
    <header className={`${styles.cardHeader} ${compact ? styles.compactHeader : ''}`}>
      <span className={styles.dragHandle} aria-hidden="true"><GripVertical size={15} /></span>
      <div><h2>{title}</h2><p>{description}</p></div>
      {badge || (onDetail ? <button type="button" onClick={onDetail}>Ver detalle <ChevronRight size={15} /></button> : null)}
    </header>
  );
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase() || 'US';
}
