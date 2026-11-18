import {ArrowLeft, Maximize2, Minimize2, Minus, X} from 'lucide-react';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import styles from '../AppShell.module.css';
import {getOSAppIdentity} from './workspaceAppIdentity';

/**
 * Shared workspace chrome for every business module (desktop, tablet, Pocket OS).
 * Window state and authorized route navigation remain owned by AppShell.
 */
export default function OSAppWindow({
  title, subtitle, Icon, appKey, maximized = false, onToggleMaximize, onSnap, onMinimize, onClose, onHeaderPointerDown, onHeaderDoubleClick, children,
}) {
  const identity=getOSAppIdentity(appKey);
  const [layoutsOpen,setLayoutsOpen]=useState(false);
  const snapAnchorRef=useRef(null);
  const snapMenuRef=useRef(null);
  const [menuPosition,setMenuPosition]=useState({top:0,right:12});
  useLayoutEffect(()=>{
    if(!layoutsOpen)return undefined;
    const measure=()=>{
      const rect=snapAnchorRef.current?.getBoundingClientRect();
      if(!rect)return;
      setMenuPosition({top:Math.min(rect.bottom+6,Math.max(8,window.innerHeight-270)),right:Math.max(12,window.innerWidth-rect.right)});
    };
    measure();
    window.addEventListener('resize',measure);
    window.addEventListener('scroll',measure,true);
    return ()=>{window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);};
  },[layoutsOpen]);
  useEffect(()=>{
    if(!layoutsOpen)return undefined;
    function dismiss(event){if(!snapAnchorRef.current?.contains(event.target)&&!snapMenuRef.current?.contains(event.target))setLayoutsOpen(false);}
    function escape(event){if(event.key==='Escape')setLayoutsOpen(false);}
    document.addEventListener('pointerdown',dismiss);
    document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape);};
  },[layoutsOpen]);
  const layouts=[['full','Pantalla completa','▣'],['left','Mitad izquierda','◧'],['right','Mitad derecha','◨'],['third-left','Tercio izquierdo','▏▯'],['third-center','Tercio central','▯▏'],['third-right','Tercio derecho','▯▏'],['two-thirds-left','Dos tercios izquierdos','◧'],['two-thirds-right','Dos tercios derechos','◨']];
  return (
    <section className={[styles.osAppWindow, maximized ? styles.osWindowMaximized : ''].filter(Boolean).join(' ')}
      aria-label={'Aplicación ' + title} data-os-application-window="true"
      data-os-app-identity={identity.key}
      style={{'--os-app-accent':identity.accent,'--os-app-accent-ink':identity.accentInk,'--os-app-tint':identity.tint}}>
      <header className={styles.osWindowBar} onPointerDown={onHeaderPointerDown} onDoubleClick={onHeaderDoubleClick}>
        <div className={styles.osWindowName}>
          <button type="button" className={styles.osPhoneHome} onClick={onMinimize}
            aria-label="Volver al escritorio de Pocket OS" title="Volver al inicio">
            <ArrowLeft size={21} aria-hidden="true"/>
          </button>
          <Icon size={21} aria-hidden="true"/>
          <strong>{title}</strong>{subtitle ? <span className={styles.osWindowSubtitle} aria-label={'Sección ' + subtitle}>/ {subtitle}</span> : null}
        </div>
        <div className={styles.osWindowControls}>
          <button type="button" onClick={onMinimize} title={'Minimizar ' + title}
            aria-label={'Minimizar ' + title + ' y volver al escritorio'}>
            <Minus size={20} aria-hidden="true"/>
          </button>
          <div ref={snapAnchorRef} className={styles.osSnapAnchor}>
          <button type="button" onClick={()=>onSnap?setLayoutsOpen(open=>!open):onToggleMaximize()}
            title={onSnap?'Organizar ventana (clic para elegir distribución)':undefined}
            aria-haspopup={onSnap?'true':undefined} aria-expanded={onSnap?layoutsOpen:undefined}
            aria-label={onSnap?'Organizar ventana de '+title:(maximized ? 'Restaurar ventana de ' : 'Ampliar ventana de ') + title}
            aria-pressed={maximized}>
            {maximized ? <Minimize2 size={18} aria-hidden="true"/> : <Maximize2 size={18} aria-hidden="true"/>}
          </button>
          {onSnap&&layoutsOpen?createPortal(<div ref={snapMenuRef} className={styles.osSnapMenu} style={menuPosition} role="group" aria-label="Organizar ventanas" onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>{if(event.key==='Escape'){setLayoutsOpen(false);event.stopPropagation();}}}>
            <strong>Organizar ventana</strong>
            <div className={styles.osSnapGrid}>{layouts.map(([id,label,glyph])=><button key={id} type="button" title={label} aria-label={label} onClick={()=>{onSnap(id);setLayoutsOpen(false);}}><span aria-hidden="true">{glyph}</span><small>{label}</small></button>)}</div>
          </div>,document.body):null}
          </div>
          <button type="button" onClick={onClose} title={'Cerrar ' + title}
            aria-label={'Cerrar ' + title}>
            <X size={19} aria-hidden="true"/>
          </button>
        </div>
      </header>
      <div className={styles.osWindowBody}>{children}</div>
    </section>
  );
}
