import {CheckCircle2, Mail, Phone, X} from 'lucide-react';
import {Button, Input} from '../../../../design-system/components';
import styles from './CrmDialogs.module.css';

export function LeadModal({value, setValue, onClose, onSubmit, saving, stages}) {
  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <form className={styles.modal} onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <ModalHeader eyebrow={value.id ? 'Editar oportunidad' : 'Nuevo lead'} title={value.companyName || value.name || 'Datos comerciales'} onClose={onClose} />
        <div className={styles.modalBody}>
          <div className={styles.grid2}>
            <Input label="Nombre del contacto" required value={value.name} onChange={(event) => setValue((current) => ({...current, name: event.target.value}))} />
            <Input label="Empresa" value={value.companyName || ''} onChange={(event) => setValue((current) => ({...current, companyName: event.target.value}))} />
          </div>
          <div className={styles.grid2}>
            <Input label="Correo" type="email" icon={Mail} value={value.email || ''} onChange={(event) => setValue((current) => ({...current, email: event.target.value}))} />
            <Input label="Teléfono" icon={Phone} value={value.phone || ''} onChange={(event) => setValue((current) => ({...current, phone: event.target.value}))} />
          </div>
          <div className={styles.grid3}>
            <label>Etapa<select value={value.stage} onChange={(event) => setValue((current) => ({...current, stage: event.target.value}))}>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
            <Input label="Valor estimado" type="number" min="0" step="0.01" value={value.estimatedValue} onChange={(event) => setValue((current) => ({...current, estimatedValue: event.target.value}))} />
            <Input label="Probabilidad %" type="number" min="0" max="100" value={value.probability} onChange={(event) => setValue((current) => ({...current, probability: event.target.value}))} />
          </div>
          <div className={styles.grid2}>
            <Input label="Fuente" placeholder="Referido, web, evento…" value={value.source || ''} onChange={(event) => setValue((current) => ({...current, source: event.target.value}))} />
            <Input label="Próximo seguimiento" type="datetime-local" value={value.nextActionAt || ''} onChange={(event) => setValue((current) => ({...current, nextActionAt: event.target.value}))} />
          </div>
          <label>Notas<textarea rows="4" value={value.notes || ''} onChange={(event) => setValue((current) => ({...current, notes: event.target.value}))} /></label>
        </div>
        <ModalFooter onClose={onClose} saving={saving} label={value.id ? 'Guardar cambios' : 'Crear lead'} />
      </form>
    </div>
  );
}

export function ActivityModal({value, setValue, prospects, onClose, onSubmit, saving, activityTypeLabel}) {
  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <form className={styles.modal} onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <ModalHeader eyebrow="Seguimiento CRM" title="Nueva actividad" onClose={onClose} />
        <div className={styles.modalBody}>
          <label>Prospecto<select required value={value.prospectId} onChange={(event) => setValue((current) => ({...current, prospectId: event.target.value}))}><option value="">Seleccionar prospecto</option>{prospects.map((item) => <option key={item.id} value={item.id}>{item.companyName || item.name} · {item.name}</option>)}</select></label>
          <div className={styles.grid2}>
            <label>Tipo<select value={value.type} onChange={(event) => setValue((current) => ({...current, type: event.target.value}))}>{Object.entries(activityTypeLabel).filter(([key]) => key !== 'STATUS_CHANGE').map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <Input label="Fecha límite" type="datetime-local" value={value.dueAt || ''} onChange={(event) => setValue((current) => ({...current, dueAt: event.target.value}))} />
          </div>
          <Input label="Título" required value={value.title} onChange={(event) => setValue((current) => ({...current, title: event.target.value}))} />
          <label>Descripción<textarea rows="4" value={value.description || ''} onChange={(event) => setValue((current) => ({...current, description: event.target.value}))} /></label>
        </div>
        <ModalFooter onClose={onClose} saving={saving} label="Registrar actividad" />
      </form>
    </div>
  );
}

export function ConversionModal({value, setValue, onClose, onSubmit, saving}) {
  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <form className={styles.modal} onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <ModalHeader eyebrow="Conversión comercial" title="Convertir prospecto a cliente" onClose={onClose} />
        <div className={styles.conversionNotice}>
          <CheckCircle2 size={20} />
          <div><strong>{value.prospectName}</strong><p>Se creará un cliente real en el catálogo del ERP y la oportunidad quedará marcada como ganada.</p></div>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.grid2}>
            <Input label="Código de cliente" required value={value.code} onChange={(event) => setValue((current) => ({...current, code: event.target.value.toUpperCase()}))} />
            <Input label="RFC" value={value.taxId} onChange={(event) => setValue((current) => ({...current, taxId: event.target.value}))} />
          </div>
          <Input label="Razón social" required value={value.legalName} onChange={(event) => setValue((current) => ({...current, legalName: event.target.value}))} />
          <div className={styles.grid2}>
            <Input label="Nombre comercial" value={value.commercialName} onChange={(event) => setValue((current) => ({...current, commercialName: event.target.value}))} />
            <Input label="Contacto" value={value.contactName} onChange={(event) => setValue((current) => ({...current, contactName: event.target.value}))} />
          </div>
          <div className={styles.grid2}>
            <Input label="Correo" type="email" value={value.email} onChange={(event) => setValue((current) => ({...current, email: event.target.value}))} />
            <Input label="Teléfono" value={value.phone} onChange={(event) => setValue((current) => ({...current, phone: event.target.value}))} />
          </div>
          <Input label="Dirección" value={value.address} onChange={(event) => setValue((current) => ({...current, address: event.target.value}))} />
          <div className={styles.grid2}>
            <Input label="Días de crédito" type="number" min="0" value={value.creditDays} onChange={(event) => setValue((current) => ({...current, creditDays: event.target.value}))} />
            <Input label="Límite de crédito" type="number" min="0" step="0.01" value={value.creditLimit} onChange={(event) => setValue((current) => ({...current, creditLimit: event.target.value}))} />
          </div>
        </div>
        <ModalFooter onClose={onClose} saving={saving} label="Crear cliente" />
      </form>
    </div>
  );
}

function ModalHeader({eyebrow, title, onClose}) {
  return (
    <header className={styles.modalHeader}>
      <div><span>{eyebrow}</span><h2>{title}</h2></div>
      <button type="button" onClick={onClose}><X size={19} /></button>
    </header>
  );
}

function ModalFooter({onClose, saving, label}) {
  return (
    <footer className={styles.modalFooter}>
      <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
      <Button type="submit" loading={saving}>{label}</Button>
    </footer>
  );
}
