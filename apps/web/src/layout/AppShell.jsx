import {useEffect, useRef, useState} from 'react';
import {Bot, CalendarDays, ClipboardList, Grid2X2, House, PanelRightClose, PanelRightOpen, Search, ShoppingBag, UserRound, X} from 'lucide-react';
import {NavLink, Outlet, useLocation, useNavigate, useNavigationType} from 'react-router-dom';
import CommandPalette from '../framework/CommandPalette';
import AIAssistant from '../framework/AIAssistant';
import BuzzBeeRightRail from '../framework/BuzzBeeRightRail';
import Sidebar from './TwoLevelSidebar';
import Topbar from './Topbar';
import ModuleTabBar from './ModuleTabBar';
import styles from './AppShell.module.css';
import {useWorkspaceAppearance} from '../framework/useWorkspaceAppearance';
import WorkspaceAppShelf from '../modules/core/ui/pages/WorkspaceAppShelf';
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

export default function AppShell() {
  const {demoLive, offlineDemo, exitDemoLive, user} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const moduleKey = location.pathname.split('/').filter(Boolean)[0] || 'inicio';
  const osContext = location.pathname === '/' ? 'home' : location.pathname === '/ventas' ? 'sales' : 'standard';
  const {appearance} = useWorkspaceAppearance(user, offlineDemo);
  const wallpaperStyle = appearance.wallpaper === 'custom' && appearance.customImage
    ? {'--os-wallpaper-image': `url("${appearance.customImage}")`} : undefined;
  const [collapsed, setCollapsed] = useState(() => readStoredPreference('buzzbee.two-level-nav.collapsed', 'false') === 'true');
  const [toolsOpen, setToolsOpen] = useState(() => readStoredPreference('buzzbee.workspace.tools-open-v2', 'true') !== 'false');
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuTriggerRef = useRef(null);
  const wasMobileOpenRef = useRef(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const commandTriggerRef = useRef(null);
  const wasCommandOpenRef = useRef(false);
  const [osAppsOpen, setOsAppsOpen] = useState(false);
  const osAppsTriggerRef = useRef(null);
  const osAppsPanelRef = useRef(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

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
    setOsAppsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!osAppsOpen) return undefined;
    const previous = document.activeElement;
    osAppsPanelRef.current?.querySelector('button[aria-label="Cerrar biblioteca de apps"]')?.focus();
    function handleKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOsAppsOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !osAppsPanelRef.current?.contains(document.activeElement)) return;
      const focusable = [...osAppsPanelRef.current.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled)')]
        .filter((node) => node.getClientRects().length);
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
        event.preventDefault();
        focusable[0].focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (previous?.isConnected && previous.getClientRects().length) previous.focus({preventScroll: true});
    };
  }, [osAppsOpen]);

  useEffect(() => {
    saveStoredPreference('buzzbee.two-level-nav.collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    saveStoredPreference('buzzbee.workspace.tools-open', String(toolsOpen));
    saveStoredPreference('buzzbee.workspace.tools-open-v2', String(toolsOpen));
  }, [toolsOpen]);

  return (
    <div className={styles.shell} data-design="premium-v2" data-visual-palette="mono-b" data-navigation-mode="two-level" data-collapsed={collapsed} data-responsive-shell="true" data-mobile-menu-open={mobileOpen ? 'true' : 'false'} data-os-context={osContext} data-os-wallpaper={appearance.wallpaper} style={wallpaperStyle}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen ? (
        <button className={styles.backdrop} aria-label="Cerrar navegación" onClick={() => setMobileOpen(false)} />
      ) : null}

      <div className={styles.workspace} data-demo-live={demoLive ? 'true' : 'false'} data-offline-demo={offlineDemo ? 'true' : 'false'}>
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
        />
        <ModuleTabBar />

        <div className={styles.businessLayout} data-tools-open={toolsOpen ? 'true' : 'false'}>
          <main className={styles.content} tabIndex={-1} data-md3-module={moduleKey} data-scroll-owner="workspace">
            <Outlet />
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
        <button type="button" className={styles.mobileNavItem} aria-label="Abrir módulos" aria-expanded={mobileOpen} aria-controls="buzzbee-module-explorer" onClick={openMobileMenu}>
          <Grid2X2 size={21} aria-hidden="true"/><span>Módulos</span>
        </button>
      </nav>

      {osContext !== 'standard' ? (
        <nav className={styles.osDock} aria-label="Dock de Business OS">
          <NavLink end to="/" className={({isActive}) => isActive ? styles.osDockActive : ''} aria-label="Escritorio"><House size={23}/><span>Inicio</span></NavLink>
          {osContext === 'sales' ? <NavLink to="/ventas" className={styles.osDockActive} aria-label="Ventas"><ShoppingBag size={23}/><span>Ventas</span></NavLink> : null}
          <button type="button" ref={osAppsTriggerRef} onClick={() => setOsAppsOpen(true)} aria-haspopup="dialog" aria-expanded={osAppsOpen} aria-label="Abrir biblioteca de aplicaciones">
            <Grid2X2 size={23}/><span>Apps</span>
          </button>
          <button type="button" onClick={openCommandPalette} aria-label="Buscar en Business OS"><Search size={23}/><span>Buscar</span></button>
          <NavLink to="/tareas" aria-label="Ir al Centro de tareas"><ClipboardList size={23}/><span>Tareas</span></NavLink>
          <NavLink to="/perfil" aria-label="Ir al perfil"><UserRound size={23}/><span>Perfil</span></NavLink>
        </nav>
      ) : null}

      {osAppsOpen ? (
        <div className={styles.osAppsOverlay} onMouseDown={(event) => {if (event.currentTarget === event.target) setOsAppsOpen(false);}}>
          <section ref={osAppsPanelRef} className={styles.osAppsPanel} role="dialog" aria-modal="true" aria-labelledby="os-apps-panel-title">
            <header>
              <div><span>BUSINESS OS</span><h2 id="os-apps-panel-title">Biblioteca de aplicaciones</h2></div>
              <button type="button" aria-label="Cerrar biblioteca de apps" onClick={() => setOsAppsOpen(false)}><X size={20}/></button>
            </header>
            <WorkspaceAppShelf variant="os"/>
          </section>
        </div>
      ) : null}

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <button className={styles.mobileAI} onClick={() => {setAiPrompt(''); setAiOpen(true);}} aria-label="Abrir BuzzBee AI">🐝</button>
      <AIAssistant open={aiOpen} initialPrompt={aiPrompt} onClose={() => setAiOpen(false)} />
    </div>
  );
}
