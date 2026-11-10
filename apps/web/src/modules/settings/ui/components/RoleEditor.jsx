import {X} from 'lucide-react';
import {Button, Input} from '../../../../design-system/components';
import styles from '../pages/UsersAccess.module.css';

// Controlled editor; persistence, permission checks and requests stay in UsersAccess.
export default function RoleEditor({roleForm, setRoleForm, permissions, saving, onSave, onClose}) {
  if (!roleForm) return null;
  const togglePermission = (id) => setRoleForm((current) => ({
    ...current,
    permissionIds: current.permissionIds.includes(id)
      ? current.permissionIds.filter((value) => value !== id)
      : [...current.permissionIds, id],
  }));
  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={onSave}>
        <div className={styles.modalHeader}><div><span className={styles.eyebrow}>Control de permisos</span><h2>{roleForm.id ? 'Editar rol' : 'Nuevo rol'}</h2></div><button type="button" onClick={onClose} aria-label="Cerrar editor de rol"><X size={20}/></button></div>
        <div className={styles.formGrid}>
          <Input label="Nombre del rol" value={roleForm.name} onChange={(e) => setRoleForm({...roleForm, name: e.target.value})} required />
          <Input label="Descripción" value={roleForm.description} onChange={(e) => setRoleForm({...roleForm, description: e.target.value})} />
        </div>
        <div className={styles.selector}><strong>Permisos</strong><div className={styles.checkGrid}>{permissions.map((permission) => <label key={permission.id}><input type="checkbox" checked={roleForm.permissionIds.includes(permission.id)} onChange={() => togglePermission(permission.id)}/><span><b>{permission.name}</b><small>{permission.key}</small></span></label>)}</div></div>
        <div className={styles.actions}><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" loading={saving}>Guardar rol</Button></div>
      </form>
    </div>
  );
}
