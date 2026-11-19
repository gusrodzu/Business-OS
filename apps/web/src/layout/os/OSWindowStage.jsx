import {useLayoutEffect, useRef, useState} from 'react';
import OSAppWindow from './OSAppWindow';
import OSWindowRouteContent from './OSWindowRouteContent';
import OSAppSurface from './OSAppSurface';
import {getOSAppIdentity} from './workspaceAppIdentity';
import {resolveOSApplication} from './resolveOSApplication';
import styles from './OSWindowStage.module.css';

/**
 * Multiple live ERP route trees share a single tenant-scoped workspace.
 * Minimized windows remain mounted (CSS hidden) so in-progress local forms
 * survive switching. Only the foreground URL is reflected in browser history.
 */
export default function OSWindowStage({
  windows,activeKey,showDesktop,onFocus,onMinimize,onClose,onMaximize,onMove,onSnap,onResize,
}) {
  const stageRef=useRef(null);
  const [topbarBottom,setTopbarBottom]=useState(null);
  const [snapPreview,setSnapPreview]=useState(null);

  useLayoutEffect(()=>{
    const topbar=document.querySelector('[data-business-os-topbar="true"]');
    if(!topbar)return undefined;
    const measure=()=>setTopbarBottom(Math.max(0,Math.ceil(topbar.getBoundingClientRect().bottom)));
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(topbar);
    window.addEventListener('resize',measure);
    return ()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[]);

  function snapZone(pointer,stage){
    const bounds=stage.getBoundingClientRect();
    if(pointer.clientX<bounds.left||pointer.clientX>bounds.right||pointer.clientY<bounds.top||pointer.clientY>bounds.bottom)return null;
    const edge=40;
    if(pointer.clientY<=bounds.top+edge)return 'full';
    if(pointer.clientX<=bounds.left+edge)return 'left';
    if(pointer.clientX>=bounds.right-edge)return 'right';
    return null;
  }

  function startDrag(event,window) {
    if(event.button!==0||(window.maximized&&!window.snap)||event.target.closest('button'))return;
    const stage=stageRef.current;
    const panel=event.currentTarget.closest('[data-os-window-slot]');
    if(!stage||!panel)return;
    event.preventDefault();
    onFocus(window.key);
    const sx=event.clientX,sy=event.clientY;
    const originX=window.x,originY=window.y;
    if(window.snap){onSnap(window.key,'float');return;}
    const roomX=Math.max(0,(stage.clientWidth-panel.offsetWidth)/2);
    // Let floating windows travel edge-to-edge. The dock overlays them rather
    // than reducing their workspace, just like a desktop taskbar.
    const roomY=Math.max(0,stage.clientHeight-panel.offsetHeight);
    const pointerId=event.pointerId;
    setSnapPreview(null);
    function move(pointer) {
      if(pointer.pointerId!==pointerId)return;
      const x=Math.max(-roomX,Math.min(roomX,originX+pointer.clientX-sx));
      const y=Math.max(0,Math.min(roomY,originY+pointer.clientY-sy));
      onMove(window.key,Math.round(x),Math.round(y));
      const zone=snapZone(pointer,stage);
      setSnapPreview(zone?{key:window.key,zone}:null);
    }
    function stop(pointer) {
      if(pointer.pointerId!==pointerId)return;
      globalThis.window.removeEventListener('pointermove',move);
      globalThis.window.removeEventListener('pointerup',stop);
      globalThis.window.removeEventListener('pointercancel',stop);
      setSnapPreview(null);
      if(pointer.type==='pointerup'){
        const zone=snapZone(pointer,stage);
        if(zone)onSnap(window.key,zone);
      }
    }
    // Browser window, not the business application instance.
    globalThis.window.addEventListener('pointermove',move);
    globalThis.window.addEventListener('pointerup',stop);
    globalThis.window.addEventListener('pointercancel',stop);
  }

  function startResize(event,window){
    if(event.button!==0||window.maximized||window.snap)return;
    const stage=stageRef.current;
    const panel=event.currentTarget.closest('[data-os-window-slot]');
    if(!stage||!panel)return;
    event.preventDefault();event.stopPropagation();onFocus(window.key);
    const pointerId=event.pointerId,sx=event.clientX,sy=event.clientY;
    const startWidth=panel.offsetWidth,startHeight=panel.offsetHeight;
    const maxWidth=Math.max(320,stage.clientWidth-(panel.offsetLeft||0));
    const maxHeight=Math.max(240,stage.clientHeight-panel.offsetTop);
    function move(pointer){
      if(pointer.pointerId!==pointerId)return;
      onResize(window.key,Math.round(Math.max(320,Math.min(maxWidth,startWidth+pointer.clientX-sx))),
        Math.round(Math.max(240,Math.min(maxHeight,startHeight+pointer.clientY-sy))));
    }
    function stop(pointer){
      if(pointer.pointerId!==pointerId)return;
      globalThis.window.removeEventListener('pointermove',move);
      globalThis.window.removeEventListener('pointerup',stop);
      globalThis.window.removeEventListener('pointercancel',stop);
    }
    globalThis.window.addEventListener('pointermove',move);
    globalThis.window.addEventListener('pointerup',stop);
    globalThis.window.addEventListener('pointercancel',stop);
  }

  return <div ref={stageRef} className={styles.stage} style={topbarBottom===null?undefined:{top:topbarBottom+'px'}} data-os-window-stage="true"
    data-os-window-count={windows.length} data-os-show-desktop={showDesktop?'true':'false'}>
    {snapPreview?<div className={styles.snapPreview} data-snap-preview={snapPreview.zone} aria-hidden="true"><span>{snapPreview.zone==='full'?'Pantalla completa':snapPreview.zone==='left'?'Mitad izquierda':'Mitad derecha'}</span></div>:null}
    {windows.map(window=>{
      const app=resolveOSApplication(window.path);
      if(!app)return null;
      const identity=getOSAppIdentity(window.key);
      const hidden=showDesktop||window.minimized;
      const selected=activeKey===window.key&&!hidden;
      const positioning={
        '--os-window-x':window.x+'px','--os-window-y':window.y+'px',
        '--os-window-width':(window.width||990)+'px','--os-window-height':(window.height||720)+'px',
        '--os-app-accent':identity.accent,
        '--os-app-tint':identity.tint,
        '--os-app-accent-ink':identity.accentInk,
        zIndex:window.order+1,
      };
      return <div key={window.key}
        className={[styles.slot,window.maximized?styles.maximized:'',window.snap?styles.snapped:'',hidden?styles.hidden:'',selected?styles.focused:''].filter(Boolean).join(' ')}
        style={positioning} data-os-window-slot={window.key} data-os-snap={window.snap||'none'}
        data-os-window-app={identity.key}
        data-os-window-minimized={window.minimized?'true':'false'}
        data-os-window-active={selected?'true':'false'}
        aria-hidden={hidden?'true':undefined}
        onPointerDown={event=>{if(!selected&&!hidden&&!event.target.closest('button'))onFocus(window.key);}}>
        <OSAppWindow title={app.title} subtitle={app.subtitle} Icon={app.Icon} appKey={window.key}
          maximized={window.maximized}
          onHeaderPointerDown={event=>startDrag(event,window)}
          onHeaderDoubleClick={event=>{if(!event.target.closest('button'))onMaximize(window.key);}}
          onToggleMaximize={()=>onMaximize(window.key)}
          onSnap={layout=>onSnap(window.key,layout)}
          onMinimize={()=>onMinimize(window.key)}
          onClose={()=>onClose(window.key)}>
          <OSAppSurface appKey={window.key} pathname={window.path}
            Icon={app.Icon} subtitle={app.subtitle}>
            <OSWindowRouteContent pathname={window.path}/>
          </OSAppSurface>
        </OSAppWindow>
        {!window.maximized&&!window.snap&&!hidden?<div className={styles.resizeHandle}
          role="separator" aria-label={'Redimensionar ventana de '+app.title}
          aria-orientation="vertical" onPointerDown={event=>startResize(event,window)}/>:null}
      </div>;
    })}
  </div>;
}
