import {useEffect,useMemo,useState} from 'react';
import {BadgeCheck,Boxes,Building2,RefreshCw,ScanSearch,Search,UsersRound} from 'lucide-react';
import {operationsRequest as apiRequest} from '../../services/operationsApi';
import {Badge,Button,Card} from '../../../../design-system/components';
import KpiGrid from '../../../../components/KpiGrid';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';
import styles from './MasterData.module.css';
export default function MasterData(){
 const [data,setData]=useState({summary:{},catalogs:[],issues:[]}),[entities,setEntities]=useState({customers:[],suppliers:[],products:[],employees:[]}),[tab,setTab]=useState('quality'),[msg,setMsg]=useState(null),[search,setSearch]=useState('');
 const load=async()=>{try{const [d,e]=await Promise.all([apiRequest('/master-data/dashboard'),apiRequest('/master-data/entities')]);setData(d);setEntities(e)}catch(e){setMsg(['error',e.message])}};useEffect(()=>{load()},[]);
 const scan=async()=>{try{await apiRequest('/master-data/quality/scan',{method:'POST',body:{}});setMsg(['success','Análisis de calidad completado']);await load()}catch(e){setMsg(['error',e.message])}};
 const resolve=async id=>{try{await apiRequest(`/master-data/quality/${id}/resolve`,{method:'POST',body:{}});await load()}catch(e){setMsg(['error',e.message])}};
 const names={quality:'Calidad',customers:'Clientes',suppliers:'Proveedores',products:'Productos',employees:'Personas',catalogs:'Catálogos'};
 const filteredEntities=useMemo(()=>{
  const term=search.trim().toLocaleLowerCase('es-MX');
  const rows=entities[tab]||[];
  if(!term)return rows;
  return rows.filter(x=>[
   x.code,x.sku,x.employeeNumber,x.legalName,x.name,x.firstName,x.lastName,
   x.email,x.category?.name,x.department?.name,x.status
  ].filter(Boolean).join(' ').toLocaleLowerCase('es-MX').includes(term));
 },[entities,tab,search]);
 return <div className={styles.page}><header className={styles.header}><div><span>BuzzBee Core</span><h1>Datos maestros</h1><p>Una fuente confiable para clientes, proveedores, productos, personas y catálogos empresariales.</p></div><Button onClick={scan}><ScanSearch size={17}/> Analizar calidad</Button></header>
 {msg?<div className={`${styles.message} ${styles[msg[0]]}`}>{msg[1]}</div>:null}
 <KpiGrid><KpiCard><BadgeCheck/><span>Calidad de datos</span><KpiInfo title="Calidad de datos">Índice de incidencias abiertas respecto al volumen maestro.</KpiInfo><strong>{data.summary.quality??100}%</strong><small>{data.summary.openIssues||0} incidencias abiertas</small></KpiCard><KpiCard><UsersRound/><span>Terceros</span><KpiInfo title="Terceros">Clientes y proveedores activos.</KpiInfo><strong>{(data.summary.customers||0)+(data.summary.suppliers||0)}</strong><small>Clientes + proveedores</small></KpiCard><KpiCard><Boxes/><span>Productos</span><KpiInfo title="Productos">Catálogo compartido por la operación.</KpiInfo><strong>{data.summary.products||0}</strong><small>Catálogo operativo</small></KpiCard><KpiCard><Building2/><span>Personas</span><KpiInfo title="Personas">Empleados activos del núcleo organizacional.</KpiInfo><strong>{data.summary.employees||0}</strong><small>Empleados activos</small></KpiCard></KpiGrid>
 <div className={styles.tabs}>{Object.keys(names).map(x=><button key={x} className={tab===x?styles.active:''} onClick={()=>{setTab(x);setSearch('')}}>{names[x]}</button>)}</div>
 {tab==='quality'?<Card className={styles.panel}><div className={styles.panelHead}><div><h2>Calidad y gobernanza</h2><p>Detecta datos incompletos, formatos inválidos y posibles duplicados.</p></div><Button variant="secondary" onClick={load}><RefreshCw size={16}/> Actualizar</Button></div><div className={styles.list}>{data.issues.length===0?<div className={styles.empty}>No hay incidencias abiertas. Ejecuta un análisis para validar los datos.</div>:data.issues.map(i=><article key={i.id}><div><Badge tone={i.issueType==='DUPLICATE'?'warning':i.issueType==='INVALID_FORMAT'?'danger':'neutral'}>{i.issueType}</Badge><h3>{i.message}</h3><p>{i.entityType}{i.field?` · ${i.field}`:''}</p></div><Button variant="secondary" onClick={()=>resolve(i.id)}>Marcar resuelto</Button></article>)}</div></Card>:null}
 {['customers','suppliers','products','employees'].includes(tab)?<Card className={styles.panel}><div className={styles.panelHead}><div><h2>{names[tab]}</h2><p>Vista maestra compartida por los módulos de BuzzBee.</p></div></div>
 <div className={styles.entityToolbar}>
  <label className={styles.entitySearch}><Search size={18} aria-hidden="true"/><span className={styles.srOnly}>Buscar registros maestros</span><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar por nombre, código o correo" aria-label="Buscar registros maestros"/></label>
  <span className={styles.entityCount} role="status">{filteredEntities.length} {filteredEntities.length===1?'registro':'registros'}</span>
 </div>
 <div className={styles.list}>{filteredEntities.map(x=><article key={x.id}><div><span>{x.code||x.sku||x.employeeNumber}</span><h3>{x.legalName||x.name||`${x.firstName} ${x.lastName}`}</h3><p>{x.email||x.category?.name||x.department?.name||'Información no disponible'}</p></div><Badge tone={x.active===false?'neutral':'success'}>{x.status||(x.active===false?'INACTIVO':'ACTIVO')}</Badge></article>)}{!filteredEntities.length?<div className={styles.entityEmpty}><strong>No hay registros para esta búsqueda.</strong><button type="button" onClick={()=>setSearch('')}>Limpiar búsqueda</button></div>:null}</div></Card>:null}
 {tab==='catalogs'?<div className={styles.catalogGrid}>{data.catalogs.map(c=><Card key={c.id} className={styles.catalog}><span>Catálogo maestro</span><h3>{c.name}</h3>{c.values.map(v=><p key={v.id}><b>{v.code}</b> {v.label}</p>)}</Card>)}</div>:null}</div>
}
