import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Search,Send,MessagesSquare,RefreshCw} from 'lucide-react';
import {apiRequest,getStoredSession} from '../../../../api';
import styles from './MessengerLive.module.css';

const name=p=>[p.firstName,p.lastName].filter(Boolean).join(' ');
const initials=p=>[p.firstName,p.lastName].filter(Boolean).map(x=>x[0]).join('').toUpperCase();
export default function BusinessMessenger(){
 const [contacts,setContacts]=useState([]),[me,setMe]=useState(''),[selected,setSelected]=useState(null),[query,setQuery]=useState('');
 const [messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const log=useRef(null),pending=useRef(null),sending=useRef(false);
 const offline=Boolean(getStoredSession()?.offlineDemo);
 useEffect(()=>{
  if(offline)return;
  const controller=new AbortController();
  apiRequest('/messenger/contacts',{signal:controller.signal}).then(r=>{if(!controller.signal.aborted){setContacts(r.contacts||[]);setMe(r.me);setLoading(false);}}).catch(e=>{if(!controller.signal.aborted){setError(e.message);setLoading(false);}});
  return ()=>controller.abort();
 },[offline]);
 useEffect(()=>{
  if(!selected||offline)return;
  const controller=new AbortController();let running=false;
  async function refresh(){if(running||controller.signal.aborted)return;running=true;try{const r=await apiRequest('/messenger/direct/'+encodeURIComponent(selected.id),{signal:controller.signal});if(!controller.signal.aborted)setMessages(r.messages||[]);}catch(e){if(!controller.signal.aborted)setError(e.message);}finally{running=false;}}
  refresh();const timer=setInterval(refresh,5000);
  return ()=>{controller.abort();clearInterval(timer);};
 },[selected,offline]);
 useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight;},[messages.at(-1)?.id,selected]);
 function choose(p){if(sending.current)return;setSelected(p);setMessages([]);setDraft('');setError('');pending.current=null;}
 async function send(e){
  e.preventDefault();const text=draft.trim();if(!text||!selected||sending.current)return;
  sending.current=true;setBusy(true);setError('');
  const peer=selected.id;
  if(!pending.current||pending.current.text!==text||pending.current.peer!==peer)pending.current={text,peer,clientId:crypto.randomUUID()};
  try{const r=await apiRequest('/messenger/direct/'+encodeURIComponent(peer),{method:'POST',body:{text,clientId:pending.current.clientId}});setMessages(old=>old.some(m=>m.id===r.message.id)?old:[...old,r.message]);setDraft('');pending.current=null;}
  catch(e){setError(e.message+' · Puedes reintentar el envío.');}finally{sending.current=false;setBusy(false);}
 }
 const visible=contacts.filter(p=>name(p).toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
 if(offline)return <section className={styles.empty}><MessagesSquare size={32}/><h2>Mensajes sin conexión</h2><p>Inicia una sesión empresarial conectada para enviar mensajes reales.</p></section>;
 return <div className={styles.shell} data-business-messenger="live" data-chat-open={Boolean(selected)}>
  <aside className={styles.sidebar} aria-label="Contactos"><header><h2>Mensajes</h2><small>Comunicación de tu empresa</small></header><label className={styles.search}><Search size={18}/><input type="search" placeholder="Buscar contactos" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Buscar contactos"/></label>
  <div className={styles.contacts}>{loading?<p>Cargando contactos…</p>:visible.length?visible.map(p=><button type="button" key={p.id} disabled={busy} aria-current={selected?.id===p.id?'true':undefined} onClick={()=>choose(p)}><span className={styles.avatar}>{initials(p)}</span><strong>{name(p)}</strong></button>):<p>No hay contactos disponibles.</p>}</div></aside>
  <section className={styles.chat} aria-label="Conversación">
  {error&&<p className={styles.error} role="alert">{error}</p>}
  {selected?<><header className={styles.head}><button type="button" className={styles.back} disabled={busy} onClick={()=>choose(null)} aria-label="Volver a contactos"><ArrowLeft size={20}/></button><span className={styles.avatar}>{initials(selected)}</span><strong>{name(selected)}</strong></header><div className={styles.log} ref={log} role="log" aria-live="polite">{messages.length?messages.map(m=><article key={m.id} className={m.senderId===me?styles.mine:styles.theirs}><span>{m.text}</span><small>{new Date(m.createdAt).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'})}</small></article>):<p className={styles.hint}>Inicia la conversación con un mensaje.</p>}</div><form className={styles.composer} onSubmit={send}><textarea rows={2} maxLength={4000} disabled={busy} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Escribe un mensaje…" aria-label="Mensaje"/><button type="submit" disabled={busy||!draft.trim()} aria-label={busy?'Enviando':'Enviar mensaje'}><Send size={20}/></button></form></>:<div className={styles.empty}><MessagesSquare size={36}/><h2>Tu espacio de conversación</h2><p>Selecciona un contacto para comenzar.</p></div>}
  </section>
 </div>;
}
