import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Check,ChevronDown,Search} from 'lucide-react';
import styles from './BusinessSelect.module.css';

const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');

// Controlled single-value selector. Native dialogs must own their nested popups.
export function BusinessSelect({label,value,options=[],onChange,searchable=false,disabled=false,placeholder='Seleccionar',descriptionId}){
  const id=useId();
  const trigger=useRef(null),popup=useRef(null),focusTarget=useRef(null);
  const [host,setHost]=useState(null),[query,setQuery]=useState(''),[active,setActive]=useState(0);
  const open=Boolean(host);
  const selected=options.find(option=>String(option.value)===String(value??''));
  const filtered=options.filter(option=>normalize(option.label).includes(normalize(query.trim())));
  const index=Math.max(0,Math.min(active,filtered.length-1));
  const activeOption=filtered[index];
  function close(restore=true){setHost(null);if(restore)trigger.current?.focus({preventScroll:true});}
  function show(){
    if(disabled)return;
    const node=trigger.current;
    setQuery('');
    setActive(Math.max(0,options.findIndex(option=>String(option.value)===String(value??''))));
    setHost(node.closest('dialog[open]')||document.body);
  }
  function choose(option){if(!option)return;onChange?.(String(option.value));close();}
  useLayoutEffect(()=>{
    if(!host||!popup.current)return;
    const panel=popup.current,node=trigger.current,visual=window.visualViewport;
    function position(){
      const anchor=node.getBoundingClientRect();
      const viewport={left:visual?.offsetLeft||0,top:visual?.offsetTop||0,width:visual?.width||innerWidth,height:visual?.height||innerHeight};
      const native=host!==document.body;
      const rect=native?host.getBoundingClientRect():{left:0,top:0,right:innerWidth,bottom:innerHeight};
      const leftBound=Math.max(rect.left,viewport.left)+8,rightBound=Math.min(rect.right,viewport.left+viewport.width)-8;
      const topBound=Math.max(rect.top,viewport.top)+8,bottomBound=Math.min(rect.bottom,viewport.top+viewport.height)-8;
      const width=Math.max(0,Math.min(Math.max(anchor.width,searchable?280:180),rightBound-leftBound));
      const maxHeight=Math.max(0,Math.min(380,bottomBound-topBound));
      panel.style.position=native?'absolute':'fixed';
      panel.style.width=width+'px';panel.style.maxHeight=maxHeight+'px';
      const height=Math.min(panel.getBoundingClientRect().height,maxHeight);
      const below=bottomBound-anchor.bottom-6,above=anchor.top-topBound-6;
      const y=below>=height?anchor.bottom+6:above>=height?anchor.top-height-6:Math.min(Math.max(anchor.bottom+6,topBound),bottomBound-height);
      panel.style.left=(Math.min(Math.max(anchor.left,leftBound),rightBound-width)-(native?rect.left+host.clientLeft:0))+'px';
      panel.style.top=(Math.max(topBound,y)-(native?rect.top+host.clientTop:0))+'px';
    }
    position();
    const observer=typeof ResizeObserver==='function'?new ResizeObserver(position):null;
    [panel,node,host].forEach(el=>observer?.observe(el));
    window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
    visual?.addEventListener('resize',position);visual?.addEventListener('scroll',position);
    focusTarget.current?.focus({preventScroll:true});
    return ()=>{observer?.disconnect();window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);visual?.removeEventListener('resize',position);visual?.removeEventListener('scroll',position);};
  },[host,searchable]);
  useEffect(()=>{
    if(!open)return;
    function outside(e){if(!popup.current?.contains(e.target)&&!trigger.current?.contains(e.target))close(false);}
    document.addEventListener('pointerdown',outside);
    document.addEventListener('focusin',outside);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);};
  },[open]);
  useEffect(()=>{
    if(open&&activeOption){
      const item=document.getElementById(id+'-option-'+index);
      const list=item?.parentElement;
      if(item&&list){if(item.offsetTop<list.scrollTop)list.scrollTop=item.offsetTop;else if(item.offsetTop+item.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=item.offsetTop+item.offsetHeight-list.clientHeight;}
    }
  },[open,index,query,id]);
  function keys(e){
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}
    if(e.key==='Tab'){close();return;}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setActive(Math.max(0,Math.min(filtered.length-1,index+(e.key==='ArrowDown'?1:-1))));}
    else if(!searchable&&(e.key==='Home'||e.key==='End')){e.preventDefault();setActive(e.key==='Home'?0:Math.max(0,filtered.length-1));}
    else if(e.key==='Enter'||(!searchable&&e.key===' ')){e.preventDefault();choose(activeOption);}
    else if(!searchable&&e.key.length===1){const found=filtered.findIndex(option=>normalize(option.label).startsWith(normalize(e.key)));if(found>=0)setActive(found);}
  }
  const activeId=activeOption?id+'-option-'+index:undefined;
  return <div className={styles.field} data-business-select-field>
    <span id={id+'-label'} className={styles.label}>{label}</span>
    <button ref={trigger} type="button" className={styles.trigger} data-business-select-trigger={label} aria-labelledby={id+'-label '+id+'-value'} aria-describedby={descriptionId} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?id+'-list':undefined} disabled={disabled} onClick={()=>open?close():show()} onKeyDown={e=>{if(!open&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();show();}}}>
      <span id={id+'-value'}>{selected?.label??(value?String(value):placeholder)}</span><ChevronDown size={17} aria-hidden="true"/>
    </button>
    {open?createPortal(<div ref={popup} data-business-select-popup data-os-elevation="4" className={styles.popup} role="group" aria-label={label} onKeyDown={keys}>
      {searchable?<div className={styles.search}><Search size={16} aria-hidden="true"/><input ref={focusTarget} type="text" role="combobox" aria-label={'Buscar '+label.toLocaleLowerCase('es')} aria-expanded="true" aria-autocomplete="list" aria-controls={id+'-list'} aria-activedescendant={activeId} placeholder="Buscar responsable..." value={query} onChange={e=>{setQuery(e.target.value);setActive(0);}}/></div>:null}
      <div ref={searchable?undefined:focusTarget} id={id+'-list'} className={styles.list} role="listbox" tabIndex={searchable?-1:0} aria-labelledby={id+'-label'} aria-activedescendant={searchable?undefined:activeId}>
        {filtered.map((option,i)=><div key={String(option.value)} id={id+'-option-'+i} role="option" aria-selected={String(option.value)===String(value??'')} data-active={i===index} className={styles.option} onPointerMove={()=>setActive(i)} onClick={()=>choose(option)}><span>{option.label}</span>{String(option.value)===String(value??'')?<Check size={16} aria-hidden="true"/>:null}</div>)}
      </div>
      {!filtered.length?<div role="status" className={styles.empty}>No se encontraron opciones.</div>:null}
    </div>,host):null}
  </div>;
}
