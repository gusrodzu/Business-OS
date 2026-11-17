import {useState} from 'react';
import {Link,Navigate,useParams} from 'react-router-dom';
import {ArrowLeft,BarChart3,CheckCircle2,LayoutGrid,Settings2,ShieldCheck} from 'lucide-react';
import {useAuth} from '../../../../auth/AuthContext';
import {Badge,Button,Card} from '../../../../design-system/components';
import {DEMO_INDUSTRIES,DEMO_MODULE_LABELS,readDemoCompanies,writeDemoCompanies} from './demoCompanyPortfolio';
import styles from './DemoCompanies.module.css';

export default function DemoCompanyWorkspace(){
  const {offlineDemo}=useAuth();
  const {companyId}=useParams();
  const [companies,setCompanies]=useState(readDemoCompanies);
  const [editing,setEditing]=useState(false);
  const [message,setMessage]=useState('');
  const company=companies.find((item)=>item.id===companyId);
  const profile=company ? DEMO_INDUSTRIES[company.industry] : null;

  function updateCompany(update){
    const next=companies.map((item)=>item.id===companyId
      ? {...item,...update,stage:'configured'}
      : item);
    if(!writeDemoCompanies(next)){
      setMessage('No fue posible guardar la configuración en este navegador.');
      return;
    }
    setCompanies(next);
    setMessage('Configuración de esta empresa guardada en Demo Local.');
  }

  function toggleMetric(id){
    if(!company)return;
    updateCompany({metricIds:company.metricIds.includes(id)
      ? company.metricIds.filter(item=>item!==id)
      : [...company.metricIds,id]});
  }

  function toggleModule(id){
    if(!company)return;
    updateCompany({modules:company.modules.includes(id)
      ? company.modules.filter(item=>item!==id)
      : [...company.modules,id]});
  }

  if(!offlineDemo)return <Navigate to="/" replace/>;
  if(!company||!profile)return <div className={styles.page} data-demo-company-workspace="missing">
    <Card className={styles.empty}><h1>Empresa de demo no encontrada</h1><p>Esta ficha no existe en el portafolio guardado en este navegador.</p><Link className={styles.openLink} to="/demo/empresas">Volver a empresas</Link></Card>
  </div>;

  const visibleMetrics=profile.metrics.filter(metric=>company.metricIds.includes(metric.id));

  return <div className={styles.page} data-demo-company-workspace={company.id}>
    <div className={styles.breadcrumb}><Link to="/demo/empresas"><ArrowLeft size={17} aria-hidden="true"/> Empresas de demo</Link><span aria-hidden="true">/</span><span>{company.name}</span></div>
    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>DASHBOARD POR EMPRESA / {profile.label.toLocaleUpperCase('es')}</span>
        <h1>{company.name}</h1>
        <p>{company.note||profile.description} Cada empresa tiene su propia selección de KPI y módulos recomendados, independiente de las otras fichas.</p>
      </div>
      <Button type="button" variant={editing?'secondary':'primary'} icon={Settings2} aria-expanded={editing} aria-controls="demo-company-settings" onClick={()=>setEditing(value=>!value)}>{editing?'Cerrar personalización':'Personalizar dashboard'}</Button>
    </header>

    <div className={styles.notice} role="note"><ShieldCheck size={19} aria-hidden="true"/><span><strong>Vista ilustrativa de {profile.label}.</strong> Todos los valores son ficticios. Personalizar este dashboard no cambia la empresa activa, las licencias ni los datos de los módulos reales.</span></div>
    {message?<p className={styles.feedback} role="status">{message}</p>:null}

    <section className={styles.listSection} aria-labelledby="demo-metrics-title">
      <div className={styles.listHead}><div><span className={styles.eyebrow}>INDICADORES RELEVANTES</span><h2 id="demo-metrics-title">Resumen operativo</h2><p>Indicadores de muestra seleccionados para las necesidades de este negocio.</p></div><Badge tone="info">Datos simulados</Badge></div>
      <div className={styles.kpiGrid} data-dashboard-kpi-grid="cards">
        {visibleMetrics.map(metric=><Card className={styles.metricCard} key={metric.id} data-demo-company-kpi={metric.id}>
          <span className={styles.metricLabel}>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.hint}</small>
        </Card>)}
      </div>
      {!visibleMetrics.length?<Card className={styles.empty}><BarChart3 size={28} aria-hidden="true"/><h3>No hay indicadores visibles</h3><p>Abre la personalización para seleccionar KPI de esta empresa.</p><Button variant="secondary" onClick={()=>setEditing(true)}>Agregar indicadores</Button></Card>:null}
    </section>

    <div className={styles.dashboardPanels}>
      <Card className={styles.panel}>
        <div className={styles.panelHead}><LayoutGrid size={20} aria-hidden="true"/><div><h2>Módulos para este negocio</h2><p>Propuesta de implementación, no habilitación de licencias.</p></div></div>
        <div className={styles.moduleList}>
          {profile.modules.filter(module=>company.modules.includes(module)).map(module=><div key={module}><CheckCircle2 size={17} aria-hidden="true"/><span>{DEMO_MODULE_LABELS[module]||module}</span><small>Propuesto</small></div>)}
          {!company.modules.length?<p>Sin módulos seleccionados. Personaliza la propuesta para agregar aplicaciones.</p>:null}
        </div>
      </Card>
      <Card className={styles.panel}>
        <div className={styles.panelHead}><Settings2 size={20} aria-hidden="true"/><div><h2>Plan de implementación</h2><p>Vista previa de necesidades por empresa.</p></div></div>
        <div className={styles.plan}>
          <div><span>Giro</span><strong>{profile.label}</strong></div>
          <div><span>Fase</span><strong>{company.stage==='configured'?'Dashboard configurado':company.source==='example'?'Plantilla inicial':'Por configurar'}</strong></div>
          <div><span>Indicadores elegidos</span><strong>{company.metricIds.length} de {profile.metrics.length}</strong></div>
          <div><span>Aplicaciones propuestas</span><strong>{company.modules.length} de {profile.modules.length}</strong></div>
        </div>
      </Card>
    </div>

    {editing?<Card className={styles.settings} id="demo-company-settings" aria-label={'Configuración de '+company.name}>
      <div className={styles.formHeader}><h2>Configurar dashboard de {company.name}</h2><p>Los cambios son exclusivos de esta ficha en Demo Local. No modifican información operativa del ERP.</p></div>
      <div className={styles.settingsColumns}>
        <fieldset><legend>Indicadores a mostrar</legend>
          {profile.metrics.map(metric=><label key={metric.id} className={styles.settingOption}><input type="checkbox" checked={company.metricIds.includes(metric.id)} onChange={()=>toggleMetric(metric.id)}/><span><strong>{metric.label}</strong><small>{metric.hint}</small></span></label>)}
        </fieldset>
        <fieldset><legend>Módulos recomendados</legend>
          {profile.modules.map(module=><label key={module} className={styles.settingOption}><input type="checkbox" checked={company.modules.includes(module)} onChange={()=>toggleModule(module)}/><span><strong>{DEMO_MODULE_LABELS[module]||module}</strong><small>Planificar uso en esta empresa</small></span></label>)}
        </fieldset>
      </div>
      <div className={styles.formActions}><Button variant="secondary" type="button" onClick={()=>setEditing(false)}>Terminar</Button></div>
    </Card>:null}
  </div>;
}
