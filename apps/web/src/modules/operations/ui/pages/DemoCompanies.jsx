import {useMemo,useState} from 'react';
import {Link, Navigate} from 'react-router-dom';
import {ArrowRight,Building2,Factory,Filter,Plus,Search,ShieldCheck} from 'lucide-react';
import {useAuth} from '../../../../auth/AuthContext';
import {Badge,Button,Card} from '../../../../design-system/components';
import {createDemoCompany,DEMO_INDUSTRIES,readDemoCompanies,writeDemoCompanies} from './demoCompanyPortfolio';
import styles from './DemoCompanies.module.css';

export default function DemoCompanies(){
  const {offlineDemo}=useAuth();
  const [companies,setCompanies]=useState(readDemoCompanies);
  const [search,setSearch]=useState('');
  const [industryFilter,setIndustryFilter]=useState('all');
  const [createOpen,setCreateOpen]=useState(false);
  const [name,setName]=useState('');
  const [industry,setIndustry]=useState('refaccionaria');
  const [note,setNote]=useState('');
  const [notice,setNotice]=useState('');

  const filtered=useMemo(()=>companies.filter((company)=>{
    const matchesIndustry=industryFilter==='all'||company.industry===industryFilter;
    const text=[company.name,DEMO_INDUSTRIES[company.industry]?.label||'',company.note].join(' ').toLocaleLowerCase('es');
    return matchesIndustry && text.includes(search.trim().toLocaleLowerCase('es'));
  }),[companies,search,industryFilter]);
  const distinctIndustries=new Set(companies.map((company)=>company.industry)).size;
  const configured=companies.filter((company)=>company.stage==='configured').length;

  function addCompany(event){
    event.preventDefault();
    setNotice('');
    if(companies.length>=50){setNotice('La Demo Local permite hasta 50 empresas.');return;}
    const company=createDemoCompany({name,industry,note});
    if(!company){setNotice('Escribe un nombre y selecciona un giro válido.');return;}
    if(companies.some((item)=>item.name.toLocaleLowerCase('es')===company.name.toLocaleLowerCase('es'))){
      setNotice('Ya hay una empresa con ese nombre en la demo.');return;
    }
    const next=[...companies,company];
    setCompanies(next);
    const saved=writeDemoCompanies(next);
    setName('');setNote('');setCreateOpen(false);setSearch('');setIndustryFilter('all');
    setNotice(saved?'Empresa agregada a la Demo Local.':'Empresa agregada en esta sesión; el navegador no permitió guardar.');
  }

  if(!offlineDemo)return <Navigate to="/" replace/>;

  return <div className={styles.page} data-demo-company-portfolio="true">
    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>DEMO LOCAL / PORTAFOLIO DE IMPLEMENTACIÓN</span>
        <h1>Empresas y espacios de trabajo</h1>
        <p>Organiza los negocios que vas a implementar y previsualiza un dashboard diferente para cada giro. La información de esta pantalla es ilustrativa y no cambia la empresa activa del ERP.</p>
      </div>
      <Button type="button" onClick={()=>setCreateOpen(value=>!value)} aria-expanded={createOpen} aria-controls="demo-company-create" icon={Plus}>{createOpen?'Cerrar formulario':'Agregar empresa'}</Button>
    </header>

    <div className={styles.notice} role="note"><ShieldCheck size={19} aria-hidden="true"/><span><strong>Entorno de demostración.</strong> Estas fichas se guardan solamente en el navegador. No son tenants activos, sus KPI son ficticios y los módulos mostrados son propuestas, no licencias habilitadas.</span></div>

    <section className={styles.summary} aria-label="Resumen del portafolio de demo">
      <Card className={styles.stat}><Building2 aria-hidden="true"/><div><strong>{companies.length}</strong><span>Empresas en la demo</span></div></Card>
      <Card className={styles.stat}><Factory aria-hidden="true"/><div><strong>{distinctIndustries}</strong><span>Giros representados</span></div></Card>
      <Card className={styles.stat}><ShieldCheck aria-hidden="true"/><div><strong>{configured}</strong><span>Dashboards configurados</span></div></Card>
    </section>

    {createOpen?<Card className={styles.formCard}>
      <form id="demo-company-create" onSubmit={addCompany}>
        <div className={styles.formHeader}><h2>Nueva empresa para implementar</h2><p>Este registro es local y no crea usuarios, bases de datos ni cuentas de cliente.</p></div>
        <div className={styles.formGrid}>
          <label>Nombre de empresa<input value={name} onChange={event=>setName(event.target.value)} maxLength={80} required placeholder="Ej. Mi negocio" autoComplete="off"/></label>
          <label>Giro principal<select value={industry} onChange={event=>setIndustry(event.target.value)}>{Object.entries(DEMO_INDUSTRIES).map(([key,profile])=><option key={key} value={key}>{profile.label}</option>)}</select></label>
          <label className={styles.full}>Necesidad principal (opcional)<input value={note} onChange={event=>setNote(event.target.value)} maxLength={160} placeholder="Ej. Control de inventario y cobranza" autoComplete="off"/></label>
        </div>
        <div className={styles.formActions}><Button type="button" variant="secondary" onClick={()=>setCreateOpen(false)}>Cancelar</Button><Button type="submit">Crear vista de empresa</Button></div>
      </form>
    </Card>:null}
    {notice?<p className={styles.feedback} role="status">{notice}</p>:null}

    <section className={styles.listSection} aria-labelledby="demo-company-title">
      <div className={styles.listHead}><div><h2 id="demo-company-title">Portafolio</h2><p>Elige una empresa para revisar y adaptar sus indicadores.</p></div><span className={styles.count}>{filtered.length} resultados</span></div>
      <div className={styles.filters}>
        <label className={styles.search}><Search size={18} aria-hidden="true"/><span className={styles.srOnly}>Buscar empresas</span><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar empresa o necesidad"/></label>
        <label className={styles.filter}><Filter size={17} aria-hidden="true"/><span className={styles.srOnly}>Filtrar por giro</span><select value={industryFilter} onChange={event=>setIndustryFilter(event.target.value)}><option value="all">Todos los giros</option>{Object.entries(DEMO_INDUSTRIES).map(([key,profile])=><option key={key} value={key}>{profile.label}</option>)}</select></label>
      </div>
      <div className={styles.companyGrid}>
        {filtered.map(company=>{
          const profile=DEMO_INDUSTRIES[company.industry];
          return <Card key={company.id} className={styles.companyCard}>
            <div className={styles.cardTop}><span className={styles.companyIcon}><Building2 size={21} aria-hidden="true"/></span><Badge tone={company.stage==='configured'?'success':'neutral'}>{company.stage==='configured'?'Configurada':company.source==='example'?'Plantilla':'Por configurar'}</Badge></div>
            <div className={styles.cardCopy}><span>{profile.label}</span><h3>{company.name}</h3><p>{company.note||profile.description}</p></div>
            <div className={styles.cardInfo}><span>{company.metricIds.length} KPI seleccionados</span><span>{company.modules.length} módulos propuestos</span></div>
            <Link className={styles.openLink} to={'/demo/empresas/'+company.id} aria-label={'Abrir dashboard de '+company.name}>Ver dashboard <ArrowRight size={17} aria-hidden="true"/></Link>
          </Card>;
        })}
      </div>
      {!filtered.length?<Card className={styles.empty}><Building2 size={30} aria-hidden="true"/><h3>Sin coincidencias</h3><p>Prueba otro término o elige todos los giros.</p><Button variant="secondary" onClick={()=>{setSearch('');setIndustryFilter('all')}}>Limpiar filtros</Button></Card>:null}
    </section>
  </div>;
}
