import {useEffect, useState} from 'react';
import {Gauge, LayoutDashboard, MonitorCog, Save} from 'lucide-react';
import {settingsRequest as apiRequest} from '../../services/settingsApi';
import {useAuth} from '../../../../auth/AuthContext';
import {useTheme} from '../../../../framework/ThemeContext';
import {Button, Card, Switch} from '../../../../design-system/components';
import styles from './PersonalSettings.module.css';

const DEFAULTS = {
  theme:'system',
  density:'comfortable',
  reducedMotion:false,
  defaultLandingPage:'/',
};

const landingOptions = [
  ['/', 'Inicio'],
  ['/agenda', 'Agenda'],
  ['/ventas', 'Ventas'],
  ['/compras', 'Compras'],
  ['/inventario/existencias', 'Inventario'],
  ['/finanzas/flujo-efectivo', 'Flujo de efectivo'],
  ['/pos', 'Punto de venta'],
];

export default function Preferences() {
  const {user, refreshUser} = useAuth();
  const {theme, density, reducedMotion, setTheme, setDensity, setReducedMotion} = useTheme();
  const [preferences, setPreferences] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const saved = {...DEFAULTS, ...(user?.preferences || {})};
    setPreferences({...saved, theme: saved.theme || theme, density: saved.density || density, reducedMotion: Boolean(saved.reducedMotion ?? reducedMotion)});
  }, [user]);

  function apply(next) {
    setPreferences(next);
    setTheme(next.theme);
    setDensity(next.density);
    setReducedMotion(Boolean(next.reducedMotion));
  }

  async function savePreferences(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const result = await apiRequest('/auth/preferences', {method:'PATCH', body:preferences});
      apply({...DEFAULTS, ...(result.preferences || preferences)});
      await refreshUser(result.user);
      setMessage({type:'success', text:'Tus preferencias se guardaron correctamente.'});
    } catch (error) {
      setMessage({type:'error', text:error.message});
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Experiencia personal</span>
          <h1>Preferencias</h1>
          <p>Personaliza cómo se ve y se comporta BuzzBee para tu cuenta.</p>
        </div>
        <Button icon={Save} loading={saving} onClick={savePreferences}>Guardar preferencias</Button>
      </header>

      {message ? <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div> : null}

      <form className={styles.preferencesGrid} onSubmit={savePreferences}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeading}><div><h2>Apariencia</h2><p>Selecciona el tema visual que prefieres.</p></div><MonitorCog size={20}/></div>
          <div className={styles.choiceGrid}>
            {[
              ['system','Sistema','Sigue la configuración de Windows o del navegador'],
              ['light','Claro','Interfaz clara y luminosa'],
              ['dark','Oscuro','Interfaz oscura para ambientes de poca luz'],
            ].map(([value,label,description])=>(
              <button type="button" key={value} className={`${styles.choice} ${preferences.theme===value?styles.choiceActive:''}`} onClick={()=>apply({...preferences,theme:value})}>
                <strong>{label}</strong><span>{description}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeading}><div><h2>Densidad y movimiento</h2><p>Ajusta la cantidad de información visible y las animaciones.</p></div><Gauge size={20}/></div>
          <div className={styles.choiceGrid}>
            {[
              ['comfortable','Cómoda','Más aire entre controles y filas'],
              ['compact','Compacta','Más información visible en pantalla'],
            ].map(([value,label,description])=>(
              <button type="button" key={value} className={`${styles.choice} ${preferences.density===value?styles.choiceActive:''}`} onClick={()=>apply({...preferences,density:value})}>
                <strong>{label}</strong><span>{description}</span>
              </button>
            ))}
          </div>
          <div className={styles.switchRow}>
            <Switch checked={preferences.reducedMotion} onChange={(value)=>apply({...preferences,reducedMotion:value})} label="Reducir movimiento" description="Minimiza transiciones y animaciones decorativas."/>
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeading}><div><h2>Página inicial</h2><p>Define qué módulo quieres abrir al iniciar sesión.</p></div><LayoutDashboard size={20}/></div>
          <label className={styles.selectField}>
            <span>Página de inicio predeterminada</span>
            <select value={preferences.defaultLandingPage} onChange={(event)=>setPreferences((current)=>({...current,defaultLandingPage:event.target.value}))}>
              {landingOptions.map(([value,label])=><option value={value} key={value}>{label}</option>)}
            </select>
            <small>Si entras desde un enlace específico, BuzzBee respetará ese destino.</small>
          </label>
        </Card>
      </form>
    </div>
  );
}
