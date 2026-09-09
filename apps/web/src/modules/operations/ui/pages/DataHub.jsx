import {statusLabel} from '../../../../design-system/i18n/uiLanguage.js';
import {useEffect,useMemo,useState} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {
  AlertTriangle,ArrowLeftRight,CheckCircle2,FileSpreadsheet,FileUp,
  History,RefreshCw,Rows3,RotateCcw,UploadCloud,UsersRound,Package,Truck,Building2,Sparkles
} from 'lucide-react';
import {apiRequest} from '../../../../api';
import {Badge,Button,Card} from '../../../../design-system/components';
import KpiGrid from '../../../../components/KpiGrid';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import styles from './DataHub.module.css';

const labels={AUTO:'Detectar automáticamente',CUSTOMER:'Clientes',SUPPLIER:'Proveedores',PRODUCT:'Productos',EMPLOYEE:'Empleados'};
const moduleCards=[
  {entity:'EMPLOYEE',label:'Recursos Humanos',description:'Plantilla, departamentos y puestos',icon:UsersRound},
  {entity:'PRODUCT',label:'Inventario',description:'Productos, SKU, costos y categorías',icon:Package},
  {entity:'SUPPLIER',label:'Compras',description:'Proveedores y condiciones comerciales',icon:Truck},
  {entity:'CUSTOMER',label:'Ventas / CRM',description:'Clientes y cartera comercial',icon:Building2},
];

const statusTone=status=>{
  if(['COMPLETED','ROLLED_BACK'].includes(status))return 'success';
  if(['COMPLETED_WITH_ERRORS','FAILED','ROLLBACK_PARTIAL'].includes(status))return 'danger';
  if(['READY','IMPORTING','ROLLING_BACK'].includes(status))return 'warning';
  return 'neutral';
};

const prettyStatus={
  PREVIEW:'Vista previa',READY:'Listo',IMPORTING:'Importando',
  COMPLETED:'Completado',COMPLETED_WITH_ERRORS:'Con errores',
  FAILED:'Fallido',CANCELLED:'Cancelado',ROLLING_BACK:'Revirtiendo',
  ROLLED_BACK:'Revertido',ROLLBACK_PARTIAL:'Reversa parcial'
};

const moneyish=v=>v===null||v===undefined?'—':String(v);

function Diff({beforeData,afterData}){
  const keys=Array.from(new Set([
    ...Object.keys(beforeData||{}),
    ...Object.keys(afterData||{})
  ])).filter(k=>!['active','categoryId','departmentId','positionId','branchId','status','notes'].includes(k));

  const changed=keys.filter(k=>String(beforeData?.[k]??'')!==String(afterData?.[k]??''));

  if(!beforeData)return <p className={styles.createNote}>Nuevo registro: se creará con los datos normalizados.</p>;
  if(!changed.length)return <p className={styles.createNote}>No se detectaron cambios de valor.</p>;

  return <div className={styles.diff}>
    {changed.slice(0,6).map(k=><div key={k}>
      <span>{k}</span>
      <del>{moneyish(beforeData?.[k])}</del>
      <b>→</b>
      <ins>{moneyish(afterData?.[k])}</ins>
    </div>)}
  </div>;
}

export default function DataHub(){
  const navigate=useNavigate();
  const [searchParams]=useSearchParams();
  const initialEntity=(searchParams.get('entity')||'AUTO').toUpperCase();
  const [dashboard,setDashboard]=useState({summary:{},jobs:[]});
  const [definitions,setDefinitions]=useState({});
  const [modes,setModes]=useState([]);
  const [entityType,setEntityType]=useState(labels[initialEntity]?initialEntity:'AUTO');
  const [mode,setMode]=useState('CREATE_ONLY');
  const [file,setFile]=useState(null);
  const [analysis,setAnalysis]=useState(null);
  const [mapping,setMapping]=useState({});
  const [prepared,setPrepared]=useState(null);
  const [selectedSheet,setSelectedSheet]=useState('');
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState(null);

  const load=async()=>{
    try{
      const [d,defs]=await Promise.all([
        apiRequest('/data-hub/dashboard'),
        apiRequest('/data-hub/definitions')
      ]);
      setDashboard(d);
      setDefinitions(defs.definitions||{});
      setModes(defs.modes||[]);
    }catch(e){
      setMsg(['error',e.message]);
    }
  };

  useEffect(()=>{load()},[]);

  const resolvedEntity=entityType==='AUTO'?(analysis?.detectedEntityType||''):entityType;
  const fields=definitions[resolvedEntity]?.fields||[];
  const requiredMissing=useMemo(
    ()=>fields.filter(f=>f.required&&!mapping[f.key]),
    [fields,mapping]
  );

  function resetWizard(){
    setAnalysis(null);
    setPrepared(null);
    setMapping({});
    setSelectedSheet('');
  }

  async function postFile(withMapping=false){
    if(!file){
      setMsg(['error','Selecciona un archivo CSV, XLSX o XLS.']);
      return;
    }

    setBusy(true);
    setMsg(null);

    try{
      const fd=new FormData();
      fd.append('file',file);
      fd.append('entityType',entityType);
      fd.append('mode',mode);
      if(selectedSheet)fd.append('sheetName',selectedSheet);
      if(withMapping)fd.append('mapping',JSON.stringify(mapping));

      const result=await apiRequest('/data-hub/preview',{
        method:'POST',
        body:fd
      });

      if(result.requiresMapping){
        setAnalysis(result);
        if(!selectedSheet&&result.sheetName)setSelectedSheet(result.sheetName);
        setMapping(result.suggestedMapping||{});
        setPrepared(null);
      }else{
        setPrepared(result);
        setAnalysis(current=>current||{
          headers:result.job.headers,
          totalRows:result.job.totalRows
        });
        await load();
      }
    }catch(e){
      setMsg(['error',e.message]);
    }finally{
      setBusy(false);
    }
  }

  async function commit(){
    if(!prepared?.job?.id)return;

    setBusy(true);
    try{
      const result=await apiRequest(
        `/data-hub/jobs/${prepared.job.id}/commit`,
        {method:'POST',body:{}}
      );

      const created=result.job.summary?.created||0;
      const updated=result.job.summary?.updated||0;

      setMsg([
        'success',
        `Importación terminada: ${created} creados y ${updated} actualizados.`
      ]);

      setPrepared(null);
      setAnalysis(null);
      setFile(null);
      await load();
    }catch(e){
      setMsg(['error',e.message]);
    }finally{
      setBusy(false);
    }
  }

  async function rollback(job){
    const accepted=window.confirm(
      `¿Revertir la importación "${job.fileName}"?\n\n`+
      `Los registros creados por este lote se intentarán eliminar y los registros actualizados volverán a su snapshot anterior. `+
      `Si algún registro ya tiene dependencias que impidan eliminarlo, se reportará como reversa parcial.`
    );

    if(!accepted)return;

    setBusy(true);
    try{
      const result=await apiRequest(
        `/data-hub/jobs/${job.id}/rollback`,
        {method:'POST',body:{}}
      );

      setMsg([
        result.rollback.errors?'error':'success',
        result.rollback.errors
          ? `Reversa parcial: ${result.rollback.rolledBack} filas revertidas y ${result.rollback.errors} con error.`
          : `Lote revertido correctamente: ${result.rollback.rolledBack} filas.`
      ]);

      await load();
    }catch(e){
      setMsg(['error',e.message]);
    }finally{
      setBusy(false);
    }
  }

  const creates=prepared?.diffSummary?.creates||0;
  const updates=prepared?.diffSummary?.updates||0;

  return <div className={styles.page}>
    <header className={styles.header}>
      <div>
        <span>BuzzBee Core · Importación Inteligente</span>
        <h1>Importa tus datos históricos</h1>
        <p>Sube Excel o CSV, deja que BuzzBee interprete columnas, valida duplicados y revisa todo antes de importar.</p>
      </div>
      <Button variant="secondary" onClick={load}>
        <RefreshCw size={16}/> Actualizar
      </Button>
    </header>

    {msg?<div className={`${styles.message} ${styles[msg[0]]}`}>{msg[1]}</div>:null}

    <KpiGrid>
      <KpiCard>
        <FileSpreadsheet/>
        <span>Importaciones</span>
        <KpiInfo title="Importaciones">Lotes registrados recientemente en el Centro de datos.</KpiInfo>
        <strong>{dashboard.summary.jobs||0}</strong>
        <small>Historial reciente</small>
      </KpiCard>

      <KpiCard>
        <Rows3/>
        <span>Filas analizadas</span>
        <KpiInfo title="Filas analizadas">Registros incluidos en los lotes recientes.</KpiInfo>
        <strong>{dashboard.summary.rows||0}</strong>
        <small>Datos procesados</small>
      </KpiCard>

      <KpiCard>
        <CheckCircle2/>
        <span>Registros aplicados</span>
        <KpiInfo title="Registros aplicados">Altas y actualizaciones ejecutadas correctamente.</KpiInfo>
        <strong>{dashboard.summary.imported||0}</strong>
        <small>Operaciones confirmadas</small>
      </KpiCard>

      <KpiCard>
        <RotateCcw/>
        <span>Reversiones</span>
        <KpiInfo title="Reversiones">Lotes con rollback total o parcial dentro del historial reciente.</KpiInfo>
        <strong>{dashboard.summary.rollbacks||0}</strong>
        <small>Control de cambios</small>
      </KpiCard>
    </KpiGrid>

    <section className={styles.moduleImportSection}>
      <div className={styles.sectionTitle}>
        <div><span>Importación por módulo</span><h2>Trae tus bases históricas a BuzzBee</h2><p>Cada departamento puede importar su archivo y BuzzBee interpreta la estructura antes de tocar datos reales.</p></div>
        <Sparkles size={22}/>
      </div>
      <div className={styles.moduleCards}>
        {moduleCards.map(item=>{const Icon=item.icon;return <button key={item.entity} type="button" onClick={()=>{setEntityType(item.entity);resetWizard();navigate(`/data-hub?entity=${item.entity}`)}}>
          <Icon size={20}/><span><strong>{item.label}</strong><small>{item.description}</small></span><FileUp size={16}/>
        </button>})}
      </div>
    </section>

    <Card className={styles.wizard}>
      <div className={styles.stepHead}>
        <div>
          <span>Paso 1</span>
          <h2>Origen y estrategia</h2>
          <p>Selecciona qué información vas a migrar y cómo tratar coincidencias existentes.</p>
        </div>
      </div>

      <div className={styles.controls}>
        <label>
          Tipo de información
          <select value={entityType} onChange={e=>{
            setEntityType(e.target.value);
            resetWizard();
          }}>
            {Object.entries(labels).map(([k,v])=><option value={k} key={k}>{v}</option>)}
          </select>
        </label>

        <label>
          Estrategia
          <select value={mode} onChange={e=>{
            setMode(e.target.value);
            resetWizard();
          }}>
            {(modes.length?modes:[
              {key:'CREATE_ONLY',label:'Solo crear'},
              {key:'UPSERT',label:'Crear y actualizar'}
            ]).map(x=><option value={x.key} key={x.key}>{x.label}</option>)}
          </select>
        </label>

        <label className={styles.fileBox}>
          <UploadCloud size={24}/>
          <span>{file?.name||'Seleccionar archivo'}</span>
          <small>CSV · XLSX · XLS · máximo 10 MB</small>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={e=>{
              setFile(e.target.files?.[0]||null);
              resetWizard();
            }}
          />
        </label>

        <Button disabled={busy||!file} onClick={()=>postFile(false)}>
          <FileUp size={17}/>
          {busy?'Analizando...':'Analizar archivo'}
        </Button>
      </div>

      <div className={styles.modeInfo}>
        <ArrowLeftRight size={16}/>
        <span>
          {mode==='UPSERT'
            ? 'Crear y actualizar: las coincidencias se preparan como UPDATE y muestran su comparación antes/después antes del commit.'
            : 'Solo crear: cualquier coincidencia existente se bloquea y nunca se sobrescribe.'}
        </span>
      </div>
    </Card>

    {analysis?<Card className={styles.wizard}>
      <div className={styles.stepHead}>
        <div>
          <span>Paso 2</span>
          <h2>Mapeo de columnas</h2>
          <p>Relaciona tu archivo con el modelo oficial de datos de BuzzBee.</p>
        </div>
        <Badge tone={requiredMissing.length?'warning':'success'}>
          {requiredMissing.length
            ?`${requiredMissing.length} obligatorios pendientes`
            :'Mapeo listo'}
        </Badge>
      </div>

      <div className={styles.interpretation}>
        <div><Sparkles size={18}/><span><strong>BuzzBee detectó: {labels[analysis.detectedEntityType]||analysis.detectedEntityType}</strong><small>Confianza de interpretación: {analysis.confidence??0}% · {analysis.totalRows} filas</small></span></div>
        {analysis.sheets?.length>1?<label>Hoja del Excel<select value={selectedSheet||analysis.sheetName} onChange={e=>{setSelectedSheet(e.target.value);setMapping({});setPrepared(null)}}>{analysis.sheets.map(sh=><option key={sh.name} value={sh.name}>{sh.name} · {sh.rowCount} filas · {labels[sh.detectedEntityType]||sh.detectedEntityType} {sh.confidence}%</option>)}</select></label>:null}
        {analysis.sheets?.length>1&&selectedSheet&&selectedSheet!==analysis.sheetName?<Button variant="secondary" disabled={busy} onClick={()=>postFile(false)}>Analizar esta hoja</Button>:null}
      </div>
      {analysis.sample?.length?<div className={styles.rawPreview}><strong>Vista previa del archivo</strong><div><table><thead><tr>{analysis.headers.slice(0,6).map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{analysis.sample.slice(0,3).map((row,i)=><tr key={i}>{analysis.headers.slice(0,6).map(h=><td key={h}>{String(row[h]??'')}</td>)}</tr>)}</tbody></table></div></div>:null}
      <div className={styles.mapping}>
        {fields.map(f=><label key={f.key}>
          <span>{f.label}{f.required?' *':''}</span>
          <select
            value={mapping[f.key]||''}
            onChange={e=>setMapping({...mapping,[f.key]:e.target.value})}
          >
            <option value="">No importar</option>
            {analysis.headers.map(h=>
              <option value={h} key={h}>{h}</option>
            )}
          </select>
        </label>)}
      </div>

      <div className={styles.footer}>
        <small>{analysis.totalRows} filas detectadas.</small>
        <Button
          disabled={busy||requiredMissing.length>0}
          onClick={()=>postFile(true)}
        >
          {busy?'Validando...':'Validar y preparar'}
        </Button>
      </div>
    </Card>:null}

    {prepared?<Card className={styles.wizard}>
      <div className={styles.stepHead}>
        <div>
          <span>Paso 3</span>
          <h2>Comparación y vista previa</h2>
          <p>Revisa exactamente qué se va a crear y qué registros existentes cambiarán.</p>
        </div>

        <div className={styles.summaryBadges}>
          <Badge tone="success">{creates} crear</Badge>
          <Badge tone={updates?'warning':'neutral'}>{updates} actualizar</Badge>
          <Badge tone={prepared.job.invalidRows?'danger':'neutral'}>
            {prepared.job.invalidRows} inválidos
          </Badge>
        </div>
      </div>

      <div className={styles.preview}>
        {prepared.preview.slice(0,50).map(row=>
          <article
            key={row.id}
            className={row.status==='VALID'?styles.valid:styles.invalid}
          >
            <div className={styles.rowMain}>
              <div className={styles.rowTitle}>
                <span>Fila {row.rowNumber}</span>
                {row.action?<Badge tone={row.action==='UPDATE'?'warning':'success'}>
                  {row.action==='UPDATE'?'ACTUALIZAR':'CREAR'}
                </Badge>:null}
              </div>

              <strong>
                {Object.values(row.normalizedData||{})
                  .filter(Boolean).slice(0,3).join(' · ')||'Sin datos'}
              </strong>

              {row.status==='VALID'
                ?<Diff beforeData={row.beforeData} afterData={row.normalizedData}/>
                :<p className={styles.rowError}>{row.errors?.join(' · ')}</p>}
            </div>

            <Badge tone={row.status==='VALID'?'success':'danger'}>
              {statusLabel(row.status)}
            </Badge>
          </article>
        )}
      </div>

      <div className={styles.footer}>
        <small>
          Solo se aplicarán filas válidas. El snapshot anterior se conserva para rollback.
        </small>
        <Button
          disabled={busy||prepared.job.validRows===0}
          onClick={commit}
        >
          {busy?'Aplicando...':`Aplicar ${prepared.job.validRows} cambios`}
        </Button>
      </div>
    </Card>:null}

    <Card className={styles.history}>
      <div className={styles.stepHead}>
        <div>
          <span>Historial</span>
          <h2>Lotes y rollback</h2>
          <p>Cada importación conserva estrategia, resultados y capacidad de reversa controlada.</p>
        </div>
        <History size={20}/>
      </div>

      <div className={styles.jobs}>
        {dashboard.jobs.length===0
          ?<div className={styles.empty}>Todavía no hay importaciones registradas.</div>
          :dashboard.jobs.map(job=><article key={job.id}>
            <div>
              <span>{labels[job.entityType]} · {job.fileName}</span>
              <strong>
                {job.totalRows} filas · {job.mode==='UPSERT'?'Crear/actualizar':'Solo crear'}
              </strong>
              <small>
                {new Date(job.createdAt).toLocaleString('es-MX')}
                {job.summary?.created!==undefined
                  ?` · ${job.summary.created||0} creados · ${job.summary.updated||0} actualizados`
                  :''}
              </small>
            </div>

            <div className={styles.jobNumbers}>
              <b>{job.importedRows}</b>
              <small>aplicados</small>
            </div>

            <Badge tone={statusTone(job.status)}>
              {prettyStatus[job.status]||job.status}
            </Badge>

            {['COMPLETED','COMPLETED_WITH_ERRORS','ROLLBACK_PARTIAL'].includes(job.status)
              ?<Button
                variant="secondary"
                disabled={busy}
                onClick={()=>rollback(job)}
              >
                <RotateCcw size={15}/> Revertir
              </Button>
              :<span/>}
          </article>)}
      </div>
    </Card>
  </div>;
}
