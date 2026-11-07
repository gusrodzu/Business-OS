import {Badge, Button} from '../../../../design-system/components';
import {EntityDrawer} from '../../../../ux-foundation/UXFoundation';
import styles from '../pages/Crm.module.css';

/** Presentation only: all CRM mutations and selection remain owned by Crm. */
export default function CrmProspectDetailDrawer({prospect, activeTab, onTabChange, onClose, onEdit, onActivity, onConvert, activities, stages, stageTone, money, dateTime, activityTypeLabel, isConverted}) {
  return (
      <EntityDrawer
        open={Boolean(prospect)}
        onClose={onClose}
        eyebrow="Lead / oportunidad"
        title={prospect?.companyName || prospect?.name}
        subtitle={prospect?.name}
        status={prospect?<Badge tone={stageTone[prospect.stage]}>{stages.find((stage)=>stage.id===prospect.stage)?.label||prospect.stage}</Badge>:null}
        tabs={[{id:'summary',label:'Resumen'},{id:'contact',label:'Contacto'},{id:'activity',label:'Actividad'}]}
        activeTab={activeTab}
        onTabChange={onTabChange}
        actions={prospect?<Button size="sm" variant="secondary" onClick={()=>onEdit(prospect)}>Editar</Button>:null}
        footer={prospect?<>
          <Button variant="secondary" onClick={()=>{onActivity(prospect)}}>Registrar seguimiento</Button>
          {prospect.stage==='WON'&&!isConverted(prospect)?<Button onClick={()=>{onConvert(prospect)}}>Convertir a cliente</Button>:null}
        </>:null}
      >
        {prospect&&activeTab==='summary'?<div className={styles.uxDrawerGrid}><div><span>Valor estimado</span><strong>{money(prospect.estimatedValue)}</strong></div><div><span>Probabilidad</span><strong>{prospect.probability||0}%</strong></div><div><span>Origen</span><strong>{prospect.source||'Sin fuente'}</strong></div><div><span>Próximo paso</span><strong>{prospect.nextActionAt?dateTime(prospect.nextActionAt):'Sin programar'}</strong></div><div className={styles.uxDrawerWide}><span>Notas</span><p>{prospect.notes||'Sin notas comerciales.'}</p></div></div>:null}
        {prospect&&activeTab==='contact'?<div className={styles.uxDrawerGrid}><div><span>Contacto</span><strong>{prospect.name}</strong></div><div><span>Empresa</span><strong>{prospect.companyName||'Sin empresa'}</strong></div><div><span>Correo</span><strong>{prospect.email||'Sin correo'}</strong></div><div><span>Teléfono</span><strong>{prospect.phone||'Sin teléfono'}</strong></div></div>:null}
        {prospect&&activeTab==='activity'?<div className={styles.uxTimeline}>{activities.filter((item)=>item.prospectId===prospect.id||item.prospect?.id===prospect.id).slice(0,8).map((item)=><article key={item.id}><i/><div><strong>{item.title}</strong><p>{item.description||activityTypeLabel[item.type]||'Actividad comercial'} · {dateTime(item.createdAt)}</p></div></article>)}{!activities.some((item)=>item.prospectId===prospect.id||item.prospect?.id===prospect.id)?<p className={styles.uxEmptyCopy}>Todavía no hay actividad registrada para esta oportunidad.</p>:null}</div>:null}
      </EntityDrawer>
  );
}
