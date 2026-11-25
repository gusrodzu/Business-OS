import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {CheckCircle2,AlertCircle,AlertTriangle,Info,X} from 'lucide-react';
import styles from './StatusNotifications.module.css';

const NotificationContext=createContext(null);
const variants={
  success:{label:'Correcto',Icon:CheckCircle2,duration:4000},
  error:{label:'Error',Icon:AlertCircle,duration:0},
  warning:{label:'Advertencia',Icon:AlertTriangle,duration:6000},
  info:{label:'Información',Icon:Info,duration:5000},
};
const resolveType=type=>Object.hasOwn(variants,type)?type:'info';

export function useNotify(){
  const context=useContext(NotificationContext);
  if(!context)throw new Error('useNotify requiere ToastProvider');
  return context;
}

export function ToastProvider({children}){
  const [items,setItems]=useState([]);
  const sequence=useRef(0);
  const dismiss=useCallback(id=>setItems(old=>old.filter(item=>item.id!==id)),[]);
  const notify=useCallback(input=>{
    const type=resolveType(input.type);
    const id=++sequence.current;
    const duration=input.duration===0?0:Number.isFinite(input.duration)?Math.max(1500,input.duration):variants[type].duration;
    const item={...input,id,type,duration:input.onAction&&input.duration==null?0:duration};
    setItems(old=>[...old.filter(previous=>previous.type!==type||previous.title!==input.title||previous.message!==input.message),item].slice(-5));
    return id;
  },[]);
  const context=useMemo(()=>({notify,dismiss}),[notify,dismiss]);
  return <NotificationContext.Provider value={context}>
    {children}
    {typeof document!=='undefined'?createPortal(<div className={styles.stack} data-os-toast-stack="true" aria-label="Avisos del sistema">
      {items.map(item=><ToastCard key={item.id} item={item} dismiss={dismiss}/>)}
    </div>,document.body):null}
  </NotificationContext.Provider>;
}

function ToastCard({item,dismiss}){
  const {Icon,label}=variants[item.type];
  const remaining=useRef(item.duration);
  const [hover,setHover]=useState(false),[focus,setFocus]=useState(false);
  const paused=hover||focus;
  useEffect(()=>{
    if(paused||!item.duration)return;
    const started=performance.now();
    const timer=window.setTimeout(()=>dismiss(item.id),remaining.current);
    return ()=>{window.clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(performance.now()-started));};
  },[paused,item.duration,item.id,dismiss]);
  return <article className={styles.toast} data-os-toast={item.type} data-os-elevation="4" onPointerEnter={e=>{if(e.pointerType==='mouse')setHover(true)}} onPointerLeave={()=>setHover(false)} onFocusCapture={()=>setFocus(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocus(false)}}>
    <div className={styles.toastBody} role={item.type==='error'||item.type==='warning'?'alert':'status'} aria-atomic="true">
      <span className={styles.symbol}><Icon size={28} strokeWidth={1.8} aria-hidden="true"/></span>
      <div className={styles.copy}><span className={styles.kind}>{label}</span><strong>{item.title}</strong>{item.message?<p>{item.message}</p>:null}</div>
    </div>
    <button type="button" className={styles.close} aria-label={'Cerrar aviso: '+item.title} onClick={()=>dismiss(item.id)}><X size={18} aria-hidden="true"/></button>
    {item.actionLabel&&item.onAction?<button type="button" className={styles.action} onClick={()=>{item.onAction();dismiss(item.id);}}>{item.actionLabel}</button>:null}
    {item.duration>0?<div className={styles.progress} aria-hidden="true"><span style={{animationDuration:item.duration+'ms',animationPlayState:paused?'paused':'running'}}/></div>:null}
  </article>;
}

// Persistent contextual feedback, including inside native modal dialogs.
export function StatusMessage({type='info',title,message,onDismiss}){
  const variant=resolveType(type);
  const {Icon,label}=variants[variant];
  return <div className={styles.inline} data-os-status={variant}>
    <div className={styles.inlineBody} role={variant==='error'||variant==='warning'?'alert':'status'}>
      <Icon size={20} aria-hidden="true"/>
      <div className={styles.copy}><strong>{title||label}</strong>{message?<p>{message}</p>:null}</div>
    </div>
    {onDismiss?<button type="button" className={styles.inlineClose} aria-label="Cerrar aviso" onClick={onDismiss}><X size={17} aria-hidden="true"/></button>:null}
  </div>;
}
