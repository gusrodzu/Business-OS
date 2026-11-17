import {Edit3} from 'lucide-react';
import {Badge, Card, Switch} from '../../../../design-system/components';
import styles from '../pages/UsersAccess.module.css';

// Presentational directory: access mutations and editor state remain in the page.
export default function UsersDirectory({users, onToggleStatus, onEditUser}) {
  return (
    <Card className={styles.panel}>
      <div className={styles.tableHeader}><div><h2>Directorio de usuarios</h2><p>Personas con acceso a la organización.</p></div></div>
      <div className={styles.list}>
        {users.map((user) => (
          <article className={styles.row} key={user.id}>
            <div className={styles.avatar}>{user.firstName[0]}{user.lastName[0]}</div>
            <div className={styles.mainInfo}><strong>{user.fullName}</strong><span>{user.email}</span></div>
            <div className={styles.roleBadges}>{user.roles.map((role) => <Badge key={role.id} tone="info">{role.name}</Badge>)}</div>
            <Badge tone={user.active ? 'success' : 'neutral'}>{user.active ? 'Activo' : 'Inactivo'}</Badge>
            <Switch size="sm" checked={user.active} onChange={() => onToggleStatus(user)} />
            <button className={styles.iconButton} onClick={() => onEditUser(user)} aria-label="Editar usuario"><Edit3 size={17}/></button>
          </article>
        ))}
      </div>
    </Card>
  );
}
