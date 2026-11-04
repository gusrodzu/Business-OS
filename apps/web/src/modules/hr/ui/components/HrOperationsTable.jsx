import {Search} from 'lucide-react';
import {Badge,Card} from '../../../../design-system/components';
import styles from './HrOperationsTable.module.css';

const labels={PRESENT:'Presente',LATE:'Retardo',ABSENT:'Ausente',REMOTE:'Remoto',DAY_OFF:'Descanso',PENDING:'Pendiente',APPROVED:'Aprobada',REJECTED:'Rechazada',CANCELLED:'Cancelada'};
const tones={PRESENT:'success',APPROVED:'success',LATE:'warning',PENDING:'warning',ABSENT:'danger',REJECTED:'danger',CANCELLED:'neutral',REMOTE:'info',DAY_OFF:'neutral'};
const employeeName=e=>`${e.firstName} ${e.lastName}`;

export default function HrOperationsTable({tab,rows,query,onQueryChange,onResolve}){
 return <Card className={styles.tableCard}><div className={styles.toolbar}><div><h2>{tab==='attendance'?'Control de asistencia':tab==='leaves'?'Solicitudes de ausencia':'Incidencias laborales'}</h2><p>{rows.length} registros</p></div><label className={styles.search}><Search size={18}/><input value={query} onChange={e=>onQueryChange(e.target.value)} placeholder="Buscar empleado"/></label></div><div className={styles.tableWrap}><table><thead><tr><th>Empleado</th><th>Fecha / periodo</th><th>Tipo / estado</th><th>Detalle</th>{tab==='leaves'?<th>Acciones</th>:null}</tr></thead><tbody>{rows.map(x=><tr key={x.id}><td><strong>{employeeName(x.employee)}</strong><small>{x.employee.employeeNumber}</small></td><td>{tab==='leaves'?`${new Date(x.startDate).toLocaleDateString('es-MX')} — ${new Date(x.endDate).toLocaleDateString('es-MX')}`:new Date(x.date).toLocaleDateString('es-MX')}</td><td><Badge tone={tones[x.status]||'neutral'}>{labels[x.status]||x.type}</Badge>{tab!=='attendance'?<small>{x.type}</small>:null}</td><td>{tab==='attendance'?(x.notes||'—'):tab==='leaves'?(x.reason||`${x.days} días`):(x.description||'—')}</td>{tab==='leaves'?<td className={styles.actions}>{x.status==='PENDING'?<><button onClick={()=>onResolve(x.id,'APPROVED')}>Aprobar</button><button onClick={()=>onResolve(x.id,'REJECTED')}>Rechazar</button></>:null}</td>:null}</tr>)}</tbody></table></div></Card>;
}
