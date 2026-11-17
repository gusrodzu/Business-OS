import {useState} from 'react';
import {Badge, Button, Card} from '../../../../design-system/components';
import {DetailDrawer} from '../../../../components/module-system';
import styles from './PosTickets.module.css';
import PosTicketDetails from './PosTicketDetails';

export default function PosTickets({sales,onVoid,date,money,methodLabel,methodIcon}){
  const [selected,setSelected]=useState(null);
  const [drawerTab,setDrawerTab]=useState('summary');
  const openTicket=sale=>{setSelected(sale);setDrawerTab('summary')};
  const voidSelected=async()=>{if(!selected)return;await onVoid(selected);setSelected(null)};

  return <>
    <Card className={styles.historyCard}>
      <div className={styles.section}><span>Historial</span><h3>Tickets POS</h3><p>Consulta el detalle completo de cada venta sin salir del módulo.</p></div>
      <div className={styles.table}><header><span>Ticket</span><span>Cliente</span><span>Fecha</span><span>Pagos</span><span>Total</span><span>Estado</span><span></span></header>{sales.map(s=><article key={s.id} className={styles.ticketRow} onClick={()=>openTicket(s)}><div><strong>{s.folio}</strong><small>{s.terminal?.name}</small></div><span>{s.customer?.commercialName||s.customer?.legalName||'Público general'}</span><span>{date(s.saleDate)}</span><span>{s.payments.map(p=>methodLabel[p.method]).join(', ')}</span><b>{money(s.total)}</b><Badge tone={s.status==='PAID'?'success':s.status==='VOID'?'danger':'neutral'}>{s.status}</Badge><div><button type="button" className={styles.viewTicketButton} onClick={e=>{e.stopPropagation();openTicket(s)}}>Ver</button></div></article>)}</div>
    </Card>

    <DetailDrawer open={Boolean(selected)} onClose={()=>setSelected(null)} title={selected?.folio||'Ticket POS'} subtitle={selected?`${selected.terminal?.code||'POS'} · ${date(selected.saleDate)}`:'Punto de venta'} activeTab={drawerTab} onTabChange={setDrawerTab} tabs={[{id:'summary',label:'Resumen'},{id:'items',label:`Partidas${selected?` (${selected.items?.length||0})`:''}`},{id:'payments',label:`Pagos${selected?` (${selected.payments?.length||0})`:''}`},{id:'trace',label:'Trazabilidad'}]} footer={selected?.status==='PAID'?<Button variant="secondary" onClick={voidSelected}>Anular ticket</Button>:null}>
      <PosTicketDetails ticket={selected} activeTab={drawerTab} date={date} money={money} methodLabel={methodLabel} methodIcon={methodIcon}/>
    </DetailDrawer>
  </>;
}

