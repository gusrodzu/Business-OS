import {Badge, Button} from '../../../../design-system/components';
import {EntityDrawer} from '../../../../ux-foundation/UXFoundation';
import {formatSalesMoney as money, formatSalesDateTime as dateTime} from '../utils/salesDisplayFormatters';
import {stages} from '../../utils/prospectStages';
import styles from '../pages/SalesEnterprise.module.css';

const stageTones = {
  LEAD: 'neutral', CONTACTED: 'warning', QUALIFIED: 'warning',
  PROPOSAL: 'neutral', WON: 'success', LOST: 'danger',
};

// Presentation only: selection, navigation, and mutations belong to the page.
export default function SalesProspectDetailDrawer({selectedProspect, drawerTab, setDrawerTab, onClose, onEdit, onCreateQuote}) {
  return (
      <EntityDrawer
        open={Boolean(selectedProspect)}
        onClose={onClose}
        eyebrow="Oportunidad comercial"
        title={selectedProspect?.companyName || selectedProspect?.name}
        subtitle={selectedProspect?.name}
        status={selectedProspect ? <Badge tone={stageTones[selectedProspect.stage]}>{stages.find((entry) => entry.id === selectedProspect.stage)?.label || selectedProspect.stage}</Badge> : null}
        tabs={[{id:'summary',label:'Resumen'},{id:'contact',label:'Contacto'},{id:'activity',label:'Seguimiento'}]}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        actions={selectedProspect ? <Button size="sm" variant="secondary" onClick={() => onEdit(selectedProspect)}>Editar</Button> : null}
        footer={selectedProspect ? <>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button onClick={onCreateQuote}>Crear cotización</Button>
        </> : null}
      >
        {selectedProspect && drawerTab === 'summary' ? <div className={styles.uxDrawerGrid}>
          <div><span>Valor estimado</span><strong>{money(selectedProspect.estimatedValue)}</strong></div>
          <div><span>Probabilidad</span><strong>{selectedProspect.probability || 0}%</strong></div>
          <div><span>Origen</span><strong>{selectedProspect.source || 'Sin fuente'}</strong></div>
          <div><span>Próxima acción</span><strong>{selectedProspect.nextActionAt ? dateTime(selectedProspect.nextActionAt) : 'Sin programar'}</strong></div>
          <div className={styles.uxDrawerWide}><span>Notas</span><p>{selectedProspect.notes || 'Sin notas comerciales.'}</p></div>
        </div> : null}
        {selectedProspect && drawerTab === 'contact' ? <div className={styles.uxDrawerGrid}>
          <div><span>Contacto</span><strong>{selectedProspect.name}</strong></div>
          <div><span>Empresa</span><strong>{selectedProspect.companyName || 'Sin empresa'}</strong></div>
          <div><span>Correo</span><strong>{selectedProspect.email || 'Sin correo'}</strong></div>
          <div><span>Teléfono</span><strong>{selectedProspect.phone || 'Sin teléfono'}</strong></div>
        </div> : null}
        {selectedProspect && drawerTab === 'activity' ? <div className={styles.uxTimeline}>
          <article><i/><div><strong>Etapa actual</strong><p>{stages.find((entry) => entry.id === selectedProspect.stage)?.label || selectedProspect.stage} · {selectedProspect.probability || 0}% de probabilidad</p></div></article>
          <article><i/><div><strong>Próximo seguimiento</strong><p>{selectedProspect.nextActionAt ? dateTime(selectedProspect.nextActionAt) : 'No hay seguimiento programado.'}</p></div></article>
          <article><i/><div><strong>Registro comercial</strong><p>{selectedProspect.createdAt ? `Creado ${dateTime(selectedProspect.createdAt)}` : 'Oportunidad disponible en el pipeline.'}</p></div></article>
        </div> : null}
      </EntityDrawer>
  );
}
