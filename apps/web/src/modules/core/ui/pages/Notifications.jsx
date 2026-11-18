import {useCallback,useEffect,useState} from 'react';
import {Bell, Check, RefreshCw} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {apiRequest} from '../../../../api';
import styles from './Notifications.module.css';

export default function Notifications(){
  const navigate=useNavigate();
  const [state,setState]=useState({loading:true,error:'',items:[],unread:0});
  const refresh=useCallback(async()=>{
    try{
      const result=await apiRequest('/activity/notifications');
      setState({loading:false,error:'',items:Array.isArray(result?.notifications)?result.notifications:[],
        unread:Number(result?.unread)||0});
    }catch{
      setState(previous=>({...previous,loading:false,error:'No fue posible cargar las notificaciones.'}));
    }
  },[]);
  useEffect(()=>{refresh();},[refresh]);

  async function openNotification(item){
    if(!item.read){
      try{await apiRequest('/activity/notifications/'+encodeURIComponent(item.id)+'/read',{method:'PATCH'});}
      catch{
        setState(previous=>({...previous,error:'No fue posible marcar la notificación como leída.'}));
        return;
      }
    }
    await refresh();
    if(typeof item.link==='string'&&item.link.startsWith('/')&&!item.link.startsWith('//'))navigate(item.link);
  }

  return <section className={styles.page} data-system-notifications="true">
    <header className={styles.head}>
      <div className={styles.headCopy}>
        <div className={styles.icon}><Bell size={24} aria-hidden="true"/></div>
        <div><small>ACTIVIDAD DEL SISTEMA</small><h1>Notificaciones</h1>
          <p>Alertas y avisos de tus aplicaciones empresariales.</p></div>
      </div>
      <button type="button" onClick={refresh} className={styles.refresh} disabled={state.loading}>
        <RefreshCw size={16} aria-hidden="true"/> Actualizar
      </button>
    </header>
    <div className={styles.summary} role="status">
      <strong>{state.unread}</strong> {state.unread===1?'notificación pendiente':'notificaciones pendientes'}
    </div>
    {state.error ? <p className={styles.error} role="alert">{state.error}</p>:null}
    {state.loading ? <p className={styles.empty}>Cargando notificaciones…</p>
      : !state.items.length ? <div className={styles.empty}><Check size={25} aria-hidden="true"/>
          <h2>Todo al día</h2><p>No tienes notificaciones por ahora.</p></div>
      : <ul className={styles.list}>
        {state.items.map(item=><li key={item.id}>
          <button type="button" className={styles.notice} onClick={()=>openNotification(item)}
            aria-label={(item.read?'Abrir ':'Leer ')+(item.title||'notificación')}>
            <span className={item.read?styles.readDot:styles.unreadDot} aria-hidden="true"/>
            <span className={styles.content}><strong>{item.title||'Notificación'}</strong>
              <span>{item.message||'Sin detalles adicionales'}</span></span>
            {!item.read?<span className={styles.new}>Nueva</span>:null}
          </button>
        </li>)}
      </ul>}
  </section>;
}
