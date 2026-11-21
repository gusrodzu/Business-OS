import {ArrowLeft, ExternalLink, Layers3, LockKeyhole} from 'lucide-react';
import {Link, Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../../../auth/AuthContext';
import AgentOffice from './AgentOffice';
import styles from './AgentOfficeStandalone.module.css';

/**
 * Agent Office is an independent, read-only product surface.
 * The GitHub feed includes ONLY publicly available repository events.
 * This route intentionally does not mount the global Super Admin control plane.
 */
export default function AgentOfficeStandalone() {
  const {authenticated, loading, platformSession, user} = useAuth();
  const location = useLocation();

  if (loading) return <main className={styles.loading} role="status">Comprobando sesión…</main>;
  if (!authenticated) return <Navigate to="/login" replace state={{from: location}}/>;

  const homePath = platformSession ? '/platform-entry' : '/';
  return <div className={styles.shell} data-agent-office-standalone="true">
    <header className={styles.chrome}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true"><Layers3 size={21}/></span>
        <div><strong>Business OS</strong><small>Agent Office · Observatorio</small></div>
      </div>
      <div className={styles.actions}>
        <span className={styles.identity} title="Sesión autenticada">
          <LockKeyhole size={14} aria-hidden="true"/>
          {user?.firstName || 'Usuario'}
        </span>
        <Link to={homePath} className={styles.back}>
          <ArrowLeft size={17} aria-hidden="true"/><span>Volver a Business OS</span>
        </Link>
      </div>
    </header>
    <main className={styles.main}>
      <AgentOffice/>
    </main>
    <footer className={styles.footer}>
      <span>Solo consulta · Actividad pública de GitHub · Sin controles de administración</span>
      <a href="https://github.com/gusrodzu/Business-OS" target="_blank" rel="noopener noreferrer">
        Repositorio público <ExternalLink size={13} aria-hidden="true"/>
      </a>
    </footer>
  </div>;
}
