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
        const osWindow=document.querySelector('[data-os-application-window="true"]');
        const stage=document.querySelector('[data-os-window-stage="true"]');
        const osWorkspace=document.querySelector('[data-workspace-chrome-rows]');
        const activePanel=stage?.querySelector('[data-os-window-active="true"]');
        const windowBar=osWindow?.querySelector('header');
        const titleElement=windowBar?.querySelector('strong');
        const parseRGB=value=>(String(value).match(/rgba?\\(([^)]+)\\)/)?.[1]||'').split(/[,\\s/]+/).filter(Boolean).slice(0,3).map(Number);
        const luminance=channels=>channels.map(value=>{
          const v=value/255;
          return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);
        }).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
        const colorContrast=(front,back)=>{
          const a=parseRGB(front),b=parseRGB(back);
          if(a.length!==3||b.length!==3)return 0;
          const f=luminance(a),g=luminance(b);
          return Number(((Math.max(f,g)+.05)/(Math.min(f,g)+.05)).toFixed(2));
        };
        const windowTitleContrast=titleElement&&windowBar
          ?colorContrast(getComputedStyle(titleElement).color,getComputedStyle(windowBar).backgroundColor):0;
        const heading=document.querySelector('main h1,h1')?.innerText?.trim()||null;
        return {
          pathname:location.pathname,
          heading,
          fatal:error,
          errorMessage:fallback,
          shell:Boolean(document.querySelector('[data-responsive-shell=true]')),
          osScreen:document.querySelector('[data-responsive-shell=true]')?.getAttribute('data-os-screen'),
          osWindow:Boolean(osWindow),
          osStageHeight:Math.round(stage?.getBoundingClientRect().height||0),
          osChromeRows:Number(osWorkspace?.dataset.workspaceChromeRows||0),
          osRenderedChromeRows:osWorkspace ? osWorkspace.children.length-1 : 0,
          osWindowHeight:Math.round(activePanel?.getBoundingClientRect().height||0),
          osWindowVisible:!!activePanel&&getComputedStyle(activePanel).display!=='none',
          osWindowFocused:activePanel?.dataset.osWindowSlot||null,
          osWindowTitle:windowBar?.querySelector('strong')?.innerText?.trim()||null,
          osWindowTitleContrast:windowTitleContrast,
          osWindowControls:[...(windowBar?.querySelectorAll('button')||[])].filter(button=>
             button.getClientRects().length>0&&getComputedStyle(button).visibility!=='hidden').length,
           osPhoneControlHidden:windowBar?.querySelector('button[aria-label="Volver al escritorio de Pocket OS"]')?.getClientRects().length===0,
          osDock:Boolean(document.querySelector('[data-business-os-dock="true"]')), 
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
      else if(route.path!=='/' && data.pathname!=='/' && data.pathname!=='/login'
        && (!data.osWindow||!data.osWindowTitle||data.osWindowControls!==3||!data.osPhoneControlHidden||!data.osDock)){
        record.status='NO_OS_WINDOW';
        record.errorMessage='Route missing shared window, OS dock, or usable controls: '+JSON.stringify({title:data.osWindowTitle,controls:data.osWindowControls,dock:data.osDock});
      }
      if(record.status==='PASS' && data.osWindow && data.osChromeRows!==data.osRenderedChromeRows){
        record.status='OS_CHROME_GRID_MISMATCH';
        record.errorMessage='Window grid rows differ from rendered shell nodes: '+JSON.stringify({route:route.path,rows:data.osChromeRows,rendered:data.osRenderedChromeRows});
      }
      if(record.status==='PASS' && data.osWindow && (data.osStageHeight<300||data.osWindowHeight<250||!data.osWindowVisible)){
        record.status='OS_WINDOW_INVISIBLE';
        record.errorMessage='OS application route mounted but not visible: '+JSON.stringify({route:route.path,stageHeight:data.osStageHeight,windowHeight:data.osWindowHeight,active:data.osWindowFocused});
      }
      if(record.status==='PASS' && data.osWindow && data.osWindowTitleContrast<4.5){
        record.status='OS_TITLE_CONTRAST';
        record.errorMessage='Unreadable OS window title: '+JSON.stringify({route:route.path,contrast:data.osWindowTitleContrast});
      }
      if(record.status==='PASS' && ['/crm','/pos','/finanzas/cuentas-por-pagar','/recursos-humanos','/configuracion'].includes(route.path)){
        const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
        await writeFile(path.join(outDir,'universal-window-'+route.path.replaceAll('/','-')+'.png'),Buffer.from(shot.data,'base64'));
      }

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
              const colors = await cdp.eval("(()=>{\n const nav=document.querySelector('nav[aria-label=\"Barra de menú de Business OS\"]');\n const header=nav?.closest('header'), trigger=nav?.querySelectorAll('button[aria-haspopup=\"true\"]')?.[1],activeTrigger=nav?.querySelector('button[aria-expanded=\"true\"]');\n const popup=nav?.querySelector('[role=\"group\"]'), choice=popup?.querySelector('button');\n if(!header||!trigger||!activeTrigger||!popup||!choice)return {ok:false,error:'menu or dropdown not visible'};\n const rgb=s=>{const m=String(s).match(/rgba?\\(([^)]+)\\)/);return m?m[1].split(/[,\\s/]+/).filter(Boolean).map(Number).slice(0,3):null};\n const lum=vals=>vals.map(v=>{const x=v/255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4)}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);\n const contrast=(a,b)=>{if(!a||!b||a.length!==3||b.length!==3)return 0;const x=lum(a),y=lum(b);return Number(((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2))};\n const h=getComputedStyle(header),t=getComputedStyle(trigger),a=getComputedStyle(activeTrigger),p=getComputedStyle(popup),o=getComputedStyle(choice);\n const stops=(h.backgroundImage.match(/rgba?\\([^)]*\\)/g)||[]).map(rgb);\n const headerContrast=stops.length?Math.min(...stops.map(stop=>contrast(rgb(t.color),stop))):0;\n const flyoutContrast=contrast(rgb(o.color),rgb(p.backgroundColor));\n const activeContrast=contrast(rgb(a.color),rgb(a.backgroundColor));\n const rect=popup.getBoundingClientRect();\n const ok=headerContrast>=4.5&&flyoutContrast>=4.5&&activeContrast>=4.5&&rect.width>120&&rect.left>=0&&rect.right<=innerWidth+1;\n return {ok,headerContrast,flyoutContrast,activeContrast,headerBackground:h.backgroundImage,triggerColor:t.color,activeBackground:a.backgroundColor,popupBackground:p.backgroundColor,popupColor:o.color,expanded:activeTrigger.getAttribute('aria-expanded'),popupRight:Math.round(rect.right)};\n})()");
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

      // Regression: home widgets intentionally remain light over the OS dark
      // wallpaper. Global dark heading rules must never produce white on white.
      if(route.path==='/' && record.status==='PASS'){
        record.homeWidgetAudit=[];
        const initialTheme=await cdp.eval("document.documentElement.getAttribute('data-theme')");
        try{
          for(const width of [1280,1440]){
            await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
            for(const theme of ['light','dark']){
              await cdp.eval("document.documentElement.setAttribute('data-theme'," + JSON.stringify(theme) + ")");
              await sleep(170);
              const cards=await cdp.eval("(() => {\n  const ids=['os-control-heading','os-wallpaper-card-heading','os-tasks-heading','os-agenda-heading'];\n  const rgb=s=>{\n    const match=String(s).match(/rgba?\\(([^)]+)\\)/);\n    if(!match)return null;\n    return match[1].split(/[,\\s/]+/).filter(Boolean).map(Number).slice(0,3);\n  };\n  const luma=channels=>channels.map(v=>{const x=v/255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4)}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);\n  const ratio=(fg,bg)=>{\n    if(!fg||!bg||fg.length!==3||bg.length!==3)return 0;\n    const a=luma(fg),b=luma(bg);\n    return Number(((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toFixed(2));\n  };\n  return ids.map(id=>{\n    const heading=document.getElementById(id);\n    const section=heading?.closest('section');\n    if(!heading||!section)return {id,ok:false,error:'missing widget or heading'};\n    const bg=getComputedStyle(section).backgroundColor;\n    const foreground=getComputedStyle(heading).color;\n    const textCandidates=[...section.querySelectorAll('p,small,button,[class*=\"_metric_\"] strong,[class*=\"_metric_\"] span,[class*=\"_listRow_\"]')].filter(el=>el.getBoundingClientRect().width>0);\n    const samples=[{name:'heading',text:heading.innerText,foreground,contrast:ratio(rgb(foreground),rgb(bg))},\n      ...textCandidates.slice(0,5).map((el,index)=>{\n        const color=getComputedStyle(el).color;\n        const localBg=getComputedStyle(el).backgroundColor;\n        const effectiveBg=localBg==='rgba(0, 0, 0, 0)'||localBg==='transparent'?bg:localBg;\n        return {name:'content-'+index,text:el.innerText?.slice(0,45),foreground:color,contrast:ratio(rgb(color),rgb(effectiveBg))};\n      })];\n    return {id,background:bg,ok:samples.every(s=>s.contrast>=4.5),samples};\n  });\n})()");
              record.homeWidgetAudit.push({width,theme,cards});
              if(width===1440){
                const shot=await cdp.send('Page.captureScreenshot',{
                  format:'png',captureBeyondViewport:false,fromSurface:true
                });
                await writeFile(path.join(outDir,'workspace-home-widgets-'+theme+'-1440.png'),Buffer.from(shot.data,'base64'));
              }
              if(cards.length!==4||cards.some(card=>!card.ok)){
                record.status='OS_WIDGET_CONTRAST';
                record.errorMessage='OS home widget contrast: '+JSON.stringify({width,theme,cards:cards.filter(card=>!card.ok)});
              }
            }
          }
        }finally{
          if(initialTheme===null)await cdp.eval("document.documentElement.removeAttribute('data-theme')");
          else await cdp.eval("document.documentElement.setAttribute('data-theme'," + JSON.stringify(initialTheme) + ")");
          await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
        }
        console.log('WORKSPACE_HOME_WIDGET_AUDIT '+JSON.stringify(record.homeWidgetAudit));
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
