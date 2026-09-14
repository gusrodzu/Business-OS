import {useState} from 'react';
import {ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck} from 'lucide-react';
import {Navigate, useNavigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const {authenticated, platformSession, login, confirmMfa, verifyMfa, logout} = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authenticated && platformSession) return <Navigate to="/admin-saas" replace/>;

  async function handleCredentials(event) {
    event.preventDefault();
    setError(''); setSubmitting(true);
    try {
      const result = await login({email, password}, {platform: true});
      if (result.mfaSetupRequired) {
        setChallengeToken(result.challengeToken);
        setSecret(result.secret);
        setStep('setup');
      } else if (result.mfaRequired) {
        setChallengeToken(result.challengeToken);
        setStep('verify');
      } else if (result.authenticated) {
        navigate('/admin-saas', {replace: true});
      }
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  async function handleMfa(event) {
    event.preventDefault();
    setError(''); setSubmitting(true);
    try {
      if (step === 'setup') await confirmMfa({challengeToken, code});
      else await verifyMfa({challengeToken, code});
      navigate('/admin-saas', {replace: true});
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  async function switchAccount() {
    if (authenticated) await logout();
    setError('');
  }

  return (
    <main className={styles.page}>
      <section className={styles.securityPanel}>
        <div className={styles.brand}><span><ShieldCheck size={26}/></span><strong>BuzzBee SaaS</strong></div>
        <div className={styles.hero}>
          <span>ACCESO DE ALTA SEGURIDAD</span>
          <h1>Super Admin de plataforma.</h1>
          <p>Acceso exclusivo para administrar empresas, suscripciones, facturación y operación global de BuzzBee.</p>
        </div>
        <div className={styles.securityList}>
          <div><ShieldCheck size={18}/><span>MFA obligatorio</span></div>
          <div><KeyRound size={18}/><span>Sesión de 45 minutos</span></div>
          <div><LockKeyhole size={18}/><span>Reautenticación para acciones críticas</span></div>
        </div>
        <small>Las acciones administrativas quedan registradas en auditoría.</small>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formWrap}>
          <div className={styles.lockBadge}><ShieldCheck size={22}/></div>
          {authenticated && !platformSession ? (
            <div className={styles.switchBox}>
              <h2>Sesión ERP activa</h2>
              <p>El Panel SaaS requiere una cuenta Super Admin independiente.</p>
              <button onClick={switchAccount}>Cerrar sesión ERP y continuar</button>
            </div>
          ) : step === 'credentials' ? (
            <form className={styles.form} onSubmit={handleCredentials}>
              <header><span>BUZZBEE PLATFORM</span><h2>Acceso Super Admin</h2><p>Usa tus credenciales administrativas. No utilices una cuenta operativa del ERP.</p></header>
              <label>Correo administrativo<div><Mail size={18}/><input type="email" autoComplete="username" value={email} onChange={(e)=>setEmail(e.target.value)} required autoFocus/></div></label>
              <label>Contraseña<div><LockKeyhole size={18}/><input type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={8}/><button type="button" onClick={()=>setShowPassword((v)=>!v)} aria-label="Mostrar contraseña">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
              {error ? <div className={styles.error}>{error}</div> : null}
              <button className={styles.submit} disabled={submitting}>{submitting?'Validando…':'Continuar con MFA'}<ArrowRight size={18}/></button>
              <a className={styles.erpLink} href="/login">Ir al acceso normal del ERP</a>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleMfa}>
              <header><span>AUTENTICACIÓN MULTIFACTOR</span><h2>{step === 'setup' ? 'Configura tu MFA' : 'Confirma tu identidad'}</h2><p>{step === 'setup' ? 'Agrega esta cuenta en Google Authenticator, Microsoft Authenticator, 1Password u otra app TOTP.' : 'Ingresa el código de 6 dígitos de tu aplicación autenticadora.'}</p></header>
              {step === 'setup' ? <div className={styles.secretBox}><small>Clave manual</small><strong>{secret}</strong><p>Guarda esta clave en un lugar seguro. Se mostrará únicamente durante la configuración inicial.</p></div> : null}
              <label>Código de 6 dígitos<div><KeyRound size={18}/><input className={styles.codeInput} inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} required autoFocus/></div></label>
              {error ? <div className={styles.error}>{error}</div> : null}
              <button className={styles.submit} disabled={submitting || code.length !== 6}>{submitting?'Verificando…':step === 'setup'?'Activar MFA y entrar':'Verificar y entrar'}<ArrowRight size={18}/></button>
              <button type="button" className={styles.back} onClick={()=>{setStep('credentials');setCode('');setError('')}}>Usar otras credenciales</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
