import {useNotify} from '../../../../design-system/components/StatusNotifications';
import {Building2, Edit3, MapPin, Plus, Save, Trash2, X} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {settingsRequest as apiRequest} from '../../services/settingsApi';
import {Badge, Button, Card, Input, Switch} from '../../../../design-system/components';
import styles from './CompanySettings.module.css';

const emptyCompany = {
  name: '', legalName: '', taxId: '', email: '', phone: '', website: '', industry: '',
  country: 'MX', currency: 'MXN', timezone: 'America/Monterrey', address: '', logoUrl: '',
};
const emptyBranch = {name: '', code: '', address: '', active: true};

export default function CompanySettings() {
  const {confirm:confirmAction}=useNotify();
  const [company, setCompany] = useState(emptyCompany);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [branchForm, setBranchForm] = useState(null);
  const [branchSaving, setBranchSaving] = useState(false);
  const companyLock = useRef(false);
  const branchLock = useRef(false);
  const deleteLocks = useRef(new Set());

  const initials = useMemo(() => company.name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'ER', [company.name]);

  async function loadCompany() {
    setLoading(true);
    try {
      const result = await apiRequest('/company');
      const {branches: nextBranches = [], ...companyData} = result.company;
      setCompany({...emptyCompany, ...companyData});
      setBranches(nextBranches);
    } catch (error) {
      setMessage({type: 'error', text: error.message});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCompany(); }, []);

  function updateField(event) {
    const {name, value} = event.target;
    setCompany((current) => ({...current, [name]: value}));
  }

  async function saveCompany(event) {
    event.preventDefault();
    if (companyLock.current) return;
    companyLock.current = true;
    setSaving(true);
    setMessage(null);
    try {
      const result = await apiRequest('/company', {method: 'PUT', body: company});
      setCompany((current) => ({...current, ...result.company}));
      setMessage({type: 'success', text: 'La información de la empresa se guardó correctamente.'});
    } catch (error) {
      setMessage({type: 'error', text: error.message});
    } finally {
      companyLock.current = false;
      setSaving(false);
    }
  }

  function openNewBranch() { setBranchForm({...emptyBranch}); }
  function openEditBranch(branch) { setBranchForm({...branch}); }
  function updateBranch(event) {
    const {name, value} = event.target;
    setBranchForm((current) => ({...current, [name]: value}));
  }

  async function saveBranch(event) {
    event.preventDefault();
    if (branchLock.current) return;
    branchLock.current = true;
    setBranchSaving(true);
    setMessage(null);
    try {
      const isEditing = Boolean(branchForm.id);
      const path = isEditing ? `/company/branches/${branchForm.id}` : '/company/branches';
      await apiRequest(path, {method: isEditing ? 'PUT' : 'POST', body: branchForm});
      setBranchForm(null);
      await loadCompany();
      setMessage({type: 'success', text: isEditing ? 'Sucursal actualizada.' : 'Sucursal creada.'});
    } catch (error) {
      setMessage({type: 'error', text: error.message});
    } finally {
      branchLock.current = false;
      setBranchSaving(false);
    }
  }

  async function deleteBranch(branch) {
    if (deleteLocks.current.has(branch.id)) return;
    if (!await confirmAction(`¿Eliminar la sucursal ${branch.name}?`)) return;
    deleteLocks.current.add(branch.id);
    try {
      await apiRequest(`/company/branches/${branch.id}`, {method: 'DELETE'});
      setBranches((current) => current.filter((item) => item.id !== branch.id));
      setMessage({type: 'success', text: 'Sucursal eliminada.'});
    } catch (error) {
      setMessage({type: 'error', text: error.message});
    } finally {
      deleteLocks.current.delete(branch.id);
    }
  }

  if (loading) return <div className={styles.loading} role="status">Cargando configuración de empresa…</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Configuración organizacional</span>
          <h1>Empresa y sucursales</h1>
          <p>Administra la identidad fiscal, datos de contacto y estructura física de la organización.</p>
        </div>
        <Button icon={Save} loading={saving} onClick={()=>document.getElementById('company-settings-form')?.requestSubmit()}>Guardar cambios</Button>
      </header>

      {message ? <div className={`${styles.message} ${styles[message.type]}`} role={message.type==='error'?'alert':'status'}>{message.text}</div> : null}

      <div className={styles.summaryGrid}>
        <Card className={styles.identityCard}>
          <div className={styles.logo}>{company.logoUrl ? <img src={company.logoUrl} alt="Logo de empresa" /> : initials}</div>
          <div>
            <Badge tone={company.active ? 'success' : 'neutral'}>{company.active ? 'Empresa activa' : 'Empresa inactiva'}</Badge>
            <h2>{company.name}</h2>
            <p>{company.legalName || 'Razón social pendiente'}</p>
          </div>
        </Card>
        <Card className={styles.metricCard}><Building2 size={20}/><span>Sucursales</span><strong>{branches.length}</strong></Card>
        <Card className={styles.metricCard}><MapPin size={20}/><span>País / moneda</span><strong>{company.country} · {company.currency}</strong></Card>
      </div>

      <form id="company-settings-form" className={styles.form} onSubmit={saveCompany}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeading}><div><h2>Información general</h2><p>Datos visibles dentro del ERP y documentos administrativos.</p></div></div>
          <div className={styles.formGrid}>
            <Input label="Nombre comercial" name="name" value={company.name} onChange={updateField} required />
            <Input label="Razón social" name="legalName" value={company.legalName ?? ''} onChange={updateField} />
            <Input label="RFC / Tax ID" name="taxId" value={company.taxId ?? ''} onChange={updateField} />
            <Input label="Industria" name="industry" value={company.industry ?? ''} onChange={updateField} placeholder="Ej. Manufactura" />
            <Input label="Correo" name="email" type="email" value={company.email ?? ''} onChange={updateField} />
            <Input label="Teléfono" name="phone" value={company.phone ?? ''} onChange={updateField} />
            <Input label="Sitio web" name="website" value={company.website ?? ''} onChange={updateField} placeholder="https://" />
            <Input label="URL del logo" name="logoUrl" value={company.logoUrl ?? ''} onChange={updateField} />
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeading}><div><h2>Localización y operación</h2><p>Configuración regional utilizada en reportes y movimientos.</p></div></div>
          <div className={styles.formGrid}>
            <Input label="País" name="country" value={company.country} onChange={updateField} />
            <Input label="Moneda" name="currency" value={company.currency} onChange={updateField} />
            <Input label="Zona horaria" name="timezone" value={company.timezone} onChange={updateField} />
            <Input label="Dirección fiscal" name="address" value={company.address ?? ''} onChange={updateField} />
          </div>
        </Card>
      </form>

      <Card className={styles.sectionCard}>
        <div className={styles.sectionHeading}>
          <div><h2>Sucursales</h2><p>Centros de operación que posteriormente podrán contener almacenes y responsables.</p></div>
          <Button icon={Plus} variant="secondary" onClick={openNewBranch}>Nueva sucursal</Button>
        </div>

        {branchForm ? (
          <form className={styles.branchForm} onSubmit={saveBranch}>
            <div className={styles.branchFormHeader}><strong>{branchForm.id ? 'Editar sucursal' : 'Nueva sucursal'}</strong><button type="button" onClick={() => setBranchForm(null)}><X size={18}/></button></div>
            <div className={styles.formGrid}>
              <Input label="Nombre" name="name" value={branchForm.name} onChange={updateBranch} required />
              <Input label="Código" name="code" value={branchForm.code} onChange={updateBranch} required />
              <Input label="Dirección" name="address" value={branchForm.address ?? ''} onChange={updateBranch} />
              <div className={styles.switchField}><span><strong>Sucursal activa</strong><small>Disponible para operaciones y asignaciones.</small></span><Switch checked={branchForm.active} onChange={(value) => setBranchForm((current) => ({...current, active: value}))}/></div>
            </div>
            <div className={styles.branchActions}><Button type="button" variant="ghost" onClick={() => setBranchForm(null)}>Cancelar</Button><Button type="submit" loading={branchSaving}>Guardar sucursal</Button></div>
          </form>
        ) : null}

        <div className={styles.branchList}>
          {branches.map((branch) => (
            <article className={styles.branchRow} key={branch.id}>
              <div className={styles.branchIcon}><Building2 size={20}/></div>
              <div className={styles.branchInfo}><strong>{branch.name}</strong><span>{branch.code} · {branch.address || 'Sin dirección registrada'}</span></div>
              <Badge tone={branch.active ? 'success' : 'neutral'}>{branch.active ? 'Activa' : 'Inactiva'}</Badge>
              <div className={styles.rowActions}><button onClick={() => openEditBranch(branch)} aria-label={`Editar sucursal ${branch.name}`} type="button"><Edit3 size={17}/></button><button onClick={() => deleteBranch(branch)} aria-label={`Eliminar sucursal ${branch.name}`} type="button"><Trash2 size={17}/></button></div>
            </article>
          ))}
          {branches.length === 0 ? <div className={styles.empty}>No hay sucursales registradas.</div> : null}
        </div>
      </Card>
    </div>
  );
}
