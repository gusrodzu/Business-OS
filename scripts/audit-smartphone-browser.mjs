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
  constructor(socket){this.socket=socket;this.nextId=1;this.pending=new Map();
    socket.onmessage=(ev)=>{const reply=JSON.parse(ev.data);if(!reply.id)return;const pending=this.pending.get(reply.id);if(!pending)return;this.pending.delete(reply.id);reply.error?pending.reject(new Error(reply.error.message)):pending.resolve(reply.result||{});};
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
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  const report=[];
  // Start at one phone width, authenticate via the same Demo Local form as a visitor.
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await cdp.send('Page.navigate',{url:origin+'/login'});
  await until(()=>cdp.run("Boolean(document.querySelector('form button'))"),{label:'login form'});
  await cdp.run(`(()=>{const button=[...document.querySelectorAll('form button')].find(el=>el.textContent.includes('Continuar'));if(!button)throw Error('Demo login submit missing');button.click();return true})()`);
  await until(()=>cdp.run("location.pathname==='/'"),{tries:90,label:'Demo Local authentication'});
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

  await writeFile(path.join(outDir,'audit.json'),JSON.stringify({generatedAt:new Date().toISOString(),source:'local Vite build',screens:report,desktopSpacing},null,2));
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
