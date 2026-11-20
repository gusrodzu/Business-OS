import {useState} from 'react';
import {Send} from 'lucide-react';
import {demoContacts,useMessengerDemo} from './MessengerDemoContext';
import styles from './BusinessMessenger.module.css';

export default function MessengerDemoChild({contactId}){
 const shared=useMessengerDemo();
 const [fallback,setFallback]=useState('');
 const person=demoContacts.find(item=>item.id===contactId);
 if(!person||!shared)return <p role="status">Conversación no disponible.</p>;
 const {messages,setMessages,popoutDrafts,setPopoutDrafts}=shared;
 const draft=popoutDrafts[contactId]??fallback;
 function send(event){
  event.preventDefault();
  const text=draft.trim();
  if(!text)return;
  setMessages(current=>({...current,[contactId]:[...(current[contactId]||[]),{id:Date.now(),author:'me',text,time:'Ahora'}]}));
  setPopoutDrafts(current=>({...current,[contactId]:''}));
  setFallback('');
 }
 return <section className={[styles.conversation,styles.childConversation].join(' ')} aria-label={'Conversación local con '+person.name}>
  <header className={styles.chatHeader}><span className={styles.avatar} style={{'--presence-color':person.color}}>{person.initials}</span>
   <div className={styles.chatIdentity}><strong>{person.name}</strong><small>{person.team} · Demostración local</small></div>
   <span className={styles.demoTag}>VISTA DEMO</span></header>
  <div className={styles.messages} role="log" aria-label={'Mensajes de '+person.name} aria-live="polite">
   {(messages[contactId]||[]).map(message=><div key={message.id} className={[styles.bubble,message.author==='me'?styles.mine:styles.theirs].join(' ')}>
    <span>{message.text}</span><small>{message.time}</small></div>)}
  </div>
  <form className={styles.composer} onSubmit={send}>
   <input aria-label={'Mensaje de prueba para '+person.name} value={draft} onChange={event=>setPopoutDrafts(current=>({...current,[contactId]:event.target.value}))} placeholder="Escribe un mensaje de prueba..."/>
   <button type="submit" disabled={!draft.trim()} aria-label="Agregar mensaje de prueba"><Send size={18}/></button>
  </form>
  <p className={styles.disclaimer}>Prototipo local: los mensajes no se envían ni se guardan en un servidor.</p>
 </section>;
}
