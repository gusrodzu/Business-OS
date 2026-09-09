import {useState} from 'react';
import {ArrowRight, Building2, Gauge, LogOut, MonitorPlay, ShieldCheck} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import styles from './PlatformEntry.module.css';

export default function PlatformEntry() {
  const {user, platformSession, enterDemoLive, logout} = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!platformSession) return null;

  async function openDemo() {
    setError('');
    setLoading(true);
    try {
      await enterDemoLive();
      navigate('/', {replace: true});
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await logout();
    navigate('/login', {replace: true});
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}><span>🐝</span><div><strong>BuzzBee</strong><small>Super Admin</small></div></div>
        <button className={styles.logout} onClick={signOut}><LogOut size={17}/>Cerrar sesión</button>
      </header>

      <section className={styles.hero}>
        <div className={styles.badge}><ShieldCheck size={16}/> Sesión Super Admin verificada</div>
        <h1>¿A dónde quieres entrar?</h1>
        <p>Hola {user?.firstName || 'Super Admin'}. Elige el contexto de trabajo. BuzzBee mantendrá separados los datos y permisos de plataforma y Demo LIVE.</p>
      </section>

      <section className={styles.options}>
        <button className={`${styles.option} ${styles.demo}`} onClick={openDemo} disabled={loading}>
          <div className={styles.icon}><MonitorPlay size={30}/></div>
          <div className={styles.copy}>
            <span>DEMO LIVE</span>
            <h2>Cargar interfaz Demo LIVE</h2>
            <p>Abre BuzzBee como una empresa demo real, con datos de demostración y módulos ERP, sin exponer datos de clientes ni tu contexto de plataforma.</p>
            <ul>
              <li>Tenant demo aislado</li>
              <li>Sesión temporal de 30 minutos</li>
              <li>Banner visible de modo Demo LIVE</li>
            </ul>
          </div>
          <div className={styles.action}>{loading ? 'Preparando demo…' : 'Entrar a Demo LIVE'}<ArrowRight size={18}/></div>
        </button>

        <button className={`${styles.option} ${styles.admin}`} onClick={()=>navigate('/admin-saas')}>
          <div className={styles.icon}><Gauge size={30}/></div>
          <div className={styles.copy}>
            <span>CONTROL PLANE</span>
            <h2>Entrar al Panel Super Admin</h2>
            <p>Administra BuzzBee como plataforma SaaS: empresas, suscripciones, facturación, usuarios globales, seguridad, soporte y salud del sistema.</p>
            <ul>
              <li>Control global SaaS</li>
              <li>Acciones críticas con reautenticación</li>
              <li>Sin módulos operativos de tenants</li>
            </ul>
          </div>
          <div className={styles.action}>Abrir Super Admin<ArrowRight size={18}/></div>
        </button>
      </section>

      {error ? <div className={styles.error}><Building2 size={18}/><span>{error}</span></div> : null}

      <footer className={styles.footer}>BuzzBee separa automáticamente las sesiones de plataforma y empresa para mantener el aislamiento multiempresa.</footer>
    </main>
  );
}
