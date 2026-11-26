import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Search,Send,MessagesSquare,Users,Info,Plus, X} from 'lucide-react';
import {apiRequest,getStoredSession} from '../../../../api';
import styles from './MessengerLive.module.css';
import {demoContacts,demoInitialMessages,useMessengerDemo} from './MessengerDemoContext';
const demoPeople=demoContacts.map(p=>({...p,firstName:p.name,lastName:''}));
const demoMe='local-demo-user';
const seed=()=>Object.fromEntries(Object.entries(demoInitialMessages).map(([peer,items])=>[peer,items.map((m,i)=>({id:peer+'-'+m.id,senderId:m.author==='me'?demoMe:peer,text:m.text,createdAt:new Date(Date.now()-(items.length-i)*60000).toISOString()}))]));

const name=p=>[p.firstName,p.lastName].filter(Boolean).join(' ');
const initials=p=>p.initials||name(p).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const stamp=m=>m?.createdAt?new Date(m.createdAt).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}):m?.time||'';
function Avatar({person}){return <span className={styles.avatar}>{initials(person)}{person.color&&<i className={styles.presence} style={{background:person.color}} aria-label={person.status}/>}</span>;}
export default function BusinessMessenger(){
 const [contacts,setContacts]=useState([]),[me,setMe]=useState(''),[selected,setSelected]=useState(null),[query,setQuery]=useState('');
 const [messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [filter,setFilter]=useState('all'),[info,setInfo]=useState(false),[find,setFind]=useState(false),[chatQuery,setChatQuery]=useState(''),[recent,setRecent]=useState({});
 const searchRef=useRef(null);
 const log=useRef(null),pending=useRef(null),sending=useRef(false);
 const offline=Boolean(getStoredSession()?.offlineDemo);
 const shared=useMessengerDemo();
 const [localDemo,setLocalDemo]=useState(seed);
 const demoHistory=shared?Object.fromEntries(Object.entries(shared.messages).map(([peer,items])=>[peer,items.map(m=>({id:peer+'-'+m.id,senderId:m.author==='me'?demoMe:peer,text:m.text,createdAt:m.createdAt||null,time:m.time}))])):localDemo;
 const activeMessages=offline?(demoHistory[selected?.id]||[]):messages;
 const activeMe=offline?demoMe:me;
 useEffect(()=>{
  if(offline)return;
  const controller=new AbortController();
  apiRequest('/messenger/contacts',{signal:controller.signal}).then(r=>{if(!controller.signal.aborted){setContacts(r.contacts||[]);setMe(r.me);setLoading(false);}}).catch(e=>{if(!controller.signal.aborted){setError(e.message);setLoading(false);}});
  return ()=>controller.abort();
 },[offline]);
 useEffect(()=>{
  if(!selected||offline)return;
  const controller=new AbortController();let running=false;
  async function refresh(){if(running||controller.signal.aborted)return;running=true;try{const r=await apiRequest('/messenger/direct/'+encodeURIComponent(selected.id),{signal:controller.signal});if(!controller.signal.aborted){setMessages(r.messages||[]);setRecent(old=>({...old,[selected.id]:(r.messages||[]).at(-1)}));}}catch(e){if(!controller.signal.aborted)setError(e.message);}finally{running=false;}}
  refresh();const timer=setInterval(refresh,5000);
  return ()=>{controller.abort();clearInterval(timer);};
 },[selected,offline]);
 useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight;},[activeMessages.at(-1)?.id,selected]);
 function choose(p){if(sending.current)return;setSelected(p);setInfo(false);setFind(false);setChatQuery('');setMessages([]);setDraft('');setError('');pending.current=null;}
 async function send(e){
  e.preventDefault();const text=draft.trim();if(!text||!selected||sending.current)return;
  if(offline){const createdAt=new Date().toISOString();const id=globalThis.crypto?.randomUUID?.()||String(Date.now());if(shared){shared.setMessages(old=>({...old,[selected.id]:[...(old[selected.id]||[]),{id,author:'me',text,time:'Ahora',createdAt}]}));}else{setLocalDemo(old=>({...old,[selected.id]:[...(old[selected.id]||[]),{id,senderId:demoMe,text,createdAt}]}));}setDraft('');return;}
  sending.current=true;setBusy(true);setError('');
  const peer=selected.id;
  if(!pending.current||pending.current.text!==text||pending.current.peer!==peer)pending.current={text,peer,clientId:crypto.randomUUID()};
  try{const r=await apiRequest('/messenger/direct/'+encodeURIComponent(peer),{method:'POST',body:{text,clientId:pending.current.clientId}});setMessages(old=>old.some(m=>m.id===r.message.id)?old:[...old,r.message]);setRecent(old=>({...old,[peer]:r.message}));setDraft('');pending.current=null;}
  catch(e){setError(e.message+' · Puedes reintentar el envío.');}finally{sending.current=false;setBusy(false);}
 }
 const people=offline?demoPeople:contacts;
 const last=p=>offline?demoHistory[p.id]?.at(-1):recent[p.id];
 const visible=people.filter(p=>name(p).toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))&&(filter==='all'||(filter==='groups'?p.status==='Grupo':Boolean(last(p)))));
 const displayed=activeMessages.filter(m=>!chatQuery||m.text.toLocaleLowerCase('es').includes(chatQuery.toLocaleLowerCase('es')));
 function newChat(){setFilter('all');setQuery('');searchRef.current?.focus();}
 return <div className={styles.container}><div className={styles.shell} data-business-messenger={offline?'demo':'live'} data-chat-open={Boolean(selected)}>
  <nav className={styles.rail} aria-label="Navegación de Mensajes">
   <button type="button" title="Conversaciones recientes" aria-label="Conversaciones recientes" aria-pressed={filter==='recent'} onClick={()=>setFilter('recent')}><MessagesSquare size={21}/></button>
   <button type="button" title="Contactos" aria-label="Contactos" aria-pressed={filter==='all'} onClick={()=>setFilter('all')}><Users size={21}/></button>
   {offline&&<button type="button" title="Grupos de demostración" aria-label="Grupos de demostración" aria-pressed={filter==='groups'} onClick={()=>setFilter('groups')}><span className={styles.groupIcon}>#</span></button>}
  </nav>
  <aside className={styles.sidebar} aria-label="Conversaciones">
   <header className={styles.sidebarHead}><div><h2>Chats</h2><small>{offline?'Demo local':'Comunicación de tu empresa'}</small></div><button type="button" className={styles.primary} onClick={newChat} title="Buscar contacto para nuevo chat" aria-label="Nuevo chat"><Plus size={20}/></button></header>
   <label className={styles.search}><Search size={17}/><input ref={searchRef} type="search" placeholder="Buscar conversaciones" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Buscar conversaciones"/></label>
   <div className={styles.filters} aria-label="Filtrar conversaciones">{[['all','Todos'],['recent','Recientes'],...(offline?[['groups','Grupos']]:[])].map(([id,label])=><button key={id} type="button" aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</div>
   <div className={styles.contacts}>{loading&&!offline?<p>Cargando contactos…</p>:visible.length?visible.map(p=><button type="button" key={p.id} disabled={busy} aria-current={selected?.id===p.id?'true':undefined} onClick={()=>choose(p)}><Avatar person={p}/><span className={styles.contactCopy}><span className={styles.contactTitle}><strong>{name(p)}</strong><small>{stamp(last(p))}</small></span><span className={styles.preview}>{last(p)?.text||p.team||'Iniciar conversación'}</span></span></button>):<p>No hay conversaciones en esta vista.</p>}</div>
   {offline&&<footer className={styles.demoNote}>Datos simulados · Sin conexión al servidor</footer>}
  </aside>
  <section className={styles.chat} aria-label="Conversación">
   {error&&<p className={styles.error} role="alert">{error}</p>}
   {selected?<><header className={styles.head}><button type="button" className={styles.back} disabled={busy} onClick={()=>choose(null)} aria-label="Volver a contactos"><ArrowLeft size={20}/></button><Avatar person={selected}/><div className={styles.identity}><strong>{name(selected)}</strong><small>{offline?[selected.status,selected.team].filter(Boolean).join(' · '):'Contacto de tu empresa'}</small></div><button type="button" className={styles.iconButton} aria-label="Buscar en conversación" aria-expanded={find} onClick={()=>{setFind(v=>!v);setChatQuery('');}}><Search size={19}/></button><button type="button" className={styles.iconButton} aria-label="Información del contacto" aria-expanded={info} onClick={()=>setInfo(v=>!v)}><Info size={20}/></button></header>
   {find&&<label className={styles.chatSearch}><Search size={16}/><input autoFocus type="search" aria-label="Buscar mensajes" placeholder="Buscar en este chat" value={chatQuery} onChange={e=>setChatQuery(e.target.value)}/></label>}
   <div className={styles.chatBody}><div className={styles.log} ref={log} role="log" aria-live="polite"><div className={styles.dayLabel}>{offline?'Conversación de ejemplo':'Conversación'}</div>{displayed.length?displayed.map(m=><article key={m.id} className={m.senderId===activeMe?styles.mine:styles.theirs}><span>{m.text}</span><small>{stamp(m)}</small></article>):<p className={styles.hint}>{chatQuery?'No se encontraron mensajes.':'Inicia la conversación con un mensaje.'}</p>}</div>
   {info&&<aside className={styles.details} aria-label="Información del contacto"><button className={styles.iconButton} type="button" onClick={()=>setInfo(false)} aria-label="Cerrar información"><X size={19}/></button><Avatar person={selected}/><strong>{name(selected)}</strong><small>{selected.team||'Contacto empresarial'}</small>{offline&&<small>{selected.status} · Simulado</small>}</aside>}</div>
   <form className={styles.composer} onSubmit={send}><textarea rows={1} maxLength={4000} disabled={busy} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit();}}} placeholder={offline?'Escribe un mensaje de prueba…':'Escribe un mensaje…'} aria-label="Mensaje"/><button type="submit" disabled={busy||!draft.trim()} aria-label={busy?'Enviando':'Enviar mensaje'}><Send size={20}/></button></form>
   </>:<div className={styles.empty}><MessagesSquare size={36}/><h2>Tu espacio de conversación</h2><p>Selecciona un contacto para comenzar.</p></div>}
  </section>
 </div></div>;
}
