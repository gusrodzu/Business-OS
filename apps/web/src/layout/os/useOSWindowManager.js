import {useEffect,useLayoutEffect,useReducer,useRef} from 'react';
import {createWindowState,windowManagerReducer} from './windowManagerState';

export default function useOSWindowManager({scope,desktop,pathname,app,navigate}) {
  const [stored,dispatch]=useReducer(windowManagerReducer,scope,createWindowState);
  // Closing/minimizing dispatches state and navigates in the same React event.
  // An older route effect must not resurrect the just-closed window.
  const suppressVisitPathRef=useRef(null);
  // A company switch must remove all previously mounted tenant pages before
  // effects run; never briefly render another company's window tree.
  const state=stored.scope===scope?stored:createWindowState(scope);
  useEffect(()=>{
    if(stored.scope!==scope){
      suppressVisitPathRef.current=null;
      dispatch({type:'RESET_SCOPE',scope});
    }
  },[stored.scope,scope]);
  useLayoutEffect(()=>{
    if(!desktop||stored.scope!==scope)return;
    if(suppressVisitPathRef.current===pathname)return;
    suppressVisitPathRef.current=null;
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
    const leavingForeground=state.activeKey===key||pathname===target.path;
    if(leavingForeground)suppressVisitPathRef.current=pathname;
    dispatch({type,scope,key});
    if(leavingForeground)navigate(next?.path||'/');
  }
  function minimize(key){exit(key,'MINIMIZE');}
  function close(key){exit(key,'CLOSE');}
  // The browser cannot kill server-side jobs; force-close immediately unmounts
  // this app's React window and removes it from the local window manager.
  function forceClose(key){exit(key,'CLOSE');}
  function maximize(key){dispatch({type:'MAXIMIZE',scope,key});}
  function move(key,x,y){dispatch({type:'MOVE',scope,key,x,y});}
  function snap(key,layout){dispatch({type:'SNAP',scope,key,layout});}
  function resize(key,width,height){dispatch({type:'RESIZE',scope,key,width,height});}

  return {...state,focus,minimize,close,forceClose,maximize,move,snap,resize};
}
