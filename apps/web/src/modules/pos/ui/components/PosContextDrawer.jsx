import {Button} from '../../../../design-system/components';
import {DetailDrawer} from '../../../../components/module-system';
import styles from '../pages/Pos.module.css';

// Presentational shell only: the POS page owns form state, submission and permissions.
export default function PosContextDrawer({open,title,subtitle,saving,onClose,formId,onSubmit,children}){
  return <DetailDrawer open={open} onClose={onClose} title={title} subtitle={subtitle} footer={<div className={styles.drawerActions}><Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button><Button type="submit" form={formId} loading={saving}>Guardar</Button></div>}>
    <form id={formId} className={styles.drawerForm} onSubmit={onSubmit}>{children}</form>
  </DetailDrawer>;
}
