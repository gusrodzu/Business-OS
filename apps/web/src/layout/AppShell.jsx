import {useEffect, useRef, useState} from 'react';
import {Bot, CalendarDays, ClipboardList, Grid2X2, House, PanelRightClose, PanelRightOpen} from 'lucide-react';
import {NavLink, Outlet, useLocation, useNavigate, useNavigationType} from 'react-router-dom';
import CommandPalette from '../framework/CommandPalette';
import AIAssistant from '../framework/AIAssistant';
import BuzzBeeRightRail from '../framework/BuzzBeeRightRail';
import Sidebar from './TwoLevelSidebar';
import Topbar from './Topbar';
import ModuleTabBar from './ModuleTabBar';
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

export default function AppShell() {
  const {demoLive, offlineDemo, exitDemoLive} = useAuth();
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
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  function openMobileMenu(event) {
    // Remember whether the topbar or bottom navigation opened the drawer.
    mobileMenuTriggerRef.current = event?.currentTarget || document.activeElement;
    setMobileOpen(true);
  }

  useEffect(() => {
    // Restore keyboard focus after the drawer is closed (button, backdrop,
    // Escape or navigation), but never on initial mount.
    if (wasMobileOpenRef.current && !mobileOpen) {
      // Responsive changes can hide or remove the original opener. Keep focus
      // in a visible control, falling back to the workspace if neither menu button exists.
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
    <div className={styles.shell} data-design="premium-v2" data-navigation-mode="two-level" data-collapsed={collapsed} data-responsive-shell="true" data-mobile-menu-open={mobileOpen ? 'true' : 'false'}>
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
            <button onClick={()=>navigate('/configuracion',{replace:false})}>Datos simulados</button>
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
          onOpenCommand={() => setCommandOpen(true)}
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
              <button type="button" title="Aplicaciones y agenda" aria-label="Mostrar panel lateral" className={toolsOpen ? styles.toolActive : ''} onClick={() => setToolsOpen((value) => !value)}>
                <Grid2X2 size={19}/>
              </button>
              <button type="button" title="BuzzBee AI" aria-label="Abrir BuzzBee AI" onClick={() => {setAiPrompt(''); setAiOpen(true);}}>
                <Bot size={19}/>
              </button>
              <span className={styles.toolSpacer}/>
              <button type="button" title={toolsOpen ? 'Ocultar panel' : 'Mostrar panel'} aria-label={toolsOpen ? 'Ocultar panel lateral' : 'Mostrar panel lateral'} onClick={() => setToolsOpen((value) => !value)}>
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
        <NavLink to="/agenda" className={({isActive}) => `${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ''}`} onClick={() => setMobileOpen(false)}>
          <CalendarDays size={21} aria-hidden="true"/><span>Agenda</span>
        </NavLink>
        <button type="button" className={styles.mobileNavItem} aria-label="Abrir BuzzBee AI" onClick={() => {setAiPrompt('');setAiOpen(true);}}>
          <Bot size={21} aria-hidden="true"/><span>BuzzBee AI</span>
        </button>
        <button type="button" className={styles.mobileNavItem} aria-label="Abrir módulos" aria-expanded={mobileOpen} aria-controls="buzzbee-module-explorer" onClick={openMobileMenu}>
          <Grid2X2 size={21} aria-hidden="true"/><span>Módulos</span>
        </button>
      </nav>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <button className={styles.mobileAI} onClick={() => {setAiPrompt(''); setAiOpen(true);}} aria-label="Abrir BuzzBee AI">🐝</button>
      <AIAssistant open={aiOpen} initialPrompt={aiPrompt} onClose={() => setAiOpen(false)} />
    </div>
  );
}
