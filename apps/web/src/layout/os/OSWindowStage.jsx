import {useRef} from 'react';
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
  windows,activeKey,showDesktop,onFocus,onMinimize,onClose,onMaximize,onMove,
}) {
  const stageRef=useRef(null);

  function startDrag(event,window) {
    if(event.button!==0||window.maximized||event.target.closest('button'))return;
    const stage=stageRef.current;
    const panel=event.currentTarget.closest('[data-os-window-slot]');
    if(!stage||!panel)return;
    event.preventDefault();
    onFocus(window.key);
    const sx=event.clientX,sy=event.clientY;
    const originX=window.x,originY=window.y;
    const roomX=Math.max(0,(stage.clientWidth-panel.offsetWidth)/2-8);
    // Keep the entire window inside the usable stage, not just its title bar.
    // This also preserves access to the dock beneath the stage.
    const roomY=Math.max(8,stage.clientHeight-panel.offsetHeight-8);
    const pointerId=event.pointerId;
    function move(pointer) {
      if(pointer.pointerId!==pointerId)return;
      const x=Math.max(-roomX,Math.min(roomX,originX+pointer.clientX-sx));
      const y=Math.max(8,Math.min(roomY,originY+pointer.clientY-sy));
      onMove(window.key,Math.round(x),Math.round(y));
    }
    function stop(pointer) {
      if(pointer.pointerId!==pointerId)return;
      globalThis.window.removeEventListener('pointermove',move);
      globalThis.window.removeEventListener('pointerup',stop);
      globalThis.window.removeEventListener('pointercancel',stop);
    }
    // Browser window, not the business application instance.
    globalThis.window.addEventListener('pointermove',move);
    globalThis.window.addEventListener('pointerup',stop);
    globalThis.window.addEventListener('pointercancel',stop);
  }

  return <div ref={stageRef} className={styles.stage} data-os-window-stage="true"
    data-os-window-count={windows.length} data-os-show-desktop={showDesktop?'true':'false'}>
    {windows.map(window=>{
      const app=resolveOSApplication(window.path);
      if(!app)return null;
      const identity=getOSAppIdentity(window.key);
      const hidden=showDesktop||window.minimized;
      const selected=activeKey===window.key&&!hidden;
      const positioning={
        '--os-window-x':window.x+'px','--os-window-y':window.y+'px',
        '--os-app-accent':identity.accent,
        '--os-app-tint':identity.tint,
        '--os-app-accent-ink':identity.accentInk,
        zIndex:window.order+1,
      };
      return <div key={window.key}
        className={[styles.slot,window.maximized?styles.maximized:'',hidden?styles.hidden:'',selected?styles.focused:''].filter(Boolean).join(' ')}
        style={positioning} data-os-window-slot={window.key}
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
          onMinimize={()=>onMinimize(window.key)}
          onClose={()=>onClose(window.key)}>
          <OSAppSurface appKey={window.key} pathname={window.path}
            Icon={app.Icon} subtitle={app.subtitle}>
            <OSWindowRouteContent pathname={window.path}/>
          </OSAppSurface>
        </OSAppWindow>
      </div>;
    })}
  </div>;
}
