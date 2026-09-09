import {prisma} from '../lib/prisma.js';

const num=(value)=>Number(value??0);
const balance=(row)=>Math.max(0,num(row.total)-num(row.paidAmount));
const DAY=24*60*60*1000;
const severityWeight={HIGH:3,MEDIUM:2,LOW:1};

function monthsBetween(start,end){
  const a=new Date(start),b=new Date(end);
  let months=(b.getUTCFullYear()-a.getUTCFullYear())*12+(b.getUTCMonth()-a.getUTCMonth());
  if(b.getUTCDate()<a.getUTCDate())months--;
  return Math.max(0,months);
}
function assetBookValue(asset){
  const cost=num(asset.acquisitionCost);
  const residual=num(asset.residualValue);
  const life=Number(asset.usefulLifeMonths||0);
  const depreciable=Math.max(0,cost-residual);
  const monthly=life>0?depreciable/life:0;
  const elapsed=Math.min(life,monthsBetween(asset.depreciationStartDate,new Date()));
  const accumulated=Math.min(depreciable,monthly*elapsed);
  return {cost,accumulated,bookValue:Math.max(residual,cost-accumulated)};
}
function daysFromNow(value,now=new Date()){
  if(!value)return null;
  return Math.ceil((new Date(value).getTime()-now.getTime())/DAY);
}
function clamp(value,min=0,max=100){return Math.max(min,Math.min(max,value));}
function moneyText(value,currency='MXN'){
  return new Intl.NumberFormat('es-MX',{style:'currency',currency,maximumFractionDigits:0}).format(num(value));
}

export async function getAdministrativeCenter(companyId,userId=null){
  const now=new Date();
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  const monthEnd=new Date(now.getFullYear(),now.getMonth()+1,1);
  const next7=new Date(now.getTime()+7*DAY);
  const next30=new Date(now.getTime()+30*DAY);
  const year=now.getFullYear();
  const month=now.getMonth()+1;

  const [
    company,
    payables,
    receivables,
    expenses,
    treasuryAccounts,
    treasuryMovements,
    budgets,
    assets,
    approvals,
    purchaseRequests,
    purchaseOrders,
    employeeDocuments,
    payrollPeriods,
    agendaEvents,
    users,
    unreadNotifications
  ]=await Promise.all([
    prisma.company.findUnique({
      where:{id:companyId},
      select:{id:true,name:true,currency:true}
    }),
    prisma.accountsPayable.findMany({
      where:{companyId,status:{notIn:['PAID','CANCELLED']}},
      select:{
        id:true,invoiceNumber:true,dueDate:true,total:true,paidAmount:true,status:true,
        supplier:{select:{legalName:true,commercialName:true}}
      },
      orderBy:{dueDate:'asc'},
      take:500
    }),
    prisma.accountsReceivable.findMany({
      where:{companyId,status:{notIn:['PAID','CANCELLED']}},
      select:{
        id:true,invoiceNumber:true,dueDate:true,total:true,paidAmount:true,status:true,
        customer:{select:{legalName:true,commercialName:true}}
      },
      orderBy:{dueDate:'asc'},
      take:500
    }),
    prisma.expense.findMany({
      where:{companyId,expenseDate:{gte:monthStart,lt:monthEnd},status:{not:'CANCELLED'}},
      select:{id:true,folio:true,title:true,amount:true,status:true,expenseDate:true,reimbursable:true},
      orderBy:{expenseDate:'desc'},
      take:300
    }),
    prisma.treasuryAccount.findMany({
      where:{companyId,active:true},
      select:{id:true,code:true,name:true,type:true,currency:true,currentBalance:true},
      orderBy:{name:'asc'}
    }),
    prisma.treasuryMovement.findMany({
      where:{companyId,movementDate:{gte:monthStart,lt:monthEnd}},
      select:{id:true,type:true,amount:true,movementDate:true,concept:true,accountId:true},
      orderBy:{movementDate:'desc'},
      take:500
    }),
    prisma.budget.findMany({
      where:{companyId,year,status:{notIn:['CANCELLED','CLOSED']}},
      select:{
        id:true,name:true,status:true,totalAmount:true,year:true,
        lines:{where:{month},select:{amount:true,category:true,costCenter:{select:{name:true,code:true}}}}
      },
      orderBy:{name:'asc'}
    }),
    prisma.fixedAsset.findMany({
      where:{companyId,status:'ACTIVE'},
      select:{
        id:true,code:true,name:true,acquisitionCost:true,accumulatedDepreciation:true,
        residualValue:true,usefulLifeMonths:true,depreciationStartDate:true,status:true
      },
      orderBy:{name:'asc'},
      take:500
    }),
    prisma.approvalRequest.findMany({
      where:{companyId,status:'PENDING'},
      select:{
        id:true,entityType:true,entityId:true,entityFolio:true,title:true,amount:true,currency:true,
        requestedAt:true,currentStep:true,
        requestedBy:{select:{firstName:true,lastName:true}},
        steps:{where:{status:'PENDING'},take:1,orderBy:{sequence:'asc'},select:{name:true,approverUserId:true,permissionKey:true}}
      },
      orderBy:{requestedAt:'asc'},
      take:100
    }),
    prisma.purchaseRequest.findMany({
      where:{companyId,status:{in:['PENDING','APPROVED']}},
      select:{id:true,folio:true,title:true,status:true,priority:true,requiredDate:true,createdAt:true,requestedBy:{select:{firstName:true,lastName:true}}},
      orderBy:[{requiredDate:'asc'},{createdAt:'asc'}],
      take:100
    }),
    prisma.purchaseOrder.findMany({
      where:{companyId,status:{in:['ISSUED','PARTIALLY_RECEIVED']}},
      select:{id:true,folio:true,status:true,expectedDate:true,total:true,currency:true,supplier:{select:{legalName:true,commercialName:true}}},
      orderBy:{expectedDate:'asc'},
      take:100
    }),
    prisma.employeeDocument.findMany({
      where:{companyId,expiresAt:{not:null},status:{not:'REJECTED'}},
      select:{id:true,name:true,type:true,status:true,expiresAt:true,employee:{select:{firstName:true,lastName:true,employeeNumber:true}}},
      orderBy:{expiresAt:'asc'},
      take:150
    }),
    prisma.payrollPeriod.findMany({
      where:{companyId,status:{in:['DRAFT','CALCULATED','APPROVED']}},
      select:{id:true,folio:true,name:true,status:true,paymentDate:true,totalNet:true,startDate:true,endDate:true},
      orderBy:{paymentDate:'asc'},
      take:50
    }),
    prisma.agendaEvent.findMany({
      where:{companyId,status:'ACTIVE',startAt:{gte:now,lte:next7}},
      select:{id:true,title:true,startAt:true,endAt:true,priority:true,allDay:true,assignee:{select:{firstName:true,lastName:true}}},
      orderBy:{startAt:'asc'},
      take:20
    }),
    prisma.user.findMany({where:{companyId},select:{id:true,firstName:true,lastName:true,email:true,active:true}}),
    prisma.notification.count({
      where:{companyId,read:false,...(userId?{OR:[{userId:null},{userId}]}:{})}
    })
  ]);

  if(!company)throw new Error('Empresa no encontrada');

  const currency=company.currency||'MXN';
  const openPayables=payables.filter(x=>balance(x)>0);
  const openReceivables=receivables.filter(x=>balance(x)>0);
  const overduePayables=openPayables.filter(x=>new Date(x.dueDate)<now);
  const overdueReceivables=openReceivables.filter(x=>new Date(x.dueDate)<now);
  const dueSoonPayables=openPayables.filter(x=>new Date(x.dueDate)>=now&&new Date(x.dueDate)<=next7);
  const dueSoonReceivables=openReceivables.filter(x=>new Date(x.dueDate)>=now&&new Date(x.dueDate)<=next7);

  const payableBalance=openPayables.reduce((sum,x)=>sum+balance(x),0);
  const receivableBalance=openReceivables.reduce((sum,x)=>sum+balance(x),0);
  const overduePayableBalance=overduePayables.reduce((sum,x)=>sum+balance(x),0);
  const overdueReceivableBalance=overdueReceivables.reduce((sum,x)=>sum+balance(x),0);
  const expensesMonth=expenses.reduce((sum,x)=>sum+num(x.amount),0);
  const treasuryBalance=treasuryAccounts.reduce((sum,x)=>sum+num(x.currentBalance),0);
  const budgetTotal=budgets.reduce((sum,x)=>sum+num(x.totalAmount),0);
  const budgetMonth=budgets.reduce((sum,b)=>sum+b.lines.reduce((lineSum,line)=>lineSum+num(line.amount),0),0);
  const budgetExecution=budgetMonth>0?(expensesMonth/budgetMonth)*100:null;
  const budgetRemaining=budgetMonth>0?budgetMonth-expensesMonth:null;
  const assetValues=assets.map(assetBookValue);
  const assetNet=assetValues.reduce((sum,x)=>sum+x.bookValue,0);

  const treasuryIncome=treasuryMovements
    .filter(x=>x.type==='INCOME'||x.type==='ADJUSTMENT_IN')
    .reduce((sum,x)=>sum+num(x.amount),0);
  const treasuryOut=treasuryMovements
    .filter(x=>x.type==='EXPENSE'||x.type==='ADJUSTMENT_OUT')
    .reduce((sum,x)=>sum+num(x.amount),0);

  const submittedExpenses=expenses.filter(x=>x.status==='SUBMITTED');
  const overdueOrders=purchaseOrders.filter(x=>x.expectedDate&&new Date(x.expectedDate)<now);
  const upcomingOrders=purchaseOrders.filter(x=>x.expectedDate&&new Date(x.expectedDate)>=now&&new Date(x.expectedDate)<=next7);
  const expiredDocuments=employeeDocuments.filter(x=>x.expiresAt&&new Date(x.expiresAt)<now);
  const expiringDocuments=employeeDocuments.filter(x=>x.expiresAt&&new Date(x.expiresAt)>=now&&new Date(x.expiresAt)<=next30);
  const payrollDue=payrollPeriods.filter(x=>new Date(x.paymentDate)<=next7);
  const overduePayroll=payrollPeriods.filter(x=>new Date(x.paymentDate)<now&&x.status!=='PAID');
  const agedApprovals=approvals.filter(x=>now.getTime()-new Date(x.requestedAt).getTime()>2*DAY);

  const queue=[];
  const add=(item)=>queue.push(item);

  for(const row of overduePayables.slice(0,6))add({
    key:`AP-${row.id}`,kind:'PAYABLE',level:'HIGH',title:`Pago vencido · ${row.invoiceNumber}`,
    detail:row.supplier?.commercialName||row.supplier?.legalName||'Proveedor',
    value:balance(row),currency,dueAt:row.dueDate,to:'/finanzas/cuentas-por-pagar'
  });
  for(const row of overdueReceivables.slice(0,6))add({
    key:`AR-${row.id}`,kind:'RECEIVABLE',level:'HIGH',title:`Cobranza vencida · ${row.invoiceNumber}`,
    detail:row.customer?.commercialName||row.customer?.legalName||'Cliente',
    value:balance(row),currency,dueAt:row.dueDate,to:'/finanzas/cuentas-por-cobrar'
  });
  for(const row of approvals.slice(0,8)){
    const days=Math.max(0,Math.floor((now-new Date(row.requestedAt))/DAY));
    add({
      key:`APP-${row.id}`,kind:'APPROVAL',level:days>=2?'HIGH':'MEDIUM',title:row.title,
      detail:`Aprobación pendiente${row.entityFolio?` · ${row.entityFolio}`:''}${days?` · ${days} día(s)`:''}`,
      value:row.amount!=null?num(row.amount):null,currency:row.currency||currency,dueAt:row.requestedAt,to:'/aprobaciones'
    });
  }
  for(const row of overdueOrders.slice(0,5))add({
    key:`PO-${row.id}`,kind:'PURCHASE_ORDER',level:'HIGH',title:`Recepción atrasada · ${row.folio}`,
    detail:row.supplier?.commercialName||row.supplier?.legalName||'Proveedor',value:num(row.total),currency:row.currency||currency,dueAt:row.expectedDate,to:'/compras/ordenes'
  });
  for(const row of expiredDocuments.slice(0,5))add({
    key:`DOC-${row.id}`,kind:'DOCUMENT',level:'HIGH',title:`Documento vencido · ${row.name}`,
    detail:`${row.employee?.firstName||''} ${row.employee?.lastName||''}`.trim(),dueAt:row.expiresAt,to:'/recursos-humanos/expedientes'
  });
  for(const row of expiringDocuments.slice(0,5))add({
    key:`DOC-SOON-${row.id}`,kind:'DOCUMENT',level:'MEDIUM',title:`Documento por vencer · ${row.name}`,
    detail:`${row.employee?.firstName||''} ${row.employee?.lastName||''}`.trim(),dueAt:row.expiresAt,to:'/recursos-humanos/expedientes'
  });
  for(const row of overduePayroll.slice(0,3))add({
    key:`PAYROLL-${row.id}`,kind:'PAYROLL',level:'HIGH',title:`Nómina pendiente · ${row.folio}`,
    detail:row.name,value:num(row.totalNet),currency,dueAt:row.paymentDate,to:'/recursos-humanos/prenomina'
  });
  for(const row of dueSoonPayables.slice(0,4))add({
    key:`AP-SOON-${row.id}`,kind:'PAYABLE',level:'MEDIUM',title:`Pago próximo · ${row.invoiceNumber}`,
    detail:row.supplier?.commercialName||row.supplier?.legalName||'Proveedor',value:balance(row),currency,dueAt:row.dueDate,to:'/finanzas/cuentas-por-pagar'
  });
  for(const row of dueSoonReceivables.slice(0,4))add({
    key:`AR-SOON-${row.id}`,kind:'RECEIVABLE',level:'MEDIUM',title:`Cobranza próxima · ${row.invoiceNumber}`,
    detail:row.customer?.commercialName||row.customer?.legalName||'Cliente',value:balance(row),currency,dueAt:row.dueDate,to:'/finanzas/cuentas-por-cobrar'
  });

  queue.sort((a,b)=>{
    const severity=(severityWeight[b.level]||0)-(severityWeight[a.level]||0);
    if(severity)return severity;
    return new Date(a.dueAt||now)-new Date(b.dueAt||now);
  });

  let healthScore=100;
  healthScore-=Math.min(18,overduePayables.length*3);
  healthScore-=Math.min(18,overdueReceivables.length*3);
  healthScore-=Math.min(12,agedApprovals.length*2);
  healthScore-=Math.min(12,expiredDocuments.length*3);
  healthScore-=Math.min(10,overdueOrders.length*2);
  healthScore-=Math.min(10,overduePayroll.length*4);
  if(treasuryBalance<0)healthScore-=20;
  if(budgetExecution!=null&&budgetExecution>100)healthScore-=Math.min(15,5+Math.round((budgetExecution-100)/5));
  healthScore=clamp(healthScore);
  const healthStatus=healthScore>=90?'EXCELLENT':healthScore>=75?'GOOD':healthScore>=60?'ATTENTION':'CRITICAL';

  const attention=[
    ...(overduePayables.length?[{key:'OVERDUE_AP',level:'HIGH',title:`${overduePayables.length} cuenta(s) por pagar vencida(s)`,detail:`Saldo vencido ${moneyText(overduePayableBalance,currency)}`,to:'/finanzas/cuentas-por-pagar'}]:[]),
    ...(overdueReceivables.length?[{key:'OVERDUE_AR',level:'HIGH',title:`${overdueReceivables.length} cuenta(s) por cobrar vencida(s)`,detail:`Cartera vencida ${moneyText(overdueReceivableBalance,currency)}`,to:'/finanzas/cuentas-por-cobrar'}]:[]),
    ...(agedApprovals.length?[{key:'AGED_APPROVALS',level:'HIGH',title:'Aprobaciones detenidas',detail:`${agedApprovals.length} solicitud(es) llevan más de 48 horas`,to:'/aprobaciones'}]:[]),
    ...(expiredDocuments.length?[{key:'EXPIRED_DOCS',level:'HIGH',title:'Documentación laboral vencida',detail:`${expiredDocuments.length} documento(s) requieren regularización`,to:'/recursos-humanos/expedientes'}]:[]),
    ...(submittedExpenses.length?[{key:'EXPENSES',level:'MEDIUM',title:'Gastos pendientes de revisión',detail:`${submittedExpenses.length} gasto(s) enviados`,to:'/gastos'}]:[]),
    ...(overdueOrders.length?[{key:'LATE_PO',level:'MEDIUM',title:'Órdenes con recepción atrasada',detail:`${overdueOrders.length} orden(es) superaron la fecha esperada`,to:'/compras/ordenes'}]:[]),
    ...(budgetExecution!=null&&budgetExecution>100?[{key:'BUDGET',level:'HIGH',title:'Presupuesto mensual excedido',detail:`Ejecución administrativa en ${budgetExecution.toFixed(1)}%`,to:'/finanzas/presupuestos'}]:[]),
    ...(treasuryBalance<0?[{key:'TREASURY_NEGATIVE',level:'HIGH',title:'Tesorería con saldo negativo',detail:'Revisa cuentas y movimientos de caja/bancos.',to:'/finanzas/tesoreria'}]:[])
  ].sort((a,b)=>(severityWeight[b.level]||0)-(severityWeight[a.level]||0)).slice(0,8);

  const userIds=users.map(x=>x.id);
  const auditRows=userIds.length?await prisma.auditLog.findMany({
    where:{userId:{in:userIds}},
    orderBy:{createdAt:'desc'},
    take:12
  }):[];
  const userMap=new Map(users.map(x=>[x.id,x]));
  const activity=auditRows.map(row=>({
    id:row.id,action:row.action,entity:row.entity,entityId:row.entityId,
    description:row.description||`${row.action} · ${row.entity}`,createdAt:row.createdAt,
    user:row.userId?userMap.get(row.userId)||null:null
  }));

  const processStatus=[
    {key:'approvals',label:'Aprobaciones',count:approvals.length,level:agedApprovals.length?'HIGH':approvals.length?'MEDIUM':'LOW',to:'/aprobaciones'},
    {key:'payments',label:'Pagos a proveedores',count:overduePayables.length,level:overduePayables.length?'HIGH':dueSoonPayables.length?'MEDIUM':'LOW',to:'/finanzas/cuentas-por-pagar'},
    {key:'collections',label:'Cobranza',count:overdueReceivables.length,level:overdueReceivables.length?'HIGH':dueSoonReceivables.length?'MEDIUM':'LOW',to:'/finanzas/cuentas-por-cobrar'},
    {key:'procurement',label:'Recepciones de compra',count:overdueOrders.length,level:overdueOrders.length?'HIGH':upcomingOrders.length?'MEDIUM':'LOW',to:'/compras/ordenes'},
    {key:'documents',label:'Expedientes laborales',count:expiredDocuments.length,level:expiredDocuments.length?'HIGH':expiringDocuments.length?'MEDIUM':'LOW',to:'/recursos-humanos/expedientes'},
    {key:'payroll',label:'Nómina',count:overduePayroll.length,level:overduePayroll.length?'HIGH':payrollDue.length?'MEDIUM':'LOW',to:'/recursos-humanos/prenomina'}
  ];

  return {
    ok:true,
    generatedAt:now.toISOString(),
    company,
    health:{score:healthScore,status:healthStatus},
    summary:{
      payableBalance,receivableBalance,overduePayableBalance,overdueReceivableBalance,
      expensesMonth,treasuryBalance,budgetTotal,budgetMonth,budgetExecution,budgetRemaining,
      assetNet,treasuryIncome,treasuryOut,
      workingCapital:treasuryBalance+receivableBalance-payableBalance
    },
    counts:{
      payables:openPayables.length,receivables:openReceivables.length,
      overduePayables:overduePayables.length,overdueReceivables:overdueReceivables.length,
      dueSoonPayables:dueSoonPayables.length,dueSoonReceivables:dueSoonReceivables.length,
      expenses:expenses.length,submittedExpenses:submittedExpenses.length,
      treasuryAccounts:treasuryAccounts.length,budgets:budgets.length,assets:assets.length,
      approvals:approvals.length,agedApprovals:agedApprovals.length,
      purchaseRequests:purchaseRequests.length,openPurchaseOrders:purchaseOrders.length,overduePurchaseOrders:overdueOrders.length,
      expiredDocuments:expiredDocuments.length,expiringDocuments:expiringDocuments.length,
      payrollDue:payrollDue.length,agendaNext7:agendaEvents.length,unreadNotifications
    },
    attention,
    queue:queue.slice(0,18),
    processStatus,
    upcoming:{
      agenda:agendaEvents,
      purchaseOrders:upcomingOrders.slice(0,6),
      payroll:payrollDue.slice(0,6),
      documents:expiringDocuments.slice(0,6)
    },
    activity,
    recent:{
      expenses:expenses.slice(0,6),
      payables:openPayables.slice(0,6),
      receivables:openReceivables.slice(0,6),
      treasury:treasuryMovements.slice(0,6)
    },
    dataSources:[
      'Cuentas por pagar','Cuentas por cobrar','Tesorería','Gastos','Presupuestos','Activos fijos',
      'Aprobaciones','Compras','Expedientes RH','Nómina','Agenda','Notificaciones','Auditoría'
    ]
  };
}
