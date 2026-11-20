import {useMemo,useRef,useState} from 'react';
import {ArrowLeft,CheckCheck,MessageCircle,MoreHorizontal,Search,Send,Smile,Users,WifiOff,Info,MessagesSquare,PanelsTopLeft,X,Minus,Maximize2} from 'lucide-react';
import styles from './BusinessMessenger.module.css';

// UI prototype only: sample data is not sourced from company users or a chat API.
const contacts=[
 {id:'ana',name:'Ana Martínez',team:'Ventas',status:'Disponible',color:'#38b66b',initials:'AM'},
 {id:'carlos',name:'Carlos Rivera',team:'Operaciones',status:'Ocupado',color:'#ed9d39',initials:'CR'},
 {id:'sofia',name:'Sofía López',team:'Recursos Humanos',status:'Disponible',color:'#38b66b',initials:'SL'},
 {id:'equipo',name:'Equipo de proyectos',team:'Grupo de ejemplo',status:'Grupo',color:'#7295c6',initials:'EP'},
];
const initialMessages={
 ana:[{id:1,author:'them',text:'¡Hola! ¿Cómo va el reporte de ventas?',time:'10:24'},{id:2,author:'me',text:'Estoy revisando los últimos datos.',time:'10:26'}],
 carlos:[{id:1,author:'them',text:'Tenemos pendiente la revisión del inventario.',time:'09:12'}],
 sofia:[{id:1,author:'them',text:'¡Buen día! Bienvenido al equipo.',time:'Ayer'}],
 equipo:[{id:1,author:'them',text:'Bienvenidos al espacio del proyecto.',time:'Ayer'}],
};
export default function BusinessMessenger(){
 const [selected,setSelected]=useState('ana');
 const [filter,setFilter]=useState('');
 const [drafts,setDrafts]=useState({});
 const draft=drafts[selected]||'';
 const [messages,setMessages]=useState(initialMessages);
 const [mobileChat,setMobileChat]=useState(false);
 const [presence,setPresence]=useState('Disponible');
 const [showInfo,setShowInfo]=useState(false);
 const [onlyAvailable,setOnlyAvailable]=useState(false);
 const [openChats,setOpenChats]=useState([]);
 const [minimizedChats,setMinimizedChats]=useState([]);
 const [popoutDrafts,setPopoutDrafts]=useState({});
 const [chatPositions,setChatPositions]=useState({});
 const [frontChat,setFrontChat]=useState(null);
 const [expandedChats,setExpandedChats]=useState([]);
 const chatLayerRef=useRef(null);
 function startChatDrag(event,id){
  if(event.button!==0||event.target.closest('button'))return;
  const layer=chatLayerRef.current;
  const panel=event.currentTarget.closest('[data-messenger-popout]');
  if(!layer||!panel)return;
  event.preventDefault();
  setFrontChat(id);
  const bounds=layer.getBoundingClientRect();
  const rect=panel.getBoundingClientRect();
  const initial={x:rect.left-bounds.left,y:rect.top-bounds.top};
  const startX=event.clientX,startY=event.clientY,pointerId=event.pointerId;
  function move(pointer){
   if(pointer.pointerId!==pointerId)return;
   const x=Math.max(0,Math.min(Math.max(0,bounds.width-rect.width),initial.x+pointer.clientX-startX));
   const y=Math.max(0,Math.min(Math.max(0,bounds.height-rect.height),initial.y+pointer.clientY-startY));
   setChatPositions(current=>({...current,[id]:{x,y}}));
  }
  function stop(pointer){
   if(pointer.pointerId!==pointerId)return;
   window.removeEventListener('pointermove',move);
   window.removeEventListener('pointerup',stop);
   window.removeEventListener('pointercancel',stop);
  }
  window.addEventListener('pointermove',move);
  window.addEventListener('pointerup',stop);
  window.addEventListener('pointercancel',stop);
 }
 const visible=useMemo(()=>contacts.filter(item=>(!onlyAvailable||item.status==='Disponible')&&(item.name+' '+item.team).toLocaleLowerCase('es').includes(filter.toLocaleLowerCase('es'))),[filter,onlyAvailable]);
 const active=contacts.find(item=>item.id===selected);
 function openChat(id){
  if(typeof globalThis.window!=='undefined'&&globalThis.document?.querySelector('[data-business-os-dock="true"]')){
   globalThis.window.dispatchEvent(new CustomEvent('business-os:open-messenger-chat',{detail:{contactId:id}}));
   return;
  }
  setFrontChat(id);setOpenChats(current=>current.includes(id)?current:[...current,id]);setMinimizedChats(current=>current.filter(value=>value!==id));}
 function toggleExpand(id){setExpandedChats(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);setMinimizedChats(current=>current.filter(value=>value!==id));setFrontChat(id);}
 function closeChat(id){setOpenChats(current=>current.filter(value=>value!==id));setMinimizedChats(current=>current.filter(value=>value!==id));setExpandedChats(current=>current.filter(value=>value!==id));setChatPositions(current=>{const next={...current};delete next[id];return next;});setFrontChat(current=>current===id?null:current);}
 function toggleChat(id){setMinimizedChats(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);}
 function send(event){
  event.preventDefault();
  const text=draft.trim();
  if(!text||!active)return;
  setMessages(current=>({...current,[selected]:[...(current[selected]||[]),{id:Date.now(),author:'me',text,time:new Intl.DateTimeFormat('es-MX',{hour:'2-digit',minute:'2-digit'}).format(new Date())}]}));
  setDrafts(current=>({...current,[selected]:''}));
 }
 return <div className={styles.shell} data-business-messenger="prototype">
  <aside className={[styles.contacts,mobileChat?styles.mobileHidden:''].join(' ')} aria-label="Contactos de demostración">
   <div className={styles.messengerBrand}><span className={styles.brandSymbol}><MessagesSquare size={19}/></span><span><strong>Messenger</strong><small>Comunicación del equipo</small></span><span className={styles.brandBeta}>BETA</span></div><div className={styles.profile}><span className={styles.myAvatar}>YO</span><div className={styles.profileCopy}><strong>Mi espacio</strong><label className={styles.presenceLabel}><span className={styles.dot}/><select value={presence} onChange={event=>setPresence(event.target.value)} aria-label="Estado de demostración"><option>Disponible</option><option>Ocupado</option><option>Ausente</option></select></label></div><MoreHorizontal size={19} aria-hidden="true"/></div>
   <div className={styles.search}><Search size={17}/><input value={filter} onChange={event=>setFilter(event.target.value)} type="search" placeholder="Buscar contactos" aria-label="Buscar contactos de demostración"/></div>
   <div className={styles.groupHeading}><Users size={16}/> Contactos <span>{visible.length}</span></div><div className={styles.filters}><button type="button" className={!onlyAvailable?styles.filterActive:""} aria-pressed={!onlyAvailable} onClick={()=>setOnlyAvailable(false)}>Todos</button><button type="button" className={onlyAvailable?styles.filterActive:""} aria-pressed={onlyAvailable} onClick={()=>setOnlyAvailable(true)}>Disponibles</button></div>
   <div className={styles.contactList}>{visible.map(item=><button key={item.id} type="button" className={[styles.contact,item.id===selected?styles.selected:''].join(' ')} onClick={()=>{setSelected(item.id);setMobileChat(true);}} aria-current={item.id===selected?'true':undefined}><span className={styles.avatar} style={{'--presence-color':item.color}}>{item.initials}</span><span className={styles.contactCopy}><strong>{item.name}</strong><small>{item.team} · {item.status}</small></span><MessageCircle size={16} className={styles.contactArrow}/></button>)}{!visible.length?<p className={styles.noResults}>No hay contactos que coincidan.</p>:null}</div>
   <div className={styles.contactsFooter}><WifiOff size={15}/> Contactos y estados simulados</div>
  </aside>
  <section className={[styles.conversation,!mobileChat?styles.mobileHiddenChat:''].join(' ')} aria-label="Conversación de demostración">
   <header className={styles.chatHeader}><button className={styles.back} type="button" onClick={()=>setMobileChat(false)} aria-label="Volver a contactos"><ArrowLeft size={20}/></button><span className={styles.avatar} style={{'--presence-color':active.color}}>{active.initials}</span><div className={styles.chatIdentity}><strong>{active.name}</strong><small>{active.status} · {active.team}</small></div><button type="button" className={styles.popoutButton} onClick={()=>openChat(selected)} aria-label="Abrir conversación independiente" title="Abrir conversación independiente"><PanelsTopLeft size={19}/></button><button type="button" className={styles.infoButton} onClick={()=>setShowInfo(value=>!value)} aria-expanded={showInfo} aria-label="Información de la conversación"><Info size={19}/></button><span className={styles.demoTag}>VISTA DEMO</span></header>
   {showInfo?<aside className={styles.infoPanel} aria-label="Información de la conversación"><strong>{active.name}</strong><p>{active.team}</p><small>Esta es una conversación de demostración. No hay usuarios ni mensajes conectados a un servidor.</small></aside>:null}
   <div className={styles.messages} role="log" aria-label="Mensajes de ejemplo" aria-live="polite"><div className={styles.dayLabel}>Conversación de ejemplo</div>{(messages[selected]||[]).map(message=><div key={message.id} className={[styles.bubble,message.author==='me'?styles.mine:styles.theirs].join(' ')}><span>{message.text}</span><small>{message.time}{message.author==='me'?<CheckCheck size={13} aria-label="Mensaje local"/>:null}</small></div>)}</div>
   <form className={styles.composer} onSubmit={send}><Smile size={20} aria-hidden="true"/><input value={draft} onChange={event=>setDrafts(current=>({...current,[selected]:event.target.value}))} placeholder="Escribe un mensaje de prueba..." aria-label="Mensaje de prueba"/><button type="submit" disabled={!draft.trim()} aria-label="Agregar mensaje de prueba"><Send size={18}/></button></form>
   <p className={styles.disclaimer}>Prototipo interactivo local: los mensajes no se envían, guardan ni comparten con otros usuarios.</p>
  </section>
  {openChats.length>0?<div ref={chatLayerRef} className={styles.popoutTray} aria-label="Chats independientes">
   {openChats.map(id=>{const person=contacts.find(contact=>contact.id===id);return <section key={id} className={[styles.popout,minimizedChats.includes(id)?styles.popoutCollapsed:'',expandedChats.includes(id)&&!minimizedChats.includes(id)?styles.popoutExpanded:''].join(' ')} data-messenger-popout={id} onKeyDown={event=>{if(event.key==='Escape'&&!event.defaultPrevented){event.stopPropagation();closeChat(id);}}} style={{left:expandedChats.includes(id)?0:(chatPositions[id]?.x??(16+(openChats.indexOf(id)%4)*36)),top:expandedChats.includes(id)?0:(chatPositions[id]?.y??(16+(openChats.indexOf(id)%4)*32)),zIndex:frontChat===id?openChats.length+10:1+openChats.indexOf(id)}} aria-label={'Ventana de '+person.name}>
    <header className={styles.popoutHeader} onPointerDown={event=>{if(!expandedChats.includes(id))startChatDrag(event,id);}}><span className={styles.avatar} style={{'--presence-color':person.color}}>{person.initials}</span><strong>{person.name}</strong><button type="button" onClick={()=>toggleExpand(id)} aria-label={(expandedChats.includes(id)?'Restaurar tamaño de ':'Ampliar ')+person.name} title={expandedChats.includes(id)?'Restaurar tamaño':'Ampliar conversación'}>{expandedChats.includes(id)?<Minus size={17}/>:<Maximize2 size={16}/>}</button><button type="button" onClick={()=>toggleChat(id)} aria-expanded={!minimizedChats.includes(id)} aria-label={(minimizedChats.includes(id)?'Restaurar':'Minimizar')+' chat con '+person.name}>{minimizedChats.includes(id)?<Maximize2 size={16}/>:<Minus size={18}/>}</button><button type="button" onClick={()=>closeChat(id)} aria-label={'Cerrar chat con '+person.name}><X size={18}/></button></header>
    {!minimizedChats.includes(id)?<><div className={styles.popoutMessages} role="log" aria-label={'Mensajes de '+person.name}>{(messages[id]||[]).map(message=><div key={message.id} className={[styles.bubble,message.author==='me'?styles.mine:styles.theirs].join(' ')}>{message.text}</div>)}</div>
    <form className={styles.popoutComposer} onSubmit={event=>{event.preventDefault();const text=(popoutDrafts[id]||'').trim();if(!text)return;setMessages(current=>({...current,[id]:[...(current[id]||[]),{id:Date.now(),author:'me',text,time:'Ahora'}]}));setPopoutDrafts(current=>({...current,[id]:''}));}}>
     <input value={popoutDrafts[id]||''} onChange={event=>setPopoutDrafts(current=>({...current,[id]:event.target.value}))} aria-label={'Mensaje local para '+person.name} placeholder="Mensaje de prueba..."/><button type="submit" disabled={!(popoutDrafts[id]||'').trim()} aria-label="Agregar mensaje local"><Send size={17}/></button>
    </form></>:null}
   </section>;})}
  </div>:null}
 </div>;
}
