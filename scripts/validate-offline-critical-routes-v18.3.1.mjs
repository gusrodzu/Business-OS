const memory = new Map();
global.localStorage = {
  getItem:key => memory.get(key) ?? null,
  setItem:(key,value) => memory.set(key,value),
  removeItem:key => memory.delete(key),
};
if (typeof global.FormData === 'undefined') global.FormData = class FormData { entries(){ return [][Symbol.iterator](); } };

const {offlineDemoRequest, resetOfflineDemo} = await import(`../apps/web/src/offlineDemo.js?qa=${Date.now()}`);
resetOfflineDemo();
const checks=[];
const check=(name,condition,detail='')=>checks.push({name,ok:Boolean(condition),detail});

let cash=await offlineDemoRequest('/cash-flow?startDate=2026-09-01&endDate=2026-12-31');
check('Flujo efectivo · movimientos normalizados', cash.recentMovements.length>0 && cash.recentMovements.every(x=>typeof x.movementDate==='string'));
check('Flujo efectivo · cierres mensuales', cash.monthly.length>0 && cash.monthly.every(x=>Number.isFinite(Number(x.closingBalance))));
check('Flujo efectivo · filtro escenario seguro', typeof cash.filters?.scenarioId==='string');
const scenarioResponse=await offlineDemoRequest('/cash-flow/scenarios',{method:'POST',body:{name:'Escenario QA',startDate:'2026-09-01',endDate:'2026-12-31'}});
await offlineDemoRequest(`/cash-flow/scenarios/${scenarioResponse.scenario.id}/status`,{method:'PATCH',body:{status:'ACTIVE'}});
await offlineDemoRequest(`/cash-flow/scenarios/${scenarioResponse.scenario.id}/adjustments`,{method:'POST',body:{concept:'Cobranza extraordinaria',type:'INFLOW',amount:12000,probability:90,date:'2026-10-01'}});
cash=await offlineDemoRequest('/cash-flow');
check('Flujo efectivo · mutaciones persisten', cash.scenarios.find(x=>x.id===scenarioResponse.scenario.id)?.adjustments.length===1);

let bank=await offlineDemoRequest('/bank-reconciliation');
check('Conciliación · cuenta bancaria enlazada', bank.statements.length>0 && bank.statements.every(x=>x.treasuryAccount?.name));
check('Conciliación · líneas normalizadas', bank.statements.flatMap(x=>x.lines).every(x=>typeof x.transactionDate==='string' && Number(x.amount)>=0));
const statementResponse=await offlineDemoRequest('/bank-reconciliation/statements',{method:'POST',body:{treasuryAccountId:bank.accounts[0]?.id,statementDate:'2026-09-14',periodStart:'2026-09-01',periodEnd:'2026-09-14',openingBalance:1000,closingBalance:1580}});
const lineResponse=await offlineDemoRequest(`/bank-reconciliation/statements/${statementResponse.statement.id}/lines`,{method:'POST',body:{transactionDate:'2026-09-14',description:'SPEI QA',type:'CREDIT',amount:580}});
const candidates=await offlineDemoRequest(`/bank-reconciliation/statements/${statementResponse.statement.id}/candidates`);
check('Conciliación · candidatos offline', Array.isArray(candidates.movements) && candidates.movements.length>0);
await offlineDemoRequest(`/bank-reconciliation/lines/${lineResponse.line.id}/match`,{method:'POST',body:{treasuryMovementId:candidates.movements[0]?.id}});
bank=await offlineDemoRequest('/bank-reconciliation');
check('Conciliación · match persiste', bank.statements.find(x=>x.id===statementResponse.statement.id)?.lines.find(x=>x.id===lineResponse.line.id)?.status==='MATCHED');

let pos=await offlineDemoRequest('/pos/dashboard');
check('POS · terminales/sesiones offline', pos.terminals.length>0 && pos.sessions.length>0 && pos.sessions.some(x=>x.terminal));
check('POS · inventario por almacén', pos.products.length>0 && pos.products.every(x=>Array.isArray(x.inventoryBalances)));
const activeSession=pos.sessions.find(x=>x.status==='OPEN');
const posSale=await offlineDemoRequest('/pos/sales',{method:'POST',body:{sessionId:activeSession?.id,folio:'POS-QA-001',customerId:pos.customers[0]?.id,items:[{productId:pos.products[0].id,quantity:1,unitPrice:100,discount:0,taxRate:16}],payments:[{method:'CASH',amount:116}]}});
pos=await offlineDemoRequest('/pos/dashboard');
check('POS · venta persiste', pos.sales.some(x=>x.id===posSale.sale.id && x.status==='PAID'));
check('POS · resumen recalculado', Number(pos.summary.totalToday)>0 && Number(pos.summary.tickets)>0);

let production=await offlineDemoRequest('/production/dashboard');
check('Producción · contrato rico', production.orders.length>0 && production.orders.every(x=>Number.isFinite(Number(x.plannedQuantity)) && Array.isArray(x.operations) && Array.isArray(x.materials) && x.metrics));
const orderResponse=await offlineDemoRequest('/production/orders',{method:'POST',body:{name:'Orden QA',productId:production.products[0].id,plannedQuantity:5}});
await offlineDemoRequest(`/production/orders/${orderResponse.order.id}/outputs`,{method:'POST',body:{quantity:2,unitCost:10,lotNumber:'LOT-QA'}});
production=await offlineDemoRequest('/production/dashboard');
const productionOrder=production.orders.find(x=>x.id===orderResponse.order.id);
check('Producción · avance persistente', productionOrder?.producedQuantity===2 && productionOrder?.metrics?.progress===40);
check('Producción · lote offline', productionOrder?.batches?.some(x=>x.lotNumber==='LOT-QA'));

let projects=await offlineDemoRequest('/projects/dashboard');
check('Proyectos · miembros normalizados', projects.projects.length>0 && projects.projects.every(p=>(p.members||[]).every(m=>m.employee?.firstName)));
check('Proyectos · métricas disponibles', projects.projects.every(p=>p.metrics && Number.isFinite(Number(p.metrics.taskProgress))));
const project=projects.projects[0];
const memberResponse=await offlineDemoRequest(`/projects/${project.id}/members`,{method:'POST',body:{employeeId:projects.employees[4]?.id,role:'QA',allocationPercent:50}});
await offlineDemoRequest(`/projects/${project.id}/comments`,{method:'POST',body:{content:'Comentario QA persistente'}});
projects=await offlineDemoRequest('/projects/dashboard');
const refreshedProject=projects.projects.find(x=>x.id===project.id);
check('Proyectos · equipo persiste', refreshedProject?.members.some(x=>x.id===memberResponse.member.id));
check('Proyectos · bitácora persiste', refreshedProject?.comments.some(x=>x.content==='Comentario QA persistente'));

const failed=checks.filter(x=>!x.ok);
console.log('\nOffline Critical Routes v18.3.1');
console.log('================================');
for(const row of checks) console.log(`${row.ok?'PASS':'FAIL'}  ${row.name}${row.ok||!row.detail?'':` · ${row.detail}`}`);
console.log(`\n${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length) process.exit(1);
