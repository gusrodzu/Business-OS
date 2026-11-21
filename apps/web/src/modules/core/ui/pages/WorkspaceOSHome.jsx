import {ArrowRight, Layers3} from 'lucide-react';
import WorkspaceWidgetBoard from './WorkspaceWidgetBoard';
import styles from './WorkspaceOSHome.module.css';

/**
 * This desktop surface is for actionable widgets, not the app library.
 * The tenant-scoped app catalog is opened from the first dock launcher.
 */
export default function WorkspaceOSHome({
  firstName, companyName, widgetScope, metrics = [], purchases = [],
  notifications = [], recentRequests = [], agenda = [], criticalStock = 0,
  offlineDemo, wallpaper, onOpenWallpaper, onOpenControlCenter,
}) {
  const storageKey = widgetScope ? 'business-os:workspace-widget-sizes:v1:' + widgetScope : null;

  return (
    <div className={styles.home} data-business-os-desktop-home="true">
      <header className={styles.welcome}>
        <div className={styles.welcomeCopy}>
          <span className={styles.kicker}>TU ESPACIO DE TRABAJO</span>
          <h1>Buenos días, {firstName || 'bienvenido'}</h1>
          <p>{companyName || 'Empresa activa'}{offlineDemo ? ' · Modo demostración' : ''}</p>
        </div>
        <button type="button" className={styles.workspacePill} onClick={onOpenWallpaper}>
          <Layers3 size={17} aria-hidden="true"/> Personalizar escritorio <ArrowRight size={16} aria-hidden="true"/>
        </button>
      </header>

      <div className={styles.widgetBoard}>
        <WorkspaceWidgetBoard key={storageKey || 'ephemeral'} storageKey={storageKey}
          metrics={metrics} purchases={purchases} notifications={notifications}
          recentRequests={recentRequests} agenda={agenda} criticalStock={criticalStock}
          wallpaper={wallpaper} onOpenWallpaper={onOpenWallpaper}
          onOpenControlCenter={onOpenControlCenter}/>
      </div>
    </div>
  );
}
