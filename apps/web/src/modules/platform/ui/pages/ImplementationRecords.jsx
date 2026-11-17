import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,ClipboardList,Plus,RefreshCw,Search,ShieldAlert,Users} from 'lucide-react';
import {platformRequest} from '../../services/platformApi';
import styles from './ImplementationRecords.module.css';

const stages={LEAD:'Prospecto',CONFIGURATION:'Configuración',TESTING:'Pruebas',ACTIVE:'Activo',PAUSED:'Pausado',CANCELLED:'Cancelado'};
const allowed={LEAD:['CONFIGURATION','CANCELLED'],CONFIGURATION:['PAUSED','CANCELLED'],TESTING:['CONFIGURATION','PAUSED','CANCELLED'],ACTIVE:['PAUSED'],PAUSED:['CONFIGURATION','CANCELLED'],CANCELLED:[]};
const emptyForm={name:'',contactEmail:'',industryKey:'',scianCode:'',notes:''};
const url='/platform-admin/implementation-records';

function parseGate(error){
  if(error?.status===503 && ['IMPLEMENTATIONS_NOT_ENABLED','IMPLEMENTATION_SCHEMA_NOT_READY'].includes(error?.code)){
    return 'El registro de implementaciones no está habilitado en este entorno. Se requiere verificar la migración y autorizar su activación; no se creará ningún tenant.';
  }
  return '';
}
export default function ImplementationRecords({critical}){
  const [state,setState]=useState('loading');
  const [records,setRecords]=useState([]);
  const [error,setError]=useState('');
  const [gate,setGate]=useState('');
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('all');
  const [selected,setSelected]=useState(null);
  const [details,setDetails]=useState(null);
  const [detailError,setDetailError]=useState('');
  const [createOpen,setCreateOpen]=useState(false);
  const [form,setForm]=useState(emptyForm);
  const [reason,setReason]=useState('');
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState('');
  const requestId=useRef(null);
  const load=useCallback(async()=>{
    setState('loading');setError('');
    try{
      const result=await platformRequest(url);
      setRecords(Array.isArray(result?.records)?result.records:[]);
      setGate('');setState('ready');
    }catch(e){
      const blocked=parseGate(e);
      if(blocked){setGate(blocked);setRecords([]);setState('gated');}
      else{setError(e.message||'No fue posible consultar las implementaciones.');setState('error');}
    }
  },[]);
  useEffect(()=>{load()},[load]);

  const visible=useMemo(()=>records.filter(row=>{
    const text=[row.name,row.industryKey,row.contactEmail].filter(Boolean).join(' ').toLocaleLowerCase('es');
    return text.includes(query.trim().toLocaleLowerCase('es')) && (filter==='all'||row.stage===filter);
  }),[records,query,filter]);

  async function showDetails(id){
    if(selected===id){setSelected(null);setDetails(null);return;}
    setSelected(id);setDetails(null);setDetailError('');setReason('');
    try{
      const result=await platformRequest(url+'/'+encodeURIComponent(id));
      setDetails(result.record||null);
    }catch(e){setDetailError(e.message||'No fue posible cargar el historial.');}
  }
  function updateField(key,value){
    requestId.current=null;
    setForm(previous=>({...previous,[key]:value}));
  }
  async function create(event){
    event.preventDefault();
    if(busy)return;
    if(form.name.trim().length<2 || !form.contactEmail.trim())return;
    const data={
      name:form.name.trim(),contactEmail:form.contactEmail.trim().toLowerCase(),
      ...(form.industryKey.trim()?{industryKey:form.industryKey.trim()}:{}),
      ...(form.scianCode.trim()?{scianCode:form.scianCode.trim()}:{}),
      ...(form.notes.trim()?{notes:form.notes.trim()}:{}),
    };
    if(!requestId.current)requestId.current=crypto.randomUUID();
    const key=requestId.current;
    setBusy(true);setFeedback('');
    try{
      await critical(async()=>{
        const result=await platformRequest(url,{method:'POST',headers:{'idempotency-key':key},body:data});
        if(result?.record){
          setFeedback(result.created?'Prospecto registrado con auditoría.':'Solicitud ya registrada; sin duplicados.');
          setCreateOpen(false);setForm(emptyForm);requestId.current=null;await load();
        }
      });
    }finally{setBusy(false);}
  }
  async function changeStage(toStage){
    if(!selected||busy||reason.trim().length<10)return;
    const id=selected;
    const message=reason.trim();
    setBusy(true);setFeedback('');
    try{
      await critical(async()=>{
        await platformRequest(url+'/'+encodeURIComponent(id)+'/stage',{
          method:'PATCH',body:{toStage,reason:message},
        });
        setFeedback('Etapa actualizada y registrada en auditoría.');
        setReason('');
        await load();
        const result=await platformRequest(url+'/'+encodeURIComponent(id));
        setDetails(result.record||null);
      });
    }finally{setBusy(false);}
  }

  return <section className={styles.page} aria-labelledby="implementation-records-heading" data-platform-implementation-records="true">
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>FLUJO DE IMPLEMENTACIÓN · SUPER ADMIN</span>
        <h2 id="implementation-records-heading">Prospectos y seguimiento</h2>
        <p>Etapas comerciales persistidas, independientes de las empresas operativas y de las licencias.</p></div>
      <button type="button" className={styles.secondary} onClick={load} disabled={state==='loading'}><RefreshCw size={16}/> Actualizar</button>
    </header>
    {state==='loading'?<p className={styles.message} role="status">Verificando el registro seguro de implementaciones…</p>:null}
    {state==='gated'?<div className={styles.gate} role="status"><ShieldAlert size={22} aria-hidden="true"/><p>{gate}</p></div>:null}
    {state==='error'?<div className={styles.gate} role="alert"><ShieldAlert size={22} aria-hidden="true"/><p>{error}</p></div>:null}
    {feedback?<p className={styles.success} role="status">{feedback}</p>:null}
    {state==='ready'?<>
      <div className={styles.toolbar}>
        <label className={styles.search}><Search size={17} aria-hidden="true"/><span className={styles.srOnly}>Buscar prospecto por nombre, giro o correo</span>
          <input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar prospecto o giro"/></label>
        <label className={styles.filter}>Etapa <select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todas</option>
          {Object.entries(stages).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
        <button type="button" className={styles.primary} onClick={()=>setCreateOpen(v=>!v)} aria-expanded={createOpen} aria-controls="platform-prospect-form"><Plus size={17}/> Nuevo prospecto</button>
      </div>
      {createOpen?<form id="platform-prospect-form" className={styles.form} onSubmit={create}>
        <h3>Registrar prospecto · no crea un tenant</h3>
        <div className={styles.fields}>
          <label>Nombre comercial *<input required minLength={2} maxLength={120} autoComplete="organization" value={form.name} onChange={e=>updateField('name',e.target.value)}/></label>
          <label>Correo de contacto *<input required type="email" maxLength={254} autoComplete="email" value={form.contactEmail} onChange={e=>updateField('contactEmail',e.target.value)}/></label>
          <label>Giro (clave de referencia)<input maxLength={100} value={form.industryKey} onChange={e=>updateField('industryKey',e.target.value)}/></label>
          <label>SCIAN (solo si está verificado)<input pattern="[0-9]{2,6}" inputMode="numeric" title="De 2 a 6 dígitos" value={form.scianCode} onChange={e=>updateField('scianCode',e.target.value)}/></label>
          <label className={styles.full}>Notas de seguimiento<textarea rows={3} maxLength={2000} value={form.notes} onChange={e=>updateField('notes',e.target.value)}/></label>
        </div>
        <p>La operación requiere reautenticación reciente y registra al responsable en la auditoría. No activa módulos, usuarios ni suscripciones.</p>
        <div className={styles.actions}><button type="button" className={styles.secondary} onClick={()=>setCreateOpen(false)}>Cancelar</button>
          <button className={styles.primary} type="submit" disabled={busy}>{busy?'Guardando…':'Registrar prospecto'}</button></div>
      </form>:null}
      <p className={styles.count}>{visible.length} de {records.length} registros. Los datos proceden exclusivamente del backend de plataforma.</p>
      <div className={styles.grid}>
        {visible.map(row=><article key={row.id} className={styles.card}>
          <div className={styles.cardHeader}><span className={styles.icon}><Users size={19}/></span><span className={styles.badge}>{stages[row.stage]||'Estado desconocido'}</span></div>
          <h3>{row.name}</h3><p>{row.industryKey||'Giro pendiente'} · {row.kind==='PROSPECT'?'Prospecto':'Tenant registrado'}</p>
          <span className={styles.minor}>Plan solicitado: {row.planKey||'Por definir'}</span>
          <button className={styles.secondary} type="button" aria-expanded={selected===row.id} onClick={()=>showDetails(row.id)}>
            {selected===row.id?'Cerrar seguimiento':'Ver seguimiento'} <ArrowRight size={15}/>
          </button>
          {selected===row.id?<div className={styles.details}>
            {detailError?<p role="alert">{detailError}</p>:!details?<p role="status">Cargando historial…</p>:<>
              <h4>Historial auditado</h4>
              <ol className={styles.history}>{(details.events||[]).map(event=><li key={event.id}><strong>{stages[event.toStage]||event.toStage}</strong>
                <span>{event.createdAt?new Date(event.createdAt).toLocaleDateString('es-MX'):'—'} · {event.reason||'Registro inicial'}</span></li>)}</ol>
              <h4>Transición autorizada</h4>
              {(allowed[details.stage]||[]).length?<><label className={styles.reason}>Motivo (mínimo 10 caracteres)<textarea rows={3} minLength={10} maxLength={500} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Justificación del cambio de etapa"/></label>
                <div className={styles.actions}>{allowed[details.stage].map(stage=><button key={stage} type="button" className={styles.secondary} disabled={busy||reason.trim().length<10}
                  onClick={()=>changeStage(stage)}>{stages[stage]}</button>)}</div></>:<p>Este registro no permite nuevas transiciones desde esta pantalla.</p>}
              <p className={styles.warning}>Pruebas, activación de tenants y licencias requieren validación independiente del backend. No están disponibles aquí.</p>
            </>}
          </div>:null}
        </article>)}
      </div>
      {!visible.length?<div className={styles.empty}><ClipboardList size={24}/><strong>No hay implementaciones para estos filtros.</strong>
        <button type="button" className={styles.secondary} onClick={()=>{setQuery('');setFilter('all')}}>Limpiar filtros</button></div>:null}
    </>:null}
  </section>;
}
