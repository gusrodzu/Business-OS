import {useEffect, useState} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import CommandPalette from '../framework/CommandPalette';
import AIAssistant from '../framework/AIAssistant';
import BuzzBeeRightRail from '../framework/BuzzBeeRightRail';
import PowerBanner from '../framework/PowerBanner';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ModuleTabBar from './ModuleTabBar';
import styles from './AppShell.module.css';
import {useAuth} from '../auth/AuthContext';

export default function AppShell() {
  const {demoLive, exitDemoLive} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const moduleKey = location.pathname.split('/').filter(Boolean)[0] || 'inicio';
  const [collapsed, setCollapsed] = useState(() => {
    return window.localStorage.getItem('erp-sidebar-collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    window.localStorage.setItem('erp-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div className={styles.shell} data-collapsed={collapsed} data-responsive-shell="true">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen ? (
        <button
          className={styles.backdrop}
          aria-label="Cerrar navegación"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className={styles.workspace} data-demo-live={demoLive ? 'true' : 'false'}>
        {demoLive ? (
          <div className={styles.demoLiveBanner}>
            <div><strong>DEMO LIVE</strong><span>Estás viendo BuzzBee como BuzzBee Demo Company. Este contexto está aislado del Control Plane.</span></div>
            <button onClick={async()=>{try{await exitDemoLive();navigate('/platform-entry',{replace:true});}catch{navigate('/login',{replace:true});}}}>Volver al Super Admin</button>
          </div>
        ) : null}
        <Topbar
          onOpenMobile={() => setMobileOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenAI={() => setAiOpen(true)}
        />
        <ModuleTabBar />
        <div className={styles.businessLayout}>
          <main className={styles.content} data-md3-module={moduleKey}>
            <Outlet />
          </main>
          <div className={styles.rightColumn}>
            <BuzzBeeRightRail />
          </div>
        </div>
        <div className={styles.powerBannerSlot}>
          <PowerBanner />
        </div>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <button className={styles.mobileAI} onClick={() => {setAiPrompt(''); setAiOpen(true);}} aria-label="Abrir BuzzBee AI">🐝</button>
      <AIAssistant open={aiOpen} initialPrompt={aiPrompt} onClose={() => setAiOpen(false)} />
    </div>
  );
}
