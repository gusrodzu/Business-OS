import {useState} from 'react';
import {ArrowRight, Eye, EyeOff, Hexagon, KeyRound, LockKeyhole, Mail, ShieldCheck} from 'lucide-react';
import {Navigate, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const {authenticated, platformSession, login, confirmMfa, verifyMfa} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('admin@erp.local');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authenticated) return <Navigate to={platformSession ? '/platform-entry' : '/'} replace />;

  async function handleCredentials(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login({email, password});
      if (result.mfaSetupRequired) {
        setChallengeToken(result.challengeToken);
        setSecret(result.secret);
        setStep('setup');
        return;
      }
      if (result.mfaRequired) {
        setChallengeToken(result.challengeToken);
        setStep('verify');
        return;
      }
      if (result.authenticated) {
        const requested = location.state?.from?.pathname;
        const erpTarget = requested && !requested.startsWith('/admin-saas') ? requested : '/';
        navigate(result.sessionKind === 'platform' ? '/platform-entry' : erpTarget, {replace: true});
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMfa(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (step === 'setup') await confirmMfa({challengeToken, code});
      else await verifyMfa({challengeToken, code});
      navigate('/platform-entry', {replace: true});
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brand}><span><Hexagon size={24}/></span><strong>BuzzBee Business OS</strong></div>
        <div className={styles.message}>
          <span>Un solo acceso · contexto automático</span>
          <h1>Tu negocio y tu plataforma, en el lugar correcto.</h1>
          <p>BuzzBee identifica automáticamente si tu cuenta pertenece a una empresa o administra la plataforma SaaS. Los Super Admin continúan protegidos con MFA obligatorio.</p>
        </div>
        <small>Acceso unificado BuzzBee · Sesiones ERP y Plataforma aisladas</small>
      </section>

      <section className={styles.formPanel}>
        {step === 'credentials' ? (
          <form className={styles.form} onSubmit={handleCredentials}>
            <header><span>BUZZBEE</span><h2>Inicia sesión</h2><p>Usa tus credenciales. BuzzBee detectará automáticamente el tipo de cuenta.</p></header>
            <label>Correo electrónico<div><Mail size={18}/><input type="email" autoComplete="username" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div></label>
            <label>Contraseña<div><LockKeyhole size={18}/><input type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={8}/><button type="button" onClick={()=>setShowPassword((v)=>!v)} aria-label="Mostrar contraseña">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
            {error ? <div className={styles.error}>{error}</div> : null}
            <button className={styles.submit} disabled={submitting}>{submitting?'Validando…':'Continuar'}<ArrowRight size={18}/></button>
            <div className={styles.accessHint}><ShieldCheck size={17}/><span>Las cuentas Super Admin solicitarán MFA automáticamente. admin@erp.local funciona como Demo Local sin conexión al backend.</span></div>
            <div className={styles.demoActions}>
              <button type="button" onClick={()=>{setEmail('admin@erp.local');setPassword('Admin123!');setError('')}}>Usar Demo Local sin backend</button>
              <p className={styles.demo}>Frontend-only: <strong>admin@erp.local</strong> / <strong>Admin123!</strong></p>
            </div>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleMfa}>
            <header><span>SUPER ADMIN · MFA</span><h2>{step === 'setup' ? 'Configura tu autenticación' : 'Confirma tu identidad'}</h2><p>{step === 'setup' ? 'Tu cuenta fue identificada como Super Admin. Registra la clave en una aplicación TOTP para continuar.' : 'Tu cuenta fue identificada como Super Admin. Ingresa el código de 6 dígitos de tu autenticador.'}</p></header>
            {step === 'setup' ? <div className={styles.secretBox}><small>Clave manual MFA</small><strong>{secret}</strong><p>Guárdala en un lugar seguro. Sólo se muestra durante la configuración inicial.</p></div> : null}
            <label>Código de 6 dígitos<div><KeyRound size={18}/><input className={styles.codeInput} inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} required autoFocus/></div></label>
            {error ? <div className={styles.error}>{error}</div> : null}
            <button className={styles.submit} disabled={submitting || code.length !== 6}>{submitting?'Verificando…':step === 'setup'?'Activar MFA y entrar':'Verificar y entrar'}<ArrowRight size={18}/></button>
            <button type="button" className={styles.back} onClick={()=>{setStep('credentials');setCode('');setError('')}}>Usar otras credenciales</button>
          </form>
        )}
      </section>
    </main>
  );
}
