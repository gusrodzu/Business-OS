import {Badge, Button} from '../../../../design-system/components';
import {EntityDrawer} from '../../../../ux-foundation/UXFoundation';
import {stages} from '../../utils/prospectStages';
import SalesProspectDetailSections from './SalesProspectDetailSections';

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
        <SalesProspectDetailSections selectedProspect={selectedProspect} drawerTab={drawerTab}/>
      </EntityDrawer>
  );
}
