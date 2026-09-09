import {useEffect,useMemo,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {
  Activity,AlertTriangle,ArrowRight,BriefcaseBusiness,Building2,CalendarDays,CheckCircle2,
  CircleDollarSign,Clock3,CreditCard,FileCheck2,Files,Landmark,PackageOpen,ReceiptText,
  RefreshCw,ShoppingCart,Users,WalletCards
} from 'lucide-react';
import {apiRequest} from '../../../../api';
import {Badge,Button,Card} from '../../../../design-system/components';
import KpiGrid from '../../../../components/KpiGrid';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import styles from './AdministrativeCenter.module.css';
import {ModuleHeader} from '../../../../components/module-system';

const money=(value,currency='MXN')=>new Intl.NumberFormat('es-MX',{
  style:'currency',currency,maximumFractionDigits:0
}).format(Number(value||0));
const date=(value)=>value?new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'short'}).format(new Date(value)):'—';
const dateTime=(value)=>value?new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value)):'—';
const tone={HIGH:'danger',MEDIUM:'warning',LOW:'success'};
const levelLabel={HIGH:'Crítico',MEDIUM:'Atención',LOW:'En orden'};
const healthCopy={
  EXCELLENT:['Excelente','La operación administrativa está bajo control.'],
  GOOD:['Estable','Hay pendientes, pero no comprometen la continuidad.'],
  ATTENTION:['Requiere atención','Conviene resolver los pendientes prioritarios.'],
  CRITICAL:['Crítico','Hay riesgos administrativos que requieren decisión inmediata.']
};

export default function AdministrativeCenter(){
  const navigate=useNavigate();
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [queueFilter,setQueueFilter]=useState('ALL');

  const load=async()=>{
    setLoading(true);
    setError('');
    try{setData(await apiRequest('/administration/dashboard'))}
    catch(err){setError(err.message)}
    finally{setLoading(false)}
  };

  useEffect(()=>{load()},[]);

  const filteredQueue=useMemo(()=>{
    const rows=data?.queue||[];
    if(queueFilter==='HIGH')return rows.filter(x=>x.level==='HIGH');
    if(queueFilter==='MEDIUM')return rows.filter(x=>x.level==='MEDIUM');
    return rows;
  },[data,queueFilter]);

  if(loading){
    return <div className={styles.page}>
      <Card className={styles.state}><RefreshCw className={styles.spin}/><strong>Preparando Centro Administrativo…</strong></Card>
    </div>;
  }
  if(error){
    return <div className={styles.page}>
      <Card className={styles.state}><strong>No fue posible cargar Administración</strong><p>{error}</p><Button onClick={load}>Reintentar</Button></Card>
    </div>;
  }

  const currency=data?.company?.currency||'MXN';
  const health=healthCopy[data?.health?.status]||healthCopy.GOOD;
  const budgetPct=data?.summary?.budgetExecution==null?null:Number(data.summary.budgetExecution);

  const modules=[
    {title:'Aprobaciones',desc:'Decisiones y autorizaciones pendientes.',to:'/aprobaciones',icon:FileCheck2,value:data.counts?.approvals||0},
    {title:'Cuentas por pagar',desc:'Facturas, vencimientos y pagos a proveedores.',to:'/finanzas/cuentas-por-pagar',icon:CreditCard,value:data.counts?.payables||0},
    {title:'Cuentas por cobrar',desc:'Cartera, vencimientos y cobranza.',to:'/finanzas/cuentas-por-cobrar',icon:WalletCards,value:data.counts?.receivables||0},
    {title:'Tesorería',desc:'Caja, bancos y movimientos de efectivo.',to:'/finanzas/tesoreria',icon:Landmark,value:data.counts?.treasuryAccounts||0},
    {title:'Gastos y viáticos',desc:'Control, aprobación y comprobación.',to:'/gastos',icon:ReceiptText,value:data.counts?.submittedExpenses||0},
    {title:'Presupuestos',desc:'Planeación y control presupuestal.',to:'/finanzas/presupuestos',icon:CircleDollarSign,value:data.counts?.budgets||0},
    {title:'Compras',desc:'Solicitudes, órdenes y recepciones.',to:'/compras',icon:ShoppingCart,value:data.counts?.purchaseRequests||0},
    {title:'Expedientes RH',desc:'Documentos laborales y vencimientos.',to:'/recursos-humanos/expedientes',icon:Files,value:data.counts?.expiredDocuments||0},
    {title:'Nómina',desc:'Periodos, cálculo, aprobación y pago.',to:'/recursos-humanos/prenomina',icon:Users,value:data.counts?.payrollDue||0},
    {title:'Agenda',desc:'Compromisos sincronizados del sistema.',to:'/agenda',icon:CalendarDays,value:data.counts?.agendaNext7||0},
    {title:'Activos fijos',desc:'Activos, depreciación y valor neto.',to:'/activos-fijos',icon:PackageOpen,value:data.counts?.assets||0},
    {title:'Contabilidad',desc:'Pólizas, periodos y cuentas contables.',to:'/finanzas/contabilidad',icon:Building2,value:'→'}
  ];

  return <div className={styles.page}>
    <ModuleHeader
      eyebrow="Administración · Centro de control"
      title="Centro Administrativo"
      description="Prioriza pendientes, controla vencimientos y conecta las decisiones administrativas con Compras, Finanzas, RR. HH. y Agenda."
      actions={<>
        <Button variant="secondary" onClick={()=>navigate('/agenda')}><CalendarDays size={16}/> Agenda</Button>
        <Button variant="secondary" onClick={()=>navigate('/aprobaciones')}><FileCheck2 size={16}/> Aprobaciones</Button>
        <Button variant="secondary" onClick={load}><RefreshCw size={16}/> Actualizar</Button>
      </>}
    />

    <KpiGrid>
      <KpiCard onClick={()=>document.getElementById('admin-pendientes')?.scrollIntoView({behavior:'smooth'})}>
        <BriefcaseBusiness/>
        <span>Salud administrativa</span>
        <KpiInfo title="Salud administrativa">Score de 0 a 100 calculado con vencimientos, aprobaciones, tesorería, presupuesto, documentos y nómina.</KpiInfo>
        <strong>{data.health?.score??0}/100</strong>
        <small>{health[0]}</small>
      </KpiCard>
      <KpiCard onClick={()=>navigate('/finanzas/tesoreria')}>
        <Landmark/>
        <span>Capital de trabajo</span>
        <KpiInfo title="Capital de trabajo">Tesorería + cartera por cobrar − obligaciones por pagar.</KpiInfo>
        <strong>{money(data.summary?.workingCapital,currency)}</strong>
        <small>Posición operativa</small>
      </KpiCard>
      <KpiCard onClick={()=>navigate('/finanzas/cuentas-por-cobrar')}>
        <WalletCards/>
        <span>Por cobrar</span>
        <KpiInfo title="Por cobrar">Saldo pendiente de clientes y cartera vencida.</KpiInfo>
        <strong>{money(data.summary?.receivableBalance,currency)}</strong>
        <small>{data.counts?.overdueReceivables||0} vencida(s)</small>
      </KpiCard>
      <KpiCard onClick={()=>navigate('/finanzas/cuentas-por-pagar')}>
        <CreditCard/>
        <span>Por pagar</span>
        <KpiInfo title="Por pagar">Saldo pendiente con proveedores y compromisos próximos.</KpiInfo>
        <strong>{money(data.summary?.payableBalance,currency)}</strong>
        <small>{data.counts?.overduePayables||0} vencida(s)</small>
      </KpiCard>
      <KpiCard onClick={()=>navigate('/finanzas/tesoreria')}>
        <CircleDollarSign/>
        <span>Liquidez</span>
        <KpiInfo title="Liquidez">Saldo consolidado de cuentas activas de caja y bancos.</KpiInfo>
        <strong>{money(data.summary?.treasuryBalance,currency)}</strong>
        <small>{data.counts?.treasuryAccounts||0} cuenta(s)</small>
      </KpiCard>
      <KpiCard onClick={()=>navigate('/finanzas/presupuestos')}>
        <ReceiptText/>
        <span>Ejecución mensual</span>
        <KpiInfo title="Ejecución presupuestal">Gasto administrativo registrado frente a las líneas presupuestales del mes actual.</KpiInfo>
        <strong>{budgetPct==null?'—':`${budgetPct.toFixed(1)}%`}</strong>
        <small>{budgetPct==null?'Sin presupuesto mensual':money(data.summary?.budgetRemaining,currency)+' disponible'}</small>
      </KpiCard>
    </KpiGrid>

    <div className={styles.controlGrid}>
      <Card className={styles.healthCard}>
        <div className={styles.healthTop}>
          <div>
            <span>Control operativo</span>
            <h2>{health[0]}</h2>
            <p>{health[1]}</p>
          </div>
          <div className={styles.healthScore} data-status={data.health?.status}>{data.health?.score??0}</div>
        </div>
        <div className={styles.healthFacts}>
          <div><strong>{data.counts?.approvals||0}</strong><span>Aprobaciones</span></div>
          <div><strong>{data.counts?.overduePurchaseOrders||0}</strong><span>Recepciones atrasadas</span></div>
          <div><strong>{data.counts?.expiredDocuments||0}</strong><span>Documentos vencidos</span></div>
          <div><strong>{data.counts?.unreadNotifications||0}</strong><span>Notificaciones</span></div>
        </div>
        <div className={styles.budgetBlock}>
          <div><span>Presupuesto del mes</span><strong>{money(data.summary?.budgetMonth,currency)}</strong></div>
          <div className={styles.progress}><span style={{width:`${Math.min(100,Math.max(0,budgetPct||0))}%`}}/></div>
          <small>{money(data.summary?.expensesMonth,currency)} registrado en gastos · {budgetPct==null?'sin referencia mensual':`${budgetPct.toFixed(1)}% ejecutado`}</small>
        </div>
      </Card>

      <Card className={styles.processCard}>
        <div className={styles.cardHead}>
          <div><h2>Estado de procesos</h2><p>Semáforo de los procesos administrativos críticos.</p></div>
          <CheckCircle2/>
        </div>
        <div className={styles.processList}>
          {(data.processStatus||[]).map(item=><Link to={item.to} key={item.key}>
            <span className={styles.processDot} data-level={item.level}/>
            <div><strong>{item.label}</strong><small>{item.count?`${item.count} pendiente(s)`:'Sin incidencias críticas'}</small></div>
            <Badge tone={tone[item.level]||'neutral'}>{levelLabel[item.level]||item.level}</Badge>
            <ArrowRight size={16}/>
          </Link>)}
        </div>
      </Card>
    </div>

    <Card className={styles.queueCard} id="admin-pendientes">
      <div className={styles.queueHeader}>
        <div><span>Prioridad operativa</span><h2>Centro de pendientes</h2><p>Una sola bandeja para vencimientos, aprobaciones, cobranza, pagos, compras, documentos y nómina.</p></div>
        <div className={styles.queueTabs}>
          <button className={queueFilter==='ALL'?styles.active:''} onClick={()=>setQueueFilter('ALL')}>Todos <b>{data.queue?.length||0}</b></button>
          <button className={queueFilter==='HIGH'?styles.active:''} onClick={()=>setQueueFilter('HIGH')}>Críticos <b>{data.queue?.filter(x=>x.level==='HIGH').length||0}</b></button>
          <button className={queueFilter==='MEDIUM'?styles.active:''} onClick={()=>setQueueFilter('MEDIUM')}>Próximos <b>{data.queue?.filter(x=>x.level==='MEDIUM').length||0}</b></button>
        </div>
      </div>
      <div className={styles.queueList}>
        {filteredQueue.length?filteredQueue.map(item=><Link key={item.key} to={item.to}>
          <Badge tone={tone[item.level]||'neutral'}>{levelLabel[item.level]||item.level}</Badge>
          <div className={styles.queueCopy}><strong>{item.title}</strong><p>{item.detail}</p></div>
          <div className={styles.queueMeta}>{item.value!=null?<strong>{money(item.value,item.currency||currency)}</strong>:null}<small><Clock3 size={13}/>{date(item.dueAt)}</small></div>
          <ArrowRight size={17}/>
        </Link>):<div className={styles.empty}><CheckCircle2/><strong>No hay pendientes en este filtro</strong><p>La operación administrativa está al día.</p></div>}
      </div>
    </Card>

    <div className={styles.secondaryGrid}>
      <Card className={styles.upcomingCard}>
        <div className={styles.cardHead}><div><h2>Próximos 7 días</h2><p>Compromisos sincronizados desde Agenda y procesos del ERP.</p></div><CalendarDays/></div>
        <div className={styles.upcomingList}>
          {(data.upcoming?.agenda||[]).slice(0,6).map(item=><Link to="/agenda" key={item.id}>
            <span className={styles.datePill}>{date(item.startAt)}</span>
            <div><strong>{item.title}</strong><small>{item.assignee?`${item.assignee.firstName} ${item.assignee.lastName}`:'Agenda del sistema'}</small></div>
            <ArrowRight size={15}/>
          </Link>)}
          {!data.upcoming?.agenda?.length?<div className={styles.miniEmpty}>Sin compromisos manuales próximos.</div>:null}
        </div>
        <Link className={styles.cardLink} to="/agenda">Abrir Agenda <ArrowRight size={15}/></Link>
      </Card>

      <Card className={styles.activityCard}>
        <div className={styles.cardHead}><div><h2>Actividad reciente</h2><p>Trazabilidad de cambios registrados por usuarios.</p></div><Activity/></div>
        <div className={styles.activityList}>
          {(data.activity||[]).slice(0,7).map(item=><div key={item.id}>
            <span className={styles.activityIcon}><Activity size={14}/></span>
            <div><strong>{item.description}</strong><small>{item.user?`${item.user.firstName} ${item.user.lastName}`:'Sistema'} · {dateTime(item.createdAt)}</small></div>
          </div>)}
          {!data.activity?.length?<div className={styles.miniEmpty}>Aún no hay actividad auditable para mostrar.</div>:null}
        </div>
        <Link className={styles.cardLink} to="/configuracion/actividad">Ver auditoría <ArrowRight size={15}/></Link>
      </Card>
    </div>

    <section className={styles.moduleSection}>
      <div className={styles.sectionHead}>
        <div><span>Aplicaciones administrativas</span><h2>Todo el ciclo administrativo conectado</h2><p>Entra al proceso canónico sin duplicar información ni rutas.</p></div>
      </div>
      <div className={styles.moduleGrid}>
        {modules.map(item=>{
          const Icon=item.icon;
          return <Link to={item.to} key={item.title}>
            <div className={styles.icon}><Icon size={20}/></div>
            <div><strong>{item.title}</strong><p>{item.desc}</p></div>
            <b>{item.value}</b>
          </Link>;
        })}
      </div>
    </section>
  </div>;
}
