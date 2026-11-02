import {useEffect,useState} from 'react';
import {CheckCircle2,Clock3,Plus,ReceiptText,WalletCards} from 'lucide-react';
import {financeRequest as apiRequest} from '../../services/financeApi';
import {Button} from '../../../../design-system/components';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseMovements from '../components/ExpenseMovements';
import styles from './Expenses.module.css';
import KpiGrid from '../../../../components/KpiGrid';
import KpiCard from '../../../../components/KpiCard';
import KpiInfo from '../../../../components/KpiInfo';

const money=(n,c='MXN')=>new Intl.NumberFormat('es-MX',{style:'currency',currency:c,maximumFractionDigits:0}).format(Number(n||0));

export default function Expenses(){
  const [data,setData]=useState({expenses:[],categories:[],employees:[],summary:{}});
  const [show,setShow]=useState(false);
  const [msg,setMsg]=useState(null);
  const [form,setForm]=useState({categoryId:'',employeeId:'',title:'',merchant:'',expenseDate:new Date().toISOString().slice(0,10),amount:'',taxAmount:'0',currency:'MXN',paymentMethod:'PERSONAL_CARD',reimbursable:true,receiptUrl:'',receiptNumber:'',notes:''});

  const load=async()=>{try{setData(await apiRequest('/expenses/dashboard'))}catch(e){setMsg(['error',e.message])}};
  useEffect(()=>{load()},[]);
  useEffect(()=>{if(!form.categoryId && data.categories[0])setForm(f=>({...f,categoryId:data.categories[0].id}))},[data.categories]);

  async function create(e){
    e.preventDefault();
    try{
      const r=await apiRequest('/expenses',{method:'POST',body:{...form,amount:Number(form.amount),taxAmount:Number(form.taxAmount),employeeId:form.employeeId||null,receiptUrl:form.receiptUrl||null}});
      setMsg(['success',`${r.expense.folio} creado`]);setShow(false);await load();
    }catch(err){setMsg(['error',err.message])}
  }
  async function act(id,action){
    try{await apiRequest(`/expenses/${id}/${action}`,{method:'POST',body:{}});setMsg(['success','Gasto actualizado']);await load()}catch(e){setMsg(['error',e.message])}
  }

  return <div className={styles.page}>
    <header className={styles.header}><div><span>Finanzas</span><h1>Gastos y viáticos</h1><p>Controla comprobaciones, autorizaciones y reembolsos desde un solo lugar.</p></div><Button onClick={()=>setShow(v=>!v)}><Plus size={17}/> Nuevo gasto</Button></header>
    {msg?<div className={`${styles.message} ${styles[msg[0]]}`}>{msg[1]}</div>:null}
    <KpiGrid>
      <KpiCard><ReceiptText/><span>Gasto registrado</span><KpiInfo title="Gasto registrado">Importe total de gastos y viáticos en el periodo consultado.</KpiInfo><strong>{money(data.summary.total)}</strong><small>Periodo consultado</small></KpiCard>
      <KpiCard><Clock3/><span>Pendientes</span><KpiInfo title="Pendientes">Gastos enviados que todavía esperan una decisión de aprobación.</KpiInfo><strong>{data.summary.pending||0}</strong><small>En aprobación</small></KpiCard>
      <KpiCard><CheckCircle2/><span>Aprobados</span><KpiInfo title="Aprobados">Gastos autorizados y disponibles para completar su pago o reembolso.</KpiInfo><strong>{data.summary.approved||0}</strong><small>Listos para pago</small></KpiCard>
      <KpiCard><WalletCards/><span>Por reembolsar</span><KpiInfo title="Por reembolsar">Saldo de gastos reembolsables que aún no han sido marcados como pagados.</KpiInfo><strong>{money(data.summary.reimbursable)}</strong><small>Saldo pendiente</small></KpiCard>
    </KpiGrid>

    {show?<ExpenseForm form={form} setForm={setForm} categories={data.categories} onSubmit={create} onCancel={()=>setShow(false)}/>:null}

    <ExpenseMovements expenses={data.expenses} onRefresh={load} onAction={act} formatMoney={money}/>
  </div>
}
