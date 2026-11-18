import {useEffect,useReducer} from 'react';
import {createWindowState,windowManagerReducer} from './windowManagerState';

export default function useOSWindowManager({scope,desktop,pathname,app,navigate}) {
  const [stored,dispatch]=useReducer(windowManagerReducer,scope,createWindowState);
  // A company switch must remove all previously mounted tenant pages before
  // effects run; never briefly render another company's window tree.
  const state=stored.scope===scope?stored:createWindowState(scope);
  useEffect(()=>{
    if(stored.scope!==scope)dispatch({type:'RESET_SCOPE',scope});
  },[stored.scope,scope]);
  useEffect(()=>{
    if(!desktop||stored.scope!==scope)return;
    dispatch({type:'VISIT',scope,app:app||null,path:pathname});
  },[desktop,stored.scope,scope,app,pathname]);

  function focus(key) {
    const window=state.windows.find(row=>row.key===key);
    if(!window)return;
    dispatch({type:'FOCUS',scope,key});
    if(pathname!==window.path)navigate(window.path);
  }
  function exit(key,type) {
    const target=state.windows.find(row=>row.key===key);
    if(!target)return;
    const next=state.windows.filter(row=>row.key!==key&&!row.minimized)
      .sort((a,b)=>b.order-a.order)[0];
    dispatch({type,scope,key});
    if(state.activeKey===key)navigate(next?.path||'/');
  }
  function minimize(key){exit(key,'MINIMIZE');}
  function close(key){exit(key,'CLOSE');}
  function maximize(key){dispatch({type:'MAXIMIZE',scope,key});}
  function move(key,x,y){dispatch({type:'MOVE',scope,key,x,y});}

  return {...state,focus,minimize,close,maximize,move};
}
