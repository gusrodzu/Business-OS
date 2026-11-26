import {useEffect, useRef, useState, useSyncExternalStore} from 'react';
import {Bot, CalendarDays, ClipboardList, Grid2X2, House, PanelRightClose, PanelRightOpen, X} from 'lucide-react';
import {NavLink, Outlet, useLocation, useNavigate, useNavigationType} from 'react-router-dom';
import CommandPalette from '../framework/CommandPalette';
import AIAssistant from '../framework/AIAssistant';
import BuzzBeeRightRail from '../framework/BuzzBeeRightRail';
import Sidebar from './TwoLevelSidebar';
import Topbar from './Topbar';
import ModuleTabBar, {hasModuleTabBarForPath} from './ModuleTabBar';
import OSDock from './os/OSDock';
import OSAppWindow from './os/OSAppWindow';
import OSWindowStage from './os/OSWindowStage';
import OSAppSurface from './os/OSAppSurface';
import {WorkspaceSettingsContext} from './os/WorkspaceSettingsContext';
import useOSWindowManager from './os/useOSWindowManager';
import {resolveOSApplication} from './os/resolveOSApplication';
import {getWorkspaceOSApp} from './workspace-os/workspaceOSRoutes';
import OSWallpaperStudio from './os/OSWallpaperStudio';
import WorkspaceOSAppDrawer from './workspace-os/WorkspaceOSAppDrawer';
import {readWorkspaceWallpaper, wallpaperBackground} from './os/workspaceWallpapers';
import WorkspaceAppShelf from '../modules/core/ui/pages/WorkspaceAppShelf';
import styles from './AppShell.module.css';
import {useAuth} from '../auth/AuthContext';

// Browser privacy settings and storage quotas must never block the workspace.
function readStoredPreference(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStoredPreference(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Keep the in-memory preference for this session when storage is unavailable.
  }
}

// One React application, two device shells: desktop windows and phone apps.
const pocketMediaQuery = '(max-width: 760px)';
function subscribePocket(notify) {
  const media = window.matchMedia(pocketMediaQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}
function getPocket() { return window.matchMedia(pocketMediaQuery).matches; }
function getPocketServer() { return false; }
// A geometry profile, not a device identity. Keep the existing shell lifecycle.
const passportMediaQuery = '(min-width: 400px) and (max-width: 1180px) and (min-aspect-ratio: 2/3) and (max-height: 900px) and (pointer: coarse)';
function subscribePassport(notify) {
  const media = window.matchMedia(passportMediaQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}
function getPassport() { return window.matchMedia(passportMediaQuery).matches; }
function getPassportServer() { return false; }
const desktopMediaQuery = '(min-width: 1181px)';
function subscribeDesktop(notify) {
  const media=window.matchMedia(desktopMediaQuery);
  media.addEventListener('change',notify);
  return ()=>media.removeEventListener('change',notify);
}
function getDesktop(){return window.matchMedia(desktopMediaQuery).matches;}
function getDesktopServer(){return false;}

export default function AppShell() {
  const {demoLive, offlineDemo, exitDemoLive, user} = useAuth();
  const pocketOS = useSyncExternalStore(subscribePocket, getPocket, getPocketServer);
  const desktopOS = useSyncExternalStore(subscribeDesktop, getDesktop, getDesktopServer);
  const passportMode = useSyncExternalStore(subscribePassport, getPassport, getPassportServer);
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const moduleKey = location.pathname.split('/').filter(Boolean)[0] || 'inicio';
  const [collapsed, setCollapsed] = useState(() => readStoredPreference('buzzbee.two-level-nav.collapsed', 'false') === 'true');
  const [toolsOpen, setToolsOpen] = useState(() => readStoredPreference('buzzbee.workspace.tools-open-v2', 'true') !== 'false');
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuTriggerRef = useRef(null);
  const wasMobileOpenRef = useRef(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const commandTriggerRef = useRef(null);
  const wasCommandOpenRef = useRef(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const osRoute = getWorkspaceOSApp(location.pathname);
  const osWindow = osRoute ? resolveOSApplication(location.pathname) : null;
  const osApplication = Boolean(osWindow);
  // The three approved OS views keep their stable selectors. Every other route
  // uses the same window chrome, without changing module CRUD or authorization.
  const osScreen = !osRoute ? 'home'
    : ['sales', 'inventory', 'procurement'].includes(osRoute.key) ? osRoute.key : 'application';
  // Desktop Workspace OS has optional demo banners and module tabs. Reserve
  // only the chrome rows that actually render; the final row must own the
  // remaining viewport height. Otherwise purchases/inventory/POS without a
  // ModuleTabBar collapse the absolute-positioned multiwindow stage to 0px.
  const moduleTabsVisible = osScreen === 'application' && !pocketOS
    && hasModuleTabBarForPath(location.pathname);
  const workspaceChromeRows = 1 + Number(Boolean(offlineDemo)) + Number(Boolean(demoLive))
    + Number(moduleTabsVisible);
  const windowScope = `${user?.id||'user'}:${user?.companyId||user?.company?.id||'none'}:${offlineDemo?'offline':'online'}`;
  const windowManager=useOSWindowManager({scope:windowScope,desktop:desktopOS,pathname:location.pathname,app:osRoute,navigate});
  // Menus follow the actual foreground window, not a stale route or a
  // minimized/background application. Desktop without a foreground uses OS menus.
  const foregroundWindow=desktopOS && !windowManager.showDesktop
    ? windowManager.windows.find((item)=>item.key===windowManager.activeKey&&!item.minimized)
    : null;
  const activeOSApp=foregroundWindow
    ? {...resolveOSApplication(foregroundWindow.path),
      path:foregroundWindow.path,windowKey:foregroundWindow.key,
      maximized:Boolean(foregroundWindow.maximized)}
    : null;
  useEffect(()=>{
    if(!desktopOS)return undefined;
    const openConversation=event=>{
      const id=event.detail?.contactId;
      if(typeof id!=='string'||!['ana','carlos','sofia','equipo'].includes(id))return;
      windowManager.openChild('messages',id);
    };
    globalThis.window.addEventListener('business-os:open-messenger-chat',openConversation);
    return ()=>globalThis.window.removeEventListener('business-os:open-messenger-chat',openConversation);
  },[desktopOS,windowManager.openChild]);
  const [windowMaximized, setWindowMaximized] = useState(false);
  const [wallpaperStudioOpen, setWallpaperStudioOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [appsLeft, setAppsLeft] = useState(12);
  const [appsPhoneOpen, setAppsPhoneOpen] = useState(false);
  const appsCloseRef = useRef(null);
  const appsDialogRef = useRef(null);
  const wallpaperKey = `business-os.wallpaper.v1:${user?.id || 'user'}:${user?.companyId || user?.company?.id || 'none'}:${offlineDemo ? 'offline' : 'online'}`;
  const appearanceKey = `business-os.appearance.v2:${windowScope}`;
  const appearanceOptions = ['light', 'classic', 'midnight', 'graphite', 'executive'];
  const [appearanceState, setAppearanceState] = useState(() => ({key:appearanceKey,value:readStoredPreference(appearanceKey,'light')}));
  const appearance = appearanceState.key===appearanceKey ? appearanceState.value : readStoredPreference(appearanceKey,'light');
  const safeAppearance = appearanceOptions.includes(appearance) ? appearance : 'light';
  function applyAppearance(next) {
    if (!appearanceOptions.includes(next)) return false;
    setAppearanceState({key:appearanceKey,value:next});
    try {window.localStorage.setItem(appearanceKey,next);return true;} catch {return false;}
  }
  const [wallpaperState, setWallpaperState] = useState(() => ({
    key: wallpaperKey, value: readWorkspaceWallpaper(wallpaperKey),
  }));
  const wallpaper = wallpaperState.key === wallpaperKey
    ? wallpaperState.value : readWorkspaceWallpaper(wallpaperKey);

  function applyWallpaper(next) {
    try {
      window.localStorage.setItem(wallpaperKey, JSON.stringify(next));
      setWallpaperState({key: wallpaperKey, value: next});
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {setAppsOpen(false);setAppsPhoneOpen(false);}, [location.pathname]);
  useEffect(() => {
    if (!appsOpen) return undefined;
    appsCloseRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setAppsOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !appsDialogRef.current?.contains(document.activeElement)) return;
      const focusables = Array.from(appsDialogRef.current.querySelectorAll(
        'a[href], button:not(:disabled), input:not(:disabled)',
      )).filter((node) => node.getClientRects().length > 0);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [appsOpen]);

  function openOSApps(event) {
    if (pocketOS) {
      setAppsPhoneOpen(true);
      return;
    }
    const rect=event?.currentTarget?.getBoundingClientRect?.();
    const width=Math.min(760,globalThis.window.innerWidth-24);
    setAppsLeft(Math.max(12,Math.min(rect?.left??12,globalThis.window.innerWidth-width-12)));
    setAppsOpen((value)=>!value);
  }

  function openMobileMenu(event) {
    // Remember whether the topbar or bottom navigation opened the drawer.
    mobileMenuTriggerRef.current = event?.currentTarget || document.activeElement;
    setMobileOpen(true);
  }

  function openCommandPalette(event) {
    // A click supplies the actual search button; Ctrl+K preserves the focused
    // keyboard opener. Save the route so selecting a result does not move focus
    // back to the previous page's search button.
    commandTriggerRef.current = {node: event?.currentTarget || document.activeElement, routeKey: location.key};
    setCommandOpen(true);
  }

  useEffect(() => {
    if (wasCommandOpenRef.current && !commandOpen) {
      const {node, routeKey} = commandTriggerRef.current || {};
      if (routeKey === location.key) {
        const active = document.activeElement;
        const focusAlreadyVisible = active && active !== document.body && active !== document.documentElement
          && active.isConnected && active.getClientRects().length
          && window.getComputedStyle(active).visibility !== 'hidden';
        if (!focusAlreadyVisible) {
          const candidates = [node, document.querySelector('button[aria-label="Buscar en Business OS"]'),
            document.querySelector('[data-scroll-owner="workspace"]')];
          const target = candidates.find((item) => item?.isConnected && !item.disabled
            && item.getClientRects().length && window.getComputedStyle(item).visibility !== 'hidden');
          target?.focus({preventScroll: true});
        }
      }
    }
    wasCommandOpenRef.current = commandOpen;
  }, [commandOpen, location.key]);

  useEffect(() => {
    // Restore keyboard focus after the drawer is closed (button, backdrop,
    // Escape or navigation), but never on initial mount.
    if (wasMobileOpenRef.current && !mobileOpen) {
      // Responsive changes can hide or remove the original opener. Keep focus
      // in a visible control, falling back to the workspace if neither menu button exists.
      // If navigation already placed focus in a visible field or dialog,
      // do not steal it back when the mobile drawer closes.
      const active = document.activeElement;
      const focusAlreadyVisible = active && active !== document.body && active !== document.documentElement
        && active.isConnected && active.getClientRects().length
        && window.getComputedStyle(active).visibility !== 'hidden';
      if (!focusAlreadyVisible) {
        const candidates = [
          mobileMenuTriggerRef.current,
          document.querySelector('button[aria-label="Abrir navegación"]'),
          document.querySelector('[data-mobile-bottom-nav] button[aria-label="Abrir módulos"]'),
          document.querySelector('[data-scroll-owner="workspace"]'),
        ];
        const target = candidates.find((node) => node?.isConnected && !node.disabled
          && node.getClientRects().length && window.getComputedStyle(node).visibility !== 'hidden');
        target?.focus();
      }
    }
    wasMobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  // Browser Back/Forward can reset focus to <body> after the drawer has closed.
  // Restore the last mobile opener only when focus is genuinely lost; never
  // steal focus from a visible field, dialog, or other interactive control.
  useEffect(() => {
    if (navigationType !== 'POP' || mobileOpen || !mobileMenuTriggerRef.current) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const active = document.activeElement;
      if (active && active !== document.body && active !== document.documentElement
        && active.isConnected && active.getClientRects().length
        && window.getComputedStyle(active).visibility !== 'hidden') return;
      const opener = mobileMenuTriggerRef.current;
      if (opener?.isConnected && !opener.disabled && opener.getClientRects().length
        && window.getComputedStyle(opener).visibility !== 'hidden') {
        opener.focus({preventScroll: true});
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.key, navigationType, mobileOpen]);

  useEffect(() => {
    saveStoredPreference('buzzbee.two-level-nav.collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    saveStoredPreference('buzzbee.workspace.tools-open', String(toolsOpen));
    saveStoredPreference('buzzbee.workspace.tools-open-v2', String(toolsOpen));
  }, [toolsOpen]);

  return (
    <div className={styles.shell} data-design="premium-v2" data-os-appearance={safeAppearance} data-visual-palette="mono-b" data-navigation-mode="two-level" data-collapsed={collapsed} data-responsive-shell="true" data-passport-mode={passportMode ? 'true' : 'false'} data-mobile-menu-open={mobileOpen ? 'true' : 'false'} data-pocket-os={pocketOS ? 'true' : 'false'} data-os-screen={osScreen} data-os-app={osApplication ? 'true' : 'false'} data-os-window-manager={desktopOS ? 'true' : 'false'}>
      {(osApplication || osScreen === 'home' || pocketOS) ? <div className={styles.osWallpaper} aria-hidden="true" style={{backgroundImage: wallpaperBackground(wallpaper)}}/> : null}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen ? (
        <button className={styles.backdrop} aria-label="Cerrar navegación" onClick={() => setMobileOpen(false)} />
      ) : null}

      <div className={styles.workspace} data-demo-live={demoLive ? 'true' : 'false'} data-offline-demo={offlineDemo ? 'true' : 'false'}
        data-workspace-chrome-rows={workspaceChromeRows}
        style={desktopOS ? {gridTemplateRows: `repeat(${workspaceChromeRows}, auto) minmax(0, 1fr)`} : undefined}>
        {offlineDemo ? (
          <div className={styles.demoLiveBanner}>
            <div><strong>DEMO LOCAL</strong><span>Frontend-only · sin API ni PostgreSQL</span></div>
            <div className={styles.demoBannerActions}>
              <button type="button" onClick={()=>navigate('/demo/empresas')} aria-label="Empresas de demo"><span className={styles.demoActionFull}>Empresas de demo</span><span className={styles.demoActionCompact}>Empresas</span></button>
              <button type="button" onClick={()=>navigate('/configuracion',{replace:false})} aria-label="Configuración de datos simulados"><span className={styles.demoActionFull}>Datos simulados</span><span className={styles.demoActionCompact}>Datos</span></button>
            </div>
          </div>
        ) : null}

        {demoLive ? (
          <div className={styles.demoLiveBanner}>
            <div><strong>DEMO LIVE</strong><span>MotorNorte Refacciones · entorno aislado</span></div>
            <button onClick={async()=>{try{await exitDemoLive();navigate('/platform-entry',{replace:true});}catch{navigate('/login',{replace:true});}}}>Volver al Super Admin</button>
          </div>
        ) : null}

        <Topbar
          mobileOpen={mobileOpen}
          onOpenMobile={openMobileMenu}
          onOpenCommand={openCommandPalette}
          onOpenAI={() => setAiOpen(true)}
          onOpenApps={openOSApps}
          activeOSApp={activeOSApp}
          onMinimizeOSWindow={windowManager.minimize}
          onMaximizeOSWindow={windowManager.maximize}
          onCloseOSWindow={windowManager.close}
          osMode={osApplication || osScreen === 'home' || pocketOS}
        />
        {moduleTabsVisible ? <ModuleTabBar /> : null}

        <div className={styles.businessLayout} data-tools-open={toolsOpen ? 'true' : 'false'}>
          <main className={styles.content} tabIndex={-1} data-md3-module={moduleKey} data-scroll-owner="workspace">
            {desktopOS ? (
              <>
                {!osApplication ? <Outlet context={{openWallpaperStudio: () => setWallpaperStudioOpen(true), wallpaper, appearance:safeAppearance, applyAppearance, applyWallpaper}}/> : null}
                <WorkspaceSettingsContext.Provider value={{openWallpaperStudio:()=>setWallpaperStudioOpen(true),wallpaper,appearance:safeAppearance,applyAppearance,applyWallpaper}}><OSWindowStage key={windowScope} windows={windowManager.windows} activeKey={windowManager.activeKey}
                  showDesktop={windowManager.showDesktop} onFocus={windowManager.focus}
                  onMinimize={windowManager.minimize} onClose={windowManager.close}
                  onMaximize={windowManager.maximize} onMove={windowManager.move} onSnap={windowManager.snap} onResize={windowManager.resize}/></WorkspaceSettingsContext.Provider>
              </>
            ) : osApplication ? (
              <OSAppWindow title={osWindow.title} subtitle={osWindow.subtitle} Icon={osWindow.Icon} appKey={osRoute.key}
                maximized={windowMaximized}
                onToggleMaximize={() => setWindowMaximized((value) => !value)}
                onMinimize={() => navigate('/')} onClose={() => navigate('/')}>
                <OSAppSurface appKey={osRoute.key} pathname={location.pathname} Icon={osWindow.Icon} subtitle={osWindow.subtitle}><Outlet context={{openWallpaperStudio: () => setWallpaperStudioOpen(true), wallpaper, appearance:safeAppearance, applyAppearance, applyWallpaper}} /></OSAppSurface>
              </OSAppWindow>
            ) : <Outlet context={{openWallpaperStudio: () => setWallpaperStudioOpen(true), wallpaper, appearance:safeAppearance, applyAppearance, applyWallpaper}} />}
          </main>

          <aside className={styles.workspaceTools} aria-label="Herramientas de espacio de trabajo">
            <div className={styles.toolStrip}>
              <button type="button" title="Agenda" aria-label="Abrir Agenda" onClick={() => navigate('/agenda')}>
                <CalendarDays size={19}/>
              </button>
              <button type="button" title="Aplicaciones y agenda" aria-label={toolsOpen ? 'Ocultar aplicaciones y agenda' : 'Mostrar aplicaciones y agenda'} aria-expanded={toolsOpen} className={toolsOpen ? styles.toolActive : ''} onClick={() => setToolsOpen((value) => !value)}>
                <Grid2X2 size={19}/>
              </button>
              <button type="button" title="BuzzBee AI" aria-label="Abrir BuzzBee AI" onClick={() => {setAiPrompt(''); setAiOpen(true);}}>
                <Bot size={19}/>
              </button>
              <span className={styles.toolSpacer}/>
              <button type="button" title={toolsOpen ? 'Ocultar panel' : 'Mostrar panel'} aria-label={toolsOpen ? 'Ocultar panel lateral' : 'Mostrar panel lateral'} aria-expanded={toolsOpen} onClick={() => setToolsOpen((value) => !value)}>
                {toolsOpen ? <PanelRightClose size={19}/> : <PanelRightOpen size={19}/>} 
              </button>
            </div>
            {toolsOpen ? <div className={styles.rightColumn}><BuzzBeeRightRail onAskAI={(prompt) => {setAiPrompt(prompt); setAiOpen(true);}} /></div> : null}
          </aside>
        </div>
      </div>

      {(osApplication || osScreen === 'home' || pocketOS) ? <OSDock onOpenApps={openOSApps} appsOpen={appsOpen}
        runningWindows={desktopOS ? windowManager.windows : []}
        activeWindowKey={desktopOS ? windowManager.activeKey : null}
        onActivateWindow={windowManager.focus}
        onMinimizeWindow={windowManager.minimize}
        onForceCloseWindow={windowManager.forceClose}
        onOpenCommand={openCommandPalette}
        onOpenAI={() => {setAiPrompt('');setAiOpen(true);}}/> : null}
      <WorkspaceOSAppDrawer open={appsPhoneOpen} onClose={() => setAppsPhoneOpen(false)}/>

      {appsOpen && (osApplication || osScreen === 'home') ? (
        <div className={styles.osAppsBackdrop} onMouseDown={(event) => {if (event.target === event.currentTarget) setAppsOpen(false);}}>
          <section id="business-os-app-launcher" ref={appsDialogRef} className={styles.osAppsDialog} role="dialog" aria-modal="true" aria-labelledby="os-apps-title"
            style={{left:appsLeft}}>
            <header className={styles.osAppsHeader}>
              <div><span>BIBLIOTECA DE APLICACIONES</span><h2 id="os-apps-title">Tus aplicaciones</h2></div>
              <button ref={appsCloseRef} type="button" aria-label="Cerrar biblioteca de aplicaciones" onClick={() => setAppsOpen(false)}><X size={20}/></button>
            </header>
            <WorkspaceAppShelf variant="drawer" onLaunch={() => setAppsOpen(false)}/>
          </section>
        </div>
      ) : null}

      <nav className={styles.mobileNav} aria-label="Navegación móvil" data-mobile-bottom-nav="true">
        <NavLink end to="/" className={({isActive}) => `${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ''}`} onClick={() => setMobileOpen(false)}>
          <House size={21} aria-hidden="true"/><span>Inicio</span>
        </NavLink>
        <NavLink to="/tareas" className={({isActive}) => `${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ''}`} onClick={() => setMobileOpen(false)}>
          <ClipboardList size={21} aria-hidden="true"/><span>Tareas</span>
        </NavLink>
        <NavLink to="/agenda" className={({isActive}) => `${styles.mobileNavItem} ${styles.mobileNavCenter} ${isActive ? styles.mobileNavActive : ''}`} onClick={() => setMobileOpen(false)}>
          <CalendarDays size={21} aria-hidden="true"/><span>Agenda</span>
        </NavLink>
        <button type="button" className={styles.mobileNavItem} aria-label="Abrir BuzzBee AI" onClick={() => {setAiPrompt('');setAiOpen(true);}}>
          <Bot size={21} aria-hidden="true"/><span>BuzzBee AI</span>
        </button>
        <button type="button" className={styles.mobileNavItem}
          aria-label="Abrir módulos"
          aria-expanded={mobileOpen}
          aria-controls="buzzbee-module-explorer"
          onClick={openMobileMenu}>
          <Grid2X2 size={21} aria-hidden="true"/><span>Módulos</span>
        </button>
      </nav>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <button className={styles.mobileAI} onClick={() => {setAiPrompt(''); setAiOpen(true);}} aria-label="Abrir BuzzBee AI">🐝</button>
      <AIAssistant open={aiOpen} initialPrompt={aiPrompt} onClose={() => setAiOpen(false)} />
      {wallpaperStudioOpen ? (
        <OSWallpaperStudio
          selection={wallpaper}
          appearance={safeAppearance}
          onAppearanceChange={applyAppearance}
          onApply={applyWallpaper}
          onClose={() => setWallpaperStudioOpen(false)}
        />
      ) : null}
    </div>
  );
}
