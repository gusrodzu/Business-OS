import {FileText, Plus} from 'lucide-react';
import {Button} from '../../../../design-system/components';
import {ModuleHeader} from '../../../../components/module-system';
import styles from '../pages/SalesEnterprise.module.css';

/**
 * Desktop-only header. Keep its existing presentation and delegate navigation
 * and prospect creation to the page; no business logic belongs here.
 */
export default function SalesEnterpriseHeader({onQuotes, onNewProspect}) {
  return (
    <div className={styles.desktopHeader}>
      <ModuleHeader
        eyebrow="Ventas"
        title="Centro comercial"
        description="Prospectos, cotizaciones, pedidos, cartera y actividad en una sola experiencia."
        actions={
          <>
            <Button variant="secondary" icon={FileText} onClick={onQuotes}>
              Nueva cotización
            </Button>
            <Button icon={Plus} onClick={onNewProspect}>
              Nuevo prospecto
            </Button>
          </>
        }
      />
    </div>
  );
}
