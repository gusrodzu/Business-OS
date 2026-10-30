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
  async run(js){const r=await this.send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true});if(r.exceptionDetails) throw new Error(r.exceptionDetails.text);return r.result?.value;}
}
await mkdir(outDir,{recursive:true});
const chromeBinary = process.env.CHROME_BIN || 'google-chrome';
const port = 9228;
const profile = path.join(os.tmpdir(),'buzzbee-mobile-chrome-'+process.pid);
const chrome = spawn(chromeBinary,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--hide-scrollbars','--no-first-run','--no-default-browser-check',
  '--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'
],{stdio:['ignore','pipe','pipe']});
let chromiumLog = '';
chrome.stderr.on('data',data=>{chromiumLog += data.toString().slice(-3000);});
const stop=()=>{if(!chrome.killed)chrome.kill('SIGTERM');};
process.on('exit',stop);
let socket;
try{
  await until(async()=>{const r=await fetch(origin+'/login');return r.ok;},{label:'local Vite preview'});
  await until(async()=>{const r=await fetch('http://127.0.0.1:'+port+'/json/version');return r.ok;},{label:'Chrome CDP'});
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
        const nav=document.querySelector('[data-mobile-bottom-nav]');
        const navStyle=nav&&getComputedStyle(nav);
        const body=document.body,html=document.documentElement;
        return {route:location.pathname,innerWidth:width,scrollWidth:html.scrollWidth,bodyWidth:body.scrollWidth,navVisible:Boolean(nav&&navStyle?.display!=='none'),navHeight:nav?Math.round(nav.getBoundingClientRect().height):0,smallTouch,offscreen,contentScroll:Math.round(document.querySelector('[data-responsive-shell] [class*="_content_"]')?.scrollHeight||0),heading:document.querySelector('main h1,h1')?.innerText?.slice(0,90)||null,errorVisible:Boolean(document.querySelector('[role="alert"]'))};
      })()`);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      const file=width+'-'+route.slug+'.png';
      await writeFile(path.join(outDir,file),Buffer.from(shot.data,'base64'));
      const record={width,file,...data};
      report.push(record);
      console.log(JSON.stringify(record));
    }
  }
  // Step-level screenshots at 390 px: menu open, collections entry modal, and POS after scrolling.
  const captureStep = async (slug,buttonText,clickQuery) => {
    await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await cdp.send('Page.navigate',{url:origin+(slug==='cobranza-modal'?'/ventas/cobranza':slug==='menu'||slug==='hex-actions'?'/':'/pos')});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-responsive-shell=true]'))"),{label:slug+' interactive shell'});
    await sleep(600);
    await cdp.run(clickQuery);
    await sleep(420);
    const state=await cdp.run("({modal:!!document.querySelector('[aria-modal=true]'),drawerOpen:document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open'),scrolled:document.querySelector('[data-responsive-shell] [class*=\"_content_\"]')?.scrollTop||0,hexReady:!!document.querySelector('[data-bb-hex-ui]'),hexFrequentlySelected:!![...document.querySelectorAll('[data-bb-hex-ui] button[aria-pressed]')].find(b=>b.textContent.includes('Frecuentes')&&b.getAttribute('aria-pressed')==='true')})");
    const screen=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    await writeFile(path.join(outDir,'390-'+slug+'.png'),Buffer.from(screen.data,'base64'));
    console.log(JSON.stringify({interactive:slug,label:buttonText,...state}));
    if (slug==='menu' && state.drawerOpen!=='true') throw Error('The mobile drawer did not open');
    if (slug==='cobranza-modal' && !state.modal) throw Error('Payment modal is not announced as a dialog');
    if (slug==='pos-scroll' && state.scrolled<100) throw Error('POS could not scroll to payment controls');
    if (slug==='hex-actions' && (!state.hexReady || !state.hexFrequentlySelected)) throw Error('Hexagonal action controls did not filter correctly');
  };
  await captureStep('menu','drawer de módulos',`(()=>{const b=document.querySelector('button[aria-label="Abrir navegación"]');if(!b)throw Error('Mobile menu trigger missing');b.click();return true})()`);
  await captureStep('cobranza-modal','registrar cobro',`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Registrar cobro'));if(!b)throw Error('Cobranza button missing');b.click();return true})()`);
  await captureStep('hex-actions','controles hexagonales',`(()=>{const root=document.querySelector('[data-bb-hex-ui]');if(!root)throw Error('Hex action panel missing');const frequent=[...root.querySelectorAll('button[aria-pressed]')].find(button=>button.textContent.includes('Frecuentes'));if(!frequent)throw Error('Hex frequent switch missing');frequent.click();root.scrollIntoView({block:'center'});return true})()`);
  await captureStep('pos-scroll','carrito y cobro',`(()=>{const el=document.querySelector('[data-responsive-shell] [class*="_content_"]');if(!el)throw Error('ERP content scroller missing');el.scrollTop=el.scrollHeight;return el.scrollTop})()`);

  // NAV-02 / QA-02: a rail icon opens only its module submenu.
  // Verify real navigation, browser history and mobile drawer dismissal.
  const navigationJourneys=[];
  for(const width of [390,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{
      width,height:900,deviceScaleFactor:1,mobile:width<760
    });
    await cdp.send('Page.navigate',{url:origin+'/'});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-two-level-navigation] nav[aria-label=\"Módulos principales\"]'))"),
      {label:'two-level rail '+width});
    if(width<760){
      await cdp.run(`(()=>{
        const trigger=document.querySelector('button[aria-label="Abrir navegación"]');
        if(!trigger)throw Error('Mobile drawer trigger missing');
        trigger.click();
        return true;
      })()`);
      await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='true'"),
        {label:'mobile two-level drawer '+width});
    }
    // NAV-01 / QA-02: keyboard navigation stays inside the icon rail without
    // activating modules. Check both smartphone drawer and desktop workspace.
    // Send actual CDP keyboard events rather than synthetic DOM keydown events.
    // This catches focus/scroll regressions in the browser input pipeline.
    await cdp.run(`(()=>{const rail=document.querySelector('[data-two-level-navigation] nav[aria-label="Módulos principales"]');const buttons=[...rail.querySelectorAll('button:not(:disabled)')];if(buttons.length<3)throw Error('Not enough rail modules');buttons[0].focus();return true})()`);
    const railFocus=()=>cdp.run(`(()=>{const rail=document.querySelector('[data-two-level-navigation] nav[aria-label="Módulos principales"]');const buttons=[...rail.querySelectorAll('button:not(:disabled)')];return {count:buttons.length,index:buttons.indexOf(document.activeElement),labels:buttons.every(b=>!!b.getAttribute('aria-label')),path:location.pathname}})()`);
    const keyPress=async (key,code)=>{
      // CDP needs the Enter character to reproduce native button activation.
      const params={key,code:key,windowsVirtualKeyCode:code,nativeVirtualKeyCode:code,
        ...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})};
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',...params});
      await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',...params});
    };
    const initial=await railFocus();
    await keyPress('ArrowDown',40);
    const down=(await railFocus()).index===1;
    await keyPress('End',35);
    const endFocus=(await railFocus()).index===initial.count-1;
    await keyPress('Home',36);
    const home=(await railFocus()).index===0;
    await keyPress('ArrowUp',38);
    const wrap=(await railFocus()).index===initial.count-1;
    const railKeyboard={count:initial.count,down,end:endFocus,home,wrap,labels:initial.labels,path:(await railFocus()).path,realKeyboard:true};
    if(!railKeyboard.down||!railKeyboard.end||!railKeyboard.home
      ||!railKeyboard.wrap||!railKeyboard.labels||railKeyboard.path!=='/'){
      throw Error('NAV-01 rail keyboard regression: '+JSON.stringify({width,...railKeyboard}));
    }
    console.log('NAV-01 rail keyboard QA: '+JSON.stringify({width,...railKeyboard}));
    // NAV-01: a short viewport must keep keyboard focus visibly outlined
    // and inside the independently scrolling rail, without moving the page.
    await cdp.send('Emulation.setDeviceMetricsOverride',{
      width,height:620,deviceScaleFactor:1,mobile:width<760
    });
    await cdp.run(`(()=>{
      const rail=document.querySelector('[data-two-level-navigation] nav[aria-label="Módulos principales"]');
      rail.scrollTop=0;
      rail.querySelector('button:not(:disabled)').focus();
      return true;
    })()`);
    await keyPress('End',35);
    const railEnd=await until(async()=>{
      const state=await cdp.run(`(()=>{
      const rail=document.querySelector('[data-two-level-navigation] nav[aria-label="Módulos principales"]');
      const buttons=[...rail.querySelectorAll('button:not(:disabled)')];
      const focused=document.activeElement,viewport=rail.getBoundingClientRect(),rect=focused.getBoundingClientRect();
      const style=getComputedStyle(focused);
      return {count:buttons.length,index:buttons.indexOf(focused),
        overflowing:rail.scrollHeight>rail.clientHeight+10,scrollTop:rail.scrollTop,
        visible:rect.top>=viewport.top-3&&rect.bottom<=viewport.bottom+3,
        outline:style.outlineStyle!=='none'&&parseFloat(style.outlineWidth)>=2,
        path:location.pathname,overflow:document.documentElement.scrollWidth-innerWidth};
    })()`);
      return state.index===state.count-1&&state.scrollTop>0&&state.visible&&state;
    },{label:'NAV-01 rail End focus scroll '+width});
    await keyPress('Home',36);
    const railHome=await until(async()=>{
      const state=await cdp.run(`(()=>{
      const rail=document.querySelector('[data-two-level-navigation] nav[aria-label="Módulos principales"]');
      const buttons=[...rail.querySelectorAll('button:not(:disabled)')];
      const rect=document.activeElement.getBoundingClientRect(),viewport=rail.getBoundingClientRect();
      return {index:buttons.indexOf(document.activeElement),scrollTop:rail.scrollTop,
        visible:rect.top>=viewport.top-3&&rect.bottom<=viewport.bottom+3};
    })()`);
      return state.index===0&&state.visible&&state.scrollTop<railEnd.scrollTop&&state;
    },{label:'NAV-01 rail Home focus scroll '+width});
    if(!railEnd.overflowing||railEnd.index!==railEnd.count-1||railEnd.scrollTop<=0
      ||!railEnd.visible||!railEnd.outline||railEnd.path!=='/'||railEnd.overflow>3
      ||railHome.index!==0||!railHome.visible||railHome.scrollTop>=railEnd.scrollTop){
      throw Error('NAV-01 short viewport focus/scroll regression: '+JSON.stringify({width,railEnd,railHome}));
    }
    console.log('NAV-01 short viewport focus/scroll QA: '+JSON.stringify({width,railEnd,railHome}));
    // NAV-01: on desktop the floating label follows the focused icon after
    // native End/Home scrolling and disappears if that icon is scrolled away.
    if(width===1440){
      const railTooltip=()=>cdp.run(`(()=>{
        const target=document.activeElement;
        const tip=document.querySelector('[data-two-level-navigation] [role="tooltip"]');
        const rect=target?.getBoundingClientRect();
        const expected=rect&&Math.max(30,Math.min(innerHeight-30,rect.top+rect.height/2));
        return {visible:!!tip&&getComputedStyle(tip).display!=='none',
          aligned:!!tip&&Math.abs(parseFloat(tip.style.top)-expected)<4,
          label:!!tip&&target.getAttribute('aria-label')?.includes(tip.textContent.trim())};
      })()`);
      await sleep(100);
      const homeTip=await railTooltip();
      await keyPress('End',35);
      await sleep(100);
      const endTip=await railTooltip();
      if(!homeTip.visible||!homeTip.aligned||!homeTip.label
        ||!endTip.visible||!endTip.aligned||!endTip.label){
        throw Error('NAV-01 desktop rail tooltip focus regression: '+JSON.stringify({homeTip,endTip}));
      }
      // WCAG 1.4.13: Escape dismisses the desktop hover/focus tooltip
      // without moving keyboard focus, changing routes or opening a module.
      const focusBeforeDismiss=await cdp.run(`document.activeElement?.getAttribute('aria-label')`);
      await keyPress('Escape',27);
      await sleep(100);
      const dismissedTip=await cdp.run(`(()=>{
        const tip=document.querySelector('[data-two-level-navigation] [role="tooltip"]');
        return {hidden:!tip,focus:document.activeElement?.getAttribute('aria-label'),path:location.pathname};
      })()`);
      if(!dismissedTip.hidden||dismissedTip.focus!==focusBeforeDismiss||dismissedTip.path!=='/'){
        throw Error('NAV-01 Escape tooltip dismissal regression: '+JSON.stringify(dismissedTip));
      }
      await keyPress('ArrowUp',38);
      await sleep(100);
      const restoredTip=await railTooltip();
      if(!restoredTip.visible||!restoredTip.aligned||!restoredTip.label){
        throw Error('NAV-01 rail tooltip did not return on next keyboard focus: '+JSON.stringify(restoredTip));
      }
      console.log('NAV-01 desktop Escape tooltip QA: '+JSON.stringify({dismissedTip,restoredTip}));
      await cdp.run(`(()=>{const rail=document.querySelector('[data-two-level-navigation] nav[aria-label="Módulos principales"]');rail.scrollTop=0;return true})()`);
      await sleep(100);
      const tipHidden=await cdp.run(`!document.querySelector('[data-two-level-navigation] [role="tooltip"]')`);
      if(!tipHidden)throw Error('NAV-01 rail tooltip remained visible after icon scrolled out of view');
      console.log('NAV-01 desktop rail tooltip QA: '+JSON.stringify({homeTip,endTip,tipHidden}));
      // The rail footer toggle also displays a tooltip, outside the rail nav.
      // Escape must dismiss it without collapsing the explorer or moving focus.
      const footerBefore=await cdp.run(`(()=>{
        const root=document.querySelector('[data-two-level-navigation]');
        const button=root?.querySelector('button[aria-label="Ocultar explorador"],button[aria-label="Abrir explorador"]');
        if(!button)throw Error('Rail footer toggle missing');
        button.focus();
        return {label:button.getAttribute('aria-label'),path:location.pathname};
      })()`);
      await sleep(100);
      const footerTipVisible=await cdp.run(`Boolean(document.querySelector('[data-two-level-navigation] [role="tooltip"]'))`);
      if(!footerTipVisible)throw Error('NAV-01 rail footer tooltip missing on keyboard focus');
      await keyPress('Escape',27);
      await sleep(100);
      const footerAfter=await cdp.run(`(()=>{
        const root=document.querySelector('[data-two-level-navigation]');
        return {hidden:!root.querySelector('[role="tooltip"]'),
          label:document.activeElement?.getAttribute('aria-label'),
          path:location.pathname};
      })()`);
      if(!footerAfter.hidden||footerAfter.label!==footerBefore.label||footerAfter.path!==footerBefore.path){
        throw Error('NAV-01 footer Escape tooltip dismissal regression: '+JSON.stringify({footerBefore,footerAfter}));
      }
      console.log('NAV-01 desktop footer Escape tooltip QA: '+JSON.stringify({footerBefore,footerAfter}));
    }
    await cdp.send('Emulation.setDeviceMetricsOverride',{
      width,height:900,deviceScaleFactor:1,mobile:width<760
    });
    const beforePath=await cdp.run("location.pathname");
    await cdp.run(`(()=>{
      const rail=document.querySelector('[data-two-level-navigation]');
      const button=rail?.querySelector('nav[aria-label="Módulos principales"] button[aria-label="Ver opciones de Ventas"]');
      if(!button)throw Error('Sales rail icon missing');
      button.click();
      return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[data-two-level-navigation] nav[aria-label=\"Opciones de Ventas\"] a[href=\"/ventas/cobranza\"]')) && document.querySelector('[data-two-level-navigation] nav[aria-label=\"Módulos principales\"] button[aria-label=\"Ver opciones de Ventas\"]')?.getAttribute('aria-expanded')==='true'"),
      {label:'focused Sales submenu '+width});
    const focused=await cdp.run(`(()=>{
      const root=document.querySelector('[data-two-level-navigation]');
      const icon=root.querySelector('nav[aria-label="Módulos principales"] button[aria-label="Ver opciones de Ventas"]');
      const sub=root.querySelector('nav[aria-label="Opciones de Ventas"]');
      const context=root.querySelector('[class*="_contextScroll_"]');
      return {
        path:location.pathname,
        count:sub?.querySelectorAll('a').length||0,
        expanded:icon?.getAttribute('aria-expanded'),
        onlySales:!context?.innerText.includes('Espacio de trabajo'),
        focused:!!root.querySelector('#buzzbee-focused-module'),
        overflow:Math.round(document.documentElement.scrollWidth-innerWidth)
      };
    })()`);
    if(beforePath!=='/'||focused.path!=='/'||focused.count!==5
      ||focused.expanded!=='true'||!focused.onlySales||!focused.focused||focused.overflow>3){
      throw Error('NAV-02 focused explorer regression: '+JSON.stringify({width,...focused}));
    }
    // NAV-01 / NAV-02: changing rail modules with real Enter must update
    // the contextual explorer without navigating or losing keyboard focus (mobile and desktop).
    if(width===390 || width===1440){
      if(!(await cdp.run("(()=>{const rail=document.querySelector('[data-two-level-navigation] nav[aria-label=\"Módulos principales\"]');const icon=rail?.querySelector('button[aria-label=\"Ver opciones de Inventario\"]');if(!icon)throw Error('Inventory rail icon missing');icon.focus();return document.activeElement===icon})()")))throw Error('Inventory rail focus failed');
      await keyPress('Enter',13);
      await sleep(250);
      const inventorySwitch=await cdp.run("(()=>{const root=document.querySelector('[data-two-level-navigation]');const rail=root?.querySelector('nav[aria-label=\"Módulos principales\"]');const inventory=rail?.querySelector('button[aria-label=\"Ver opciones de Inventario\"]');const sales=rail?.querySelector('button[aria-label=\"Ver opciones de Ventas\"]');return {path:location.pathname,drawer:document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open'),focused:document.activeElement===inventory,inventoryExpanded:inventory?.getAttribute('aria-expanded'),salesExpanded:sales?.getAttribute('aria-expanded'),inventoryOptions:!!root?.querySelector('nav[aria-label=\"Opciones de Inventario\"]')};})()");
      console.log('NAV-01 inventory selection diagnostic: '+JSON.stringify(inventorySwitch));
      if(inventorySwitch.path!=='/'||(width<760 && inventorySwitch.drawer!=='true')||!inventorySwitch.focused
        ||inventorySwitch.inventoryExpanded!=='true'||inventorySwitch.salesExpanded!=='false'
        ||!inventorySwitch.inventoryOptions)throw Error('NAV-01 inventory keyboard selection regression: '+JSON.stringify(inventorySwitch));
      if(!(await cdp.run("(()=>{const icon=document.querySelector('[data-two-level-navigation] nav[aria-label=\"Módulos principales\"] button[aria-label=\"Ver opciones de Ventas\"]');if(!icon)throw Error('Sales rail icon missing');icon.focus();return document.activeElement===icon})()")))throw Error('Sales rail focus failed');
      await keyPress('Enter',13);
      const salesReturn=await until(async()=>{const state=await cdp.run("(()=>{const root=document.querySelector('[data-two-level-navigation]');const sales=root?.querySelector('nav[aria-label=\"Módulos principales\"] button[aria-label=\"Ver opciones de Ventas\"]');return {path:location.pathname,focused:document.activeElement===sales,expanded:sales?.getAttribute('aria-expanded'),salesOptions:!!root?.querySelector('nav[aria-label=\"Opciones de Ventas\"]')};})()");
        return state.path==='/'&&state.focused&&state.expanded==='true'&&state.salesOptions&&state;
      },{label:'keyboard return to Sales '+width});
      console.log('NAV-01 rail module switch QA: '+JSON.stringify({width,inventorySwitch,salesReturn,realKeyboard:true}));
    }
    const screen=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    await writeFile(path.join(outDir,width+'-focused-sales-explorer.png'),Buffer.from(screen.data,'base64'));
    // NAV-02: search result announcements and Escape behavior must work
    // with real Chrome input, including the open smartphone drawer.
    await cdp.run("(()=>{const input=document.querySelector('[data-two-level-navigation] input[aria-label=\"Buscar opciones de Ventas\"]');if(!input)throw Error('Sales search input missing');input.focus();return true})()");
    const nav02Search=()=>cdp.run("(()=>{const root=document.querySelector('[data-two-level-navigation]');const input=root?.querySelector('input[aria-label=\"Buscar opciones de Ventas\"]');const status=root?.querySelector('[role=\"status\"][aria-live=\"polite\"]');const nav=root?.querySelector('nav[aria-label=\"Opciones de Ventas\"]');return {value:input?.value,focused:document.activeElement===input,status:status?.textContent?.trim(),links:nav?.querySelectorAll('a').length,drawer:document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')}})()");
    await cdp.send('Input.insertText',{text:'cobranza'});
    await until(async()=>{
      const result=await nav02Search();
      return result.value==='cobranza'&&result.links===1&&result.status==='1 resultado de búsqueda';
    },{label:'contextual Sales search results '+width});
    const matchingSearch=await nav02Search();
    await keyPress('Escape',27);
    await until(async()=>{
      const result=await nav02Search();
      return result.value===''&&result.links===5&&result.focused&&result.status==='';
    },{label:'first Escape clears contextual search '+width});
    const clearedSearch=await nav02Search();
    if(width<760){
      if(clearedSearch.drawer!=='true')throw Error('First Escape unexpectedly closed mobile explorer');
      await keyPress('Escape',27);
      await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='false'"),
        {label:'second Escape closes mobile explorer '+width});
      // NAV-02 / QA-02: the drawer must return focus to its opener on Escape
      // and trap real Tab / Shift+Tab at its keyboard boundaries.
      await until(()=>cdp.run("document.activeElement===document.querySelector('button[aria-label=\"Abrir navegación\"]')"),
        {label:'mobile focus restored to navigation trigger '+width});
      await cdp.run("(()=>{document.querySelector('button[aria-label=\"Abrir navegación\"]').click();return true})()");
      await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='true'"),
        {label:'mobile drawer opened for Tab boundary QA '+width});
      const drawerBoundary=()=>cdp.run(`(()=>{
        const drawer=document.querySelector('[data-two-level-navigation][role="dialog"]');
        const items=[...drawer.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),[tabindex]:not([tabindex="-1"])')]
          .filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
        return {count:items.length,atFirst:document.activeElement===items[0],
          atLast:document.activeElement===items[items.length-1],inside:drawer.contains(document.activeElement)};
      })()`);
      const boundaryStart=await cdp.run(`(()=>{
        const drawer=document.querySelector('[data-two-level-navigation][role="dialog"]');
        const first=[...drawer.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),[tabindex]:not([tabindex="-1"])')]
          .find(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
        if(!first)throw Error('Mobile drawer has no keyboard controls');
        first.focus();return document.activeElement===first;
      })()`);
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Shift',code:'ShiftLeft',windowsVirtualKeyCode:16,modifiers:8});
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
      await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
      await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Shift',code:'ShiftLeft',windowsVirtualKeyCode:16});
      const shiftTab=await drawerBoundary();
      await keyPress('Tab',9);
      const forwardTab=await drawerBoundary();
      if(!boundaryStart||shiftTab.count<3||!shiftTab.atLast||!shiftTab.inside
        ||!forwardTab.atFirst||!forwardTab.inside){
        throw Error('NAV-02 mobile Tab focus trap regression: '+JSON.stringify({boundaryStart,shiftTab,forwardTab}));
      }
      // NAV-02: Escape belongs to the focused dialog, not to an unrelated
      // overlay that temporarily takes focus while the explorer is open.
      const outsideFocus=await cdp.run(`(()=>{
        const drawer=document.querySelector('[data-two-level-navigation][role="dialog"]');
        const opener=document.querySelector('button[aria-label="Abrir navegación"]');
        if(!drawer||!opener||drawer.contains(opener))throw Error('Missing external focus target');
        opener.focus();
        return document.activeElement===opener;
      })()`);
      if(!outsideFocus)throw Error('NAV-02 could not focus outside mobile explorer');
      await keyPress('Escape',27);
      if(!(await cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='true'")))
        throw Error('NAV-02 Escape outside dialog unexpectedly closed mobile explorer');
      // Another overlay may own focus; the explorer must not intercept Tab/Shift+Tab.
      // Real Tab cycling inside the explorer is checked above.
      const externalTab=await cdp.run(`(()=>{
        const opener=document.querySelector('button[aria-label="Abrir navegación"]');
        if(document.activeElement!==opener)throw Error('External Tab target lost focus');
        return [false,true].map(shiftKey=>{
          const event=new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true,shiftKey});
          opener.dispatchEvent(event);
          return {shiftKey,prevented:event.defaultPrevented,focusPreserved:document.activeElement===opener};
        });
      })()`);
      if(externalTab.some(result=>result.prevented||!result.focusPreserved))
        throw Error('NAV-02 external dialog Tab was intercepted: '+JSON.stringify(externalTab));
      console.log('NAV-02 external Tab/Shift+Tab isolation QA: '+JSON.stringify({width,externalTab}));
      await cdp.run("(()=>{const close=document.querySelector('[data-two-level-navigation] button[aria-label=\"Cerrar menú\"]');if(!close)throw Error('Mobile close button missing');close.focus();return true})()");
      await keyPress('Escape',27);
      await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='false' && document.activeElement===document.querySelector('button[aria-label=\"Abrir navegación\"]')"),
        {label:'mobile Escape restores opener focus after Tab QA '+width});
      console.log('NAV-02 mobile Tab/Shift+Tab focus QA: '+JSON.stringify({width,boundaryStart,shiftTab,forwardTab,focusRestored:true}));
      // NAV-02 / QA-02: both explicit close controls must restore focus to
      // the opener that actually launched the mobile drawer (topbar or bottom nav).
      const closeCases=[
        {name:'close button',opener:'button[aria-label="Abrir navegación"]',closer:'[data-two-level-navigation] button[aria-label="Cerrar menú"]'},
        {name:'backdrop',opener:'[data-mobile-bottom-nav] button[aria-label="Abrir módulos"]',closer:'button[aria-label="Cerrar navegación"]'},
      ];
      for(const closeCase of closeCases){
        await cdp.run(`(()=>{const trigger=document.querySelector(${JSON.stringify(closeCase.opener)});
          if(!trigger||!trigger.getClientRects().length)throw Error('Mobile drawer opener not visible');
          trigger.click();return true})()`);
        await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='true'"),
          {label:'mobile drawer opened for '+closeCase.name+' '+width});
        await cdp.run(`(()=>{const closer=document.querySelector(${JSON.stringify(closeCase.closer)});
          if(!closer||!closer.getClientRects().length)throw Error('Mobile drawer close control not visible');
          closer.click();return true})()`);
        await until(()=>cdp.run(`(()=>{const trigger=document.querySelector(${JSON.stringify(closeCase.opener)});
          return document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='false'
            &&document.activeElement===trigger})()`),
          {label:'mobile '+closeCase.name+' restores original opener focus '+width});
        console.log('NAV-02 mobile close focus QA: '+JSON.stringify({width,method:closeCase.name,focusRestored:true}));
      }
      // NAV-02: if a responsive change hides the opener while the drawer is open,
      // Escape must focus a visible alternative (or the focusable workspace).
      const fallbackCases = [
        {name:'alternate menu button',hide:['[data-mobile-bottom-nav] button[aria-label="Abrir módulos"]'],expected:'button[aria-label="Abrir navegación"]'},
        {name:'workspace',hide:['[data-mobile-bottom-nav] button[aria-label="Abrir módulos"]','button[aria-label="Abrir navegación"]'],expected:'[data-scroll-owner="workspace"]'},
      ];
      for (const fallbackCase of fallbackCases) {
        await cdp.run("(()=>{const trigger=document.querySelector('[data-mobile-bottom-nav] button[aria-label=\"Abrir módulos\"]');if(!trigger)throw Error('Bottom menu trigger missing');trigger.click();return true})()");
        await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='true'"),
          {label:'drawer opened for focus fallback '+fallbackCase.name});
        await cdp.run(`(()=>{for(const selector of ${JSON.stringify(fallbackCase.hide)}){const node=document.querySelector(selector);if(!node)throw Error('Missing focus fallback test target: '+selector);node.style.display='none'}return true})()`);
        await keyPress('Escape',27);
        await until(()=>cdp.run(`(()=>{const target=document.querySelector(${JSON.stringify(fallbackCase.expected)});return document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='false'&&document.activeElement===target})()`),
          {label:'focus fallback to '+fallbackCase.name});
        await cdp.run(`(()=>{for(const selector of ${JSON.stringify(fallbackCase.hide)})document.querySelector(selector).style.removeProperty('display');return true})()`);
        console.log('NAV-02 mobile focus fallback QA: '+JSON.stringify({width,case:fallbackCase.name,restored:true}));
      }
      await cdp.run("(()=>{const trigger=document.querySelector('button[aria-label=\"Abrir navegación\"]');if(!trigger)throw Error('Mobile navigation trigger missing after Escape');trigger.click();return true})()");
      await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='true'"),
        {label:'reopen mobile explorer after Escape '+width});
    }
    console.log('NAV-02 contextual search keyboard QA: '+JSON.stringify({width,matchingSearch,clearedSearch,escapeClosesMobile:width<760}));

    // NAV-02: activate a contextual submenu link using a real Enter key.
    // A mouse click alone cannot catch keyboard-only navigation regressions.
    const submenuKeyboard=await cdp.run(`(()=>{
      const link=document.querySelector('[data-two-level-navigation] nav[aria-label="Opciones de Ventas"] a[href="/ventas/cobranza"]');
      if(!link)throw Error('Cobranza destination missing in Sales submenu');
      link.focus();
      return {focused:document.activeElement===link,label:link.textContent.trim(),
        href:link.getAttribute('href'),path:location.pathname};
    })()`);
    if(!submenuKeyboard.focused||!submenuKeyboard.label||submenuKeyboard.href!=='/ventas/cobranza'
      ||submenuKeyboard.path!=='/'){
      throw Error('NAV-02 contextual link keyboard focus regression: '+JSON.stringify({width,...submenuKeyboard}));
    }
    await keyPress('Enter',13);
    await until(()=>cdp.run("location.pathname==='/ventas/cobranza'"),
      {label:'Sales submenu Enter navigation '+width});
    console.log('NAV-02 contextual link Enter QA: '+JSON.stringify({width,...submenuKeyboard,activated:true}));
    const drawerClosed=width>=760||await until(()=>cdp.run(
      "document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='false'"
    ),{label:'mobile drawer closes after subroute '+width});
    // NAV-02 / QA-02: route activation must not strand keyboard focus in a
    // hidden drawer. The menu opener remains available after the route change.
    if(width<760){
      const routeFocus=await until(()=>cdp.run(`(()=>{
        const opener=document.querySelector('button[aria-label="Abrir navegación"]');
        const drawer=document.querySelector('[data-two-level-navigation][role="dialog"]');
        return opener && document.activeElement===opener && opener.getClientRects().length
          && (!drawer || !drawer.contains(document.activeElement));
      })()`),{label:'mobile focus returns to opener after route '+width});
      if(!routeFocus)throw Error('NAV-02 route navigation lost mobile keyboard focus');
    }
    await cdp.run("window.history.back();true");
    await until(()=>cdp.run("location.pathname==='/'"),{label:'browser Back from Sales '+width});
    await cdp.run("window.history.forward();true");
    await until(()=>cdp.run("location.pathname==='/ventas/cobranza'"),{label:'browser Forward to Sales '+width});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-two-level-navigation] nav[aria-label=\"Opciones de Ventas\"] a[href=\"/ventas/cobranza\"][aria-current=\"page\"]'))"),
      {label:'active Sales submenu after browser history '+width});
    if(width<760){
      // Focus restoration runs after the router commits the history transition.
      // Wait for that frame instead of racing it with an immediate CDP snapshot.
      const readHistoryFocus=()=>cdp.run(`(()=>{
        const opener=document.querySelector('button[aria-label="Abrir navegación"]');
        const drawer=document.querySelector('[data-two-level-navigation][role="dialog"]');
        return {atOpener:document.activeElement===opener,
          visible:!!opener?.getClientRects().length,
          trappedInDrawer:!!drawer?.contains(document.activeElement),
          activeTag:document.activeElement?.tagName,
          activeLabel:document.activeElement?.getAttribute('aria-label')};
      })()`);
      const historyFocus=await until(async()=>{
        const state=await readHistoryFocus();
        return state.atOpener&&state.visible&&!state.trappedInDrawer&&state;
      },{label:'mobile history focus restored to opener '+width}).catch(async(error)=>{
        throw Error('NAV-02 mobile history focus regression: '
          +JSON.stringify(await readHistoryFocus())+'; '+error.message);
      });
      console.log('NAV-02 mobile route/history focus QA: '+JSON.stringify({width,afterRoute:true,afterHistory:historyFocus}));
    }
    const result={width,focusedCount:focused.count,focusedOnly:focused.onlySales,
      navigation:true,backForward:true,drawerClosed:Boolean(drawerClosed),overflow:focused.overflow};
    // QA-02: test saved shortcuts and profile-only routes in isolated Demo Local.
    if(width<760){
      await cdp.run("(()=>{const trigger=document.querySelector('button[aria-label=\"Abrir navegación\"]');if(!trigger)throw Error('Drawer trigger missing for shortcuts QA');trigger.click();return true})()");
      await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='true'"),
        {label:'saved shortcuts mobile drawer '+width});
    }
    await cdp.run("(()=>{const home=document.querySelector('[data-two-level-navigation] button[aria-label=\"Ver todos los módulos\"]');if(!home)throw Error('Full explorer trigger missing');home.click();localStorage.setItem('buzzbee.ux.favorites',JSON.stringify([{label:'Cobranza',path:'/ventas/cobranza'},{label:'Duplicado',path:'/ventas/cobranza'},{label:'Ruta inválida',path:'//invalid'},{label:'Integraciones SaaS',path:'/integration-hub'},{label:'Facturación SaaS',path:'/configuracion/facturacion'}]));window.dispatchEvent(new Event('buzzbee:favorites-changed'));return true})()");
    await until(()=>cdp.run("document.querySelectorAll('nav[aria-labelledby=\"buzzbee-favorites-heading\"] a[href=\"/ventas/cobranza\"]').length===1"),
      {label:'deduplicated saved shortcut '+width});
    const savedShortcuts=await cdp.run("(()=>({favorites:document.querySelectorAll('nav[aria-labelledby=\"buzzbee-favorites-heading\"] a').length,recents:document.querySelectorAll('nav[aria-labelledby=\"buzzbee-recents-heading\"] a[href=\"/ventas/cobranza\"]').length,stored:JSON.parse(localStorage.getItem('buzzbee.ux.favorites')||'[]').length}))()");
    if(savedShortcuts.favorites!==1||savedShortcuts.recents!==1||savedShortcuts.stored!==5){
      throw Error('Saved shortcuts browser regression: '+JSON.stringify({width,...savedShortcuts}));
    }
    result.savedShortcuts=savedShortcuts;
    // NAV-02 / QA-04: Enter on a full-explorer module replaces that button
    // with its contextual options. Focus must follow the first option, not
    // fall back to the document body. Rail selection is tested separately.
    const fullExplorerPath=await cdp.run('location.pathname');
    const fullExplorerFocused=await cdp.run(`(()=>{
      const root=document.querySelector('[data-two-level-navigation]');
      const button=[...root.querySelectorAll('button[class*="_moduleButton_"]')]
        .find(node=>node.textContent.trim()==='Ventas');
      if(!button)throw Error('Sales button missing in full explorer');
      button.focus();
      return document.activeElement===button;
    })()`);
    if(!fullExplorerFocused)throw Error('Full explorer Sales button could not receive focus');
    await keyPress('Enter',13);
    const contextualFocus=await until(async()=>{
      const state=await cdp.run(`(()=>{
        const nav=document.querySelector('#buzzbee-focused-module nav[aria-label="Opciones de Ventas"]');
        const first=nav?.querySelector('a[href]');
        return {first:!!first,focused:document.activeElement===first,
          path:location.pathname,activeTag:document.activeElement?.tagName};
      })()`);
      return state.first&&state.focused&&state.path===fullExplorerPath&&state;
    },{label:'full explorer module keyboard focus '+width});
    console.log('NAV-02 full explorer keyboard focus QA: '+JSON.stringify({width,...contextualFocus}));
    result.fullExplorerKeyboardFocus=contextualFocus;
    // NAV-02 / QA-04: returning from contextual options to the full explorer
    // via a real Enter key must keep focus on its persistent back button.
    // No route change or hidden submenu should steal the keyboard focus.
    const backButtonFocused=await cdp.run(`(()=>{
      const back=document.querySelector('[data-two-level-navigation] button[aria-label="Ver todos los módulos"]');
      if(!back)throw Error('Full explorer back button missing');
      back.focus();
      return document.activeElement===back;
    })()`);
    if(!backButtonFocused)throw Error('Full explorer back button could not receive focus');
    await keyPress('Enter',13);
    const returnedExplorer=await until(async()=>{
      const state=await cdp.run(`(()=>{
        const root=document.querySelector('[data-two-level-navigation]');
        const back=root?.querySelector('button[aria-label="Ver todos los módulos"]');
        const sales=[...root.querySelectorAll('button[class*="_moduleButton_"]')]
          .find(node=>node.textContent.trim()==='Ventas');
        return {backFocused:document.activeElement===back,
          allModules:!!sales,contextualHidden:!root.querySelector('#buzzbee-focused-module'),
          path:location.pathname};
      })()`);
      return state.backFocused&&state.allModules&&state.contextualHidden
        &&state.path===fullExplorerPath&&state;
    },{label:'full explorer keyboard return '+width});
    console.log('NAV-02 full explorer keyboard return QA: '+JSON.stringify({width,...returnedExplorer}));
    result.fullExplorerKeyboardReturn=returnedExplorer;
    // NAV-02 / QA-04: accent-insensitive search in the full explorer must
    // announce the result count, keep keyboard focus and preserve the route.
    const fullSearchFocused=await cdp.run(`(()=>{
      const input=document.querySelector('[data-two-level-navigation] input[aria-label="Buscar módulos"]');
      if(!input)throw Error('Full explorer search input missing');
      input.focus();
      return document.activeElement===input;
    })()`);
    if(!fullSearchFocused)throw Error('Full explorer search could not receive focus');
    await cdp.send('Input.insertText',{text:'configuracion'});
    const accentSearch=await until(async()=>{
      const state=await cdp.run(`(()=>{
        const root=document.querySelector('[data-two-level-navigation]');
        const input=root?.querySelector('input[aria-label="Buscar módulos"]');
        const status=root?.querySelector('[role="status"][aria-live="polite"]');
        const matches=[...root.querySelectorAll('a[href="/configuracion"]')]
          .filter(link=>link.textContent.trim()==='Configuración');
        return {value:input?.value,status:status?.textContent?.trim(),
          matches:matches.length,focused:document.activeElement===input,path:location.pathname};
      })()`);
      return state.value==='configuracion'&&state.status==='1 resultado de búsqueda'
        &&state.matches===1&&state.focused&&state.path===fullExplorerPath&&state;
    },{label:'full explorer accent-insensitive search '+width});
    await keyPress('Escape',27);
    const accentSearchCleared=await until(async()=>{
      const state=await cdp.run(`(()=>{
        const root=document.querySelector('[data-two-level-navigation]');
        const input=root?.querySelector('input[aria-label="Buscar módulos"]');
        const status=root?.querySelector('[role="status"][aria-live="polite"]');
        return {value:input?.value,status:status?.textContent?.trim(),
          focused:document.activeElement===input,path:location.pathname,
          drawer:document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')};
      })()`);
      return state.value===''&&state.status===''&&state.focused
        &&state.path===fullExplorerPath&&(width>=760||state.drawer==='true')&&state;
    },{label:'full explorer Escape clears search '+width});
    console.log('NAV-02 full explorer accent search QA: '+JSON.stringify({width,accentSearch,accentSearchCleared}));
    result.fullExplorerAccentSearch={matched:true,cleared:true};
    // QA-02: a full page reload must rehydrate saved links without
    // duplicating entries or rewriting the user's original localStorage.
    await cdp.send('Page.navigate',{url:origin+'/ventas/cobranza'});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-two-level-navigation] button[aria-label=\"Ver todos los módulos\"]'))"),
      {label:'saved shortcuts reload shell '+width});
    if(width<760){
      await cdp.run("(()=>{const trigger=document.querySelector('button[aria-label=\"Abrir navegación\"]');if(!trigger)throw Error('Drawer trigger missing after reload');trigger.click();return true})()");
      await until(()=>cdp.run("document.querySelector('[data-mobile-menu-open]')?.getAttribute('data-mobile-menu-open')==='true'"),
        {label:'saved shortcuts drawer after reload '+width});
    }
    await cdp.run("(()=>{const home=document.querySelector('[data-two-level-navigation] button[aria-label=\"Ver todos los módulos\"]');if(!home)throw Error('Explorer trigger missing after reload');home.click();return true})()");
    await until(()=>cdp.run("document.querySelectorAll('nav[aria-labelledby=\"buzzbee-favorites-heading\"] a[href=\"/ventas/cobranza\"]').length===1 && document.querySelectorAll('nav[aria-labelledby=\"buzzbee-recents-heading\"] a[href=\"/ventas/cobranza\"]').length===1"),
      {label:'saved shortcuts rehydration '+width});
    const reloadedShortcuts=await cdp.run("(()=>({path:location.pathname,favorites:document.querySelectorAll('nav[aria-labelledby=\"buzzbee-favorites-heading\"] a').length,recents:document.querySelectorAll('nav[aria-labelledby=\"buzzbee-recents-heading\"] a[href=\"/ventas/cobranza\"]').length,stored:JSON.parse(localStorage.getItem('buzzbee.ux.favorites')||'[]').length}))()");
    if(reloadedShortcuts.path!=='/ventas/cobranza'||reloadedShortcuts.favorites!==1
      ||reloadedShortcuts.recents!==1||reloadedShortcuts.stored!==5){
      throw Error('Saved shortcuts reload regression: '+JSON.stringify({width,...reloadedShortcuts}));
    }
    // QA-02: simulate one company module being disabled in the isolated
    // offline fixture. The rail and saved shortcuts must hide Sales without
    // deleting the user's favorites; re-enabling restores both immediately.
    await cdp.run(`(()=>{
      const key='buzzbee-offline-demo-state-v2';
      window.__qaOriginalModuleFixture=localStorage.getItem(key);
      const persisted=JSON.parse(window.__qaOriginalModuleFixture||'{}');
      persisted['/modules/dashboard']={companyModules:[{module:{key:'ventas'},enabled:false}]};
      localStorage.setItem(key,JSON.stringify(persisted));
      window.dispatchEvent(new Event('buzzbee:modules-changed'));
      return true;
    })()`);
    let disabledModule;
    try{
      await until(()=>cdp.run("!document.querySelector('[data-two-level-navigation] nav[aria-label=\"Módulos principales\"] button[aria-label=\"Ver opciones de Ventas\"]') && !document.querySelector('nav[aria-labelledby=\"buzzbee-favorites-heading\"] a[href=\"/ventas/cobranza\"]')"),
        {label:'disabled Sales module and shortcut '+width});
      disabledModule=await cdp.run(`(()=>({
        salesRail:!!document.querySelector('[data-two-level-navigation] nav[aria-label="Módulos principales"] button[aria-label="Ver opciones de Ventas"]'),
        salesFavorite:!!document.querySelector('nav[aria-labelledby="buzzbee-favorites-heading"] a[href="/ventas/cobranza"]'),
        stored:JSON.parse(localStorage.getItem('buzzbee.ux.favorites')||'[]').length,
        path:location.pathname
      }))()`);
      if(disabledModule.salesRail||disabledModule.salesFavorite||disabledModule.stored!==5
        ||disabledModule.path!=='/ventas/cobranza'){
        throw Error('Disabled company module regression: '+JSON.stringify({width,...disabledModule}));
      }
    }finally{
      await cdp.run(`(()=>{
        const key='buzzbee-offline-demo-state-v2';
        const original=window.__qaOriginalModuleFixture;
        if(original===null)localStorage.removeItem(key);
        else if(typeof original==='string')localStorage.setItem(key,original);
        delete window.__qaOriginalModuleFixture;
        window.dispatchEvent(new Event('buzzbee:modules-changed'));
        return true;
      })()`);
    }
    await until(()=>cdp.run("!!document.querySelector('[data-two-level-navigation] nav[aria-label=\"Módulos principales\"] button[aria-label=\"Ver opciones de Ventas\"]') && !!document.querySelector('nav[aria-labelledby=\"buzzbee-favorites-heading\"] a[href=\"/ventas/cobranza\"]')"),
      {label:'re-enabled Sales module and shortcut '+width});
    result.moduleEntitlement={disabled:disabledModule,restored:true};
    console.log('Company module visibility QA: '+JSON.stringify({width,...result.moduleEntitlement}));
    result.savedShortcutsReload=reloadedShortcuts;
    console.log('Saved shortcut reload QA: '+JSON.stringify({width,...reloadedShortcuts}));
    await cdp.run("(()=>{localStorage.removeItem('buzzbee.ux.favorites');window.dispatchEvent(new Event('buzzbee:favorites-changed'));return true})()");
    console.log('Saved shortcut browser QA: '+JSON.stringify({width,...savedShortcuts}));
    navigationJourneys.push(result);
    console.log('Two-level navigation journey: '+JSON.stringify(result));
    // QA-02: an authenticated ERP Demo Local session must never enter the
    // platform-only SaaS shell through a direct URL. This is a client-side
    // routing regression, NOT a backend permission or Production smoke test.
    const erpCompany=await cdp.run("JSON.parse(localStorage.getItem('erp-session')||'null')?.user?.companyId");
    if(!erpCompany)throw Error('ERP demo session missing company scope');
    await cdp.send('Page.navigate',{url:origin+'/admin-saas'});
    await until(()=>cdp.run("location.pathname==='/' && Boolean(document.querySelector('[data-two-level-navigation]'))"),
      {label:'ERP cannot enter SaaS platform shell '+width});
    const roleBoundary=await cdp.run(`(()=>{
      const session=JSON.parse(localStorage.getItem('erp-session')||'null');
      return {path:location.pathname,erpShell:!!document.querySelector('[data-two-level-navigation]'),
        offlineDemo:session?.offlineDemo===true,platform:session?.platform===true,
        companyId:session?.user?.companyId||null};
    })()`);
    if(roleBoundary.path!=='/'||!roleBoundary.erpShell||!roleBoundary.offlineDemo
      ||roleBoundary.platform||roleBoundary.companyId!==erpCompany){
      throw Error('ERP/SaaS route boundary regression: '+JSON.stringify({width,...roleBoundary}));
    }
    result.erpPlatformBoundary=roleBoundary;
    console.log('ERP platform route boundary QA: '+JSON.stringify({width,...roleBoundary}));
  }
  
  // Quick Actions v2: verify a compact initial view, progressive disclosure,
  // module filtering and advanced controls at a smartphone and desktop width.
  for(const width of [390,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{
      width,height:900,deviceScaleFactor:1,mobile:width<760
    });
    await cdp.send('Page.navigate',{url:origin+'/'});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-bb-hex-ui] nav[aria-label=\"Accesos rápidos\"]'))"),
      {label:'quick actions '+width});
    await sleep(350);
    const before=await cdp.run(`(()=>{
      const root=document.querySelector('[data-bb-hex-ui]');
      const list=root.querySelector('nav[aria-label="Accesos rápidos"]');
      const buttons=[...list.querySelectorAll(':scope > button')];
      root.scrollIntoView({block:'center'});
      return {
        initial:buttons.length,
        buttonHeight:Math.min(...buttons.map(b=>b.getBoundingClientRect().height)),
        radius:parseFloat(getComputedStyle(buttons[0]).borderTopLeftRadius),
        search:!!root.querySelector('input[type="search"]'),
        select:!!root.querySelector('select'),
        overflow:Math.round(document.documentElement.scrollWidth-innerWidth)
      };
    })()`);
    if(before.initial!==4||before.buttonHeight<44||before.radius>16||!before.search||!before.select||before.overflow>3){
      throw Error('Quick Actions v2 initial layout regression '+JSON.stringify({width,...before}));
    }
    await cdp.run(`(()=>{
      const root=document.querySelector('[data-bb-hex-ui]');
      const button=[...root.querySelectorAll('button')].find(b=>b.textContent.includes('Ver 4 más'));
      if(!button)throw Error('Expand shortcuts button missing');
      button.click();
      return true;
    })()`);
    await until(()=>cdp.run("document.querySelectorAll('[data-bb-hex-ui] nav[aria-label=\"Accesos rápidos\"] > button').length === 8"),
      {label:'expanded quick actions '+width});
    const expanded=await cdp.run(`(()=>{
      const root=document.querySelector('[data-bb-hex-ui]');
      const preferences=[...root.querySelectorAll('button')].find(b=>b.textContent.includes('Personalizar cantidad'));
      if(!preferences)throw Error('Preferences toggle missing');
      preferences.click();
      return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[data-bb-hex-ui] input[type=range]'))"),
      {label:'quick actions personalization '+width});
    await cdp.run(`(()=>{
      const root=document.querySelector('[data-bb-hex-ui]');
      const select=root.querySelector('select');
      const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;
      setter.call(select,'ventas');
      select.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    })()`);
    await until(()=>cdp.run("document.querySelectorAll('[data-bb-hex-ui] nav[aria-label=\"Accesos rápidos\"] > button').length === 2"),
      {label:'filtered quick actions '+width});
    const screenshot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    await writeFile(path.join(outDir,width+'-quick-actions-v2.png'),Buffer.from(screenshot.data,'base64'));
    console.log('Quick Actions v2 browser QA '+JSON.stringify({width,...before,expanded:!!expanded,filtered:2,customization:true}));
  }

  // Original rounded KPI cards: exercise add, persistence, and removal in
  // the per-company personalizer without assuming any honeycomb geometry.
  for(const width of [390,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{
      width,height:900,deviceScaleFactor:1,mobile:width<760
    });
    await cdp.send('Page.navigate',{url:origin+'/'});
    await until(()=>cdp.run("document.querySelectorAll('[data-dashboard-kpi]').length === 4"),
      {label:'four original KPI cards '+width});
    const initial=await cdp.run(`(()=>{
      const cards=[...document.querySelectorAll('[data-dashboard-kpi]')];
      return {
        count:cards.length,
        ids:cards.map(card=>card.getAttribute('data-dashboard-kpi')),
        rounded:cards.every(card=>parseFloat(getComputedStyle(card).borderRadius)>0),
        noHex:!document.querySelector('[data-honeycomb-kpis]'),
        overflow:document.documentElement.scrollWidth-innerWidth
      };
    })()`);
    if(!initial.rounded||!initial.noHex||initial.overflow>3){
      throw Error('Original KPI card regression '+JSON.stringify({width,...initial}));
    }
    await cdp.run(`(()=>{
      const customize=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Personalizar');
      if(!customize)throw Error('Dashboard personalization button missing');
      customize.click();
      return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[role=dialog] button[data-ui-surface=card][aria-pressed]'))"),
      {label:'card metric catalog '+width});
    await cdp.run(`(()=>{
      const dialog=document.querySelector('[role=dialog]');
      const option=[...dialog.querySelectorAll('button')].find(b=>b.textContent.includes('Compras del año'));
      if(!option||option.getAttribute('aria-pressed')!=='false')throw Error('Annual purchases metric missing');
      option.click();
      const save=[...dialog.querySelectorAll('button')].find(b=>b.textContent.includes('Guardar cambios'));
      if(!save)throw Error('Save preferences button missing');
      save.click();
      return true;
    })()`);
    await until(()=>cdp.run("document.querySelectorAll('[data-dashboard-kpi]').length === 5"),
      {label:'added KPI card '+width});
    const added=await cdp.run(`(()=>{
      const card=document.querySelector('[data-dashboard-kpi="annualPurchases"]');
      card?.scrollIntoView({block:'center'});
      return {
        count:document.querySelectorAll('[data-dashboard-kpi]').length,
        value:card?.querySelector('strong')?.textContent||'',
        overflow:document.documentElement.scrollWidth-innerWidth
      };
    })()`);
    if(!added.value||added.overflow>3)throw Error('KPI card addition regression '+JSON.stringify({width,...added}));
    const screenshot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    await writeFile(path.join(outDir,width+'-dashboard-kpi-cards.png'),Buffer.from(screenshot.data,'base64'));
    await cdp.send('Page.navigate',{url:origin+'/'});
    await until(()=>cdp.run("Boolean(document.querySelector('[data-dashboard-kpi=annualPurchases]'))"),
      {label:'persisted KPI card '+width});
    await cdp.run(`(()=>{
      const customize=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Personalizar');
      customize.click();
      return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[role=dialog] button[data-ui-surface=card][aria-pressed]'))"),
      {label:'reopen KPI catalog '+width});
    await cdp.run(`(()=>{
      const dialog=document.querySelector('[role=dialog]');
      const option=[...dialog.querySelectorAll('button')].find(b=>b.textContent.includes('Compras del año'));
      if(!option||option.getAttribute('aria-pressed')!=='true')throw Error('Metric did not persist');
      option.click();
      const save=[...dialog.querySelectorAll('button')].find(b=>b.textContent.includes('Guardar cambios'));
      save.click();
      return true;
    })()`);
    await until(()=>cdp.run("document.querySelectorAll('[data-dashboard-kpi]').length === 4"),
      {label:'removed KPI card '+width});
    // Empty selection remains recoverable, including on mobile.
    await cdp.run(`(()=>{
      const customize=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Personalizar');
      if(!customize)throw Error('Personalize button missing');
      customize.click();
      return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[role=dialog] button[data-ui-surface=card][aria-pressed]'))"),
      {label:'empty dashboard setup '+width});
    await cdp.run(`(()=>{
      const dialog=document.querySelector('[role=dialog]');
      const selected=[...dialog.querySelectorAll('button[data-ui-surface="card"][aria-pressed="true"]')];
      if(selected.length!==4)throw Error('Expected four selected KPI cards');
      selected.forEach(option=>option.click());
      const save=[...dialog.querySelectorAll('button')].find(b=>b.textContent.includes('Guardar cambios'));
      save.click();
      return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[data-dashboard-kpi-empty]'))"),
      {label:'recoverable KPI empty state '+width});
    const empty=await cdp.run(`(()=>{
      const root=document.querySelector('[data-dashboard-kpi-empty]');
      const action=[...root.querySelectorAll('button')].find(b=>b.textContent.includes('Agregar indicadores'));
      return {hasAction:!!action,noCards:document.querySelectorAll('[data-dashboard-kpi]').length===0,
        overflow:document.documentElement.scrollWidth-innerWidth};
    })()`);
    if(!empty.hasAction||!empty.noCards||empty.overflow>3){
      throw Error('Empty KPI recovery regression '+JSON.stringify({width,...empty}));
    }
    await cdp.run(`(()=>{
      const root=document.querySelector('[data-dashboard-kpi-empty]');
      root.querySelector('button').click();
      return true;
    })()`);
    await until(()=>cdp.run("Boolean(document.querySelector('[role=dialog] button[data-ui-surface=card][aria-pressed]'))"),
      {label:'restore KPI cards '+width});
    await cdp.run(`(()=>{
      const dialog=document.querySelector('[role=dialog]');
      const reset=[...dialog.querySelectorAll('button')].find(b=>b.textContent.includes('Restablecer'));
      const save=[...dialog.querySelectorAll('button')].find(b=>b.textContent.includes('Guardar cambios'));
      if(!reset||!save)throw Error('Reset controls missing');
      reset.click();save.click();return true;
    })()`);
    await until(()=>cdp.run("document.querySelectorAll('[data-dashboard-kpi]').length===4"),
      {label:'restored default KPI cards '+width});
    console.log('Original KPI card browser QA '+JSON.stringify({
      width,initial:initial.count,added:added.count,removed:true,persisted:true,emptyRecovered:true,overflow:added.overflow
    }));
  }

  // Desktop rail spacing regression: the vertical tools must never touch
  // the module canvas. Check both operating widths and two different modules.
  const desktopSpacing=[];
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});
  for(const width of [1280,1440]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const route of [{slug:'productos',url:'/inventario/productos'},{slug:'ventas',url:'/ventas'}]){
      await cdp.send('Page.navigate',{url:origin+route.url});
      await until(()=>cdp.run("Boolean(document.querySelector('[data-scroll-owner=workspace]'))"),{label:route.slug+' desktop shell'});
      await sleep(450);
      const metrics=await cdp.run(`(()=>{
        const main=document.querySelector('main[data-scroll-owner="workspace"]');
        const tools=document.querySelector('aside[aria-label="Herramientas de espacio de trabajo"]');
        const layout=main?.parentElement;
        if(!main||!tools||!layout) return {error:'Missing workspace, rail or grid'};
        const content=main.getBoundingClientRect();
        const rail=tools.getBoundingClientRect();
        const grid=layout.getBoundingClientRect();
        return {
          width:innerWidth,route:location.pathname,
          separation:Math.round((rail.left-content.right)*10)/10,
          outerGutter:Math.round((content.left-grid.left)*10)/10,
          contentWidth:Math.round(content.width),
          contentCorner:parseFloat(getComputedStyle(main).borderTopRightRadius),
          toolsCorner:parseFloat(getComputedStyle(tools).borderTopLeftRadius),
          toolsVisible:getComputedStyle(tools).display!=='none'
        };
      })()`);
      if(metrics.error||!metrics.toolsVisible||metrics.separation<15||metrics.outerGutter<10||metrics.contentCorner<16||metrics.toolsCorner<16){
        throw Error('Desktop workspace rail spacing regression: '+JSON.stringify(metrics));
      }
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      await writeFile(path.join(outDir,width+'-'+route.slug+'-rail.png'),Buffer.from(shot.data,'base64'));
      desktopSpacing.push(metrics);
      console.log('Desktop rail spacing: '+JSON.stringify(metrics));
      // The reference screenshot shows the narrow, collapsed right rail.
      // Confirm that closing the supporting panel does not collapse the gap.
      if(width===1440 && route.slug==='productos'){
        await cdp.run(`(()=>{const button=document.querySelector('button[aria-label="Ocultar panel lateral"]');if(!button)throw Error('Collapse rail action missing');button.click();return true})()`);
        await sleep(300);
        const collapsed=await cdp.run(`(()=>{
          const main=document.querySelector('main[data-scroll-owner="workspace"]');
          const tools=document.querySelector('aside[aria-label="Herramientas de espacio de trabajo"]');
          const distance=tools.getBoundingClientRect().left-main.getBoundingClientRect().right;
          return {separation:Math.round(distance*10)/10,toolsWidth:Math.round(tools.getBoundingClientRect().width)};
        })()`);
        if(collapsed.separation<15 || collapsed.toolsWidth<48 || collapsed.toolsWidth>60){
          throw Error('Collapsed desktop rail spacing regression: '+JSON.stringify(collapsed));
        }
        const narrow=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
        await writeFile(path.join(outDir,'1440-productos-rail-collapsed.png'),Buffer.from(narrow.data,'base64'));
        desktopSpacing.push({width,route:route.url,collapsed:true,...collapsed});
        console.log('Desktop collapsed rail spacing: '+JSON.stringify(collapsed));
        await cdp.run(`(()=>{const button=document.querySelector('button[aria-label="Mostrar panel lateral"]');if(!button)throw Error('Expand rail action missing');button.click();return true})()`);
        await sleep(220);
      }
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
        return {
          width:innerWidth,route:location.pathname,
          pageGap:parseFloat(pageStyle.rowGap),
          pageWidth:Math.round(page.getBoundingClientRect().width),
          mainWidth:Math.round(main.getBoundingClientRect().width),
          horizontalOverflow:Math.round(document.documentElement.scrollWidth-innerWidth),
          mainPadding:parseFloat(mainStyle.paddingLeft)
        };
      })()`);
      if(space.error || !Number.isFinite(space.pageGap) || space.pageGap<14
         || space.mainPadding<10 || space.pageWidth>space.mainWidth+4
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
  console.error('Mobile browser audit could not complete: '+error.message);
  console.error(chromiumLog.slice(-1600));
  process.exitCode=1;
} finally {
  socket?.close();
  stop();
}
