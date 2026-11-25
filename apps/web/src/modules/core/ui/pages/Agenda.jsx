import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {
  Bell,CalendarDays,Check,ChevronLeft,ChevronRight,Clock3,Edit3,Plus,RefreshCw,
  Search,Trash2,X
} from 'lucide-react';
import {createPortal} from 'react-dom';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {apiRequest} from '../../../../api';
import {Button} from '../../../../design-system/components/Button';
import {Input} from '../../../../design-system/components/Input';
import {BusinessSelect} from '../../../../design-system/components/BusinessSelect';
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
// Spanish headings capitalize only the first letter, not every word.
function dateHeading(label){return label.charAt(0).toLocaleUpperCase('es-MX')+label.slice(1)}
function monthHeading(value){return dateHeading(new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric'}).format(value))}
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

  const title=view==='day'?dateHeading(fullDate(cursor)):view==='week'
    ?`${new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short'}).format(range.from)} – ${new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(range.to)}`
    :monthHeading(cursor);

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
      <div className={styles.toolbar} data-calendar-toolbar="true">
        <div className={styles.toolbarPrimary}>
          <div className={styles.periodControls} data-calendar-period-nav="true" role="group" aria-label="Navegación de fechas">
            <button type="button" onClick={()=>move(-1)} aria-label="Anterior"><ChevronLeft size={21} strokeWidth={2.25} aria-hidden="true"/></button>
            <h2 aria-live="polite">{title}</h2>
            <button type="button" onClick={()=>move(1)} aria-label="Siguiente"><ChevronRight size={21} strokeWidth={2.25} aria-hidden="true"/></button>
          </div>
          <div className={styles.headerActions} role="group" aria-label="Acciones del calendario">
            <button type="button" className={styles.todayButton} onClick={()=>setCursor(new Date())}>Hoy</button>
            <button type="button" className={styles.refreshAction} onClick={()=>load()} disabled={loading} aria-label="Actualizar calendario" title="Actualizar"><RefreshCw size={18} aria-hidden="true"/></button>
            <button type="button" className={styles.newAction} onClick={()=>openNew(cursor)}><Plus size={18} aria-hidden="true"/> Nuevo evento</button>
          </div>
        </div>
        <div className={styles.toolbarSecondary}>
          <div className={styles.viewToggle} role="group" aria-label="Vista del calendario">
            {[['day','Día'],['week','Semana'],['month','Mes'],['list','Lista']].map(([key,label])=><button key={key} type="button" aria-pressed={view===key} className={view===key?styles.active:''} onClick={()=>setView(key)}>{label}</button>)}
          </div>
          <div className={styles.toolbarSearch}>
            <Search size={18} aria-hidden="true"/>
            <input type="search" aria-label="Buscar eventos" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar eventos…"/>
            {query?<button type="button" aria-label="Limpiar búsqueda" onClick={()=>setQuery('')}><X size={16} aria-hidden="true"/></button>:null}
          </div>
        </div>
      </div>

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
    <header><button type="button" aria-label="Mes anterior" onClick={()=>onMove(-1)}><ChevronLeft size={16}/></button><strong>{monthHeading(cursor)}</strong><button type="button" aria-label="Mes siguiente" onClick={()=>onMove(1)}><ChevronRight size={16}/></button></header>
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
      <header className={styles.agendaDayHeading}><span className={styles.agendaDayIcon}><CalendarDays size={19} aria-hidden="true"/></span><h3>{dateHeading(fullDate(new Date(day+'T12:00:00')))}</h3><span className={styles.agendaDayCount}>{events.length} {events.length===1?'evento':'eventos'}</span></header>
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

// Keep local civil date strings; the existing save handler owns ISO conversion.
function EventDateFields({label,value,allDay,required,field,active,onToggle}){
  const [date='',time='']=value.split('T');
  const dateLabel=date?date.split('-').reverse().join('/'):'Seleccionar fecha';
  return <fieldset className={styles.dateFields}><legend>{label}</legend>
    <div className={styles.pickerField}><span>Fecha{required?' *':''}</span><button type="button" className={styles.pickerTrigger} data-event-picker-trigger={field+'-date'} aria-label={label+': fecha, '+dateLabel} aria-expanded={active?.field===field&&active.kind==='date'} onClick={e=>onToggle(field,'date',e.currentTarget)}><span>{dateLabel}</span><CalendarDays size={17} aria-hidden="true"/></button></div>
    {!allDay?<div className={styles.pickerField}><span>Hora</span><button type="button" className={styles.pickerTrigger} data-event-picker-trigger={field+'-time'} disabled={!date} aria-label={label+': hora, '+(time||'sin hora')} aria-expanded={active?.field===field&&active.kind==='time'} onClick={e=>onToggle(field,'time',e.currentTarget)}><span>{time?timeLabel(date+'T'+time,false):'Seleccionar hora'}</span><Clock3 size={17} aria-hidden="true"/></button></div>:null}
  </fieldset>;
}

function DateChoice({value,required,onChoose,onClose}){
  const initial=value?new Date(value+'T12:00:00'):new Date();
  const [day,setDay]=useState(initial);
  const focusNext=useRef(true);
  const gridRef=useRef(null);
  const month=startOfMonth(day);
  const first=startOfWeek(month);
  useLayoutEffect(()=>{if(focusNext.current){focusNext.current=false;gridRef.current?.querySelector('[tabindex="0"]')?.focus({preventScroll:true});}},[day]);
  function shiftMonth(delta,focus=false){
    const next=new Date(day.getFullYear(),day.getMonth()+delta,1);
    next.setDate(Math.min(day.getDate(),new Date(next.getFullYear(),next.getMonth()+1,0).getDate()));
    focusNext.current=focus;setDay(next);
  }
  function handleDayKey(event){
    const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-((day.getDay()+6)%7),End:6-((day.getDay()+6)%7)};
    if(event.key==='PageUp'||event.key==='PageDown'){event.preventDefault();shiftMonth(event.key==='PageUp'?-1:1,true);return;}
    if(Object.hasOwn(offsets,event.key)){event.preventDefault();focusNext.current=true;setDay(addDays(day,offsets[event.key]));}
  }
  return <div className={styles.dateChoice}>
    <div className={styles.choiceMonth}><button type="button" aria-label="Mes anterior" onClick={()=>shiftMonth(-1)}><ChevronLeft size={18}/></button><strong aria-live="polite">{monthHeading(month)}</strong><button type="button" aria-label="Mes siguiente" onClick={()=>shiftMonth(1)}><ChevronRight size={18}/></button></div>
    <div className={styles.choiceGrid} aria-hidden="true">{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=><span key={d}>{d}</span>)}</div>
    <div ref={gridRef} className={styles.choiceGrid} role="group" aria-label="Días del mes">
      {Array.from({length:42},(_,i)=>addDays(first,i)).map(d=><button type="button" key={isoDate(d)} data-picker-date={isoDate(d)} data-outside={d.getMonth()!==month.getMonth()} data-today={sameDay(d,new Date())} aria-pressed={isoDate(d)===value} aria-label={fullDate(d)} tabIndex={sameDay(d,day)?0:-1} onKeyDown={handleDayKey} onClick={()=>onChoose(isoDate(d))}>{d.getDate()}</button>)}
    </div>
    <div className={styles.choiceFooter}>{!required?<button type="button" onClick={()=>onChoose('')}>Borrar</button>:null}<button type="button" onClick={()=>onChoose(isoDate(new Date()))}>Hoy</button><button type="button" onClick={onClose}>Cancelar</button></div>
  </div>;
}

function TimeChoice({value,onChoose,onClose}){
  const [h,m]=(value||'09:00').split(':').map(Number);
  const [hour,setHour]=useState(String(h%12||12).padStart(2,'0'));
  const [minute,setMinute]=useState(String(m||0).padStart(2,'0'));
  const [period,setPeriod]=useState(h>=12?'pm':'am');
  const hourRef=useRef(null);
  useEffect(()=>{if(!window.matchMedia('(pointer: coarse)').matches)hourRef.current?.focus({preventScroll:true});},[]);
  const valid=/^\d{1,2}$/.test(hour)&&Number(hour)>=1&&Number(hour)<=12&&/^\d{1,2}$/.test(minute)&&Number(minute)<=59;
  function apply(){if(valid)onChoose(String(Number(hour)%12+(period==='pm'?12:0)).padStart(2,'0')+':'+String(Number(minute)).padStart(2,'0'));}
  return <div className={styles.timeChoice} onKeyDown={e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();apply();}}}>
    <div className={styles.timeDigits}>
      <label>Hora<input ref={hourRef} type="text" inputMode="numeric" maxLength={2} value={hour} onChange={e=>setHour(e.target.value.replace(/\D/g,''))}/></label>
      <span aria-hidden="true">:</span>
      <label>Minutos<input type="text" inputMode="numeric" maxLength={2} value={minute} onChange={e=>setMinute(e.target.value.replace(/\D/g,''))}/></label>
      <div className={styles.periodChoice} role="group" aria-label="Periodo">{['am','pm'].map(p=><button type="button" key={p} aria-pressed={period===p} onClick={()=>setPeriod(p)}>{p==='am'?'a. m.':'p. m.'}</button>)}</div>
    </div>
    <div className={styles.minuteChoices} role="group" aria-label="Minutos frecuentes">{['00','15','30','45'].map(m=><button type="button" key={m} aria-pressed={minute===m} onClick={()=>setMinute(m)}>{m}</button>)}</div>
    {!valid?<small role="status">Usa horas de 1 a 12 y minutos de 00 a 59.</small>:null}
    <div className={styles.choiceFooter}><button type="button" onClick={onClose}>Cancelar</button><button type="button" className={styles.choicePrimary} disabled={!valid} onClick={apply}>Aplicar hora</button></div>
  </div>;
}

// Portal into the native event dialog, outside the scrolling form body.
function PickerPopup({active,trigger,onClose,children}){
  const popupRef=useRef(null);
  const host=trigger?.closest('dialog[data-os-event-editor]');
  useLayoutEffect(()=>{
    const popup=popupRef.current;
    if(!host||!popup||!trigger)return;
    const visual=window.visualViewport;
    const position=()=>{
      const bounds=host.getBoundingClientRect();
      const anchor=trigger.getBoundingClientRect();
      const inset=10,gap=8;
      const width=Math.max(0,Math.min(active.kind==='date'?340:320,bounds.width-inset*2));
      const maxHeight=Math.max(0,bounds.height-inset*2);
      popup.style.width=width+'px';
      popup.style.maxHeight=maxHeight+'px';
      const height=Math.min(popup.getBoundingClientRect().height,maxHeight);
      const below=bounds.bottom-anchor.bottom-gap-inset;
      const above=anchor.top-bounds.top-gap-inset;
      const left=Math.min(Math.max(anchor.left-bounds.left,inset),Math.max(inset,bounds.width-width-inset));
      const rawTop=below>=height?anchor.bottom-bounds.top+gap:above>=height?anchor.top-bounds.top-gap-height:(bounds.height-height)/2;
      const top=Math.min(Math.max(rawTop,inset),Math.max(inset,bounds.height-height-inset));
      popup.style.left=left+'px';popup.style.top=top+'px';
    };
    position();
    const observer=typeof ResizeObserver==='function'?new ResizeObserver(position):null;
    observer?.observe(host);observer?.observe(popup);observer?.observe(trigger);
    window.addEventListener('resize',position);
    window.addEventListener('scroll',position,true);
    visual?.addEventListener('resize',position);
    visual?.addEventListener('scroll',position);
    return ()=>{observer?.disconnect();window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);visual?.removeEventListener('resize',position);visual?.removeEventListener('scroll',position);};
  },[active,host,trigger]);
  useEffect(()=>{
    function outside(event){if(host?.contains(event.target)&&!popupRef.current?.contains(event.target)&&!event.target.closest?.('[data-event-picker-trigger]'))onClose(false);}
    document.addEventListener('pointerdown',outside);
    return ()=>document.removeEventListener('pointerdown',outside);
  },[host,onClose]);
  if(!host)return null;
  return createPortal(<section ref={popupRef} className={styles.pickerSurface} data-event-picker={active.kind} data-picker-popup="true" data-os-elevation="4" role="group" aria-label={(active.kind==='date'?'Elegir fecha':'Elegir hora')+' de '+(active.field==='startAt'?'inicio':'término')}>{children}</section>,host);
}

function EventScheduleFields({value,setValue}){
  const [active,setActive]=useState(null);
  const triggerRef=useRef(null);
  const previousAllDay=useRef(value.allDay);
  useEffect(()=>{if(previousAllDay.current!==value.allDay){previousAllDay.current=value.allDay;setActive(null);}},[value.allDay]);
  function close(restoreFocus=true){setActive(null);if(restoreFocus!==false)triggerRef.current?.focus({preventScroll:true});}
  function toggle(field,kind,trigger){triggerRef.current=trigger;trigger.scrollIntoView({block:'nearest',inline:'nearest'});setActive(old=>old?.field===field&&old.kind===kind?null:{field,kind});}
  function update(field,next){
    if(field==='endAt'){setValue(v=>({...v,endAt:next}));return;}
    setValue(v=>{
      const duration=new Date(v.endAt)-new Date(v.startAt);
      const endAt=v.endAt&&Number.isFinite(duration)&&duration>=0&&next?(v.allDay?isoDate(new Date(new Date(next+'T12:00:00').getTime()+duration)):localDateTime(new Date(new Date(next).getTime()+duration))):v.endAt;
      return {...v,startAt:next,endAt};
    });
  }
  const [date='',time='']=active?value[active.field].split('T'):[];
  function choose(next){
    if(active.kind==='date')update(active.field,next?(value.allDay?next:next+'T'+(time||'09:00')):'');
    else if(date)update(active.field,date+'T'+next);
    close();
  }
  return <div className={styles.scheduleFields} onKeyDown={e=>{if(active&&e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}}}>
    <div className={styles.grid2}>
      <EventDateFields label="Inicio" field="startAt" value={value.startAt} allDay={value.allDay} required active={active} onToggle={toggle}/>
      <EventDateFields label="Término" field="endAt" value={value.endAt} allDay={value.allDay} active={active} onToggle={toggle}/>
    </div>
    {active&&!(value.allDay&&active.kind==='time')?<PickerPopup key={active.field+active.kind} active={active} trigger={triggerRef.current} onClose={close}>
      <div className={styles.choiceHeading}><strong>{active.kind==='date'?'Elegir fecha':'Elegir hora'} · {active.field==='startAt'?'Inicio':'Término'}</strong><button type="button" aria-label="Cerrar selector" onClick={close}><X size={17}/></button></div>
      {active.kind==='date'?<DateChoice key={active.field} value={date} required={active.field==='startAt'} onChoose={choose} onClose={close}/>:<TimeChoice key={active.field} value={time} onChoose={choose} onClose={close}/>}
    </PickerPopup>:null}
  </div>;
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
    <div ref={dialogRef} className={styles.eventPanel} data-event-editor-panel="true" data-os-elevation="3">
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
          <EventScheduleFields value={value} setValue={setValue}/>
          </section>
          <section className={styles.editorSection} aria-label="Organización"><h3>Organización</h3>
          <div className={styles.grid2}>
            <BusinessSelect label="Prioridad" value={value.priority} options={Object.entries(priorityLabels).map(([value,label])=>({value,label}))} onChange={priority=>setValue(v=>({...v,priority}))} disabled={saving}/>
            <BusinessSelect label="Responsable" value={value.assigneeEmployeeId} options={[{value:'',label:'Sin responsable'},...employees.map(employee=>({value:employee.id,label:employeeName(employee)+' · '+employee.employeeNumber}))]} onChange={assigneeEmployeeId=>setValue(v=>({...v,assigneeEmployeeId}))} searchable disabled={saving}/>
          </div>
          <BusinessSelect label="Recordatorio" value={value.reminderMinutes} options={reminderOptions} onChange={reminderMinutes=>setValue(v=>({...v,reminderMinutes}))} disabled={saving}/>
          <small className={styles.helper}><Bell size={12}/> Recordatorio configurado en Business OS.</small>
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
