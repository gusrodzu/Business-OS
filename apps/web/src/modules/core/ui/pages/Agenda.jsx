import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {
  Bell,CalendarDays,Check,ChevronDown,ChevronLeft,ChevronRight,Clock3,Edit3,Plus,RefreshCw,
  Trash2,X
} from 'lucide-react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {apiRequest} from '../../../../api';
import {Button} from '../../../../design-system/components/Button';
import {Input} from '../../../../design-system/components/Input';
import styles from './Agenda.module.css';

const priorityLabels={LOW:'Baja',NORMAL:'Normal',HIGH:'Alta',URGENT:'Urgente'};
const reminderOptions=[
  {value:'',label:'Sin recordatorio'},
  {value:'0',label:'Al iniciar'},
  {value:'10',label:'10 minutos antes'},
  {value:'30',label:'30 minutos antes'},
  {value:'60',label:'1 hora antes'},
  {value:'1440',label:'1 día antes'},
  {value:'2880',label:'2 días antes'},
  {value:'10080',label:'1 semana antes'},
];

function startOfDay(date){const d=new Date(date);d.setHours(0,0,0,0);return d}
function endOfDay(date){const d=new Date(date);d.setHours(23,59,59,999);return d}
function startOfWeek(date){const d=startOfDay(date);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d}
function addDays(date,count){const d=new Date(date);d.setDate(d.getDate()+count);return d}
function startOfMonth(date){return new Date(date.getFullYear(),date.getMonth(),1)}
function sameDay(a,b){return new Date(a).toDateString()===new Date(b).toDateString()}
function isoDate(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function localDateTime(value){
  const d=new Date(value);
  return `${isoDate(d)}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function timeLabel(value,allDay){return allDay?'Todo el día':new Intl.DateTimeFormat('es-MX',{hour:'2-digit',minute:'2-digit'}).format(new Date(value))}
function fullDate(value){return new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(value))}
function employeeName(employee){return `${employee.firstName||''} ${employee.lastName||''}`.trim()}

function emptyEvent(date=new Date()){
  const start=new Date(date);
  if(start.getHours()===0&&start.getMinutes()===0)start.setHours(9,0,0,0);
  else start.setHours(start.getHours()+1,0,0,0);
  const end=new Date(start.getTime()+60*60*1000);
  return {id:null,title:'',description:'',allDay:false,startAt:localDateTime(start),endAt:localDateTime(end),priority:'NORMAL',reminderMinutes:'30',assigneeEmployeeId:'',status:'ACTIVE'};
}

export default function Agenda(){
  const navigate=useNavigate();
  const [searchParams,setSearchParams]=useSearchParams();
  const [view,setView]=useState('month');
  const [cursor,setCursor]=useState(new Date());
  const [items,setItems]=useState([]);
  const [employees,setEmployees]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [modal,setModal]=useState(null);
  const [query,setQuery]=useState('');
  const requestId=useRef(0);
  const [formError,setFormError]=useState('');

  useEffect(()=>{
    if(searchParams.get('new')==='1'){
      setModal(emptyEvent(new Date()));
      setSearchParams({}, {replace:true});
    }
  },[searchParams,setSearchParams]);

  const range=useMemo(()=>{
    if(view==='day')return {from:startOfDay(cursor),to:endOfDay(cursor)};
    if(view==='week'){
      const from=startOfWeek(cursor);
      return {from,to:endOfDay(addDays(from,6))};
    }
    const first=startOfMonth(cursor);
    const from=startOfWeek(first);
    return {from,to:endOfDay(addDays(from,41))};
  },[cursor,view]);

  const load=useCallback(async(silent=false)=>{
    const id=++requestId.current;
    if(!silent)setLoading(true);
    setError('');
    try{
      const [agenda,meta]=await Promise.all([
        apiRequest('/agenda',{params:{from:isoDate(range.from),to:isoDate(range.to),take:500}}),
        employees.length?Promise.resolve({employees}):apiRequest('/agenda/meta'),
      ]);
      if(id!==requestId.current)return;
      setItems(agenda.items||[]);
      if(meta.employees)setEmployees(meta.employees);
    }catch(e){if(id===requestId.current)setError(e.message||'No fue posible cargar la agenda');}
    finally{if(id===requestId.current)setLoading(false)}
  },[range.from,range.to,employees]);

  useEffect(()=>{load();return()=>{requestId.current++;};},[view,cursor.getFullYear(),cursor.getMonth(),cursor.getDate()]);
  useEffect(()=>{
    const onFocus=()=>load(true);
    const timer=window.setInterval(()=>load(true),60_000);
    window.addEventListener('focus',onFocus);
    return()=>{window.clearInterval(timer);window.removeEventListener('focus',onFocus)};
  },[load]);

  const visibleItems=useMemo(()=>items.filter(item=>[item.title,item.description,item.module,item.meta].join(' ').toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'))),[items,query]);
  const byDay=useMemo(()=>{
    const map=new Map();
    visibleItems.forEach(item=>{const key=isoDate(new Date(item.date));const list=map.get(key)||[];list.push(item);map.set(key,list)});
    map.forEach(list=>list.sort((a,b)=>new Date(a.date)-new Date(b.date)));
    return map;
  },[visibleItems]);

  useEffect(()=>{
    const eventId=searchParams.get('event');
    if(!eventId||!items.length)return;
    const item=items.find(row=>row.source==='manual'&&row.rawId===eventId);
    if(item){
      openItem(item);
      setSearchParams({}, {replace:true});
    }
  },[items,searchParams,setSearchParams]);

  const stats=useMemo(()=>{
    const today=startOfDay(new Date());const todayEnd=endOfDay(today);const weekEnd=endOfDay(addDays(today,7));
    return {
      today:items.filter(i=>{const d=new Date(i.date);return d>=today&&d<=todayEnd}).length,
      week:items.filter(i=>{const d=new Date(i.date);return d>=today&&d<=weekEnd}).length,
      overdue:items.filter(i=>new Date(i.date)<today&&i.status!=='COMPLETED').length,
      manual:items.filter(i=>i.source==='manual').length,
    };
  },[items]);

  function move(direction){
    if(view==='day'){setCursor(addDays(cursor,direction));return;}
    if(view==='week'){
      const d=new Date(cursor);d.setDate(d.getDate()+direction*7);setCursor(d);
    }else{
      setCursor(new Date(cursor.getFullYear(),cursor.getMonth()+direction,1));
    }
  }

  function openNew(date=new Date()){
    setFormError('');setModal(emptyEvent(date));
  }

  function openItem(item){
    if(item.source!=='manual'){
      if(item.route)navigate(item.route);
      return;
    }
    setFormError('');
    const allDay=Boolean(item.allDay);
    setModal({
      id:item.rawId,
      title:item.title||'',
      description:item.description||'',
      allDay,
      startAt:allDay?isoDate(new Date(item.date)):localDateTime(item.date),
      endAt:item.endAt?(allDay?isoDate(new Date(item.endAt)):localDateTime(item.endAt)):'',
      priority:item.eventPriority||'NORMAL',
      reminderMinutes:item.reminderMinutes==null?'':String(item.reminderMinutes),
      assigneeEmployeeId:item.assigneeEmployeeId||'',
      status:item.status||'ACTIVE',
    });
  }

  async function saveEvent(event){
    event.preventDefault();
    if(saving)return;
    setFormError('');
    if(!modal.title.trim()){setFormError('Escribe un título.');return;}
    if(!modal.startAt||!Number.isFinite(new Date(modal.startAt).getTime())||(modal.endAt&&(!Number.isFinite(new Date(modal.endAt).getTime())||new Date(modal.endAt)<new Date(modal.startAt)))){setFormError('Revisa las fechas: el término no puede ser anterior al inicio.');return;}
    setSaving(true);setError('');setNotice('');
    try{
      const startAt=modal.allDay?new Date(`${modal.startAt}T12:00:00`).toISOString():new Date(modal.startAt).toISOString();
      const endAt=modal.endAt?(modal.allDay?new Date(`${modal.endAt}T23:59:00`).toISOString():new Date(modal.endAt).toISOString()):null;
      const body={
        title:modal.title.trim(),description:modal.description.trim()||null,startAt,endAt,allDay:modal.allDay,
        priority:modal.priority,reminderMinutes:modal.reminderMinutes===''?null:Number(modal.reminderMinutes),
        assigneeEmployeeId:modal.assigneeEmployeeId||null,status:modal.status||'ACTIVE',
      };
      await apiRequest(modal.id?`/agenda/events/${modal.id}`:'/agenda/events',{method:modal.id?'PUT':'POST',body});
      setNotice(modal.id?'Evento actualizado':'Evento creado');setModal(null);await load(true);
    }catch(e){setFormError(e.message||'No fue posible guardar el evento');}
    finally{setSaving(false)}
  }

  async function removeEvent(){
    if(!modal?.id||saving)return;
    if(!window.confirm('¿Eliminar este evento?'))return;
    setSaving(true);
    try{
      await apiRequest(`/agenda/events/${modal.id}`,{method:'DELETE'});
      setNotice('Evento eliminado');setModal(null);await load(true);
    }catch(e){setError(e.message||'No fue posible eliminar el evento');}
    finally{setSaving(false)}
  }

  async function completeEvent(){
    if(!modal?.id||saving)return;
    setSaving(true);
    try{
      await apiRequest(`/agenda/events/${modal.id}/status`,{method:'PATCH',body:{status:modal.status==='COMPLETED'?'ACTIVE':'COMPLETED'}});
      setNotice(modal.status==='COMPLETED'?'Evento reactivado':'Evento completado');setModal(null);await load(true);
    }catch(e){setError(e.message||'No fue posible actualizar el evento');}
    finally{setSaving(false)}
  }

  const title=view==='day'?fullDate(cursor):view==='week'
    ?`${new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short'}).format(range.from)} – ${new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(range.to)}`
    :new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric'}).format(cursor);

  return <div className={styles.page}>
    {notice?<div className={styles.notice}>{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>:null}
    {error?<div className={styles.error}>{error}<button onClick={()=>setError('')}><X size={15}/></button></div>:null}

    <div className={styles.calendarLayout}>
      <aside className={styles.calendarSidebar} aria-label="Resumen y próximos eventos">
        
        <MiniCalendar cursor={cursor} onSelect={day=>{setCursor(day);setView('day')}} onMove={direction=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()+direction,1))}/>
        <h2>Resumen del periodo</h2>
    <section className={styles.stats} aria-label="Resumen de eventos del periodo">
      <article><span><CalendarDays size={16}/>Hoy</span><strong>{stats.today}</strong><small>Eventos del día</small></article>
      <article><span><Clock3 size={16}/>Próximos 7 días</span><strong>{stats.week}</strong><small>Compromisos próximos</small></article>
      <article className={stats.overdue?styles.statAlert:''}><span><Bell size={16}/>Vencidos</span><strong>{stats.overdue}</strong><small>Requieren atención</small></article>
      <article><span><Edit3 size={16}/>Eventos propios</span><strong>{stats.manual}</strong><small>Creados en Agenda</small></article>
    </section>

        <h2>Próximos eventos</h2>
        <div className={styles.upcoming}>{visibleItems.filter(item=>new Date(item.date)>=startOfDay(new Date())&&item.status!=='COMPLETED').sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,5).map(item=><button type="button" key={item.id} onClick={()=>openItem(item)}><small>{fullDate(item.date)} · {timeLabel(item.date,item.allDay)}</small><strong>{item.title}</strong></button>)}</div>
        {!visibleItems.some(item=>new Date(item.date)>=startOfDay(new Date())&&item.status!=='COMPLETED')?<p className={styles.sidebarEmpty}>Sin próximos eventos en este periodo.</p>:null}
      </aside>
    <section className={styles.calendarCard} aria-label="Calendario">
      <div className={styles.toolbar}>
        <div className={styles.periodControls}>
          <button type="button" onClick={()=>move(-1)} aria-label="Anterior"><ChevronLeft size={17}/></button>
          <button type="button" className={styles.todayButton} onClick={()=>setCursor(new Date())}>Hoy</button>
          <button type="button" onClick={()=>move(1)} aria-label="Siguiente"><ChevronRight size={17}/></button>
          <h2>{title}</h2>
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.headerActions}><button type="button" className={styles.refreshAction} onClick={()=>load()} disabled={loading} aria-label="Actualizar calendario" title="Actualizar"><RefreshCw size={17}/></button><button type="button" className={styles.newAction} onClick={()=>openNew(cursor)}><Plus size={17}/> Nuevo evento</button></div>
          <div className={styles.viewToggle}>
            <button type="button" aria-pressed={view==='day'} className={view==='day'?styles.active:''} onClick={()=>setView('day')}>Día</button>
            <button type="button" aria-pressed={view==='month'} className={view==='month'?styles.active:''} onClick={()=>setView('month')}>Mes</button>
            <button type="button" aria-pressed={view==='week'} className={view==='week'?styles.active:''} onClick={()=>setView('week')}>Semana</button>
            <button type="button" aria-pressed={view==='list'} className={view==='list'?styles.active:''} onClick={()=>setView('list')}>Lista</button>
          </div>
        </div>
      </div>

      <label className={styles.eventSearch}><span>Buscar eventos</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Título, módulo o descripción…"/></label>
      {loading?<div className={styles.loading}><RefreshCw size={20}/>Sincronizando agenda…</div>:view==='month'
        ?<MonthGrid cursor={cursor} range={range} byDay={byDay} onNew={openNew} onItem={openItem} onShowDay={day=>{setCursor(day);setView('day')}}/>
        :view==='list'?<AgendaList byDay={byDay} onItem={openItem} query={query}/>
        :<WeekGrid count={view==='day'?1:7} range={range} byDay={byDay} onNew={openNew} onItem={openItem}/>
      }
    </section>
    </div>

    {modal?<EventModal value={modal} setValue={setModal} employees={employees} saving={saving} error={formError} onClose={()=>{if(!saving)setModal(null)}} onSubmit={saveEvent} onDelete={removeEvent} onComplete={completeEvent}/>:null}
  </div>;
}

function MiniCalendar({cursor,onSelect,onMove}){
  const from=startOfWeek(startOfMonth(cursor));
  return <div className={styles.miniCalendar}>
    <header><button type="button" aria-label="Mes anterior" onClick={()=>onMove(-1)}><ChevronLeft size={16}/></button><strong>{new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric'}).format(cursor)}</strong><button type="button" aria-label="Mes siguiente" onClick={()=>onMove(1)}><ChevronRight size={16}/></button></header>
    <div className={styles.miniGrid}>{['L','M','M','J','V','S','D'].map((label,i)=><span key={i}>{label}</span>)}{Array.from({length:42},(_,i)=>addDays(from,i)).map(day=><button type="button" key={isoDate(day)} data-outside={day.getMonth()!==cursor.getMonth()} aria-label={fullDate(day)} aria-pressed={sameDay(day,cursor)} onClick={()=>onSelect(day)}>{day.getDate()}</button>)}</div>
  </div>;
}

function MonthGrid({cursor,range,byDay,onNew,onItem,onShowDay}){
  const days=Array.from({length:42},(_,i)=>addDays(range.from,i));
  const today=new Date();
  return <div className={styles.monthWrap}>
    <div className={styles.weekdays}>{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(day=><span key={day}>{day}</span>)}</div>
    <div className={styles.monthGrid}>
      {days.map(day=>{
        const events=byDay.get(isoDate(day))||[];
        const muted=day.getMonth()!==cursor.getMonth();
        return <div key={day.toISOString()} className={`${styles.dayCell} ${muted?styles.mutedDay:''} ${sameDay(day,today)?styles.todayCell:''}`}>
          <button className={styles.dayNumber} onClick={()=>onNew(day)} aria-label={`Crear evento el ${fullDate(day)}`} type="button">{day.getDate()}</button>
          <div className={styles.dayEvents}>
            {events.slice(0,3).map(item=><EventPill key={item.id} item={item} onClick={()=>onItem(item)}/>)}
            {events.length>3?<button className={styles.moreEvents} onClick={()=>onShowDay(day)}>+{events.length-3} más</button>:null}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

function WeekGrid({range,byDay,onNew,onItem,count=7}){
  const days=Array.from({length:count},(_,i)=>addDays(range.from,i));
  const today=new Date();
  return <div className={styles.weekGrid} data-day-view={count===1}>
    {days.map(day=>{
      const events=byDay.get(isoDate(day))||[];
      return <section key={day.toISOString()} className={`${styles.weekColumn} ${sameDay(day,today)?styles.todayWeek:''}`}>
        <header>
          <span>{new Intl.DateTimeFormat('es-MX',{weekday:'short'}).format(day).replace('.','')}</span>
          <strong>{day.getDate()}</strong>
          <button onClick={()=>onNew(day)} aria-label="Crear evento"><Plus size={14}/></button>
        </header>
        <div className={styles.weekEvents}>
          {events.length?events.map(item=><WeekEvent key={item.id} item={item} onClick={()=>onItem(item)}/>):<button className={styles.emptyDay} onClick={()=>onNew(day)}>Agregar evento</button>}
        </div>
      </section>;
    })}
  </div>;
}

function EventPill({item,onClick}){
  return <button className={`${styles.eventPill} ${styles[`tone_${item.tone}`]||''} ${item.source==='manual'?styles.manualEvent:''}`} onClick={onClick} title={`${item.module}: ${item.title}`}>
    <span>{timeLabel(item.date,item.allDay)}</span><strong>{item.title}</strong>
  </button>;
}

const agendaModuleTones={'crm':'blue','flotillas':'blue','rr. hh.':'green','recursos humanos':'green','nómina':'green','compras':'purple','inventario':'amber'};
function AgendaList({byDay,onItem,query}){
  const groups=[...byDay.entries()].sort(([a],[b])=>a.localeCompare(b));
  return <div className={styles.agendaList} data-calendar-agenda-list="true" aria-label="Lista de eventos">
    {groups.length===0?<div className={styles.agendaEmpty}><CalendarDays size={32} aria-hidden="true"/><strong>{query.trim()?'No se encontraron eventos':'No hay eventos en este periodo'}</strong><span>{query.trim()?'Prueba con otro término de búsqueda.':'Los eventos programados aparecerán aquí.'}</span></div>:groups.map(([day,events])=><section key={day} className={styles.agendaDay} data-agenda-day={day}>
      <header className={styles.agendaDayHeading}><span className={styles.agendaDayIcon}><CalendarDays size={19} aria-hidden="true"/></span><h3>{fullDate(new Date(day+'T12:00:00'))}</h3><span className={styles.agendaDayCount}>{events.length} {events.length===1?'evento':'eventos'}</span></header>
      <div className={styles.agendaDayEvents}>
        {events.map(item=>{
          const module=item.module?.trim();
          const meta=item.meta?.trim();
          const tone=agendaModuleTones[module?.toLocaleLowerCase('es')]||item.tone||'blue';
          const canOpen=item.source==='manual'||Boolean(item.route);
          const content=<><span className={styles.agendaTime}>{timeLabel(item.date,item.allDay)}</span><span className={styles.agendaEventCopy}><span className={styles.agendaEventTitle}><span className={styles.agendaEventDot} aria-hidden="true"/><strong>{item.title}</strong></span>{module||meta?<span className={styles.agendaEventMeta}>{module?<span>Módulo: {module}</span>:null}{meta&&meta!==module?<span>{meta}</span>:null}</span>:null}{item.status==='COMPLETED'||item.priority==='high'?<span className={styles.agendaEventState}>{item.status==='COMPLETED'?'Completado':'Prioridad alta'}</span>:null}</span>{canOpen?<ChevronRight size={17} className={styles.agendaEventArrow} aria-hidden="true"/>:null}</>;
          const props={className:styles.agendaEntry,'data-agenda-tone':tone,'data-agenda-event':item.id};
          return canOpen?<button key={item.id} type="button" {...props} onClick={()=>onItem(item)}>{content}</button>:<div key={item.id} {...props}>{content}</div>;
        })}
      </div>
    </section>)}
  </div>;
}

function WeekEvent({item,onClick}){
  return <button className={`${styles.weekEvent} ${item.source==='manual'?styles.manualWeekEvent:''}`} onClick={onClick}>
    <span className={`${styles.eventDot} ${styles[`dot_${item.tone}`]||''}`}/>
    <small>{timeLabel(item.date,item.allDay)} · {item.module}</small>
    <strong>{item.title}</strong>
    <span>{item.meta}</span>
  </button>;
}

function EventDateFields({label,value,allDay,required,onChange}){
  const [date='',time='']=value.split('T');
  return <fieldset className={styles.dateFields}><legend>{label}</legend>
    <label>Fecha<input type="date" required={required} value={date} onChange={e=>onChange(e.target.value?(allDay?e.target.value:e.target.value+'T'+(time||'09:00')):'')}/></label>
    {!allDay?<label>Hora<input type="time" required={required||Boolean(date)} disabled={!date} value={time} onChange={e=>onChange(date+'T'+e.target.value)}/></label>:null}
  </fieldset>;
}

function EventModal({value,setValue,employees,saving,error,onClose,onSubmit,onDelete,onComplete}){
  const editing=Boolean(value.id);
  const overlayRef=useRef(null);
  const dialogRef=useRef(null);
  useLayoutEffect(()=>{
    const overlay=overlayRef.current;
    if(!overlay)return;
    const previous=document.activeElement;
    const app=overlay.closest('[data-os-application-window="true"]');
    const header=app?.querySelector(':scope > header');
    const workspace=app?.closest('[data-scroll-owner="workspace"]');
    const visual=window.visualViewport;
    function measure(){
      const viewport={left:visual?.offsetLeft||0,top:visual?.offsetTop||0,width:visual?.width||window.innerWidth,height:visual?.height||window.innerHeight};
      let left=viewport.left,top=viewport.top,right=left+viewport.width,bottom=top+viewport.height;
      if(app&&window.innerWidth>760){
        const rect=app.getBoundingClientRect();
        const clip=workspace?.getBoundingClientRect();
        left=Math.max(left,rect.left,clip?.left??left);
        top=Math.max(top,header?.getBoundingClientRect().bottom??rect.top,clip?.top??top);
        right=Math.min(right,rect.right,clip?.right??right);
        bottom=Math.min(bottom,rect.bottom,clip?.bottom??bottom);
      }
      // A minimized window can temporarily have a zero rectangle.
      overlay.style.setProperty('--event-left',left+'px');
      overlay.style.setProperty('--event-top',top+'px');
      overlay.style.setProperty('--event-width',Math.max(0,right-left)+'px');
      overlay.style.setProperty('--event-height',Math.max(0,bottom-top)+'px');
    }
    measure();
    if(!overlay.open)overlay.showModal();
    dialogRef.current?.querySelector('input')?.focus({preventScroll:true});
    const observer=typeof ResizeObserver==='function'?new ResizeObserver(measure):null;
    [app,header,workspace].filter(Boolean).forEach(node=>observer?.observe(node));
    window.addEventListener('resize',measure);
    window.addEventListener('scroll',measure,true);
    visual?.addEventListener('resize',measure);
    visual?.addEventListener('scroll',measure);
    return ()=>{
      observer?.disconnect();
      window.removeEventListener('resize',measure);
      window.removeEventListener('scroll',measure,true);
      visual?.removeEventListener('resize',measure);
      visual?.removeEventListener('scroll',measure);
      if(overlay.open)overlay.close();
      if(previous?.isConnected)previous.focus?.({preventScroll:true});
    };
  },[]);
  return <dialog ref={overlayRef} className={styles.eventLayer} data-os-event-editor="true" aria-label={editing?'Editar evento':'Nuevo evento'} aria-modal="true" onCancel={event=>{event.preventDefault();event.stopPropagation();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <div ref={dialogRef} className={styles.eventPanel} data-event-editor-panel="true">
      <header className={styles.eventHeading}>
        <div><span>{editing?'Editar evento':'Calendario Business OS'}</span><h2>{editing?'Actualizar evento':'Nuevo evento'}</h2></div>
        <button type="button" aria-label="Cerrar evento" disabled={saving} onClick={onClose}><X size={19}/></button>
      </header>
      <form className={styles.editorForm} onSubmit={onSubmit}>
        <div className={styles.eventContent} data-scroll-region="local">
          {error?<p role="alert" className={styles.error}>{error}</p>:null}
          <section className={styles.editorSection} aria-label="Información del evento">
          <Input label="Título" required maxLength="180" value={value.title} onChange={e=>setValue(v=>({...v,title:e.target.value}))}/>
          <label className={styles.textareaField}>Descripción<textarea rows="3" maxLength="3000" value={value.description} onChange={e=>setValue(v=>({...v,description:e.target.value}))}/></label>
          </section>
          <section className={styles.editorSection} aria-label="Fecha y horario"><h3>Fecha y horario</h3>
          <label className={styles.checkRow}><input type="checkbox" checked={value.allDay} onChange={e=>setValue(v=>({...v,allDay:e.target.checked,startAt:e.target.checked?v.startAt.split('T')[0]:`${v.startAt}T09:00`,endAt:v.endAt?(e.target.checked?v.endAt.split('T')[0]:`${v.endAt}T10:00`):''}))}/><span><strong>Todo el día</strong><small>Oculta la hora del evento en el calendario</small></span></label>
          <div className={styles.grid2}>
            <EventDateFields label="Inicio" value={value.startAt} allDay={value.allDay} required onChange={startAt=>setValue(v=>{const duration=new Date(v.endAt)-new Date(v.startAt);const nextEnd=v.endAt&&Number.isFinite(duration)&&duration>=0&&startAt?(v.allDay?isoDate(new Date(new Date(startAt+'T12:00:00').getTime()+duration)):localDateTime(new Date(new Date(startAt).getTime()+duration))):v.endAt;return {...v,startAt,endAt:nextEnd};})}/>
            <EventDateFields label="Término" value={value.endAt} allDay={value.allDay} onChange={endAt=>setValue(v=>({...v,endAt}))}/>
          </div>
          </section>
          <section className={styles.editorSection} aria-label="Organización"><h3>Organización</h3>
          <div className={styles.grid2}>
            <label>Prioridad<span className={styles.eventSelectWrap}><select className={styles.eventSelect} value={value.priority} onChange={e=>setValue(v=>({...v,priority:e.target.value}))}>{Object.entries(priorityLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><ChevronDown className={styles.eventSelectChevron} size={16} aria-hidden="true" focusable="false"/></span></label>
            <label>Responsable<span className={styles.eventSelectWrap}><select className={styles.eventSelect} value={value.assigneeEmployeeId} onChange={e=>setValue(v=>({...v,assigneeEmployeeId:e.target.value}))}><option value="">Sin responsable</option>{employees.map(employee=><option key={employee.id} value={employee.id}>{employeeName(employee)} · {employee.employeeNumber}</option>)}</select><ChevronDown className={styles.eventSelectChevron} size={16} aria-hidden="true" focusable="false"/></span></label>
          </div>
          <label>Recordatorio<span className={styles.eventSelectWrap}><select className={styles.eventSelect} value={value.reminderMinutes} onChange={e=>setValue(v=>({...v,reminderMinutes:e.target.value}))}>{reminderOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown className={styles.eventSelectChevron} size={16} aria-hidden="true" focusable="false"/></span><small className={styles.helper}><Bell size={12}/> Recordatorio configurado en Business OS.</small></label>
          </section>
        </div>
        <footer className={styles.eventActions}>
          <div className={styles.destructiveActions}>
            {editing?<button type="button" className={styles.deleteButton} onClick={onDelete} disabled={saving}><Trash2 size={15}/>Eliminar</button>:null}
            {editing?<button type="button" className={styles.completeButton} onClick={onComplete} disabled={saving}><Check size={15}/>{value.status==='COMPLETED'?'Reactivar':'Completar'}</button>:null}
          </div>
          <div className={styles.saveActions}><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={saving} icon={editing?Edit3:Plus}>{editing?'Guardar cambios':'Crear evento'}</Button></div>
        </footer>
      </form>
    </div>
  </dialog>;
}
