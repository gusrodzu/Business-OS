import {useEffect, useState} from 'react';
import {Bot, CalendarDays, Grid2X2, PanelRightClose, PanelRightOpen} from 'lucide-react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import CommandPalette from '../framework/CommandPalette';
import AIAssistant from '../framework/AIAssistant';
import BuzzBeeRightRail from '../framework/BuzzBeeRightRail';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ModuleTabBar from './ModuleTabBar';
import styles from './AppShell.module.css';
import {useAuth} from '../auth/AuthContext';

export default function AppShell() {
  const {demoLive, offlineDemo, exitDemoLive} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const moduleKey = location.pathname.split('/').filter(Boolean)[0] || 'inicio';
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem('erp-sidebar-collapsed') !== 'false');
  const [toolsOpen, setToolsOpen] = useState(() => window.localStorage.getItem('buzzbee.workspace.tools-open') !== 'false');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    window.localStorage.setItem('erp-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    window.localStorage.setItem('buzzbee.workspace.tools-open', String(toolsOpen));
  }, [toolsOpen]);

  return (
    <div className={styles.shell} data-design="premium-v2" data-collapsed={collapsed} data-responsive-shell="true">
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
          onOpenMobile={() => setMobileOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenAI={() => setAiOpen(true)}
        />
        <ModuleTabBar />

        <div className={styles.businessLayout} data-tools-open={toolsOpen ? 'true' : 'false'}>
          <main className={styles.content} data-md3-module={moduleKey} data-scroll-owner="workspace">
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

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <button className={styles.mobileAI} onClick={() => {setAiPrompt(''); setAiOpen(true);}} aria-label="Abrir BuzzBee AI">🐝</button>
      <AIAssistant open={aiOpen} initialPrompt={aiPrompt} onClose={() => setAiOpen(false)} />
    </div>
  );
}
