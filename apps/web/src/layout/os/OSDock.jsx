import {useEffect, useRef, useState} from 'react';
import {
  Bell, Bot, CalendarDays, ClipboardCheck, ContactRound, Grid2X2,
  House, ListTodo, MessagesSquare, Search, Settings2, UserRound,
} from 'lucide-react';
import {Link, NavLink, useLocation, useNavigate} from 'react-router-dom';
import {apiRequest} from '../../api';
import {isProfileVisible,navigationGroups} from '../../data/navigation';
import {getWorkspaceOSApp} from '../workspace-os/workspaceOSRoutes';
import {useAuth} from '../../auth/AuthContext';
import {SYSTEM_DOCK_APPS, SYSTEM_DOCK_KEYS} from '../workspace-os/systemDockApps';
import {resolveOSApplication} from './resolveOSApplication';
import OSSystemAppIcon from './OSSystemAppIcon';
import {getOSAppIdentityForModule} from './workspaceAppIdentity';
import {demoContacts} from '../../modules/core/ui/pages/MessengerDemoContext';
import styles from './OSDock.module.css';

const ICONS = {
  agenda:CalendarDays, tasks:ListTodo, messages:MessagesSquare,
  approvals:ClipboardCheck, notifications:Bell, directory:ContactRound,
  settings:Settings2,
};

// Show system utilities and the same enabled business catalog as the app library.
export default function OSDock({onOpenApps, onOpenCommand, onOpenAI, appsOpen=false, mobileAppsOpen=false,
  runningWindows=[],activeWindowKey=null,onActivateWindow,
  onMinimizeWindow,onForceCloseWindow}) {
  const {user,offlineDemo} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileActive=(location.pathname==='/configuracion'&&new URLSearchParams(location.search).get('seccion')==='account')||['/configuracion/perfil','/configuracion/preferencias'].includes(location.pathname);
  const scope = String(user?.id||'none')+':'+String(user?.companyId||user?.company?.id||'none');
  const [menu,setMenu] = useState(null);
  const catalogScope=scope+':'+Boolean(offlineDemo);
  const [catalog,setCatalog]=useState(null);
  useEffect(()=>{
    let active=true;
    const load=()=>apiRequest('/modules/dashboard').then(result=>{
      if(active)setCatalog({scope:catalogScope,enabled:new Map((result?.companyModules||[]).map(row=>[row.module?.key||row.moduleId,row.enabled]))});
    }).catch(()=>{if(active)setCatalog(null);});
    load();
    window.addEventListener('focus',load);
    return ()=>{active=false;window.removeEventListener('focus',load);};
  },[catalogScope]);
  const dockApps=[...SYSTEM_DOCK_APPS];
  const dockKeys=new Set(SYSTEM_DOCK_KEYS);
  if(catalog?.scope===catalogScope){
    for(const item of navigationGroups.filter(group=>group.label!=='Principal').flatMap(group=>group.children)){
      const to=item.moduleKey==='compras'?'/compras/solicitudes':item.to||item.children?.find(child=>child.to)?.to;
      if(!to||!isProfileVisible(item))continue;
      const enabled=catalog.enabled.get(item.moduleKey);
      if(enabled===false||(enabled===undefined&&item.defaultVisible===false))continue;
      const key=getWorkspaceOSApp(to)?.key;
      if(!key||key==='notifications'||dockKeys.has(key))continue;
      dockKeys.add(key);dockApps.push({key,label:item.label,to,icon:item.icon});
    }
  }
  useEffect(()=>{const key='business-os-display:'+scope;try{const saved=JSON.parse(localStorage.getItem(key)||'{}');document.documentElement.dataset.osDockSize=saved.dock==='compact'?'compact':'normal';document.documentElement.dataset.osTextSize=saved.text==='large'?'large':'normal';}catch{document.documentElement.dataset.osDockSize='normal';document.documentElement.dataset.osTextSize='normal';}},[scope]);
  const menuRef = useRef(null);
  const contextOpenerRef = useRef(null);
  const running = runningWindows.map(window=>{
    const contact=window.parentKey==='messages'&&demoContacts.find(item=>item.id===window.childId);
    return {...window,app:contact
      ?{title:contact.name,subtitle:'Messenger',Icon:MessagesSquare}
      :resolveOSApplication(window.path)};
  });
  const additionalRunning = running.filter(window=>!dockKeys.has(window.key));
  const byKey = new Map(running.map(window=>[window.key,window]));

  useEffect(()=>{setMenu(null);},[scope]);
  useEffect(()=>{
    if(!menu)return undefined;
    const outside=event=>{if(!menuRef.current?.contains(event.target))setMenu(null);};
    const dismiss=event=>{if(event.key==='Escape'){setMenu(null);contextOpenerRef.current?.focus();}};
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',dismiss);
    globalThis.window.addEventListener('resize',outside);
    globalThis.window.addEventListener('scroll',outside,true);
    const id=globalThis.window.requestAnimationFrame(()=>menuRef.current?.querySelector('button')?.focus());
    return ()=>{
      document.removeEventListener('pointerdown',outside);
      document.removeEventListener('keydown',dismiss);
      globalThis.window.removeEventListener('resize',outside);
      globalThis.window.removeEventListener('scroll',outside,true);
      globalThis.window.cancelAnimationFrame(id);
    };
  },[menu]);

  function showContext(event,key) {
    event.preventDefault();
    contextOpenerRef.current=event.currentTarget;
    const target=byKey.get(key);
    const width=230;
    const height=target ? (target.minimized?128:166) : 74;
    setMenu({key,x:Math.max(8,Math.min(event.clientX,globalThis.window.innerWidth-width-8)),
      y:Math.max(8,Math.min(event.clientY-height,globalThis.window.innerHeight-height-8))});
  }
  function keyboardContext(event,key) {
    if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')){
      showContext({preventDefault:()=>event.preventDefault(),currentTarget:event.currentTarget,
        clientX:event.currentTarget.getBoundingClientRect().left,
        clientY:event.currentTarget.getBoundingClientRect().top},key);
    }
  }
  function action(fn) {setMenu(null);fn();}
  // A second click on the foreground app hides it; clicking again restores it.
  // Background and minimized apps always come to the foreground.
  function toggleDockWindow(key,foreground) {
    if(foreground)onMinimizeWindow?.(key);
    else onActivateWindow?.(key);
  }
  const menuWindow=menu ? byKey.get(menu.key) : null;
  const menuApp=menu ? dockApps.find(app=>app.key===menu.key) : null;
  const menuTitle=menuWindow?.app?.title||menuApp?.label||'Aplicación';
  const menuIsForeground=Boolean(menuWindow&&!menuWindow.minimized&&activeWindowKey===menuWindow.key);

  return (
    <>
      <nav className={styles.dock} data-business-os-dock="true" data-mobile-bottom-nav="true"
        aria-label="Dock de aplicaciones">
        <button type="button" className={styles.item+' '+styles.launcherItem}
          data-os-app-launcher="true" aria-label="Abrir menú de aplicaciones"
          aria-haspopup="dialog" aria-controls={appsOpen ? 'business-os-app-launcher' : undefined}
          aria-expanded={appsOpen} title="Todas las aplicaciones" onClick={onOpenApps}>
          <Grid2X2 size={24} aria-hidden="true"/><span>Apps</span>
        </button>
        <span className={styles.divider} aria-hidden="true"/>
        <NavLink end to="/" className={({isActive})=>styles.item+' '+styles.homeItem+' '+(isActive?styles.active:'')}
          aria-label="Escritorio" title="Escritorio">
          <House size={23} aria-hidden="true"/><span>Inicio</span>
        </NavLink>
        <span className={styles.divider} aria-hidden="true"/>
        <div className={styles.pinnedShelf} role="group" aria-label="Aplicaciones disponibles de la empresa">
          {dockApps.map(app=>{
            const Icon=ICONS[app.key]||app.icon||Grid2X2;
            const opened=byKey.get(app.key);
            const foreground=opened&&activeWindowKey===app.key&&!opened.minimized;
            const status=opened?(opened.minimized?'minimized':foreground?'active':'background'):'closed';
            return <NavLink key={app.key} to={app.to}
              onClick={event=>{if(opened){event.preventDefault();toggleDockWindow(app.key,foreground);}}}
              onContextMenu={event=>showContext(event,app.key)}
              onKeyDown={event=>keyboardContext(event,app.key)}
              data-os-window-status={status}
              className={({isActive})=>styles.item+' '+(foreground||(!opened&&isActive)?styles.active:'')+' '+(opened?styles.runningPinned:'')}
              aria-label={(opened?.minimized?'Restaurar ':foreground?'Minimizar ':opened?'Mostrar ':'Abrir ')+app.label}
              aria-haspopup="menu" title={app.label}>
              <OSSystemAppIcon appKey={app.key} size={30} fallback={Icon}/><span>{app.label}</span>
              {opened ? <i className={styles.runningDot} data-os-running-dot={app.key} aria-hidden="true"/> : null}
            </NavLink>;
          })}
        </div>
        {additionalRunning.length ? <>
          <span className={styles.divider} aria-hidden="true"/>
          <div className={styles.runningShelf} role="group" aria-label="Aplicaciones abiertas">
            {additionalRunning.map(window=>{
              const Icon=window.app?.Icon||Grid2X2;
              const foreground=activeWindowKey===window.key&&!window.minimized;
              const status=window.minimized?'minimized':foreground?'active':'background';
              return <button key={window.key} type="button"
                data-os-running-app={window.key}
                data-os-window-status={status}
                className={styles.item+' '+styles.runningItem+' '+(foreground?styles.active:'')}
                title={(window.minimized?'Restaurar: ':foreground?'Minimizar: ':'Mostrar: ')+(window.app?.title||window.key)}
                aria-label={(window.minimized?'Restaurar ':foreground?'Minimizar ':'Mostrar ')+(window.app?.title||window.key)}
                aria-pressed={Boolean(foreground)}
                aria-haspopup="menu"
                onClick={()=>toggleDockWindow(window.key,foreground)}
                onContextMenu={event=>showContext(event,window.key)}
                onKeyDown={event=>keyboardContext(event,window.key)}>
                <OSSystemAppIcon appKey={getOSAppIdentityForModule(window.app?.moduleKey||window.parentKey||window.key).key} size={30} fallback={Icon}/><span>{window.app?.title||window.key}</span>
                <i className={styles.runningDot} data-os-running-dot={window.key} aria-hidden="true"/>
              </button>;
            })}
          </div>
        </> : null}
      </nav>

      {menu ? <div ref={menuRef} className={styles.contextMenu} role="menu"
        aria-label={'Opciones de '+menuTitle} style={{left:menu.x,top:menu.y}}
        onKeyDown={event=>{
          if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
          event.preventDefault();
          const buttons=Array.from(menuRef.current?.querySelectorAll('button')||[]);
          const index=buttons.indexOf(document.activeElement);
          const next=event.key==='Home'?0:event.key==='End'?buttons.length-1
            :(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
          buttons[next]?.focus();
        }}>
        <strong className={styles.contextTitle}>{menuTitle}</strong>
        {menuWindow ? <>
          {!menuIsForeground ? <button type="button" role="menuitem" onClick={()=>action(()=>onActivateWindow?.(menu.key))}>
            {menuWindow.minimized?'Restaurar ventana':'Mostrar ventana'}
          </button> : null}
          {!menuWindow.minimized ? <button type="button" role="menuitem"
            onClick={()=>action(()=>onMinimizeWindow?.(menu.key))}>Minimizar</button> : null}
          <span className={styles.contextDivider} role="separator"/>
          <button type="button" role="menuitem" className={styles.danger}
            data-os-force-close={menu.key}
            onClick={()=>action(()=>onForceCloseWindow?.(menu.key))}>
            Cerrar ventana
          </button>
        </> : <button type="button" role="menuitem"
          onClick={()=>action(()=>navigate(menuApp?.to||'/'))}>Abrir aplicación</button>}
      </div> : null}

      <nav className={styles.mobileDock} aria-label="Dock de Pocket OS" data-mobile-bottom-nav="true">
        <NavLink end to="/" data-pocket-dock-action="home" aria-label="Ir al escritorio de Pocket OS"
          className={({isActive})=>styles.mobileDockItem+' '+(isActive?styles.mobileDockActive:'')}>
          <House size={23} aria-hidden="true"/><span>Inicio</span>
        </NavLink>
        <button type="button" className={styles.mobileDockItem} data-pocket-dock-action="search"
          aria-label="Buscar aplicaciones y acciones" onClick={onOpenCommand}>
          <Search size={23} aria-hidden="true"/><span>Buscar</span></button>
        <button type="button" className={styles.mobileDockItem+' '+styles.mobileLauncher} data-pocket-dock-action="apps"
          aria-label="Abrir todas las aplicaciones" aria-haspopup="dialog" aria-expanded={mobileAppsOpen}
          aria-controls={mobileAppsOpen?'workspace-os-app-drawer':undefined}
          onClick={onOpenApps}><Grid2X2 size={24} aria-hidden="true"/><span>Apps</span></button>
        <button type="button" className={styles.mobileDockItem} data-pocket-dock-action="assistant"
          aria-label="Abrir asistente empresarial" onClick={onOpenAI}>
          <Bot size={23} aria-hidden="true"/><span>Asistente</span></button>
        <Link to="/configuracion?seccion=account" data-pocket-dock-action="profile" aria-label="Abrir mi cuenta" aria-current={profileActive?'page':undefined}
          className={styles.mobileDockItem+' '+(profileActive?styles.mobileDockActive:'')}>
          <UserRound size={23} aria-hidden="true"/><span>Perfil</span>
        </Link>
      </nav>
    </>
  );
}
