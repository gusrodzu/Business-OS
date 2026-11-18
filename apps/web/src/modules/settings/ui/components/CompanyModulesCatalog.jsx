import {Boxes, Pencil, Search} from 'lucide-react';
import {Badge, Card} from '../../../../design-system/components';
import styles from '../pages/Modules.module.css';

// Presentation and local filtering only; permissions and persistence stay in Modules.
export default function CompanyModulesCatalog({modules, stateMap, query, onQueryChange, filter, onFilterChange, saving, onToggleModule, onEditModule}) {
  return <Card className={styles.card}>
      <div className={styles.moduleHeader}>
        <div className={styles.section}><span>Workspace</span><h3>Aplicaciones de la empresa</h3><p>Activa o desactiva los módulos disponibles para esta empresa.</p></div>
        <div className={styles.moduleTools}>
          <label className={styles.moduleSearch}><Search size={16}/><input value={query} onChange={e=>onQueryChange(e.target.value)} placeholder="Buscar módulo…" aria-label="Buscar módulo"/></label>
          <select value={filter} onChange={e=>onFilterChange(e.target.value)} aria-label="Filtrar módulos"><option value="all">Todos los módulos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select>
        </div>
      </div>
      <div className={styles.moduleListHeader}><span>Módulo</span><span>Descripción</span><span>Ruta</span><span>Estado</span><span>Acciones</span></div>
      <div className={styles.moduleList}>{modules.filter(m=>{const cm=stateMap.get(m.id)||stateMap.get(m.key);const isCore=m.key==='inicio'||m.category==='CORE';const enabled=isCore||Boolean(cm?.enabled);const q=query.trim().toLowerCase();const matches=!q||`${m.name} ${m.description||''} ${m.route||''}`.toLowerCase().includes(q);const status=filter==='all'||(filter==='active'&&enabled)||(filter==='inactive'&&!enabled);return matches&&status}).map(m=>{const cm=stateMap.get(m.id)||stateMap.get(m.key);const isCore=m.key==='inicio'||m.category==='CORE';const enabled=isCore||Boolean(cm?.enabled);return <article key={m.id} className={styles.moduleRow}>
        <div className={styles.moduleIdentity}><span className={styles.moduleIcon}><Boxes size={18}/></span><div><strong>{m.name}</strong>{isCore?<small>CORE</small>:null}</div></div>
        <p>{m.description||m.category||'Módulo BuzzBee'}</p>
        <code>{m.route||'Sin ruta'}</code>
        <div className={styles.moduleState}>
          <Badge tone={isCore?'info':enabled?'success':'neutral'}>{isCore?'Siempre activo':enabled?'Activo':'Inactivo'}</Badge>
          {!isCore?<button type="button" role="switch" aria-checked={enabled} aria-label={`${enabled?'Desactivar':'Activar'} ${m.name}`} disabled={saving} className={`${styles.switch} ${enabled?styles.switchOn:''}`} onClick={()=>onToggleModule(m,enabled)}><span/></button>:null}
        </div>
        <div className={styles.moduleActions}>
          {isCore?<span className={styles.noAction}>—</span>:<button type="button" className={styles.editModuleButton} aria-label={`Editar ${m.name}`} title={`Editar ${m.name}`} onClick={()=>onEditModule(m)}><Pencil size={16}/></button>}
        </div>
      </article>})}</div>
      <div className={styles.moduleNotice}><span className={styles.noticeIcon}>i</span><div><strong>Los cambios se aplican en tiempo real</strong><small>El menú, las aplicaciones y los permisos se sincronizan con el estado del módulo.</small></div></div>
    </Card>;
}
