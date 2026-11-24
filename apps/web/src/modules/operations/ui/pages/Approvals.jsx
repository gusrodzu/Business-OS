import {useEffect,useState} from 'react';
import {CheckCircle2,Clock3,FileCheck2,History,Inbox,Settings2,XCircle,Search,RefreshCw} from 'lucide-react';
import {operationsRequest as apiRequest} from '../../services/operationsApi';
import {Badge,Button,Card,Input} from '../../../../design-system/components';
import styles from './Approvals.module.css';

const types={PURCHASE_REQUEST:'Solicitud de compra',PURCHASE_ORDER:'Orden de compra',EXPENSE:'Gasto',PAYMENT:'Pago',INVOICE:'Factura'};
const statuses={PENDING:'Pendiente',APPROVED:'Aprobada',REJECTED:'Rechazada',CANCELLED:'Cancelada',COMPLETED:'Completada'};
const tabNames={inbox:'Mi bandeja',mine:'Mis solicitudes',history:'Historial',workflows:'Flujos'};
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
const money=(v,c='MXN')=>new Intl.NumberFormat('es-MX',{style:'currency',currency:c,maximumFractionDigits:0}).format(Number(v||0));
const date=v=>v?new Intl.DateTimeFormat('es-MX',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'—';

export default function Approvals(){
  const [data,setData]=useState({workflows:[],requests:[],inbox:[],requestedByMe:[],summary:{}});
  const [tab,setTab]=useState('inbox');
  const [message,setMessage]=useState(null);
  const [saving,setSaving]=useState(false);
  const [comment,setComment]=useState({});
  const [query,setQuery]=useState('');
  const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    try{setData(await apiRequest('/approvals/dashboard'))}
    catch(e){setMessage(['error',e.message])}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[]);

  async function decide(id,action){
    if(saving)return;
    setSaving(true);
    try{
      await apiRequest(`/approvals/requests/${id}/${action}`,{method:'POST',body:{comment:comment[id]||null}});
      setMessage(['success',action==='approve'?'Solicitud aprobada':'Solicitud rechazada']);
      await load();
    }catch(e){setMessage(['error',e.message])}
    finally{setSaving(false)}
  }

  const sourceRows=tab==='inbox'?data.inbox:tab==='mine'?data.requestedByMe:data.requests;
  const q=normalize(query).trim();
  const matches=(...values)=>!q||normalize(values.join(' ')).includes(q);
  const rows=(sourceRows||[]).filter(r=>matches(r.entityFolio,r.entityType,types[r.entityType],r.title,r.description,r.workflow?.name,statuses[r.status],r.status));
  const workflows=(data.workflows||[]).filter(w=>matches(w.name,w.description,w.entityType,types[w.entityType]));

  return <div className={styles.page}>
    <header className={styles.header}><h1>Aprobaciones</h1><p>Decisiones, autorizaciones y trazabilidad.</p></header>
    {message?<div role={message[0]==='error'?'alert':'status'} className={`${styles.message} ${styles[message[0]]}`}>{message[1]}</div>:null}
    <div className={styles.approvalLayout}>
      <aside className={styles.sidebar} aria-label="Navegación de aprobaciones">
        <h2>Centro de decisiones</h2>
        <nav className={styles.tabs} aria-label="Vistas de aprobaciones">
          {[[ 'inbox',Inbox ],['mine',FileCheck2],['history',History],['workflows',Settings2]].map(([id,Icon])=><button key={id} type="button" aria-pressed={tab===id} className={tab===id?styles.active:''} onClick={()=>{setTab(id);setQuery('')}}><Icon size={17} aria-hidden="true"/><span>{tabNames[id]}</span>{id==='inbox'?<strong>{data.summary?.myInbox||0}</strong>:null}</button>)}
        </nav>
        <div className={styles.summary} aria-label="Resumen de la empresa">
          <h2>Resumen</h2>
          {[[Clock3,'Pendientes','pending'],[CheckCircle2,'Aprobadas','approved'],[XCircle,'Rechazadas','rejected']].map(([Icon,label,key])=><div key={key} className={styles[key]}><Icon size={16} aria-hidden="true"/><span>{label}</span><strong>{data.summary?.[key]||0}</strong></div>)}
        </div>
      </aside>
      <section className={styles.workspace} aria-label={tabNames[tab]}>
        <header className={styles.toolbar}><div><h2>{tabNames[tab]}</h2><p>{loading?'Actualizando…':tab==='workflows'?`${workflows.length} flujos`:`${rows.length} solicitudes`}</p></div><Button variant="secondary" icon={RefreshCw} disabled={loading||saving} onClick={load}>Actualizar</Button></header>
        <label className={styles.search}><Search size={18} aria-hidden="true"/><input type="search" aria-label={tab==='workflows'?'Buscar flujos':'Buscar solicitudes'} placeholder={tab==='workflows'?'Buscar flujos…':'Buscar por folio, concepto o estado…'} value={query} onChange={e=>setQuery(e.target.value)}/></label>
        {loading?<p className={styles.empty} role="status">Cargando solicitudes…</p>:null}
    {tab==='workflows'?<div className={styles.workflowGrid}>{workflows.map(w=><Card key={w.id} className={styles.workflow}><div className={styles.workflowHead}><div><span>{types[w.entityType]||w.entityType}</span><h3>{w.name}</h3></div><Badge tone={w.active?'success':'neutral'}>{w.active?'Activo':'Inactivo'}</Badge></div><p>{w.description||'Sin descripción'}</p><div className={styles.steps}>{w.rules.map(r=><div key={r.id}><b>{r.sequence}</b><span>{r.name}</span><small>{r.actorType}{r.permissionKey?` · ${r.permissionKey}`:''}</small></div>)}</div></Card>)}</div>:<Card className={styles.tableCard}>
      <div className={styles.list}>
        {rows.length===0?<div className={styles.empty}>No hay solicitudes para mostrar.</div>:rows.map(r=>{
          const currentStep=r.steps?.find(s=>s.status==='PENDING');
          return <article key={r.id}>
            <div className={styles.requestTop}>
              <div><span>{types[r.entityType]||r.entityType}{r.entityFolio&&r.entityFolio!==r.title?` · ${r.entityFolio}`:''}</span><h3>{r.title}</h3><p>{r.description||r.workflow?.name}</p></div>
              <div className={styles.requestMeta}><Badge tone={r.status==='APPROVED'?'success':r.status==='REJECTED'?'danger':'warning'}>{statuses[r.status]||r.status}</Badge>{r.amount!=null?<strong>{money(r.amount,r.currency)}</strong>:null}<small>{date(r.requestedAt)}</small></div>
            </div>
            {currentStep?<div className={styles.step}><span>Paso actual</span><strong>{currentStep.name}</strong><small>{currentStep.permissionKey||currentStep.role?.name||currentStep.approverUser?.name||'Aprobador autorizado'}</small></div>:null}
            {tab==='inbox' && r.status==='PENDING'?<div className={styles.actions}><Input label="Comentario opcional" value={comment[r.id]||''} onChange={e=>setComment(v=>({...v,[r.id]:e.target.value}))}/><Button variant="secondary" disabled={saving||loading} onClick={()=>decide(r.id,'reject')}>Rechazar</Button><Button disabled={saving} onClick={()=>decide(r.id,'approve')}>Aprobar</Button></div>:null}
          </article>
        })}
      </div>
    </Card>}
      </section>
    </div>
  </div>
}
