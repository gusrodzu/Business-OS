import {useEffect, useMemo, useState} from 'react';
import {Building2, Mail, Save, ShieldCheck, UserRound} from 'lucide-react';
import {settingsRequest as apiRequest} from '../../services/settingsApi';
import {useAuth} from '../../../../auth/AuthContext';
import {Badge, Button, Card, Input} from '../../../../design-system/components';
import styles from './PersonalSettings.module.css';

export default function Profile() {
  const {user, refreshUser, offlineDemo} = useAuth();
  const [form, setForm] = useState({firstName:'', lastName:'', email:''});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
  }, [user]);

  const initials = useMemo(() => {
    const letters = `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.trim();
    return letters.toUpperCase() || 'U';
  }, [form.firstName, form.lastName]);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const result = await apiRequest('/auth/profile', {
        method: 'PATCH',
        body: {firstName: form.firstName.trim(), lastName: form.lastName.trim()},
      });
      await refreshUser(result.user);
      setMessage({type:'success', text:'Tu perfil se actualizó correctamente.'});
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
          <span className={styles.eyebrow}>Cuenta personal</span>
          <h1>Mi perfil</h1>
          <p>Administra tu identidad dentro de BuzzBee y revisa el contexto de acceso de tu cuenta.</p>
        </div>
        <Button icon={Save} loading={saving} onClick={saveProfile}>Guardar cambios</Button>
      </header>

      {message ? <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div> : null}

      <section className={styles.heroGrid}>
        <Card className={styles.identityCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.identityCopy}>
            <Badge tone="success">{offlineDemo ? 'Demo Offline' : 'Cuenta activa'}</Badge>
            <h2>{user?.fullName || `${form.firstName} ${form.lastName}`.trim() || 'Usuario'}</h2>
            <p>{user?.roles?.[0]?.name || 'Colaborador'}</p>
          </div>
        </Card>
        <Card className={styles.infoCard}><Building2 size={20}/><span>Empresa</span><strong>{user?.company?.name || 'Sin empresa asignada'}</strong></Card>
        <Card className={styles.infoCard}><ShieldCheck size={20}/><span>Rol principal</span><strong>{user?.roles?.[0]?.name || 'Sin rol'}</strong></Card>
      </section>

      <form className={styles.grid} onSubmit={saveProfile}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div><h2>Información personal</h2><p>Estos datos identifican tus acciones, aprobaciones y registros de auditoría.</p></div>
            <UserRound size={20}/>
          </div>
          <div className={styles.formGrid}>
            <Input label="Nombre" name="firstName" value={form.firstName} onChange={(event)=>setForm((current)=>({...current,firstName:event.target.value}))} required minLength={1} maxLength={80}/>
            <Input label="Apellido" name="lastName" value={form.lastName} onChange={(event)=>setForm((current)=>({...current,lastName:event.target.value}))} required minLength={1} maxLength={80}/>
            <Input className={styles.fullField} icon={Mail} label="Correo de acceso" name="email" type="email" value={form.email} readOnly hint="El correo funciona como identificador de acceso y sólo puede cambiarlo un administrador autorizado."/>
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div><h2>Seguridad de la cuenta</h2><p>Estado de autenticación y trazabilidad de tu sesión actual.</p></div>
            <ShieldCheck size={20}/>
          </div>
          <div className={styles.securityList}>
            <div><span>Autenticación MFA</span><strong>{user?.mfaEnabled ? 'Activada' : offlineDemo ? 'No aplica en Demo Offline' : 'No activada'}</strong></div>
            <div><span>Último acceso</span><strong>{user?.lastLoginAt ? new Intl.DateTimeFormat('es-MX',{dateStyle:'medium',timeStyle:'short'}).format(new Date(user.lastLoginAt)) : 'Sesión actual'}</strong></div>
            <div><span>Permisos efectivos</span><strong>{user?.permissions?.includes('*') ? 'Acceso total' : `${user?.permissions?.length || 0} permisos`}</strong></div>
          </div>
        </Card>
      </form>
    </div>
  );
}
