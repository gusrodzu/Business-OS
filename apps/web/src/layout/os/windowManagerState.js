// Workspace OS in-memory window lifecycle. Never persist a component tree or
// session/company-scoped route list in browser storage.
export function createWindowState(scope='anonymous') {
  return {scope,windows:[],activeKey:null,showDesktop:true,clock:0};
}

function foreground(windows) {
  return [...windows].filter(window=>!window.minimized)
    .sort((a,b)=>b.order-a.order)[0]||null;
}

export function windowManagerReducer(state,action) {
  if(action.type==='RESET_SCOPE') return createWindowState(action.scope);
  // Ignore delayed actions from a previous tenant instead of resetting to it.
  if(action.scope && action.scope!==state.scope) return state;
  if(action.type==='VISIT') {
    if(!action.app) return {...state,showDesktop:true,activeKey:null};
    const key=action.app.key;
    const order=state.clock+1;
    const found=state.windows.some(window=>window.key===key);
    const next=found
      ?state.windows.map(window=>window.key===key
        ?{...window,path:action.path,minimized:false,order}:window)
      :[...state.windows,{
        // Open as a generous floating workspace, matching the approved reference.
        // Stage CSS constrains it on smaller displays; maximize remains optional.
        key,path:action.path,minimized:false,maximized:false,order,width:1190,height:690,
        x:(state.windows.length%6)*38,y:14+(state.windows.length%6)*38,
      }];
    return {...state,windows:next,activeKey:key,showDesktop:false,clock:order};
  }
  if(action.type==='FOCUS') {
    if(!state.windows.some(window=>window.key===action.key))return state;
    const order=state.clock+1;
    return {...state,clock:order,activeKey:action.key,showDesktop:false,
      windows:state.windows.map(window=>window.key===action.key
        ?{...window,minimized:false,order}:window)};
  }
  if(action.type==='SHOW_DESKTOP') return {...state,showDesktop:true,activeKey:null};
  if(action.type==='MAXIMIZE') return {...state,windows:state.windows.map(window=>window.key===action.key
    ?{...window,maximized:window.snap?true:!window.maximized,snap:null}:window)};
  if(action.type==='SNAP') return {...state,windows:state.windows.map(window=>window.key===action.key
    ?{...window,maximized:action.layout==='full',snap:action.layout==='full'||action.layout==='float'?null:action.layout}:window)};
  if(action.type==='RESIZE') return {...state,windows:state.windows.map(window=>window.key===action.key
    ?{...window,width:action.width,height:action.height}:window)};
  if(action.type==='MOVE') return {...state,windows:state.windows.map(window=>window.key===action.key
    ?{...window,x:action.x,y:action.y}:window)};
  if(action.type==='MINIMIZE'||action.type==='CLOSE') {
    const next=action.type==='CLOSE'
      ?state.windows.filter(window=>window.key!==action.key)
      :state.windows.map(window=>window.key===action.key?{...window,minimized:true}:window);
    const active=state.activeKey===action.key?foreground(next):next.find(window=>window.key===state.activeKey&&!window.minimized)||foreground(next);
    // Closing or minimizing a background app must not steal focus from the
    // current workspace, and must not unexpectedly exit Show Desktop.
    const preserveDesktop=state.showDesktop&&state.activeKey===null;
    return {...state,windows:next,activeKey:preserveDesktop?null:active?.key||null,
      showDesktop:preserveDesktop||!active};
  }
  return state;
}
