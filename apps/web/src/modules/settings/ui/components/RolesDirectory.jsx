import {Edit3} from 'lucide-react';
import {Badge, Card} from '../../../../design-system/components';
import styles from '../pages/UsersAccess.module.css';

// Presentation only: permission changes and persistence remain in UsersAccess.
export default function RolesDirectory({roles, onEditRole}) {
  return (
        <div className={styles.roleGrid}>
          {roles.map((role) => (
            <Card className={styles.roleCard} key={role.id}>
              <div className={styles.roleHeading}><div><Badge tone="info">{role._count.users} usuarios</Badge><h2>{role.name}</h2><p>{role.description || 'Sin descripción'}</p></div><button className={styles.iconButton} onClick={() => onEditRole(role)}><Edit3 size={17}/></button></div>
              <div className={styles.permissionList}>{role.permissions.map((permission) => <span key={permission.id}>{permission.name}</span>)}</div>
            </Card>
          ))}
        </div>
  );
}
