import {useEffect,useMemo,useState} from 'react';

const STORAGE_KEY='businessos-automotive-workshop-demo-v1';
const SAMPLE_PARTS=[
 {sku:'FILT-001',name:'Filtro de aceite',make:'Nissan',model:'Versa',from:2015,to:2024,stock:12,price:180},
 {sku:'FREN-002',name:'Balatas delanteras',make:'Chevrolet',model:'Aveo',from:2018,to:2025,stock:8,price:650},
 {sku:'BUJI-003',name:'Juego de bujías',make:'Nissan',model:'Versa',from:2015,to:2024,stock:15,price:390}
];
const initialState={parts:SAMPLE_PARTS,orders:[]};
function loadState(){try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY));return raw&&Array.isArray(raw.parts)&&Array.isArray(raw.orders)?raw:initialState}catch{return initialState}}
const money=value=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(value);
export default function AutomotiveWorkshopDemo(){
 const [data,setData]=useState(loadState);
 const [make,setMake]=useState('Nissan');
 const [model,setModel]=useState('Versa');
 const [year,setYear]=useState('2020');
 const [customer,setCustomer]=useState('');
 const [plate,setPlate]=useState('');
 const [service,setService]=useState('');
 const [sku,setSku]=useState('');
 const [message,setMessage]=useState('');
 useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}catch{setMessage('No se pudieron guardar los cambios en el navegador.')}},[data]);
 const matches=useMemo(()=>data.parts.filter(part=>part.make.toLowerCase()===make.trim().toLowerCase()&&part.model.toLowerCase()===model.trim().toLowerCase()&&Number(year)>=part.from&&Number(year)<=part.to),[data.parts,make,model,year]);
 function createOrder(event){
  event.preventDefault();
  const chosen=data.parts.find(part=>part.sku===sku);
  if(!customer.trim()||!service.trim()||!plate.trim()||!Number.isInteger(Number(year))||Number(year)<1950||Number(year)>2100){setMessage('Completa cliente, placas, servicio y año válido.');return}
  if(chosen&&(!matches.some(part=>part.sku===sku)||chosen.stock<1)){setMessage('La refacción seleccionada no es compatible o no tiene existencias.');return}
  const order={id:'OS-'+Date.now(),customer:customer.trim(),plate:plate.trim().toUpperCase(),make:make.trim(),model:model.trim(),year:Number(year),service:service.trim(),sku:chosen?.sku||null,partName:chosen?.name||null,price:chosen?.price||0,status:'abierta',createdAt:new Date().toISOString()};
  setData(previous=>({...previous,orders:[order,...previous.orders]}));
  setCustomer('');setPlate('');setService('');setSku('');setMessage('Orden de servicio creada en la demo local.');
 }
 function completeOrder(id){
  const order=data.orders.find(item=>item.id===id);
  if(!order||order.status!=='abierta')return;
  const part=data.parts.find(item=>item.sku===order.sku);
  if(order.sku&&(!part||part.stock<1)){setMessage('Sin existencias para completar la orden.');return}
  setData(previous=>({
   parts:previous.parts.map(item=>item.sku===order.sku?{...item,stock:item.stock-1}:item),
   orders:previous.orders.map(item=>item.id===id?{...item,status:'completada'}:item)
  }));
  setMessage('Orden completada. Inventario simulado actualizado.');
 }
 const input={padding:'10px',border:'1px solid #d5dce7',borderRadius:8,width:'100%',boxSizing:'border-box'};
 const section={background:'#fff',border:'1px solid #dce2ed',borderRadius:16,padding:20,marginBottom:16};
 return <main style={{padding:'clamp(12px,3vw,32px)',background:'#f4f6fb',minHeight:'100%'}}>
  <header style={section}><small>BUSINESS OS / DEMO OFFLINE / AUTOMOTRIZ</small><h1>Refacciones y taller automotriz</h1><p>Consulta compatibilidad, crea órdenes de servicio y descuenta inventario al completarlas. Todos los datos permanecen en este navegador; no se modifican ventas, existencias ni clientes reales.</p><a href="/configuracion/giros">← Volver a tipos de empresa</a></header>
  {message&&<p role="status" style={{...section,background:'#f1f7ff'}}>{message}</p>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,340px),1fr))',gap:16}}>
   <section style={section}><h2>1. Buscar refacciones compatibles</h2>
    <label>Marca<input style={input} value={make} onChange={e=>{setMake(e.target.value);setSku('')}} /></label>
    <label>Modelo<input style={input} value={model} onChange={e=>{setModel(e.target.value);setSku('')}} /></label>
    <label>Año<input style={input} type="number" min="1950" max="2100" value={year} onChange={e=>{setYear(e.target.value);setSku('')}} /></label>
    <h3>Coincidencias ({matches.length})</h3>
    {matches.length?matches.map(part=><div key={part.sku} style={{padding:'9px 0',borderBottom:'1px solid #e5e8ee'}}><strong>{part.name}</strong><div>{part.sku} · {money(part.price)} · Disponibles: {part.stock}</div></div>):<p>No hay coincidencias en el catálogo de ejemplo. La compatibilidad debe validarse con datos técnicos reales antes de vender.</p>}
   </section>
   <section style={section}><h2>2. Crear orden de servicio</h2><form onSubmit={createOrder} style={{display:'grid',gap:12}}>
    <label>Cliente<input style={input} value={customer} onChange={e=>setCustomer(e.target.value)} required /></label>
    <label>Placas<input style={input} value={plate} onChange={e=>setPlate(e.target.value)} required /></label>
    <label>Servicio solicitado<input style={input} value={service} onChange={e=>setService(e.target.value)} required /></label>
    <label>Refacción (opcional)<select style={input} value={sku} onChange={e=>setSku(e.target.value)}><option value="">Sin refacción</option>{matches.filter(part=>part.stock>0).map(part=><option key={part.sku} value={part.sku}>{part.name} — {money(part.price)}</option>)}</select></label>
    <button type="submit" style={{padding:12,background:'#2563eb',color:'white',border:0,borderRadius:10,cursor:'pointer'}}>Crear orden local</button>
   </form></section>
  </div>
  <section style={section}><h2>3. Órdenes de servicio ({data.orders.length})</h2>
   {data.orders.length===0?<p>Aún no hay órdenes en esta demo.</p>:data.orders.map(order=><article key={order.id} style={{borderTop:'1px solid #dce2ed',padding:'14px 0',display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}>
    <div><strong>{order.id} · {order.customer}</strong><div>{order.make} {order.model} {order.year} · {order.plate}</div><div>{order.service}{order.partName?' · '+order.partName:''}</div><small>Estado: {order.status}</small></div>
    {order.status==='abierta'&&<button type="button" onClick={()=>completeOrder(order.id)} style={{padding:10,borderRadius:9,cursor:'pointer'}}>Completar y descontar inventario demo</button>}
   </article>)}
  </section>
 </main>;
}
