/**
 * Business OS headless viewport review.
 * Uses Chrome DevTools Protocol over Node 24 WebSocket, no browser test dependency.
 * Captures the locally built UI (not a stale Vercel deployment) in Demo Local.
 */
import {spawn} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const root = process.cwd();
const outDir = path.join(root, 'artifacts/mobile-review');
const origin = process.env.BUSINESS_OS_AUDIT_ORIGIN || 'http://127.0.0.1:4173';
const sizes = [320,360,390,430];
const routes = [
  {slug:'inicio',url:'/'},
  {slug:'inventario',url:'/inventario/existencias'},
  {slug:'ventas',url:'/ventas'},
  {slug:'pos',url:'/pos'},
  {slug:'cobranza',url:'/ventas/cobranza'},
  {slug:'configuracion',url:'/configuracion'},
  {slug:'personalizacion',url:'/configuracion?seccion=personal'},
  {slug:'mi-cuenta',url:'/configuracion?seccion=account'},
];
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
const now = Date.now();
function timeout(ms, label) { return new Promise((_,reject)=>setTimeout(()=>reject(new Error('Timeout '+label)),ms)); }
async function until(callback,{tries=65,interval=260,label='condition'}={}) {
  for (let i=0;i<tries;i++){try{const result=await callback(); if(result) return result;}catch{} await sleep(interval);}
  throw new Error('Not ready: '+label);
}
class CDP {
  constructor(socket){this.socket=socket;this.nextId=1;this.pending=new Map();this.events=[];
    socket.onmessage=(ev)=>{const reply=JSON.parse(ev.data);
      if(!reply.id){
        if(['Runtime.exceptionThrown','Log.entryAdded','Network.loadingFailed'].includes(reply.method))this.events.push({method:reply.method,params:reply.params});
        return;
      }
      const pending=this.pending.get(reply.id);if(!pending)return;this.pending.delete(reply.id);reply.error?pending.reject(new Error(reply.error.message)):pending.resolve(reply.result||{});
    };
  }
  send(method,params={}) {return Promise.race([new Promise((resolve,reject)=>{const id=this.nextId++;this.pending.set(id,{resolve,reject});this.socket.send(JSON.stringify({id,method,params}));}),timeout(15000,method)]);}
  async run(js){const r=await this.send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true});if(r.exceptionDetails){const details=r.exceptionDetails;const exception=details.exception;const description=exception?.description||exception?.value||details.text||'Unknown browser exception';throw new Error('Browser evaluation failed: '+description+'; expression: '+js.slice(0,220));}return r.result?.value;}
}
await mkdir(outDir,{recursive:true});
const chromeBinary = process.env.CHROME_BIN || 'google-chrome';
const port = 20000 + (process.pid % 30000);
const profile = path.join(os.tmpdir(),'buzzbee-mobile-chrome-'+process.pid);
const chrome = spawn(chromeBinary,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--hide-scrollbars','--no-first-run','--no-default-browser-check',
  '--disable-background-networking','--disable-extensions',
  '--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'
],{stdio:['ignore','pipe','pipe']});
let chromiumLog = '';
chrome.stderr.on('data',data=>{chromiumLog += data.toString().slice(-3000);});
const stop=()=>{if(!chrome.killed)chrome.kill('SIGTERM');};
process.on('exit',stop);
let socket;
try{
  await until(async()=>{const r=await fetch(origin+'/login');return r.ok;},{label:'local Vite preview'});
  await until(async()=>{if(chrome.exitCode!==null)throw new Error('Chrome exited: '+chrome.exitCode);const r=await fetch('http://127.0.0.1:'+port+'/json/version');return r.ok;},{tries:110,label:'Chrome CDP'}).catch(error=>{throw new Error(error.message+'; pid='+chrome.pid+'; exit='+chrome.exitCode+'; stderr='+chromiumLog.slice(-3500));});
  const result=await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'});
  if(!result.ok)throw Error('Chrome target creation failed');
  const target=await result.json();
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await Promise.race([new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;}),timeout(12000,'CDP connection')]);
  const cdp = new CDP(socket);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Network.enable');
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  const report=[];
  // Start at one phone width, authenticate via the same Demo Local form as a visitor.
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  // On heavily loaded CI runners, login hydration can lag behind navigation.
  // Retry the document once and surface diagnostics instead of timing out blind.
  let loginReady=false;
  for(let attempt=0;attempt<2&&!loginReady;attempt++){
    await cdp.send('Page.navigate',{url:origin+'/login'});
    try{
      await until(()=>cdp.run("location.pathname==='/' || Boolean(document.querySelector('form button'))"),{tries:95,label:'login form or session'});
      loginReady=true;
    }catch(error){
      const state=await cdp.run("({path:location.pathname,ready:document.readyState,title:document.title,body:document.body?.innerText?.slice(0,320)||'',root:document.querySelector('#root')?.innerHTML?.slice(0,220)||'',scripts:[...document.scripts].map(x=>x.src),resources:performance.getEntriesByType('resource').filter(x=>/assets\\//.test(x.name)).slice(0,8).map(x=>({url:x.name.split('/').pop(),duration:x.duration,transferSize:x.transferSize,responseStatus:x.responseStatus}))})");
      console.error('Login readiness attempt '+(attempt+1)+': '+JSON.stringify(state)+'; events='+JSON.stringify(cdp.events.slice(-8))+'; '+error.message);
      if(attempt===1)throw error;
    }
  }
  if(!(await cdp.run("location.pathname==='/'"))){
    await cdp.run(`(()=>{const button=[...document.querySelectorAll('form button')].find(el=>el.textContent.includes('Continuar'));if(!button)throw Error('Demo login submit missing');button.click();return true})()`);
    await until(()=>cdp.run("location.pathname==='/'"),{tries:120,label:'Demo Local authentication'});
  }
  for (const width of sizes){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
    for (const route of routes){
      await cdp.send('Page.navigate',{url:origin+route.url});
      await until(()=>cdp.run('document.readyState === "complete"'),{label:route.slug+' document'});
      await until(()=>cdp.run("Boolean(document.querySelector('[data-responsive-shell=true]'))"),{label:route.slug+' ERP shell'});
      await sleep(950);
      const data=await cdp.run(`(()=>{
        const width=window.innerWidth;
        const all=[...document.querySelectorAll('button,a,[role="button"],input,select,textarea')];
        const isShown=e=>{const st=getComputedStyle(e),r=e.getBoundingClientRect();return st.visibility!=='hidden'&&st.display!=='none'&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth};
        const canScroll=e=>{let p=e.parentElement;while(p&&p!==document.body){const o=getComputedStyle(p).overflowX;if((o==='auto'||o==='scroll')&&p.scrollWidth>p.clientWidth+3)return true;p=p.parentElement;}return false;};
        const offscreen=all.filter(isShown).filter(e=>{const r=e.getBoundingClientRect();return (r.left<-3||r.right>width+3)&&!canScroll(e);}).slice(0,8).map(e=>({tag:e.tagName,text:(e.innerText||e.getAttribute('aria-label')||'').slice(0,45),x:Math.round(e.getBoundingClientRect().x),right:Math.round(e.getBoundingClientRect().right)}));
        const smallTouch=[...document.querySelectorAll('[data-mobile-bottom-nav] button,[data-mobile-bottom-nav] a')].filter(isShown).filter(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44}).map(e=>({text:e.innerText,w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)}));
        const nav=document.querySelector('nav[aria-label="Dock de Pocket OS"]');
        const navStyle=nav&&getComputedStyle(nav);
        const visibleDock=Boolean(nav&&navStyle.display!=='none'&&nav.getBoundingClientRect().height>=58);
        const dockActions=nav?[...nav.querySelectorAll('a,button')].filter(isShown).length:0;
        const body=document.body,html=document.documentElement;
        return {route:location.pathname,innerWidth:width,scrollWidth:html.scrollWidth,bodyWidth:body.scrollWidth,navVisible:visibleDock,navHeight:nav?Math.round(nav.getBoundingClientRect().height):0,dockActions,smallTouch,offscreen,contentScroll:Math.round(document.querySelector('[data-responsive-shell] [class*="_content_"]')?.scrollHeight||0),heading:document.querySelector('main h1,h1')?.innerText?.slice(0,90)||null,errorVisible:Boolean(document.querySelector('[role="alert"]'))};
      })()`);
      if(['configuracion','personalizacion','mi-cuenta'].includes(route.slug)){
        const settings=await cdp.run(`(()=>{const root=document.querySelector('[aria-label="Categorías de configuración"]');const heading=document.querySelector('main h1');const personal=document.querySelector('[aria-label="Personalización del escritorio"]');return {sidebar:!!root,heading:heading?.textContent||'',personal:!!personal,hasThemes:!!document.querySelector('[aria-label="Temas del sistema"]'),horizontalOverflow:document.documentElement.scrollWidth>innerWidth+3};})()`);
        if(!settings.sidebar||!settings.heading||settings.horizontalOverflow||(route.slug==='personalizacion'&&(!settings.personal||!settings.hasThemes)))throw Error('Settings mobile UI regression: '+JSON.stringify({width,slug:route.slug,...settings}));
      }
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      const file=width+'-'+route.slug+'.png';
      await writeFile(path.join(outDir,file),Buffer.from(shot.data,'base64'));
      const record={width,file,...data};
      report.push(record);
      console.log(JSON.stringify(record));
      if(!record.navVisible||record.dockActions!==4||record.smallTouch.length||record.offscreen.length||record.scrollWidth>width+3||record.errorVisible)
        throw Error('Pocket OS mobile layout and dock regression: '+JSON.stringify(record));
    }
  }
  // Step-level screenshots at 390 px: menu open, collections entry modal, and POS after scrolling.
  const captureStep = async (slug,buttonText,clickQuery) => {
    await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await cdp.send('Page.navigate',{url:origin+(slug==='cobranza-modal'?'/ventas/cobranza':slug==='menu'||slug==='app-shelf'||slug==='os-apps'?'/':'/pos')});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-responsive-shell=true]'))"),{label:slug+' interactive shell'});
    await sleep(600);
    await cdp.run(clickQuery);
    await sleep(420);
    const state=await cdp.run("({modal:!!document.querySelector('[aria-modal=true]'),drawerOpen:document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open'),appDialogOpen:!!document.querySelector('#workspace-os-app-drawer[open]'),appDrawerReady:!!document.querySelector('#workspace-os-app-drawer[open] [data-workspace-app-shelf=true]'),scrolled:document.querySelector('[data-scroll-owner=workspace]')?.scrollTop||0,appShelfReady:!!document.querySelector(':is([data-business-os-desktop-home=true],[data-business-os-pocket-home=true]) [data-workspace-app-shelf=true]')})");
    const screen=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    await writeFile(path.join(outDir,'390-'+slug+'.png'),Buffer.from(screen.data,'base64'));
    console.log(JSON.stringify({interactive:slug,label:buttonText,...state}));
    if (slug==='menu' && state.drawerOpen!=='true') throw Error('The mobile drawer did not open');
    if (slug==='cobranza-modal' && !state.modal) throw Error('Payment modal is not announced as a dialog');
    if (slug==='pos-scroll' && state.scrolled<100) throw Error('POS could not scroll to payment controls');
    if (slug==='app-shelf' && !state.appShelfReady) throw Error('OS application shelf not visible');
    if (slug==='os-apps' && (!state.appDialogOpen || !state.appDrawerReady)) throw Error('Pocket OS app library did not open the fullscreen application drawer');
  };
  await captureStep('menu','drawer de módulos',`(()=>{const b=document.querySelector('button[aria-label="Abrir navegación"]');if(!b)throw Error('Mobile menu trigger missing');b.click();return true})()`);
  await captureStep('cobranza-modal','registrar cobro',`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Registrar cobro'));if(!b)throw Error('Cobranza button missing');b.click();return true})()`);
  await captureStep('app-shelf','biblioteca de aplicaciones',"(()=>{const shelf=document.querySelector('[data-workspace-app-shelf=true]');if(!shelf)throw Error('App shelf missing');shelf.scrollIntoView({block:'center'});return true})()");
  await captureStep('os-apps','biblioteca desde dock',"(()=>{const b=document.querySelector('nav[aria-label=\"Dock de Pocket OS\"] button[aria-label=\"Abrir todas las aplicaciones\"]');if(!b)throw Error('Pocket OS dock app library missing');b.click();return true})()");
  await captureStep('pos-scroll','carrito y cobro',`(()=>{const el=document.querySelector('[data-responsive-shell] [class*="_content_"]');if(!el)throw Error('ERP content scroller missing');el.scrollTop=el.scrollHeight;return el.scrollTop})()`);

  // Android-like app bar: use a large touch target to return to the OS
  // desktop without showing desktop minimize/maximize controls on phones.
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await cdp.send('Page.navigate',{url:origin+'/ventas'});
  await until(()=>cdp.run("Boolean(document.querySelector('[data-os-application-window=true] button[aria-label=\"Volver al escritorio de Pocket OS\"]'))"),
    {label:'Pocket OS Android app bar'});
  const pocketBar=await cdp.run(`(()=>{
    const win=document.querySelector('[data-os-application-window=true]');
    const back=win?.querySelector('button[aria-label="Volver al escritorio de Pocket OS"]');
    const controls=win?.querySelector('[class*="_osWindowControls_"]');
    const rect=back?.getBoundingClientRect();
    const dock=document.querySelector('nav[aria-label="Dock de Pocket OS"]');
    return {
      route:location.pathname,
      backVisible:!!back && getComputedStyle(back).display!=='none' && rect.width>=44 && rect.height>=44,
      desktopWindowControlsHidden:!!controls && getComputedStyle(controls).display==='none',
      dockVisible:!!dock && getComputedStyle(dock).display!=='none',
      overflow:document.documentElement.scrollWidth-innerWidth
    };
  })()`);
  if(!pocketBar.backVisible||!pocketBar.desktopWindowControlsHidden||!pocketBar.dockVisible||pocketBar.overflow>3)
    throw Error('Pocket OS Android app bar regression: '+JSON.stringify(pocketBar));
  await cdp.run("(()=>{document.querySelector('[data-os-application-window=true] button[aria-label=\"Volver al escritorio de Pocket OS\"]').click();return true})()");
  await until(()=>cdp.run("location.pathname==='/'"),
    {label:'Pocket OS returns from Ventas to home'});
  const backScreen=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  await writeFile(path.join(outDir,'390-pocket-os-android-app-home.png'),Buffer.from(backScreen.data,'base64'));
  console.log('Pocket OS Android app bar QA '+JSON.stringify({...pocketBar,returnedHome:true}));

  // NAV-02 / QA-02: a rail icon opens only its module submenu.
  // Verify real navigation, browser history and mobile drawer dismissal.
  // Pocket OS: the 60px icon rail is intentionally hidden in the mobile
  // drawer. Audit the visible module explorer instead of focusing hidden icons.
  await cdp.send('Emulation.setDeviceMetricsOverride',{
    width:390,height:900,deviceScaleFactor:1,mobile:true
  });
  await cdp.send('Page.navigate',{url:origin+'/'});
  await until(()=>cdp.run("Boolean(document.querySelector('button[aria-label=\"Abrir navegación\"]'))"),
    {label:'mobile navigation opener'});
  await cdp.run("(()=>{document.querySelector('button[aria-label=\"Abrir navegación\"]').click();return true})()");
  await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='true'"),
    {label:'mobile module explorer open'});
  const mobileExplorer=await cdp.run("(()=>{const root=document.querySelector('[data-two-level-navigation][role=dialog]');const rail=root?.querySelector('nav[aria-label=\"Módulos principales\"]');const buttons=[...root?.querySelectorAll('button[data-mobile-module-item=true]')||[]];return {visible:!!root&&getComputedStyle(root).visibility==='visible',railHidden:!!rail&&getComputedStyle(rail.closest('[class*=\"_rail_\"]')).display==='none',modules:buttons.length,touch:buttons.every(b=>b.getBoundingClientRect().height>=44),overflow:document.documentElement.scrollWidth-innerWidth}})()");
  if(!mobileExplorer.visible||!mobileExplorer.railHidden||mobileExplorer.modules<3
    ||!mobileExplorer.touch||mobileExplorer.overflow>3){
    throw Error('Pocket OS mobile module explorer regression: '+JSON.stringify(mobileExplorer));
  }
  await cdp.run("(()=>{const buttons=[...document.querySelectorAll('[data-two-level-navigation] button[data-mobile-module-item=true]')];const sales=buttons.find(b=>b.textContent.includes('Ventas'));if(!sales)throw Error('Sales mobile module missing');sales.click();return true})()");
  await until(()=>cdp.run("Boolean(document.querySelector('[data-two-level-navigation] nav[aria-label=\"Opciones de Ventas\"] a[href=\"/ventas/cobranza\"]'))"),
    {label:'Pocket OS Sales submodule'});
  await cdp.run("(()=>{const search=document.querySelector('[data-two-level-navigation] input[aria-label=\"Buscar opciones de Ventas\"]');if(!search)throw Error('Mobile contextual search missing');search.focus();return true})()");
  await cdp.send('Input.insertText',{text:'cobranza'});
  await until(()=>cdp.run("(()=>{const root=document.querySelector('[data-two-level-navigation]');const input=root.querySelector('input[aria-label=\"Buscar opciones de Ventas\"]');const links=root.querySelectorAll('nav[aria-label=\"Opciones de Ventas\"] a');return input?.value==='cobranza'&&links.length===1})()"),
    {label:'Pocket OS Sales search'});
  await cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
  await until(()=>cdp.run("document.querySelector('[data-two-level-navigation] input[aria-label=\"Buscar opciones de Ventas\"]')?.value===''"),
    {label:'Pocket OS search Escape clear'});
  const mobileScreen=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  await writeFile(path.join(outDir,'390-pocket-os-sales-explorer.png'),Buffer.from(mobileScreen.data,'base64'));
  await cdp.run("(()=>{const link=document.querySelector('[data-two-level-navigation] nav[aria-label=\"Opciones de Ventas\"] a[href=\"/ventas/cobranza\"]');if(!link)throw Error('Sales collection link missing');link.click();return true})()");
  await until(()=>cdp.run("location.pathname==='/ventas/cobranza'&&document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='false'"),
    {label:'Pocket OS real Sales navigation'});
  const mobileNavigation={width:390,...mobileExplorer,search:true,escapeCleared:true,
    destination:await cdp.run('location.pathname'),drawerDismissed:true};
  console.log('Pocket OS mobile explorer QA '+JSON.stringify(mobileNavigation));

  // Desktop is now an OS with app windows and a system menu, not a classic
  // left icon rail. Exercise real keyboard actions on the supported chrome;
  // Pocket OS mobile explorer is verified independently above.
  const navigationJourneys=[];
  for(const width of [1280,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{
      width,height:900,deviceScaleFactor:1,mobile:false
    });
    for(const [route,title] of [
      ['/compras/recepciones','Compras'],
      ['/crm','CRM'],
      ['/finanzas/cuentas-por-pagar','Finanzas'],
      ['/recursos-humanos','Recursos Humanos'],
      ['/pos','Punto de venta'],
      ['/configuracion','Administración'],
    ]){
      await cdp.send('Page.navigate',{url:origin+route});
      await until(()=>cdp.run("Boolean(document.querySelector('[data-os-application-window=true] header'))"),
        {label:'Desktop OS application window '+route+' '+width});
      const state=await cdp.run(`(()=>{
        const shell=document.querySelector('[data-responsive-shell=true]');
        const win=document.querySelector('[data-os-application-window=true]');
        const bar=win?.querySelector('header');
        const controls=[...(bar?.querySelectorAll('button')||[])]
           .filter(button=>button.getClientRects().length>0&&getComputedStyle(button).visibility!=='hidden');
         const phoneHome=bar?.querySelector('button[aria-label="Volver al escritorio de Pocket OS"]');
        const menu=document.querySelector('nav[aria-label^="Menús de "], nav[aria-label="Barra de menú de Business OS"]');
        const dock=document.querySelector('nav[data-business-os-dock=true]');
        const bounds=win?.getBoundingClientRect();
        return {
          route:location.pathname,windowTitle:bar?.querySelector('strong')?.innerText?.trim(),
          controls:controls.length,labels:controls.every(b=>Boolean(b.getAttribute('aria-label'))),
           phoneControlHidden:!!phoneHome && phoneHome.getClientRects().length===0,
          visible:!!bounds&&bounds.width>280&&bounds.left>=0&&bounds.right<=innerWidth+3,
          menuVisible:!!menu&&menu.getBoundingClientRect().width>120,
          dockVisible:!!dock&&dock.getBoundingClientRect().height>42,
          sidebarHidden:getComputedStyle(document.querySelector('[data-two-level-navigation]')).visibility==='hidden',
          overflow:document.documentElement.scrollWidth-innerWidth,
          osApp:shell?.getAttribute('data-os-app'),
        };
      })()`);
      if(state.route!==route||state.windowTitle!==title||state.controls!==3
         ||!state.labels||!state.phoneControlHidden||!state.visible||!state.menuVisible||!state.dockVisible
         ||!state.sidebarHidden||state.overflow>3||state.osApp!=='true'){
        throw Error('Desktop universal OS window regression: '+JSON.stringify({width,...state}));
      }
      if(width===1440 && ['/crm','/finanzas/cuentas-por-pagar','/pos'].includes(route)){
        const image=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
        await writeFile(path.join(outDir,'1440-window-'+route.replaceAll('/','-')+'.png'),Buffer.from(image.data,'base64'));
      }
      navigationJourneys.push({width,...state});
      console.log('Desktop OS module QA '+JSON.stringify({width,...state}));
    }
    // Test the actual Snap Layout chooser with native keyboard Enter.
    // New OS windows start maximized; the chooser replaces the legacy
    // single maximize/restore button and renders its menu in a portal.
    await cdp.send('Page.navigate',{url:origin+'/crm'});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-os-application-window=true] button[aria-label^=\"Organizar ventana\"]'))"),
      {label:'CRM window layout chooser '+width});
    await cdp.run(`(()=>{
      const btn=document.querySelector('[data-os-application-window=true] button[aria-label^="Organizar ventana"]');
      if(!btn)throw Error('OS layout chooser missing');
      btn.focus();return true;
    })()`);
    const enter={key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'};
    await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',...enter});
    await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',...enter});
    await until(()=>cdp.run("Boolean(document.querySelector('[role=group][aria-label=\"Organizar ventanas\"] button[aria-label=\"Mitad izquierda\"]'))"),
      {label:'OS layout menu Enter '+width});
    await cdp.run(`(()=>{
      const left=document.querySelector('[role=group][aria-label="Organizar ventanas"] button[aria-label="Mitad izquierda"]');
      if(!left)throw Error('OS left layout missing');
      left.click();return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[data-os-window-slot][data-os-snap=\"left\"]'))"),
      {label:'OS snap left '+width});
    await cdp.run(`(()=>{
      const chooser=document.querySelector('[data-os-application-window=true] button[aria-label^="Organizar ventana"]');
      chooser.click();return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[role=group][aria-label=\"Organizar ventanas\"] button[aria-label=\"Pantalla completa\"]'))"),
      {label:'OS full layout menu '+width});
    await cdp.run(`(()=>{
      const full=document.querySelector('[role=group][aria-label="Organizar ventanas"] button[aria-label="Pantalla completa"]');
      full.click();return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[data-os-window-slot] button[aria-pressed=true]'))"),
      {label:'OS full layout restore '+width});
    await cdp.run(`(()=>{
      const btn=document.querySelector('[data-os-application-window=true] button[aria-label^="Minimizar"]');
      if(!btn)throw Error('OS minimize control missing');
      btn.click();return true;
    })()`);
    await until(()=>cdp.run("location.pathname==='/'&&!!document.querySelector('[data-business-os-desktop-home=true]')"),
      {label:'OS minimize to desktop '+width});
    const menuReady=await cdp.run("Boolean(document.querySelector('nav[aria-label^=\"Menús de \"], nav[aria-label=\"Barra de menú de Business OS\"]'))");
    if(!menuReady)throw Error('Desktop menu bar lost after minimizing a module');
    console.log('Desktop OS window keyboard and minimize QA '+JSON.stringify({width,keyboard:'Enter',snapLeft:true,full:true,minimize:true}));

    // A demo ERP user must not escape tenant scope through the SaaS admin URL.
    const company=await cdp.run("JSON.parse(localStorage.getItem('erp-session')||'null')?.user?.companyId");
    if(!company)throw Error('ERP demo session missing company scope');
    await cdp.send('Page.navigate',{url:origin+'/admin-saas'});
    await until(()=>cdp.run("location.pathname==='/'&&Boolean(document.querySelector('[data-responsive-shell=true]'))"),
      {label:'ERP cannot enter SaaS platform shell '+width});
    const boundary=await cdp.run(`(()=>{
      const session=JSON.parse(localStorage.getItem('erp-session')||'null');
      return {path:location.pathname,offlineDemo:session?.offlineDemo===true,
        platform:session?.platform===true,companyId:session?.user?.companyId||null};
    })()`);
    if(boundary.path!=='/'||!boundary.offlineDemo||boundary.platform||boundary.companyId!==company){
      throw Error('ERP/SaaS route boundary regression: '+JSON.stringify({width,...boundary}));
    }
    console.log('Desktop OS ERP/SaaS boundary '+JSON.stringify({width,...boundary}));
  }

  // Workspace OS uses an app-first home. The legacy hexagonal actions and
  // dashboard KPI customizer are not mounted here. Audit the current OS
  // app shelf, widgets, favorites, category filters and app navigation.
  const osShelfJourneys=[];
  for (const width of [390,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{
      width,height:900,deviceScaleFactor:1,mobile:width<760
    });
    await cdp.send('Page.navigate',{url:origin+'/'});
    if(width===1440){
      // #804: desktop Home is widget-first; applications exist only in the dock launcher.
      await until(()=>cdp.run("Boolean(document.querySelector('[data-business-os-desktop-home=true] [data-os-widget-board] #os-widget-control'))"),
        {label:'Widget-first desktop Home '+width});
      const home=await cdp.run("(()=>({shelfOnHome:!!document.querySelector('[data-business-os-desktop-home=true] [data-workspace-app-shelf=true]'),widgets:!!document.querySelector('[data-business-os-desktop-home=true] [data-os-widget-board] #os-widget-activity'),overflow:document.documentElement.scrollWidth-innerWidth,firstDockAction:document.querySelector('[data-business-os-dock] button')?.getAttribute('data-os-app-launcher')}))()");
      if(home.shelfOnHome||!home.widgets||home.overflow>3||home.firstDockAction!=='true')
        throw Error('Widget-first desktop Home regression '+JSON.stringify(home));
      await cdp.run("document.querySelector('[data-os-app-launcher=true]').click()");
      await until(()=>cdp.run("Boolean(document.querySelector('#business-os-app-launcher [data-workspace-app-shelf=true] nav[aria-label=\\\"Aplicaciones disponibles\\\"] button[aria-label^=\\\"Abrir \\\"]'))"),
        {label:'Desktop dock app launcher '+width});
      const initial=await cdp.run("(()=>{const drawer=document.querySelector('#business-os-app-launcher');const apps=[...drawer.querySelectorAll('nav[aria-label=\\\"Aplicaciones disponibles\\\"] button[aria-label^=\\\"Abrir \\\"]')];return {apps:apps.length,labeled:apps.every(b=>b.getAttribute('aria-label')?.startsWith('Abrir ')),focusInside:drawer.contains(document.activeElement)}})()");
      if(!initial.apps||!initial.labeled||!initial.focusInside)
        throw Error('Desktop launcher accessibility regression '+JSON.stringify(initial));
      const favorite=await cdp.run("(()=>{const app=document.querySelector('#business-os-app-launcher nav button[aria-label^=\\\"Abrir \\\"]');const pin=app?.parentElement.querySelector('button[aria-pressed]');if(!pin)throw Error('Launcher favorite missing');const before=pin.getAttribute('aria-pressed');pin.click();return {name:app.getAttribute('aria-label'),before}})()");
      // Favoriting can reorder the first eight tiles; expand the catalog when the target falls outside the collapsed grid.
      const pinCheck="(()=>{const root=document.querySelector('#business-os-app-launcher');const app=[...root?.querySelectorAll('nav button[aria-label^=\\\"Abrir \\\"]')||[]].find(b=>b.getAttribute('aria-label')==="+JSON.stringify(favorite.name)+");if(!app){root?.querySelector('button[aria-controls=\\\"workspace-app-grid\\\"][aria-expanded=\\\"false\\\"]')?.click();return null;}return app.parentElement.querySelector('button[aria-pressed]')?.getAttribute('aria-pressed')})()";
      await until(()=>cdp.run(pinCheck).then(value=>value!==favorite.before),{label:'Desktop launcher favorite toggle'});
      await cdp.run("document.querySelector('#business-os-app-launcher button[aria-label=\\\"Cerrar biblioteca de aplicaciones\\\"]').click()");
      await until(()=>cdp.run("!document.querySelector('#business-os-app-launcher')"),{label:'Desktop launcher close'});
      await cdp.run("document.querySelector('[data-os-app-launcher=true]').click()");
      await until(()=>cdp.run(pinCheck).then(value=>value==='true'||value==='false'),{label:'Desktop launcher favorite control ready after reopen'});
      await until(()=>cdp.run(pinCheck).then(value=>value!==undefined&&value!==null&&value!==favorite.before),{label:'Desktop launcher favorite persistence'});
      await cdp.run("(()=>{const app=[...document.querySelectorAll('#business-os-app-launcher nav button[aria-label^=\\\"Abrir \\\"]')].find(b=>b.getAttribute('aria-label')==="+JSON.stringify(favorite.name)+");app.parentElement.querySelector('button[aria-pressed]').click()})()");
      await until(()=>cdp.run(pinCheck).then(value=>value===favorite.before),{label:'Desktop launcher favorite restored'});
      const category=await cdp.run("(()=>{const group=document.querySelector('#business-os-app-launcher [role=group][aria-label=\\\"Filtrar aplicaciones por área\\\"]');const button=[...group?.querySelectorAll('button[aria-pressed=false]')||[]].find(b=>!b.textContent.includes('Favoritas'));if(!button)return null;button.click();return button.textContent.trim()})()");
      if(category){
        await until(()=>cdp.run("(()=>{const group=document.querySelector('#business-os-app-launcher [role=group][aria-label=\\\"Filtrar aplicaciones por área\\\"]');return [...group?.querySelectorAll('button[aria-pressed=true]')||[]].some(b=>b.textContent.trim()==="+JSON.stringify(category)+")})()"),{label:'Desktop launcher category filter'});
        await cdp.run("(()=>{const group=document.querySelector('#business-os-app-launcher [role=group][aria-label=\\\"Filtrar aplicaciones por área\\\"]');[...group.querySelectorAll('button')].find(b=>b.textContent.includes('Todas'))?.click()})()");
      }
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      await writeFile(path.join(outDir,width+'-os-app-launcher.png'),Buffer.from(shot.data,'base64'));
      const launched=await cdp.run("(()=>{const button=document.querySelector('#business-os-app-launcher nav button[aria-label^=\\\"Abrir \\\"]');if(!button)throw Error('No launchable app');const label=button.getAttribute('aria-label');button.click();return label})()");
      await until(()=>cdp.run("location.pathname!=='/'"),{label:'Desktop launcher app launch'});
      const destination=await cdp.run("location.pathname");
      osShelfJourneys.push({width,apps:initial.apps,favoritesPersisted:true,categoryFilter:Boolean(category),launched,destination,overflow:home.overflow});
      console.log('Workspace OS dock launcher QA '+JSON.stringify(osShelfJourneys.at(-1)));
      continue;
    }
    await until(()=>cdp.run("Boolean(document.querySelector(':is([data-business-os-desktop-home=true],[data-business-os-pocket-home=true]) [data-workspace-app-shelf=true] nav[aria-label=\"Aplicaciones disponibles\"] button[aria-label^=\"Abrir \"]'))"),
      {label:'OS app shelf '+width});
    const initial=await cdp.run("(()=>{const home=document.querySelector(':is([data-business-os-desktop-home=true],[data-business-os-pocket-home=true])');const shelf=home.querySelector('[data-workspace-app-shelf=true]');const apps=[...shelf.querySelectorAll('nav[aria-label=\"Aplicaciones disponibles\"] button[aria-label^=\"Abrir \"]')];return {apps:apps.length,labeled:apps.every(b=>b.getAttribute('aria-label')?.startsWith('Abrir ')),widgets:home.matches('[data-business-os-pocket-home=true]')?(!!home.querySelector('#pocket-priorities-heading')&&!!home.querySelector('#pocket-activity-heading')):(!!home.querySelector('[data-os-widget-board] #os-widget-control')&&!!home.querySelector('[data-os-widget-board] #os-widget-activity')),overflow:document.documentElement.scrollWidth-innerWidth}})()");
    if(initial.apps<1||!initial.labeled||!initial.widgets||initial.overflow>3)
      throw Error('OS home application and widget regression '+JSON.stringify({width,...initial}));
    // Desktop homepage must remain a high-contrast OS surface, never a
    // Mono B dashboard with white labels on a light toolbar or dark hero ink.
    if(width===1440){
      const visual=await cdp.run("(()=>{const home=document.querySelector('[data-business-os-desktop-home=true]');const shelf=home?.querySelector('[data-workspace-app-shelf=true]');const title=home?.querySelector('header h1');const welcome=title?.closest('header');const shelfTitle=shelf?.querySelector('h2');const topbar=document.querySelector('header[data-mobile-home=true]');const rgb=(value)=>[...value.matchAll(/[0-9.]+/g)].slice(0,3).map(x=>Number(x[0]));return {variant:shelf?.dataset.variant,homeWidth:home?.getBoundingClientRect().width,welcomeWidth:welcome?.getBoundingClientRect().width,welcomeAboveApps:welcome?.getBoundingClientRect().bottom<=shelf?.getBoundingClientRect().top+3,heroColor:rgb(getComputedStyle(title).color),appsHeadingColor:rgb(getComputedStyle(shelfTitle).color),topbarColor:rgb(getComputedStyle(topbar).backgroundColor),overflow:document.documentElement.scrollWidth-innerWidth}})()");
      const white=arr=>Array.isArray(arr)&&arr.length===3&&arr.every(v=>v>=220);
      const dark=arr=>Array.isArray(arr)&&arr.length===3&&arr.every(v=>v<100);
      if(visual.variant!=='os'||visual.welcomeWidth<visual.homeWidth*.91
        ||!visual.welcomeAboveApps||!white(visual.heroColor)
        ||!white(visual.appsHeadingColor)||!dark(visual.topbarColor)
        ||visual.overflow>3){
        throw Error('Workspace OS desktop contrast/layout regression '+JSON.stringify(visual));
      }
      console.log('Workspace OS home contrast QA '+JSON.stringify(visual));
    }
    const favorite=await cdp.run("(()=>{const open=document.querySelector('[data-workspace-app-shelf=true] nav button[aria-label^=\"Abrir \"]');const pin=open.parentElement.querySelector('button[aria-pressed]');if(!pin)throw Error('App favorite control missing');const result={name:open.getAttribute('aria-label'),before:pin.getAttribute('aria-pressed')};pin.click();return result})()");
    const opposite=favorite.before==='true'?'false':'true';
    const pinCheck="(()=>{const app=[...document.querySelectorAll('[data-workspace-app-shelf=true] nav button[aria-label^=\"Abrir \"]')].find(b=>b.getAttribute('aria-label')==="+JSON.stringify(favorite.name)+");return app?.parentElement.querySelector('button[aria-pressed]')?.getAttribute('aria-pressed')})()";
    await until(()=>cdp.run(pinCheck).then(x=>x===opposite),{label:'OS app favorite toggle '+width});
    await cdp.send('Page.navigate',{url:origin+'/'});
    await until(()=>cdp.run(pinCheck).then(x=>x===opposite),{label:'OS app favorite persistence '+width});
    await cdp.run("(()=>{const app=[...document.querySelectorAll('[data-workspace-app-shelf=true] nav button[aria-label^=\"Abrir \"]')].find(b=>b.getAttribute('aria-label')==="+JSON.stringify(favorite.name)+");app.parentElement.querySelector('button[aria-pressed]').click();return true})()");
    await until(()=>cdp.run(pinCheck).then(x=>x===favorite.before),{label:'OS favorite restored '+width});
    const category=await cdp.run("(()=>{const group=document.querySelector('[data-workspace-app-shelf=true] [role=group][aria-label=\"Filtrar aplicaciones por área\"]');const button=[...group?.querySelectorAll('button[aria-pressed=false]')||[]].find(b=>!b.textContent.includes('Favoritas'));if(!button)return null;button.click();return button.textContent.trim()})()");
    if(category){
      await until(()=>cdp.run("(()=>{const group=document.querySelector('[data-workspace-app-shelf=true] [role=group][aria-label=\"Filtrar aplicaciones por área\"]');return [...group?.querySelectorAll('button[aria-pressed=true]')||[]].some(b=>b.textContent.trim()==="+JSON.stringify(category)+")})()"),
        {label:'OS app category filter '+width});
      await cdp.run("(()=>{const group=document.querySelector('[data-workspace-app-shelf=true] [role=group][aria-label=\"Filtrar aplicaciones por área\"]');const all=[...group.querySelectorAll('button')].find(b=>b.textContent.includes('Todas'));if(!all)throw Error('All categories button missing');all.click();return true})()");
    }
    // Preserve the upstream #565 desktop app-library dialog coverage.
    if(width===1440){
      await cdp.run("(()=>{const dock=document.querySelector('[data-business-os-dock] button[aria-label=\"Ver todas las aplicaciones\"]');if(!dock)throw Error('Desktop OS library trigger missing');dock.click();return true})()");
      await until(()=>cdp.run("Boolean(document.querySelector('#os-apps-title'))"),{label:'Desktop OS app library '+width});
      await cdp.run("(()=>{const close=document.querySelector('button[aria-label=\"Cerrar biblioteca de aplicaciones\"]');if(!close)throw Error('Desktop OS library close missing');close.click();return true})()");
      await until(()=>cdp.run("!document.querySelector('#os-apps-title')"),{label:'Desktop OS app library closed '+width});
    }
    const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    await writeFile(path.join(outDir,width+'-os-app-shelf.png'),Buffer.from(shot.data,'base64'));
    const launched=await cdp.run("(()=>{const button=document.querySelector('[data-workspace-app-shelf=true] nav button[aria-label^=\"Abrir \"]');if(!button)throw Error('No launchable app');const label=button.getAttribute('aria-label');button.click();return label})()");
    await until(()=>cdp.run("location.pathname!=='/'"),{label:'OS app launch '+width});
    const destination=await cdp.run("location.pathname");
    osShelfJourneys.push({width,apps:initial.apps,favoritesPersisted:true,
      categoryFilter:Boolean(category),launched,destination,overflow:initial.overflow});
    console.log('Workspace OS app shelf QA '+JSON.stringify(osShelfJourneys.at(-1)));
  }

  // Wallpaper Studio must open, save a preset and restore it after page reload.
  for(const width of [390,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<760});
    await cdp.send('Page.navigate',{url:origin+'/'});
    await until(()=>cdp.run("Boolean(document.querySelector(':is([data-business-os-desktop-home],[data-business-os-pocket-home]) button'))"),{label:'OS home '+width});
    await cdp.run("(()=>{const open=[...document.querySelectorAll(':is([data-business-os-desktop-home],[data-business-os-pocket-home]) button')].find(b=>(b.getAttribute('aria-label')==='Personalizar escritorio'||b.textContent.includes('Personalizar escritorio')));if(!open)throw Error('Wallpaper trigger missing');open.click();return true})()");
    await until(()=>cdp.run("Boolean(document.querySelector('[role=\"dialog\"][aria-labelledby=\"os-wallpaper-heading\"]'))"),{label:'Wallpaper modal '+width});
    const selected=await cdp.run("(()=>{const root=document.querySelector('[role=\"dialog\"][aria-labelledby=\"os-wallpaper-heading\"]');const options=[...root.querySelectorAll('button[aria-pressed]')];if(options.length<2)throw Error('Wallpaper choices missing');const choice=options.find(b=>b.getAttribute('aria-pressed')==='false')||options[0];const label=choice.textContent.trim();choice.click();return label})()");
    // A real user makes two distinct clicks. Wait for React to commit the
    // selected draft before clicking Apply; one CDP evaluate would otherwise
    // trigger both onClick handlers against the old render closure.
    await until(()=>cdp.run("(()=>{const root=document.querySelector('[role=\"dialog\"][aria-labelledby=\"os-wallpaper-heading\"]');const active=[...root?.querySelectorAll('button[aria-pressed=true]')||[]].find(b=>b.textContent.trim()==="+JSON.stringify(selected)+");return !!active})()"),
      {label:'Wallpaper draft selected '+width});
    await cdp.run("(()=>{const root=document.querySelector('[role=\"dialog\"][aria-labelledby=\"os-wallpaper-heading\"]');const apply=[...root.querySelectorAll('button')].find(b=>/^(Aplicar fondo|Guardar fondo y cerrar)$/.test(b.textContent.trim()));if(!apply)throw Error('Wallpaper apply missing');apply.click();return true})()");
    await until(()=>cdp.run("!document.querySelector('[role=\"dialog\"][aria-labelledby=\"os-wallpaper-heading\"]')"),{label:'Wallpaper saved '+width});
    await cdp.send('Page.navigate',{url:origin+'/'});
    await until(()=>cdp.run("Boolean(document.querySelector(':is([data-business-os-desktop-home],[data-business-os-pocket-home]) button'))"),{label:'OS home restored '+width});
    await cdp.run("(()=>{const open=[...document.querySelectorAll(':is([data-business-os-desktop-home],[data-business-os-pocket-home]) button')].find(b=>(b.getAttribute('aria-label')==='Personalizar escritorio'||b.textContent.includes('Personalizar escritorio')));open.click();return true})()");
    await until(()=>cdp.run("Boolean(document.querySelector('[role=\"dialog\"][aria-labelledby=\"os-wallpaper-heading\"]'))"),{label:'Wallpaper reopened '+width});
    const persisted=await cdp.run("(()=>{const root=document.querySelector('[role=\"dialog\"][aria-labelledby=\"os-wallpaper-heading\"]');const choice=[...root.querySelectorAll('button[aria-pressed]')].find(b=>b.getAttribute('aria-pressed')==='true');const name=choice?.textContent.trim()||null;root.querySelector('button[aria-label=\"Cerrar Wallpaper Studio\"]')?.click();return {name,overflow:document.documentElement.scrollWidth-innerWidth}})()");
    if(persisted.name!==selected||persisted.overflow>3)
      throw Error('OS wallpaper persistence regression '+JSON.stringify({width,selected,persisted}));
    console.log('Workspace OS wallpaper browser QA '+JSON.stringify({width,selected,persisted}));
  }

  // Universal Workspace OS replaced the classic dual-column ERP shell.
  // Verify a centered application window, hidden legacy tool rail and no
  // horizontal clipping in both desktop widths.
  const desktopSpacing=[];
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});
  for(const width of [1280,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const route of [{slug:'compras',url:'/compras/recepciones'},{slug:'crm',url:'/crm'}]){
      await cdp.send('Page.navigate',{url:origin+route.url});
      await until(()=>cdp.run("location.pathname==="+JSON.stringify(route.url)+"&&Boolean(document.querySelector('[data-os-application-window=true]'))"),
        {label:route.slug+' desktop OS window'});
      await sleep(220);
      const metrics=await cdp.run(`(()=>{
        const main=document.querySelector('main[data-scroll-owner="workspace"]');
        const tools=document.querySelector('aside[aria-label="Herramientas de espacio de trabajo"]');
        const win=document.querySelector('[data-os-application-window=true]');
        const shell=document.querySelector('[data-responsive-shell=true]');
        const wallpaper=document.querySelector('[class*="_osWallpaper_"]');
        if(!main||!tools||!win||!shell)return {error:'Missing workspace window or OS shell'};
        const a=main.getBoundingClientRect(),b=win.getBoundingClientRect();
        return {width:innerWidth,route:location.pathname,
          windowWidth:Math.round(b.width),mainWidth:Math.round(a.width),
          centered:Math.abs(b.left-(innerWidth-b.right))<=45,
          windowVisible:b.left>=0&&b.right<=innerWidth+3,
          toolsHidden:getComputedStyle(tools).display==='none',
          wallpaperVisible:!!wallpaper&&getComputedStyle(wallpaper).display!=='none',
          osApp:shell.getAttribute('data-os-app'),
          overflow:document.documentElement.scrollWidth-innerWidth};
      })()`);
      if(metrics.error||!metrics.windowVisible||!metrics.centered||!metrics.toolsHidden
        ||!metrics.wallpaperVisible||metrics.osApp!=='true'||metrics.overflow>3){
        throw Error('Desktop OS canvas and window geometry regression: '+JSON.stringify(metrics));
      }
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      await writeFile(path.join(outDir,width+'-'+route.slug+'-window.png'),Buffer.from(shot.data,'base64'));
      desktopSpacing.push(metrics);
      console.log('Desktop OS window geometry: '+JSON.stringify(metrics));
    }
  }

  // Workspace OS applications deliberately hide the classic right tool
  // rail. Validate their own full-width windows separately from legacy ERP.
  const osApplicationWindows=[];
  for(const width of [1280,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{
      width,height:900,deviceScaleFactor:1,mobile:false
    });
    for(const route of [{slug:'catalogo',url:'/inventario/productos'},{slug:'ventas',url:'/ventas'}]){
      await cdp.send('Page.navigate',{url:origin+route.url});
      await until(()=>cdp.run("Boolean(document.querySelector('[data-os-application-window=true]'))"),
        {label:route.slug+' OS application window'});
      await sleep(350);
      const layout=await cdp.run("(()=>{const shell=document.querySelector('[data-responsive-shell=true]');const main=document.querySelector('main[data-scroll-owner=workspace]');const win=document.querySelector('[data-os-application-window=true]');const tools=document.querySelector('aside[aria-label=\"Herramientas de espacio de trabajo\"]');const rect=win.getBoundingClientRect(),mainRect=main.getBoundingClientRect();return {route:location.pathname,width:innerWidth,osMode:shell?.getAttribute('data-os-screen'),windowWidth:Math.round(rect.width),mainWidth:Math.round(mainRect.width),rightRailHidden:!!tools&&getComputedStyle(tools).display==='none',overflow:document.documentElement.scrollWidth-innerWidth}})()");
      if(!layout.rightRailHidden||layout.windowWidth<layout.mainWidth*.6
         ||layout.overflow>3||layout.windowWidth<500
         ||!['sales','inventory'].includes(layout.osMode)){
        throw Error('OS application desktop window regression: '+JSON.stringify({width,...layout}));
      }
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      await writeFile(path.join(outDir,width+'-'+route.slug+'-os-window.png'),Buffer.from(shot.data,'base64'));
      osApplicationWindows.push(layout);
      console.log('Workspace OS application desktop QA '+JSON.stringify(layout));
    }
  }

  // Multiwindow contract: exercise real dock navigation, live component trees,
  // minimize, restore, close and Show Desktop without a full-page reload.
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await cdp.send('Page.navigate',{url:origin+'/ventas'});
  await until(()=>cdp.run("document.querySelector('[data-os-window-stage]')?.dataset.osWindowCount==='1'"),{label:"first OS window"});
  // #804: Apps is the first dock action and opens the same accessible React
  // launcher used by the desktop Home audit, not the removed native drawer.
  await cdp.run("(()=>{const dock=document.querySelector('[data-business-os-dock]');const b=dock?.querySelector('button[data-os-app-launcher=true]');if(!b||dock.querySelector('button')!==b)throw Error('Apps must be first in desktop dock');b.click();return true})()");
  const desktopDrawer='#business-os-app-launcher[role="dialog"][aria-labelledby="os-apps-title"]';
  await until(()=>cdp.run(`Boolean(document.querySelector('${desktopDrawer} [data-workspace-app-shelf=true]'))`),{label:"ERP desktop app library opens"});
  // Only expand if the current catalog actually offers an expansion control.
  await cdp.run(`(()=>{const root=document.querySelector('${desktopDrawer}');root?.querySelector('button[aria-expanded="false"][aria-controls="workspace-app-grid"]')?.click();return true})()`);
  await until(()=>cdp.run(`Boolean(document.querySelector('${desktopDrawer} button[aria-label="Abrir Compras"]'))`),{label:"Purchases available in desktop app library"});
  await cdp.run(`(()=>{const b=document.querySelector('${desktopDrawer} button[aria-label="Abrir Compras"]');if(!b)throw Error('Purchases app not available to current user');b.click();return true})()`);
  await until(()=>cdp.run("location.pathname==='/compras/solicitudes' && document.querySelector('[data-os-window-stage]')?.dataset.osWindowCount==='2'"),{label:"two simultaneous windows"});
  const multiOpen=await cdp.run("(()=>{const stage=document.querySelector('[data-os-window-stage]');const nodes=[...stage.querySelectorAll('[data-os-window-slot]')];const front=stage.querySelector('[data-os-window-active=true]');return {count:nodes.length,live:nodes.every(n=>Boolean(n.querySelector('[data-ux-v19-route]'))),keys:nodes.map(n=>n.dataset.osWindowSlot),visible:nodes.every(n=>getComputedStyle(n).display!=='none'),active:nodes.filter(n=>n.dataset.osWindowActive==='true').length,stageHeight:Math.round(stage.getBoundingClientRect().height),windowHeight:Math.round(front?.getBoundingClientRect().height||0),chromeRows:Number(document.querySelector('.workspace,[class*=\"_workspace_\"]')?.dataset.workspaceChromeRows||0),duplicatePinned:!!document.querySelector('[data-business-os-dock] [role=group][aria-label=\"Ventanas abiertas\"]'),overflow:document.documentElement.scrollWidth-innerWidth}})()");
  if(multiOpen.count!==2||!multiOpen.live||!multiOpen.visible||multiOpen.active!==1||multiOpen.overflow>3||multiOpen.stageHeight<400||multiOpen.windowHeight<300||multiOpen.chromeRows!==2||multiOpen.duplicatePinned||!multiOpen.keys.includes('sales')||!multiOpen.keys.includes('procurement')) throw Error('OS simultaneous windows regression: '+JSON.stringify(multiOpen));
  const stackShot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  await writeFile(path.join(outDir,'1440-os-multiwindow-stacked.png'),Buffer.from(stackShot.data,'base64'));
  await cdp.run("(()=>{const b=document.querySelector('[data-business-os-dock] button[data-os-running-app=sales]');if(!b)throw Error('Running Sales button missing');b.click();return true})()");
  await until(()=>cdp.run("location.pathname==='/ventas'&&document.querySelector('[data-os-window-slot=sales]')?.dataset.osWindowActive==='true'"),{label:"focus Sales window"});
  await cdp.run("(()=>{const b=document.querySelector('[data-os-window-slot=sales] button[aria-label^=\"Minimizar\"]');if(!b)throw Error('Minimize button missing');b.click();return true})()");
  await until(()=>cdp.run("location.pathname==='/compras/solicitudes'&&document.querySelector('[data-os-window-slot=sales]')?.dataset.osWindowMinimized==='true'"),{label:"minimize Sales"});
  const minimized=await cdp.run("(()=>{const n=document.querySelector('[data-os-window-slot=sales]');return {mounted:!!n?.querySelector('[data-ux-v19-route]'),hidden:getComputedStyle(n).display==='none',count:document.querySelector('[data-os-window-stage]')?.dataset.osWindowCount}})()");
  if(!minimized.mounted||!minimized.hidden||minimized.count!=='2')throw Error('Minimize lost a live window: '+JSON.stringify(minimized));
  await cdp.run("(()=>{const b=document.querySelector('[data-business-os-dock] button[data-os-running-app=sales]');if(!b)throw Error('Restore button missing');b.click();return true})()");
  await until(()=>cdp.run("location.pathname==='/ventas'&&document.querySelector('[data-os-window-slot=sales]')?.dataset.osWindowMinimized==='false'"),{label:"restore Sales"});
  await cdp.run("(()=>{const b=document.querySelector('[data-os-window-slot=sales] button[aria-label^=\"Cerrar\"]');if(!b)throw Error('Close button missing');b.click();return true})()");
  await sleep(350);
  const afterClose=await cdp.run("(()=>{const stage=document.querySelector('[data-os-window-stage]');return {path:location.pathname,count:stage?.dataset.osWindowCount,active:stage?.querySelector('[data-os-window-active=true]')?.dataset.osWindowSlot,showDesktop:stage?.dataset.osShowDesktop,windows:[...stage?.querySelectorAll('[data-os-window-slot]')||[]].map(n=>({key:n.dataset.osWindowSlot,minimized:n.dataset.osWindowMinimized,display:getComputedStyle(n).display})),url:location.href}})()");
  console.log('OS_CLOSE_DIAGNOSTIC '+JSON.stringify(afterClose));
  await until(()=>cdp.run("location.pathname==='/compras/solicitudes'&&document.querySelector('[data-os-window-stage]')?.dataset.osWindowCount==='1'"),{label:"close Sales only"});
  await sleep(450);
  const noZombie=await cdp.run("(()=>{const stage=document.querySelector('[data-os-window-stage]');const panel=stage?.querySelector('[data-os-window-slot=procurement]');return {path:location.pathname,count:stage?.dataset.osWindowCount,salesPresent:!!stage?.querySelector('[data-os-window-slot=sales]'),active:panel?.dataset.osWindowActive,stageHeight:Math.round(stage?.getBoundingClientRect().height||0),panelHeight:Math.round(panel?.getBoundingClientRect().height||0)}})()");
  if(noZombie.path!=='/compras/solicitudes'||noZombie.count!=='1'||noZombie.salesPresent||noZombie.active!=='true'||noZombie.stageHeight<400||noZombie.panelHeight<250){
    throw Error('OS stale route resurrected closed sales window: '+JSON.stringify(noZombie));
  }
  console.log('WORKSPACE_CLOSE_NO_ZOMBIE_QA '+JSON.stringify(noZombie));
  await cdp.run("(()=>{const a=document.querySelector('[data-business-os-dock] a[aria-label=\"Escritorio\"]');if(!a)throw Error('Desktop button missing');a.click();return true})()");
  await until(()=>cdp.run("location.pathname==='/'&&document.querySelector('[data-os-window-stage]')?.dataset.osShowDesktop==='true'"),{label:"show OS desktop"});
  await cdp.run("(()=>{const b=document.querySelector('[data-business-os-dock] button[data-os-running-app=procurement]');if(!b)throw Error('Running purchases missing');b.click();return true})()");
  await until(()=>cdp.run("location.pathname==='/compras/solicitudes'&&document.querySelector('[data-os-window-stage]')?.dataset.osShowDesktop==='false'"),{label:"resume purchases window"});
  console.log('WORKSPACE_MULTIWINDOW_QA '+JSON.stringify({multiOpen,minimized,restored:true,closedOne:true,desktopRestore:true}));
  // A business module is an OS app with its own identity and section hierarchy.
  // Navigate between Finance sections without unmounting its live window.
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await cdp.send('Page.navigate',{url:origin+'/finanzas/cuentas-por-pagar'});
  await until(()=>cdp.run("Boolean(document.querySelector('[data-os-app-surface=finance]'))"),
    {label:'Finance native app identity'});
  const financeApp=await cdp.run("(()=>{const app=document.querySelector('[data-os-app-surface=finance]');const win=app?.closest('[data-os-application-window]');const links=[...app?.querySelectorAll('nav[aria-label=\"Secciones de Finanzas\"] a')||[]];return {key:win?.dataset.osAppIdentity,section:app?.dataset.osActiveSection,sections:links.length,selected:links.find(x=>x.getAttribute('aria-current')==='page')?.getAttribute('href'),accent:app?getComputedStyle(app).getPropertyValue('--os-app-accent').trim():null,windowHeight:Math.round(win?.getBoundingClientRect().height||0)}})()");
  if(financeApp.key!=='finance'||financeApp.section!=='/finanzas/cuentas-por-pagar'
     ||financeApp.sections<7||financeApp.selected!=='/finanzas/cuentas-por-pagar'
     ||financeApp.accent!=='#4c57aa'||financeApp.windowHeight<250)
    throw Error('Finance OS app hierarchy regression: '+JSON.stringify(financeApp));
  const financeImage=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  await writeFile(path.join(outDir,'1440-finance-app-identity.png'),Buffer.from(financeImage.data,'base64'));
  await cdp.run("(()=>{const link=document.querySelector('[data-os-app-surface=finance] a[href=\"/finanzas/cuentas-por-cobrar\"]');if(!link)throw Error('Finance section link missing');link.click();return true})()");
  await until(()=>cdp.run("location.pathname==='/finanzas/cuentas-por-cobrar'&&document.querySelector('[data-os-app-surface=finance] a[aria-current=page]')?.getAttribute('href')==='/finanzas/cuentas-por-cobrar'"),
    {label:'Finance app section navigation'});
  console.log('WORKSPACE_APP_HIERARCHY_QA '+JSON.stringify({...financeApp,sectionNavigation:true}));

  // Suppliers OS: browser checks real shared explorer, tenant-scoped UI
  // and existing create/detail drawers. No supplier data is ever mutated.
  for(const width of [320,390,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<760});
    await cdp.send('Page.navigate',{url:origin+'/compras/proveedores'});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-os-suppliers=true] [data-os-suppliers-workspace=true] [data-workspace-os-record-explorer=true]'))"),
      {label:'Suppliers OS rendered '+width});
    const summary=await cdp.run("(()=>{const root=document.querySelector('[data-os-suppliers=true]');const explorer=root?.querySelector('[data-workspace-os-record-explorer=true]');const win=document.querySelector('[data-os-application-window=true]');const list=explorer?.querySelector('nav[aria-label^=\"Registros de\"]');const detail=explorer?.querySelector('section[aria-label^=\"Detalle de\"]');return {route:location.pathname,mode:document.querySelector('[data-responsive-shell=true]')?.dataset.osScreen,window:!!win,search:!!explorer?.querySelector('input[type=search]'),statusFilter:!!explorer?.querySelector('select[aria-label=\"Filtrar proveedores por estado\"]'),listVisible:!!list&&getComputedStyle(list).display!=='none',detailVisible:!!detail&&getComputedStyle(detail).display!=='none',records:list?.querySelectorAll('button[data-selected]').length||0,newSupplier:[...root?.querySelectorAll('button')||[]].some(b=>b.textContent.includes('Nuevo proveedor')),overflow:document.documentElement.scrollWidth-innerWidth}})()");
    if(summary.route!=='/compras/proveedores'||summary.mode!=='procurement'
      ||!summary.window||!summary.search||!summary.statusFilter||!summary.listVisible
      ||!summary.newSupplier||(width<760&&summary.detailVisible)
      ||(width>=760&&!summary.detailVisible)||summary.overflow>3){
      throw Error('Suppliers OS layout regression '+JSON.stringify({width,...summary}));
    }
    if(summary.records){
      await cdp.run("(()=>{document.querySelector('[data-os-suppliers=true] nav[aria-label^=\"Registros de\"] button[data-selected]')?.click();return true})()");
      await until(()=>cdp.run("document.querySelector('[data-os-suppliers=true] [data-workspace-os-record-explorer=true]')?.dataset.mobileDetail==='true'"),
        {label:'Suppliers OS select detail '+width});
      if(width<760){
        const panes=await cdp.run("(()=>{const exp=document.querySelector('[data-os-suppliers=true] [data-workspace-os-record-explorer=true]');return {list:getComputedStyle(exp.querySelector('nav[aria-label^=\"Registros de\"]')).display,detail:getComputedStyle(exp.querySelector('section[aria-label^=\"Detalle de\"]')).display}})()");
        if(panes.list!=='none'||panes.detail==='none')
          throw Error('Pocket OS suppliers detail regression '+JSON.stringify({width,...panes}));
      }
      await cdp.run("(()=>{const b=[...document.querySelectorAll('[data-os-suppliers-workspace=true] button')].find(x=>x.textContent.includes('Ver ficha completa'));if(!b)throw Error('Supplier full detail action missing');b.click();return true})()");
      await until(()=>cdp.run("Boolean(document.querySelector('[data-ux-v19=\"entity-drawer\"] [role=\"dialog\"]'))"),
        {label:'Suppliers existing full detail drawer '+width});
      await cdp.run("(()=>{document.querySelector('[data-ux-v19=\"entity-drawer\"] [role=\"dialog\"] button[aria-label=\"Cerrar\"]')?.click();return true})()");
      await until(()=>cdp.run("!document.querySelector('[data-ux-v19=\"entity-drawer\"]')"),
        {label:'Supplier detail drawer dismissed '+width});
      if(width<760){
        await cdp.run("(()=>{document.querySelector('[data-os-suppliers=true] button[aria-label^=\"Volver a registros de\"]')?.click();return true})()");
        await until(()=>cdp.run("document.querySelector('[data-os-suppliers=true] [data-workspace-os-record-explorer=true]')?.dataset.mobileDetail==='false'"),
          {label:'Supplier Pocket OS back to list '+width});
      }
    }
    const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    await writeFile(path.join(outDir,width+'-procurement-os-suppliers.png'),Buffer.from(shot.data,'base64'));
    await cdp.run("(()=>{const b=[...document.querySelectorAll('[data-os-suppliers=true] button')].find(x=>x.textContent.includes('Nuevo proveedor'));if(!b)throw Error('Supplier new action missing');b.click();return true})()");
    await until(()=>cdp.run("Boolean(document.querySelector('#supplier-drawer-form'))"),
      {label:'Supplier existing creation form '+width});
    await cdp.run("(()=>{document.querySelector('[data-ux-v19=\"entity-drawer\"] button[aria-label=\"Cerrar\"]')?.click();return true})()");
    await until(()=>cdp.run("!document.querySelector('#supplier-drawer-form')"),
      {label:'Supplier form dismissed '+width});
    console.log('Suppliers OS browser QA '+JSON.stringify({width,...summary,formOpened:true,detailChecked:summary.records>0}));
  }

  // Procurement Orders OS: desktop master/detail and native single-pane phone flow.
  // This browser audit never creates, issues or receives a purchase order.
  for(const width of [320,390,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<760});
    await cdp.send('Page.navigate',{url:origin+'/compras/ordenes'});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-os-purchase-orders=true] [data-workspace-os-record-explorer=true]'))"),
      {label:'Purchase Orders OS rendered '+width});
    const snapshot=await cdp.run("(()=>{const root=document.querySelector('[data-os-purchase-orders=true]');const explorer=root?.querySelector('[data-workspace-os-record-explorer=true]');const shell=document.querySelector('[data-responsive-shell=true]');const win=document.querySelector('[data-os-application-window=true]');const list=explorer?.querySelector('nav[aria-label^=\"Registros de\"]');const detail=explorer?.querySelector('section[aria-label^=\"Detalle de\"]');return {route:location.pathname,mode:shell?.dataset.osScreen,window:!!win,listVisible:!!list&&getComputedStyle(list).display!=='none',detailVisible:!!detail&&getComputedStyle(detail).display!=='none',search:!!explorer?.querySelector('input[type=search]'),filter:!!explorer?.querySelector('select[aria-label=\"Filtrar órdenes por estado\"]'),records:list?.querySelectorAll('button[data-selected]').length||0,overflow:document.documentElement.scrollWidth-innerWidth}})()");
    if(snapshot.route!=='/compras/ordenes'||snapshot.mode!=='procurement'
      ||!snapshot.window||!snapshot.listVisible||!snapshot.search||!snapshot.filter
      ||(width<760&&snapshot.detailVisible)||(!snapshot.detailVisible&&width>=760)
      ||snapshot.overflow>3){
      throw Error('Purchase Orders OS layout regression '+JSON.stringify({width,...snapshot}));
    }
    if(snapshot.records){
      await cdp.run("(()=>{const b=document.querySelector('[data-os-purchase-orders=true] nav[aria-label^=\"Registros de\"] button[data-selected]');if(!b)throw Error('Order list control missing');b.click();return true})()");
      await until(()=>cdp.run("document.querySelector('[data-os-purchase-orders=true] [data-workspace-os-record-explorer=true]')?.dataset.mobileDetail==='true'"),
        {label:'Purchase Orders OS select detail '+width});
      if(width<760){
        const panes=await cdp.run("(()=>{const exp=document.querySelector('[data-os-purchase-orders=true] [data-workspace-os-record-explorer=true]');return {list:getComputedStyle(exp.querySelector('nav[aria-label^=\"Registros de\"]')).display,detail:getComputedStyle(exp.querySelector('section[aria-label^=\"Detalle de\"]')).display}})()");
        if(panes.list!=='none'||panes.detail==='none')
          throw Error('Purchase Orders Pocket detail regression '+JSON.stringify({width,...panes}));
        await cdp.run("(()=>{const b=document.querySelector('[data-os-purchase-orders=true] button[aria-label^=\"Volver a registros de\"]');if(!b)throw Error('Order list back control missing');b.click();return true})()");
        await until(()=>cdp.run("document.querySelector('[data-os-purchase-orders=true] [data-workspace-os-record-explorer=true]')?.dataset.mobileDetail==='false'"),
          {label:'Purchase Orders Pocket back to list '+width});
      }
    }
    const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    await writeFile(path.join(outDir,width+'-procurement-os-orders.png'),Buffer.from(shot.data,'base64'));
    await cdp.run("(()=>{const b=[...document.querySelectorAll('[data-os-purchase-orders=true] button')].find(x=>x.textContent.includes('Nueva orden'));if(!b)throw Error('Existing new order action missing');b.click();return true})()");
    await until(()=>cdp.run("Boolean(document.querySelector('button[aria-label=\"Cerrar formulario de orden\"]'))"),
      {label:'Purchase Orders existing creation form '+width});
    await cdp.run("(()=>{document.querySelector('button[aria-label=\"Cerrar formulario de orden\"]')?.click();return true})()");
    await until(()=>cdp.run("!document.querySelector('button[aria-label=\"Cerrar formulario de orden\"]')"),
      {label:'Purchase Orders creation form dismissed '+width});
    console.log('Purchase Orders OS browser QA '+JSON.stringify({width,...snapshot,formOpened:true,detailChecked:snapshot.records>0}));
  }

  // Procurement OS v1: verify the actual migrated route at phone and desktop
  // sizes. Mutations are not sent: the browser exercises existing form and
  // detail dialogs without altering tenant or transactional data.
  for(const width of [320,390,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{
      width,height:900,deviceScaleFactor:1,mobile:width<760
    });
    await cdp.send('Page.navigate',{url:origin+'/compras/solicitudes'});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-os-procurement-requests=true]'))"),
      {label:'Procurement OS requests rendered '+width});
    const layout=await cdp.run("(()=>{const shell=document.querySelector('[data-responsive-shell=true]');const root=document.querySelector('[data-os-procurement-requests=true]');const split=root?.querySelector('[data-os-workspace-split=true]');const win=document.querySelector('[data-os-application-window=true]');const tools=document.querySelector('aside[aria-label=\"Herramientas de espacio de trabajo\"]');return {route:location.pathname,osMode:shell?.getAttribute('data-os-screen'),window:!!win,split:!!split,search:!!root?.querySelector('[data-os-workspace-search=true] input'),newButton:[...root?.querySelectorAll('button')||[]].some(b=>b.textContent.includes('Nueva solicitud')),railHidden:!!tools&&getComputedStyle(tools).display==='none',overflow:document.documentElement.scrollWidth-innerWidth}})()");
    if(layout.route!=='/compras/solicitudes'||layout.osMode!=='procurement'
      ||!layout.window||!layout.split||!layout.search||!layout.newButton
      ||!layout.railHidden||layout.overflow>3){
      throw Error('Procurement OS layout regression '+JSON.stringify({width,...layout}));
    }
    const openCount=await cdp.run("document.querySelectorAll('[data-os-procurement-requests] button[aria-label^=\"Ver solicitud \"]').length");
    if(openCount){
      await cdp.run("(()=>{document.querySelector('[data-os-procurement-requests] button[aria-label^=\"Ver solicitud \"]').click();return true})()");
      await until(()=>cdp.run("document.querySelector('[data-os-procurement-requests]')?.getAttribute('data-mobile-detail')==='true'"),
        {label:'Procurement OS record selected '+width});
      if(width<760){
        const visible=await cdp.run("(()=>{const split=document.querySelector('[data-os-procurement-requests] [data-os-workspace-split=true]');return {master:getComputedStyle(split.children[0]).display,detail:getComputedStyle(split.children[1]).display}})()");
        if(visible.master!=='none'||visible.detail==='none')
          throw Error('Pocket OS request detail regression '+JSON.stringify({width,...visible}));
      }
      await cdp.run("(()=>{const button=[...document.querySelectorAll('[data-os-procurement-requests] button')].find(b=>b.textContent.includes('Ver expediente y aprobación'));if(!button)throw Error('Existing request detail action missing');button.click();return true})()");
      await until(()=>cdp.run("Boolean(document.querySelector('[role=\"dialog\"][aria-labelledby=\"purchase-request-modal-title\"]'))"),
        {label:'Procurement existing approval detail '+width});
      await cdp.run("(()=>{document.querySelector('[role=\"dialog\"][aria-labelledby=\"purchase-request-modal-title\"] button[aria-label=\"Cerrar\"]')?.click();return true})()");
      await until(()=>cdp.run("!document.querySelector('[role=\"dialog\"][aria-labelledby=\"purchase-request-modal-title\"]')"),
        {label:'Procurement request detail dismissed '+width});
    }
    const screen=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    await writeFile(path.join(outDir,width+'-procurement-os-requests.png'),Buffer.from(screen.data,'base64'));
    await cdp.run("(()=>{const button=[...document.querySelectorAll('[data-os-procurement-requests] button')].find(b=>b.textContent.includes('Nueva solicitud'));if(!button)throw Error('New request action missing');button.click();return true})()");
    await until(()=>cdp.run("Boolean(document.querySelector('button[aria-label=\"Cerrar formulario de solicitud\"]'))"),
      {label:'Procurement existing request form '+width});
    await cdp.run("(()=>{document.querySelector('button[aria-label=\"Cerrar formulario de solicitud\"]').click();return true})()");
    await until(()=>cdp.run("!document.querySelector('button[aria-label=\"Cerrar formulario de solicitud\"]')"),
      {label:'Procurement request form dismissed '+width});
    console.log('Procurement OS browser QA '+JSON.stringify({width,...layout,visibleRecords:openCount,formOpened:true,legacyDetailOpened:openCount>0}));
  }

  // Calendar editor must keep header and actions visible, even at short heights.
  for(const [width,height] of [[320,640],[390,700],[1024,600],[1440,640],[1920,900]]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<760});
    await cdp.send('Page.navigate',{url:origin+'/agenda'});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-os-app-surface=agenda] button'))"),{label:'Calendar route '+width});
    const checkEditor=async(label)=>{
      await cdp.run("(()=>{const button=[...document.querySelectorAll('[data-os-app-surface=agenda] button')].find(b=>b.textContent.trim()==='Nuevo evento');if(!button)throw Error('New event button missing');button.click();return true})()");
      await until(()=>cdp.run("Boolean(document.querySelector('dialog[open][aria-label=\"Nuevo evento\"]'))"),{label:'Calendar editor '+label});
      const bounds=await cdp.run(`(()=>{
        const dialog=document.querySelector('dialog[open][aria-label="Nuevo evento"]');
        const header=dialog.querySelector('header');
        const footer=dialog.querySelector('footer');
        const action=[...footer.querySelectorAll('button')].find(b=>b.textContent.includes('Crear evento'));
        const outer=dialog.getBoundingClientRect();
        const visible=e=>{if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top>=Math.max(0,outer.top)-2&&r.bottom<=Math.min(innerHeight,outer.bottom)+2&&r.left>=Math.max(0,outer.left)-2&&r.right<=Math.min(innerWidth,outer.right)+2};
        const app=dialog.closest('[data-os-application-window]');
        const rect=app?.getBoundingClientRect();
        const title=app?.querySelector(':scope > header')?.getBoundingClientRect();
        const workspace=app?.closest('[data-scroll-owner="workspace"]')?.getBoundingClientRect();
        const panel=dialog.querySelector('[data-event-editor-panel]').getBoundingClientRect();
        const content=dialog.querySelector('[data-scroll-region="local"]');
        const desktop=innerWidth>760&&rect;
        const expected=desktop?{left:Math.max(0,rect.left,workspace?.left??0),top:Math.max(0,title?.bottom??rect.top,workspace?.top??0),right:Math.min(innerWidth,rect.right,workspace?.right??innerWidth),bottom:Math.min(innerHeight,rect.bottom,workspace?.bottom??innerHeight)}:{left:0,top:0,right:innerWidth,bottom:innerHeight};
        const aligned=['left','top','right','bottom'].every(key=>Math.abs(outer[key]-expected[key])<=3);
        const centered=Math.abs((panel.left+panel.right-outer.left-outer.right)/2)<=3&&(!desktop||Math.abs((panel.top+panel.bottom-outer.top-outer.bottom)/2)<=3);
        const buttonRect=action?.getBoundingClientRect();
        const hit=buttonRect&&document.elementFromPoint((buttonRect.left+buttonRect.right)/2,(buttonRect.top+buttonRect.bottom)/2);
        const clickable=!!hit&&action.contains(hit);
        const scrollOwner=getComputedStyle(content).overflowY==='auto'&&getComputedStyle(dialog).overflowY==='hidden';
        return {header:visible(header),footer:visible(footer),action:visible(action),aligned,centered,clickable,scrollOwner,height:outer.height};
      })()`);
      if(!bounds.header||!bounds.footer||!bounds.action||!bounds.aligned||!bounds.centered||!bounds.clickable||!bounds.scrollOwner)throw Error('Calendar editor clipping '+JSON.stringify({label,...bounds}));
      const editorHeight=await cdp.run("document.querySelector('dialog[open] [data-scroll-region=local]').scrollHeight");
      async function checkPickerPopup(kind){
        const geometry=await cdp.run(`(()=>{
          const dialog=document.querySelector('dialog[open][data-os-event-editor]');
          const popup=dialog.querySelector('[data-picker-popup][data-event-picker="'+${JSON.stringify(kind)}+'"]');
          if(!popup)return {missing:true};
          const a=dialog.getBoundingClientRect(),b=popup.getBoundingClientRect();
          const body=dialog.querySelector('[data-scroll-region=local]');
          return {directChild:popup.parentElement===dialog,position:getComputedStyle(popup).position,contained:b.width>0&&b.height>0&&b.left>=a.left-2&&b.right<=a.right+2&&b.top>=a.top-2&&b.bottom<=a.bottom+2,bodyHeight:body.scrollHeight};
        })()`);
        if(!geometry.directChild||geometry.position!=='absolute'||!geometry.contained||Math.abs(geometry.bodyHeight-editorHeight)>2)throw Error('Calendar picker popup geometry '+JSON.stringify({label,kind,...geometry,editorHeight}));
      }
      await cdp.run(`(()=>{
        const dialog=document.querySelector('dialog[open][aria-label="Nuevo evento"]');
        dialog.querySelector('[data-event-picker-trigger="startAt-date"]').click();
        return true;
      })()`);
      await until(()=>cdp.run("document.querySelectorAll('[data-event-picker=date] [data-picker-date]').length===42"),{label:'Calendar date picker '+label});
      await checkPickerPopup('date');
      await cdp.run("(()=>{document.querySelector('[data-event-picker=date] button[aria-pressed=true]').click();return true})()");
      await until(()=>cdp.run("!document.querySelector('[data-event-picker]')"),{label:'Calendar date chosen '+label});
      await cdp.run("(()=>{document.querySelector('[data-event-picker-trigger=startAt-time]').click();return true})()");
      await until(()=>cdp.run("Boolean(document.querySelector('[data-event-picker=time]'))"),{label:'Calendar time picker '+label});
      await checkPickerPopup('time');
      const pickerShot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      await writeFile(path.join(outDir,label+'-calendar-time-popup.png'),Buffer.from(pickerShot.data,'base64'));
      await cdp.run("(()=>{const picker=document.querySelector('[data-event-picker=time]');[...picker.querySelectorAll('button')].find(b=>b.textContent==='30').click();[...picker.querySelectorAll('button')].find(b=>b.textContent==='Aplicar hora').click();return true})()");
      await until(()=>cdp.run("!document.querySelector('[data-event-picker]')&&document.querySelector('[data-event-picker-trigger=startAt-time]').getAttribute('aria-label').includes(':30')&&Boolean(document.querySelector('dialog[open]'))"),{label:'Calendar time applied without saving '+label});
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      await writeFile(path.join(outDir,label+'-calendar-editor.png'),Buffer.from(shot.data,'base64'));
      await cdp.run("(()=>{document.querySelector('dialog[open] button[aria-label=\"Cerrar evento\"]').click();return true})()");
      await until(()=>cdp.run("!document.querySelector('dialog[open][aria-label=\"Nuevo evento\"]')"),{label:'Calendar editor closed '+label});
    };
    await checkEditor(width+'x'+height);
    if(width>=1181){
      await cdp.run("(()=>{const app=document.querySelector('[data-os-app-surface=agenda]').closest('[data-os-application-window]');app.querySelector('button[aria-label^=\"Organizar ventana de\"]').click();return true})()");
      await until(()=>cdp.run("Boolean(document.querySelector('button[aria-label=\"Pantalla completa\"]'))"),{label:'Calendar maximize menu'});
      await cdp.run("(()=>{document.querySelector('button[aria-label=\"Pantalla completa\"]').click();return true})()");
      await sleep(250);
      await checkEditor(width+'x'+height+'-maximized');
    }
  }

  // Reference-image regression: measure page rhythm in the five workflows
  // at a smartphone width and a desktop width, not only on the home screen.
  const moduleSpacing=[];
  const referencePages=[
    {slug:'entregas',url:'/ventas/operacion'},
    {slug:'recepciones',url:'/compras/recepciones'},
    {slug:'pos',url:'/pos'},
    {slug:'produccion',url:'/produccion'},
    {slug:'marketing',url:'/marketing'},
  ];
  for(const width of [390,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<760});
    for(const route of referencePages){
      await cdp.send('Page.navigate',{url:origin+route.url});
      await until(()=>cdp.run("Boolean(document.querySelector('main[data-scroll-owner=workspace] [data-ux-v19-route] [class*=_routeContent_] > [class*=_page_]'))"),{label:route.slug+' module layout'});
      await sleep(400);
      const space=await cdp.run(`(()=>{
        const main=document.querySelector('main[data-scroll-owner="workspace"]');
        const page=main?.querySelector('[data-ux-v19-route] [class*="_routeContent_"] > [class*="_page_"]');
        if(!main||!page) return {error:'Module root not rendered'};
        const mainStyle=getComputedStyle(main),pageStyle=getComputedStyle(page);
        const windowBody=main.querySelector('[data-os-application-window=true] > [class*="_osWindowBody_"]');
        const appBody=windowBody?.querySelector('[data-os-app-page=true]');
        const paddingOwner=appBody||windowBody;
        const windowPadding=paddingOwner?parseFloat(getComputedStyle(paddingOwner).paddingLeft):null;
        return {
          width:innerWidth,route:location.pathname,
          pageGap:parseFloat(pageStyle.rowGap),
          pageWidth:Math.round(page.getBoundingClientRect().width),
          mainWidth:Math.round(main.getBoundingClientRect().width),
          horizontalOverflow:Math.round(document.documentElement.scrollWidth-innerWidth),
          mainPadding:parseFloat(mainStyle.paddingLeft),
          windowPadding
        };
      })()`);
      if(space.error || !Number.isFinite(space.pageGap) || space.pageGap<14
         || (width>=1181?space.windowPadding<10:space.mainPadding<10)
         || space.pageWidth>space.mainWidth+4
         || space.horizontalOverflow>3){
        throw Error('Module spacing viewport regression: '+JSON.stringify(space));
      }
      if(route.slug==='marketing'||route.slug==='produccion'){
        const selector=route.slug==='marketing'?'[class*="_performanceTable_"] > button':'[class*="_schedule_"] > button';
        await until(()=>cdp.run(`Boolean(document.querySelector(${JSON.stringify(selector)}))`),{tries:80,label:route.slug+' record rows'});
        const row=await cdp.run(`(()=>{
          const element=document.querySelector(${JSON.stringify(selector)});
          const css=getComputedStyle(element);
          return {
            radius:parseFloat(css.borderTopLeftRadius),
            borderLeft:parseFloat(css.borderLeftWidth),
            borderRight:parseFloat(css.borderRightWidth),
            shadow:css.boxShadow,
            lineHeight:css.lineHeight
          };
        })()`);
        if(!Number.isFinite(row.radius)||row.radius>1||row.borderLeft>0||row.borderRight>0||row.shadow!=='none'){
          throw Error('Record row still has pill geometry: '+JSON.stringify({route:route.slug,width,...row}));
        }
        console.log('Flat record row: '+JSON.stringify({route:route.slug,width,...row}));
      }
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      await writeFile(path.join(outDir,width+'-'+route.slug+'-rhythm.png'),Buffer.from(shot.data,'base64'));
      moduleSpacing.push(space);
      console.log('Module spacing: '+JSON.stringify(space));
    }
  }
  await writeFile(path.join(outDir,'audit.json'),JSON.stringify({generatedAt:new Date().toISOString(),source:'local Vite build',screens:report,desktopSpacing,moduleSpacing,navigationJourneys},null,2));
  const failed=report.filter(r=>r.innerWidth!==r.width||r.scrollWidth>r.width+3||r.offscreen.length||r.smallTouch.length||!r.navVisible);
  console.log('Mobile browser audit: '+report.length+' screenshots at 320/360/390/430px. Screen-level findings: '+failed.length);
  // Audit is observational until human visual review has accepted screenshots.
} catch (error) {
  console.error('Mobile browser audit could not complete: '+(error.stack||error.message));
  console.error(chromiumLog.slice(-1600));
  process.exitCode=1;
} finally {
  socket?.close();
  stop();
}
