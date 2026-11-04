import {useEffect,useMemo,useState} from 'react';
import {CalendarCheck,Clock3,FileWarning,Plus,Search} from 'lucide-react';
import {hrRequest as apiRequest} from '../../services/hrApi';
import {Badge,Button,Card} from '../../../../design-system/components';
import styles from './HrOperations.module.css';
import HrOperationForm from '../components/HrOperationForm';
import KpiInfo from '../../../../components/KpiInfo';
import KpiCard from '../../../../components/KpiCard';
import {ModuleTabs} from '../../../../components/module-system';
const today=()=>new Date().toISOString().slice(0,10);
const labels={PRESENT:'Presente',LATE:'Retardo',ABSENT:'Ausente',REMOTE:'Remoto',DAY_OFF:'Descanso',PENDING:'Pendiente',APPROVED:'Aprobada',REJECTED:'Rechazada',CANCELLED:'Cancelada'};
const tones={PRESENT:'success',APPROVED:'success',LATE:'warning',PENDING:'warning',ABSENT:'danger',REJECTED:'danger',CANCELLED:'neutral',REMOTE:'info',DAY_OFF:'neutral'};
const employeeName=e=>`${e.firstName} ${e.lastName}`;
export default function HrOperations(){
 const [data,setData]=useState({employees:[],attendance:[],leaves:[],incidents:[]});const [tab,setTab]=useState('attendance');const [query,setQuery]=useState('');const [modal,setModal]=useState(null);const [message,setMessage]=useState(null);const [saving,setSaving]=useState(false);
 async function load(){setData(await apiRequest('/hr-operations'))} useEffect(()=>{load().catch(e=>setMessage(['error',e.message]))},[]);
 const rows=useMemo(()=>data[tab].filter(x=>`${employeeName(x.employee)} ${x.employee.employeeNumber} ${x.description||''}`.toLowerCase().includes(query.toLowerCase())),[data,tab,query]);
 function open(kind){setModal(kind==='attendance'?{kind,employeeId:'',date:today(),status:'PRESENT',checkIn:'',checkOut:'',notes:''}:kind==='leaves'?{kind,employeeId:'',type:'VACATION',startDate:today(),endDate:today(),days:1,reason:''}:{kind,employeeId:'',type:'OTHER',date:today(),amount:'',description:'',notes:''})}
 async function save(e){e.preventDefault();setSaving(true);try{const endpoint=modal.kind==='attendance'?'/hr-operations/attendance':modal.kind==='leaves'?'/hr-operations/leaves':'/hr-operations/incidents';let body={...modal};delete body.kind;if(modal.kind==='attendance'){body.checkIn=body.checkIn?`${body.date}T${body.checkIn}:00`:null;body.checkOut=body.checkOut?`${body.date}T${body.checkOut}:00`:null}if(modal.kind==='incidents')body.amount=body.amount===''?null:Number(body.amount);await apiRequest(endpoint,{method:'POST',body});setModal(null);setMessage(['success','Registro guardado correctamente']);await load()}catch(err){setMessage(['error',err.message])}finally{setSaving(false)}}
 async function resolve(id,status){try{await apiRequest(`/hr-operations/leaves/${id}/status`,{method:'PATCH',body:{status}});await load()}catch(e){setMessage(['error',e.message])}}
 return <div className={styles.page}><header className={styles.header}><div><span className={styles.eyebrow}>Operación de RH</span><h1>Asistencias, vacaciones e incidencias</h1><p>Controla la operación diaria y las ausencias del personal.</p></div><Button icon={Plus} onClick={()=>open(tab)}>{tab==='attendance'?'Registrar asistencia':tab==='leaves'?'Nueva solicitud':'Nueva incidencia'}</Button></header>
 {message?<div className={`${styles.message} ${styles[message[0]]}`}>{message[1]}</div>:null}
 <section className={styles.metrics}><KpiCard><CalendarCheck/><span>Registros de asistencia</span><KpiInfo title="Asistencias registradas">Cantidad de registros de entrada, salida o jornada.</KpiInfo><strong>{data.attendance.length}</strong></KpiCard><KpiCard><Clock3/><span>Solicitudes pendientes</span><KpiInfo title="Ausencias por autorizar">Solicitudes de permiso o ausencia que requieren resolución.</KpiInfo><strong>{data.leaves.filter(x=>x.status==='PENDING').length}</strong></KpiCard><KpiCard><FileWarning/><span>Incidencias</span><KpiInfo title="Incidencias laborales">Eventos de asistencia o personal registrados en el periodo.</KpiInfo><strong>{data.incidents.length}</strong></KpiCard></section>
 <ModuleTabs
   active={tab}
   onChange={setTab}
   items={[
    {id:'attendance',label:'Asistencias'},
    {id:'leaves',label:'Vacaciones y permisos'},
    {id:'incidents',label:'Incidencias'}
   ]}
 />
 <Card className={styles.tableCard}><div className={styles.toolbar}><div><h2>{tab==='attendance'?'Control de asistencia':tab==='leaves'?'Solicitudes de ausencia':'Incidencias laborales'}</h2><p>{rows.length} registros</p></div><label className={styles.search}><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar empleado"/></label></div><div className={styles.tableWrap}><table><thead><tr><th>Empleado</th><th>Fecha / periodo</th><th>Tipo / estado</th><th>Detalle</th>{tab==='leaves'?<th>Acciones</th>:null}</tr></thead><tbody>{rows.map(x=><tr key={x.id}><td><strong>{employeeName(x.employee)}</strong><small>{x.employee.employeeNumber}</small></td><td>{tab==='leaves'?`${new Date(x.startDate).toLocaleDateString('es-MX')} — ${new Date(x.endDate).toLocaleDateString('es-MX')}`:new Date(x.date).toLocaleDateString('es-MX')}</td><td><Badge tone={tones[x.status]||'neutral'}>{labels[x.status]||x.type}</Badge>{tab!=='attendance'?<small>{x.type}</small>:null}</td><td>{tab==='attendance'?(x.notes||'—'):tab==='leaves'?(x.reason||`${x.days} días`):(x.description||'—')}</td>{tab==='leaves'?<td className={styles.actions}>{x.status==='PENDING'?<><button onClick={()=>resolve(x.id,'APPROVED')}>Aprobar</button><button onClick={()=>resolve(x.id,'REJECTED')}>Rechazar</button></>:null}</td>:null}</tr>)}</tbody></table></div></Card>
 {modal?<HrOperationForm modal={modal} setModal={setModal} employees={data.employees} employeeName={employeeName} save={save} saving={saving}/>:null}</div>}
