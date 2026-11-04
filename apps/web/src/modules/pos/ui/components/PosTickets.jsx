import {useState} from 'react';
import {Calculator, ReceiptText, Store, WalletCards} from 'lucide-react';
import {Badge, Button, Card} from '../../../../design-system/components';
import {DetailDrawer} from '../../../../components/module-system';
import styles from './PosTickets.module.css';

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
      {selected&&drawerTab==='summary'?<div className={styles.posTicketDetail}><div className={styles.posTicketSummary}><div><span>Estado</span><strong><Badge tone={selected.status==='PAID'?'success':selected.status==='VOID'?'danger':'neutral'}>{selected.status}</Badge></strong></div><div><span>Total</span><strong>{money(selected.total)}</strong></div><div><span>Subtotal</span><strong>{money(selected.subtotal)}</strong></div><div><span>Impuestos</span><strong>{money(selected.taxTotal)}</strong></div><div><span>Descuentos</span><strong>{money(selected.discountTotal)}</strong></div><div><span>Cliente</span><strong>{selected.customer?.commercialName||selected.customer?.legalName||'Público general'}</strong></div><div><span>Terminal</span><strong>{selected.terminal?.name||'—'}</strong></div><div><span>Vendedor</span><strong>{selected.createdBy?`${selected.createdBy.firstName||''} ${selected.createdBy.lastName||''}`.trim():'—'}</strong></div></div>{selected.notes?<section className={styles.posTicketNote}><strong>Notas</strong><p>{selected.notes}</p></section>:null}</div>:null}
      {selected&&drawerTab==='items'?<div className={styles.posTicketItems}>{selected.items?.map(item=><article key={item.id}><div><strong>{item.description||item.product?.name||'Producto'}</strong><span>{item.sku||item.product?.sku||'Sin SKU'}</span></div><div><span>Cantidad</span><strong>{Number(item.quantity||0).toLocaleString('es-MX',{maximumFractionDigits:3})}</strong></div><div><span>P. unitario</span><strong>{money(item.unitPrice)}</strong></div><div><span>Total</span><strong>{money(item.total)}</strong></div></article>)}{!selected.items?.length?<p className={styles.posTicketEmpty}>El ticket no contiene partidas.</p>:null}</div>:null}
      {selected&&drawerTab==='payments'?<div className={styles.posTicketPayments}>{selected.payments?.map(payment=>{const Icon=methodIcon[payment.method]||WalletCards;return <article key={payment.id}><span className={styles.paymentIcon}><Icon size={17}/></span><div><strong>{methodLabel[payment.method]||payment.method}</strong><small>{payment.reference||payment.authorization||'Sin referencia'}</small></div><b>{money(payment.amount)}</b></article>})}{!selected.payments?.length?<p className={styles.posTicketEmpty}>No hay pagos registrados.</p>:null}</div>:null}
      {selected&&drawerTab==='trace'?<div className={styles.posTicketTrace}><article><i><Store size={15}/></i><div><strong>Terminal</strong><span>{selected.terminal?.code||'—'} · {selected.terminal?.name||'Sin terminal'}</span></div></article><article><i><Calculator size={15}/></i><div><strong>Sesión de caja</strong><span>{selected.session?.status||'—'} · apertura {date(selected.session?.openedAt)}</span></div></article><article><i><ReceiptText size={15}/></i><div><strong>Ticket generado</strong><span>{date(selected.saleDate)} · {selected.folio}</span></div></article><article><i><WalletCards size={15}/></i><div><strong>Pago</strong><span>{selected.payments?.map(p=>`${methodLabel[p.method]||p.method} ${money(p.amount)}`).join(' · ')||'Sin pagos'}</span></div></article></div>:null}
    </DetailDrawer>
  </>;
}

