/**
 * Business OS: executable ERP route audit, not just an href/static audit.
 * Uses the actual Vite build and a Demo Local session in headless Chrome.
 * Discovers every explicit ERP route from module route files so new screens
 * enter this sweep automatically. Writes JSON and Markdown evidence.
 */
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const root=process.cwd();
const outDir=path.join(root,'artifacts/route-audit');
const origin=process.env.BUSINESS_OS_AUDIT_ORIGIN || 'http://127.0.0.1:4173';
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
const wait=async (fn,label,tries=85)=>{
  for(let i=0;i<tries;i++){try{const value=await fn();if(value)return value;}catch{}await sleep(230);}
  throw Error('Not ready: '+label);
};
const modules=['core','procurement','inventory','finance','hr','sales','crm','projects','production','pos','intelligence','operations','settings'];
function discoverRoutes(){
  const found=[{path:'/',id:'core:home'}];
  for(const mod of modules){
    const source=readFileSync(path.join(root,'apps/web/src/modules',mod,'routes.jsx'),'utf8');
    for(const match of source.matchAll(/\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*path:\s*['"]([^'"]+)['"]/g)){
      if(match[2].includes('*'))continue;
      found.push({path:'/'+match[2].replace(/^\//,''),id:match[1]});
    }
  }
  // Additional explicit App.jsx routes and supported redirect aliases.
  found.push(
    {path:'/configuracion/giros',id:'config:industries'},
    {path:'/configuracion/giros/automotriz-demo',id:'config:automotive-demo'},
  );
  const registry=readFileSync(path.join(root,'apps/web/src/modules/registry.jsx'),'utf8');
  for(const match of registry.matchAll(/\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*path:\s*['"]([^'"]+)['"]/g)){
    if(!match[2].includes('*'))found.push({path:'/'+match[2],id:match[1],redirect:true});
  }
  return [...new Map(found.map(route=>[route.path,route])).values()];
}
class CDP{
  constructor(socket){
    this.socket=socket;this.next=0;this.pending=new Map();this.events=[];
    socket.onmessage=(event)=>{
      const data=JSON.parse(event.data);
      if(!data.id){
        if(['Runtime.exceptionThrown','Log.entryAdded','Network.loadingFailed'].includes(data.method)){
          this.events.push({method:data.method,params:data.params});
        }
        return;
      }
      const req=this.pending.get(data.id);
      if(!req)return;
      this.pending.delete(data.id);
      if(data.error)req.reject(Error(data.error.message));
      else req.resolve(data.result||{});
    };
  }
  send(method,params={}){
    const id=++this.next;
    return Promise.race([
      new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.socket.send(JSON.stringify({id,method,params}));}),
      new Promise((_,reject)=>setTimeout(()=>reject(Error('CDP timeout: '+method)),20000)),
    ]);
  }
  async eval(source){
    const result=await this.send('Runtime.evaluate',{expression:source,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails)throw Error(result.exceptionDetails.text);
    return result.result?.value;
  }
}
await mkdir(outDir,{recursive:true});
const list=discoverRoutes();
if(list.length<40)throw Error('Route discovery incomplete: only '+list.length+' explicit routes');
console.log('ROUTE_AUDIT_DISCOVERED='+list.length);
const chrome=spawn(process.env.CHROME_BIN||'google-chrome',[
  '--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
  '--no-first-run','--no-default-browser-check','--remote-debugging-port=9231',
  '--user-data-dir='+path.join(os.tmpdir(),'bb-route-audit-'+process.pid),'about:blank',
],{stdio:['ignore','pipe','pipe']});
let stderr='';
let chromeExit=null;
chrome.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-5000);});
chrome.on('error',error=>{chromeExit='spawn error: '+error.message;});
chrome.on('exit',(code,signal)=>{chromeExit='exit code '+code+', signal '+signal;});
let socket;
const records=[];
try{
  await wait(async()=>{const response=await fetch(origin+'/login');return response.ok;},'Vite preview');
  await wait(async()=>{
    if(chromeExit)throw Error(chromeExit);
    const response=await fetch('http://127.0.0.1:9231/json/version');
    return response.ok;
  },'Chrome CDP');
  const targetResponse=await fetch('http://127.0.0.1:9231/json/new?about:blank',{method:'PUT'});
  if(!targetResponse.ok)throw Error('Could not create Chrome page');
  const target=await targetResponse.json();
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await Promise.race([
    new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;}),
    new Promise((_,reject)=>setTimeout(()=>reject(Error('CDP socket timeout')),12000)),
  ]);
  const cdp=new CDP(socket);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Network.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await cdp.send('Page.navigate',{url:origin+'/login'});
  await wait(()=>cdp.eval("Boolean(document.querySelector('form button')) || location.pathname==='/'"),'Demo Local login',120);
  if(!(await cdp.eval("location.pathname==='/'"))){
    await cdp.eval(`(()=>{
      const button=[...document.querySelectorAll('form button')].find(b=>b.textContent.includes('Continuar'));
      if(!button)throw Error('Demo Local login button missing');
      button.click();return true;
    })()`);
    await wait(()=>cdp.eval("location.pathname==='/'"),'authenticated Demo Local session',120);
  }
  console.log('ROUTE_AUDIT_AUTH_OK');

  for(let index=0;index<list.length;index++){
    const route=list[index];
    const eventStart=cdp.events.length;
    let record={id:route.id,path:route.path,kind:route.redirect?'redirect':'page',status:'PASS'};
    try{
      await cdp.send('Page.navigate',{url:origin+route.path});
      await wait(()=>cdp.eval("document.readyState==='complete' && Boolean(document.querySelector('#root'))"),'document '+route.path,85);
      await wait(()=>cdp.eval(`(()=>{
        const fatal=document.body?.innerText?.includes('No pudimos mostrar esta pantalla');
        const ready=Boolean(document.querySelector('[data-responsive-shell=true]'));
        return fatal||ready||location.pathname==='/login';
      })()`),'React route '+route.path,90);
      await sleep(950);
      const data=await cdp.eval(`(()=>{
        const text=document.body?.innerText||'';
        const error=text.includes('No pudimos mostrar esta pantalla');
        const fallback=error?document.querySelector('main pre')?.innerText||null:null;
        const content=document.querySelector('main[data-scroll-owner="workspace"]');
        const marker=document.querySelector('[data-ux-v19-route]');
        const heading=document.querySelector('main h1,h1')?.innerText?.trim()||null;
        return {
          pathname:location.pathname,
          heading,
          fatal:error,
          errorMessage:fallback,
          shell:Boolean(document.querySelector('[data-responsive-shell=true]')),
          routeId:marker?.getAttribute('data-ux-v19-route')||null,
          blank:!error&&(!content||!content.innerText.trim()),
          notFound:text.includes('No encontramos esta página')||text.includes('Página no encontrada'),
          excerpt:text.slice(0,210),
        };
      })()`);
      Object.assign(record,data);
      if(data.fatal)record.status='CRASH';
      else if(data.pathname==='/login')record.status='AUTH_REDIRECT';
      else if(data.blank)record.status='BLANK';
      else if(data.notFound&&!route.redirect)record.status='NOT_FOUND';
      else if(!data.shell)record.status='NO_SHELL';

      // Validate the actual Workspace OS menu after Demo Local login, not only CSS source text.
      // Screenshots make theme regressions reviewable in GitHub Actions artifacts.
      if (route.path === '/' && record.status === 'PASS') {
        record.menuBarAudit = [];
        const originalTheme = await cdp.eval("document.documentElement.getAttribute('data-theme')");
        try {
          for (const width of [1280, 1440]) {
            await cdp.send('Emulation.setDeviceMetricsOverride', {
              width, height: 900, deviceScaleFactor: 1, mobile: false,
            });
            for (const theme of ['light', 'dark']) {
              await cdp.eval("document.documentElement.setAttribute('data-theme'," + JSON.stringify(theme) + ")");
              await sleep(100);
              const opened = await cdp.eval("(()=>{const n=document.querySelector('nav[aria-label=\"Barra de menú de Business OS\"]');const b=n?.querySelector('button[aria-haspopup=\"true\"]');if(!b)return false;if(b.getAttribute('aria-expanded')!=='true')b.click();return true})()");
              await sleep(140);
              const colors = await cdp.eval("(()=>{\n const nav=document.querySelector('nav[aria-label=\"Barra de menú de Business OS\"]');\n const header=nav?.closest('header'), trigger=nav?.querySelector('button[aria-haspopup=\"true\"]');\n const popup=nav?.querySelector('[role=\"group\"]'), choice=popup?.querySelector('button');\n if(!header||!trigger||!popup||!choice)return {ok:false,error:'menu or dropdown not visible'};\n const rgb=s=>{const m=String(s).match(/rgba?\\(([^)]+)\\)/);return m?m[1].split(/[,\\s/]+/).filter(Boolean).map(Number).slice(0,3):null};\n const lum=vals=>vals.map(v=>{const x=v/255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4)}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);\n const contrast=(a,b)=>{if(!a||!b||a.length!==3||b.length!==3)return 0;const x=lum(a),y=lum(b);return Number(((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2))};\n const h=getComputedStyle(header),t=getComputedStyle(trigger),p=getComputedStyle(popup),o=getComputedStyle(choice);\n const stops=(h.backgroundImage.match(/rgba?\\([^)]*\\)/g)||[]).map(rgb);\n const headerContrast=stops.length?Math.min(...stops.map(stop=>contrast(rgb(t.color),stop))):0;\n const flyoutContrast=contrast(rgb(o.color),rgb(p.backgroundColor));\n const rect=popup.getBoundingClientRect();\n const ok=headerContrast>=4.5&&flyoutContrast>=4.5&&rect.width>120&&rect.left>=0&&rect.right<=innerWidth+1;\n return {ok,headerContrast,flyoutContrast,headerBackground:h.backgroundImage,triggerColor:t.color,popupBackground:p.backgroundColor,popupColor:o.color,expanded:trigger.getAttribute('aria-expanded'),popupRight:Math.round(rect.right)};\n})()");
              record.menuBarAudit.push({width, theme, opened, ...colors});
              if (width === 1440 && opened) {
                const shot = await cdp.send('Page.captureScreenshot', {
                  format: 'png', clip: {x: 0, y: 0, width, height: 340, scale: 1},
                  fromSurface: true, captureBeyondViewport: false,
                });
                await writeFile(path.join(outDir, 'workspace-menubar-' + theme + '-1440.png'), Buffer.from(shot.data, 'base64'));
              }
              if (!opened || !colors.ok) {
                record.status = 'MENUBAR_CONTRAST';
                record.errorMessage = 'OS menu color or flyout regression ' + width + 'px ' + theme + ': ' + JSON.stringify(colors);
              }
            }
          }
        } finally {
          if (originalTheme === null) await cdp.eval("document.documentElement.removeAttribute('data-theme')");
          else await cdp.eval("document.documentElement.setAttribute('data-theme'," + JSON.stringify(originalTheme) + ")");
          await cdp.send('Emulation.setDeviceMetricsOverride', {width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
          await cdp.eval("document.querySelector('nav[aria-label=\"Barra de menú de Business OS\"] button[aria-expanded=\"true\"]')?.click()");
        }
        console.log('WORKSPACE_MENUBAR_AUDIT ' + JSON.stringify(record.menuBarAudit));
      }
      // Also exercise read-only tab navigation in complex modules; a healthy
      // landing page alone cannot reveal render errors behind secondary tabs.
      const tabbedRoutes=new Set(['/marketing','/integration-hub','/produccion','/crm','/ventas','/ventas/operacion','/ventas/devoluciones','/finanzas/contabilidad','/proyectos']);
      if(record.status==='PASS' && tabbedRoutes.has(route.path)){
        const tabs=await cdp.eval(`(()=>{
          const container=document.querySelector('main[data-scroll-owner="workspace"]');
          return [...(container?.querySelectorAll('[class*="_tabs_"] > button,[role="tab"]')||[])]
            .filter(b=>b.getBoundingClientRect().width>0)
            .map(b=>b.textContent.trim()).filter(Boolean).slice(0,10);
        })()`);
        record.tabsChecked=[];
        for(const label of [...new Set(tabs)]){
          const clicked=await cdp.eval(`(()=>{
            const main=document.querySelector('main[data-scroll-owner="workspace"]');
            const button=[...(main?.querySelectorAll('[class*="_tabs_"] > button,[role="tab"]')||[])]
              .find(b=>b.textContent.trim()===${JSON.stringify(label)});
            if(!button)return false;
            button.click();return true;
          })()`);
          if(!clicked)continue;
          await sleep(300);
          const screen=await cdp.eval(`({
            fatal:Boolean(document.body?.innerText?.includes('No pudimos mostrar esta pantalla')),
            error:document.querySelector('main pre')?.innerText||null,
            route:location.pathname
          })`);
          record.tabsChecked.push({label,status:screen.fatal?'CRASH':'PASS'});
          if(screen.fatal){
            record.status='INTERACTION_CRASH';
            record.errorMessage=screen.error;
            record.failedTab=label;
            break;
          }
        }
      }
      // Regression: the legacy native-button radius must not turn Sales
      // document tabs into oval pills. Measure both resolutions after
      // navigating real UI tabs, without affecting their business state.
      if(record.status==='PASS' && ['/ventas/operacion','/ventas/devoluciones'].includes(route.path)){
        record.tabGeometry=[];
        for(const width of [1440,390]){
          await cdp.send('Emulation.setDeviceMetricsOverride',{
            width,height:900,deviceScaleFactor:1,mobile:width<760
          });
          await sleep(160);
          const geom=await cdp.eval(`(()=>{
            const tabs=[...document.querySelectorAll('[data-fluid-module="sales"] [class*="_tabs_"] > button')];
            return {
              count:tabs.length,
              selected:tabs.filter(b=>b.getAttribute('aria-pressed')==='true').length,
              geometry:tabs.map(b=>{
                const css=getComputedStyle(b);
                const bounds=b.getBoundingClientRect();
                return {
                  label:b.textContent.trim(),
                  radius:parseFloat(css.borderTopLeftRadius)||0,
                  borderLeft:parseFloat(css.borderLeftWidth)||0,
                  borderRight:parseFloat(css.borderRightWidth)||0,
                  borderBottom:parseFloat(css.borderBottomWidth)||0,
                  width:Math.round(bounds.width),
                  height:Math.round(bounds.height)
                };
              }),
              overflow:Math.round(document.documentElement.scrollWidth-innerWidth)
            };
          })()`);
          record.tabGeometry.push({width,...geom});
          const fail=geom.count!==2 || geom.selected!==1 || geom.overflow>3 ||
            geom.geometry.some(b=>b.radius>1||b.borderLeft>0||b.borderRight>0||b.borderBottom<2||b.height<40);
          if(fail){
            record.status='TAB_PILL_REGRESSION';
            record.errorMessage='Sales document tab geometry is not rectangular: '+JSON.stringify({width,...geom});
          }
          if(width===390){
            const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
            await writeFile(path.join(outDir,route.id.replaceAll(':','-').replaceAll('/','-')+'-390-flat-tabs.png'),Buffer.from(shot.data,'base64'));
          }
          if(fail)break;
        }
        await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
        console.log('SALES_TABS_GEOMETRY '+JSON.stringify({path:route.path,results:record.tabGeometry}));
      }
      const runtime=cdp.events.slice(eventStart).filter(e=>e.method==='Runtime.exceptionThrown')
        .map(e=>e.params?.exceptionDetails?.exception?.description||e.params?.exceptionDetails?.text||'Runtime exception');
      if(runtime.length)record.runtimeExceptions=runtime.slice(0,4);
      if(record.status==='PASS'&&runtime.length)record.status='RUNTIME_EXCEPTION';
      if(record.status!=='PASS'){
        const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
        record.screenshot='failure-'+String(index+1).padStart(3,'0')+'.png';
        await writeFile(path.join(outDir,record.screenshot),Buffer.from(shot.data,'base64'));
      }
    }catch(error){
      record={...record,status:'HARNESS_ERROR',errorMessage:String(error?.message||error)};
    }
    records.push(record);
    console.log('ROUTE_RESULT '+JSON.stringify(record));
  }
}catch(error){
  console.error('Route audit setup error: '+String(error?.stack||error));
  console.error('Chrome process: '+(chromeExit||'still running'));
  if(stderr.trim())console.error('Chrome stderr (last 5000 chars): '+stderr);
  records.push({id:'AUDIT',path:'/',status:'HARNESS_ERROR',errorMessage:String(error?.message||error),chromeLog:stderr.slice(-900)});
}finally{
  const summary={
    generatedAt:new Date().toISOString(),
    discovered:list.length,
    visited:records.filter(r=>r.id!=='AUDIT').length,
    failed:records.filter(r=>r.status!=='PASS').length,
    results:records,
  };
  await writeFile(path.join(outDir,'results.json'),JSON.stringify(summary,null,2));
  const markdown=[
    '# Business OS — browser route sweep',
    '',
    'Routes discovered: '+summary.discovered,
    'Routes visited: '+summary.visited,
    'Failures: '+summary.failed,
    '',
    '| Route | Result | Details |',
    '| --- | --- | --- |',
    ...records.map(r=>'| `'+r.path+'` | '+r.status+' | '+String(r.errorMessage||r.runtimeExceptions?.[0]||r.heading||'').replaceAll('|','/').replaceAll('\n',' ').slice(0,170)+' |'),
    '',
  ].join('\n');
  await writeFile(path.join(outDir,'report.md'),markdown);
  console.log('ROUTE_AUDIT_SUMMARY '+JSON.stringify({total:summary.discovered,visited:summary.visited,failed:summary.failed}));
  socket?.close();
  chrome.kill('SIGTERM');
  if(summary.failed||summary.discovered!==summary.visited)process.exitCode=1;
}
