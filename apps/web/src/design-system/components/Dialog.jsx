import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
import {createPortal} from 'react-dom';
import styles from './Dialog.module.css';
export function Dialog({open,onClose,title,eyebrow,children,actions,size='md',ariaLabelledby}){
 const ref=useRef(null); const titleId=ariaLabelledby||'bb-dialog-title';
 useEffect(()=>{if(!open)return; const prior=document.activeElement; const node=ref.current; const focusables=node?.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); focusables?.[0]?.focus(); const key=e=>{if(e.key==='Escape')onClose?.(); if(e.key==='Tab'&&focusables?.length){const a=[...focusables];const first=a[0],last=a[a.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}; document.addEventListener('keydown',key); return()=>{document.removeEventListener('keydown',key);prior?.focus?.()};},[open,onClose]);
 if(!open)return null; return createPortal(<div className={styles.layer}><button className={styles.scrim} type="button" aria-label="Cerrar diálogo" onClick={onClose}/><section ref={ref} className={`${styles.dialog} ${styles[size]||''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}><header>{<div>{eyebrow?<span>{eyebrow}</span>:null}<h2 id={titleId}>{title}</h2></div>}<button className={styles.close} type="button" onClick={onClose} aria-label="Cerrar"><X size={20}/></button></header><div className={styles.body}>{children}</div>{actions?<footer>{actions}</footer>:null}</section></div>,document.body);
}
