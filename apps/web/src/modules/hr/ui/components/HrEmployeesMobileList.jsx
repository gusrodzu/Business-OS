import {useState} from 'react';
import {Pencil,Search} from 'lucide-react';
import {Badge} from '../../../../design-system/components';
import styles from './HrEmployeesMobileList.module.css';
const filters=[['ALL','Todos'],['ACTIVE','Activos'],['LEAVE','Con permiso'],['INACTIVE','Inactivos'],['TERMINATED','Bajas']];
export default function HrEmployeesMobileList({employees=[],query,onQueryChange,onEdit,statusLabels,statusTones,formatMoney}){
 const [status,setStatus]=useState('ALL');
 const visible=employees.filter(e=>status==='ALL'||e.status===status);
 return <section className={styles.root} aria-label="Directorio móvil de empleados">
   <label className={styles.search}><Search size={19} aria-hidden="true"/><span className={styles.sr}>Buscar empleado</span><input type="search" value={query} onChange={e=>onQueryChange(e.target.value)} placeholder="Buscar empleado o puesto"/></label>
   <div className={styles.filters} role="group" aria-label="Filtrar empleados por estado">{filters.map(([id,label])=><button type="button" key={id} aria-pressed={status===id} className={status===id?styles.active:styles.chip} onClick={()=>setStatus(id)}>{label}</button>)}</div>
   <p className={styles.count} role="status">{visible.length} {visible.length===1?'empleado':'empleados'}</p>
   <div className={styles.list}>{visible.map(e=><article className={styles.card} key={e.id}>
    <div className={styles.top}><span className={styles.avatar} aria-hidden="true">{String(e.firstName||'').slice(0,1)}{String(e.lastName||'').slice(0,1)}</span><div className={styles.identity}><strong>{e.firstName} {e.lastName}</strong><small>{e.employeeNumber||'Sin número'}</small></div><Badge tone={statusTones[e.status]||'neutral'}>{statusLabels[e.status]||e.status||'Sin estado'}</Badge></div>
    <div className={styles.meta}><span><small>Departamento</small><strong>{e.department?.name||'Sin departamento'}</strong></span><span><small>Puesto</small><strong>{e.position?.name||'Sin puesto'}</strong></span><span><small>Sucursal</small><strong>{e.branch?.name||'Sin asignar'}</strong></span><span><small>Ingreso</small><strong>{e.hireDate?new Date(e.hireDate).toLocaleDateString('es-MX'):'Sin fecha'}</strong></span></div>
    <div className={styles.bottom}><span><small>Sueldo mensual</small><strong>{formatMoney(e.salary)}</strong></span><button type="button" onClick={()=>onEdit(e)} aria-label={`Editar empleado ${e.firstName} ${e.lastName}`}><Pencil size={16} aria-hidden="true"/> Editar</button></div>
   </article>)}{!visible.length?<div className={styles.empty}><strong>No hay empleados con estos filtros.</strong><span>Prueba otra búsqueda o selecciona «Todos».</span><button type="button" onClick={()=>{setStatus('ALL');onQueryChange('')}}>Limpiar filtros</button></div>:null}</div>
 </section>;
}