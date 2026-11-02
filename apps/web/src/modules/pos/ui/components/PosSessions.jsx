import {Calculator,MonitorSmartphone,Plus} from 'lucide-react';
import {Badge,Button,Card} from '../../../../design-system/components';
// Keep the existing POS layout classes during gradual CSS migration; no desktop restyle.
import pageStyles from '../pages/Pos.module.css';
import styles from './PosSessions.module.css';

// Presentation only: session and terminal data/actions stay owned by the POS page.
export default function PosSessions({data,onOpen,onMovement,formatDate,formatMoney}){
  return <div className={`${pageStyles.sessionsGrid} ${styles.root}`}>
    <Card className={pageStyles.sessionCard}><div className={pageStyles.cardAction}><div className={pageStyles.section}><span>Caja</span><h3>Sesiones</h3><p>Control de aperturas, movimientos y diferencias.</p></div><Button icon={Plus} onClick={onOpen}>Abrir caja</Button></div><div className={pageStyles.sessionList}>{data.sessions.map(session=><article key={session.id}><span className={`${pageStyles.sessionIcon} ${styles.icon}`><Calculator size={18}/></span><div><strong>{session.terminal.code} · {session.terminal.name}</strong><small>{formatDate(session.openedAt)} · {session.openedBy?.firstName} {session.openedBy?.lastName}</small></div><Badge tone={session.status==='OPEN'?'success':'neutral'}>{session.status}</Badge><div className={pageStyles.sessionAmounts}><small>Inicial</small><b>{formatMoney(session.openingAmount)}</b></div>{session.status==='OPEN'?<Button variant="ghost" onClick={()=>onMovement(session)}>Movimiento</Button>:<div className={pageStyles.sessionAmounts}><small>Diferencia</small><b>{formatMoney(session.difference)}</b></div>}</article>)}</div></Card>
    <Card className={pageStyles.terminalCard}><div className={pageStyles.section}><span>Hardware lógico</span><h3>Terminales</h3><p>Cajas disponibles para operación.</p></div><div className={pageStyles.terminalList}>{data.terminals.map(terminal=><article key={terminal.id}><span className={`${pageStyles.sessionIcon} ${styles.icon}`><MonitorSmartphone size={18}/></span><div><strong>{terminal.name}</strong><small>{terminal.code} · {terminal.warehouse?.name||'Sin almacén'}</small></div><Badge tone={terminal.active?'success':'neutral'}>{terminal.active?'Activa':'Inactiva'}</Badge></article>)}</div></Card>
  </div>;
}
