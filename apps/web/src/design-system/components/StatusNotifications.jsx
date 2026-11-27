import {createContext,useCallback,useContext,useEffect,useLayoutEffect,useId,useMemo,useRef,useState} from 'react';
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
  const [decision,setDecision]=useState(null);
  const pending=useRef(null);
  const settle=useCallback((id,result)=>{
    if(pending.current?.id!==id)return;
    const {resolve}=pending.current;
    pending.current=null;
    setDecision(null);
    resolve(result);
  },[]);
  const ask=useCallback((input,kind='confirm')=>new Promise(resolve=>{
    // Reject overlapping decisions rather than authorizing an unintended action.
    if(pending.current){resolve(kind==='prompt'?null:false);return;}
    const id=++sequence.current;
    pending.current={id,resolve,kind};
    setDecision({...input,id,kind});
  }),[]);
  const confirm=useCallback(input=>ask(typeof input==='string'?{title:input}:input),[ask]);
  const prompt=useCallback(input=>ask(typeof input==='string'?{title:input}:input,'prompt'),[ask]);
  useEffect(()=>()=>{const active=pending.current;pending.current=null;if(active)active.resolve(active.kind==='prompt'?null:false);},[]);
  const dismiss=useCallback(id=>setItems(old=>old.filter(item=>item.id!==id)),[]);
  const notify=useCallback(input=>{
    const type=resolveType(input.type);
    const id=++sequence.current;
    const duration=input.duration===0?0:Number.isFinite(input.duration)?Math.max(1500,input.duration):variants[type].duration;
    const item={...input,id,type,duration:input.onAction&&input.duration==null?0:duration};
    setItems(old=>[...old.filter(previous=>previous.type!==type||previous.title!==input.title||previous.message!==input.message),item].slice(-5));
    return id;
  },[]);
  const context=useMemo(()=>({notify,dismiss,confirm,prompt}),[notify,dismiss,confirm,prompt]);
  return <NotificationContext.Provider value={context}>
    {children}
    {typeof document!=='undefined'?createPortal(<div className={styles.stack} data-os-toast-stack="true" aria-label="Avisos del sistema">
      {items.map(item=><ToastCard key={item.id} item={item} dismiss={dismiss}/>)}
    </div>,document.body):null}
    {decision?<DecisionDialog key={decision.id} item={decision} settle={settle}/>:null}
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

/* Native HTML dialog supplies the browser top layer and modal focus containment,
   without using the browser's unstyleable confirm/prompt chrome. */
function DecisionDialog({item,settle}){
  const dialog=useRef(null),cancel=useRef(null),field=useRef(null);
  const titleId=useId(),messageId=useId();
  const isPrompt=item.kind==='prompt';
  const [value,setValue]=useState(String(item.defaultValue??''));
  const variant=resolveType(item.type||'warning');
  const {Icon}=variants[variant];
  const reject=()=>settle(item.id,isPrompt?null:false);
  const accept=()=>settle(item.id,isPrompt?value:true);
  useLayoutEffect(()=>{
    const node=dialog.current,previous=document.activeElement;
    if(!node)return;
    node.showModal();
    (isPrompt?field.current:cancel.current)?.focus({preventScroll:true});
    return ()=>{if(node.open)node.close();if(previous?.isConnected)previous.focus?.({preventScroll:true});};
  },[isPrompt]);
  return createPortal(<dialog ref={dialog} className={styles.decision} data-os-decision={variant} data-ws-window-kind="decision" aria-labelledby={titleId} aria-describedby={item.message?messageId:undefined} role="alertdialog" aria-modal="true" onCancel={e=>{e.preventDefault();reject();}}>
    <div className={styles.decisionPanel} data-os-elevation="5">
      <span className={styles.decisionSymbol}><Icon size={32} strokeWidth={1.8} aria-hidden="true"/></span>
      <h2 id={titleId}>{item.title}</h2>
      {item.message?<p id={messageId}>{item.message}</p>:null}
      {isPrompt?<label className={styles.promptField}>{item.inputLabel||'Respuesta'}<input ref={field} value={value} onChange={e=>setValue(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();if(!item.required||value.trim())accept();}}}/></label>:null}
      <div className={styles.decisionActions} data-ws-region="footer">
        <button ref={cancel} type="button" data-os-decision-cancel onClick={reject}>{item.cancelLabel||'Cancelar'}</button>
        <button type="button" data-os-decision-accept onClick={accept} disabled={isPrompt&&item.required&&!value.trim()}>{item.confirmLabel||'Aceptar'}</button>
      </div>
    </div>
  </dialog>,document.body);
}
