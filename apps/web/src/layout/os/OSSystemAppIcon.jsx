import {useId} from 'react';

// HaibuOS matte artwork: original monochrome glyphs, shared by app chrome and launcher.
// No specular highlights, gloss layers, rim strokes or bitmap assets.
const ART={
 agenda:<><path fillRule="evenodd" d="M13 16h38a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5V21a5 5 0 0 1 5-5zm1 16v17h36V32z"/><path d="M20 11v12M44 11v12" stroke="#fff" strokeWidth="5" strokeLinecap="round"/><g>{[22,32,42].map(x=><circle key={x} cx={x} cy="40" r="3"/>)}</g></>,
 tasks:<g stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">{[17,32,47].map(y=><path key={y} d={`M12 ${y}l5 5 8-10 M33 ${y}h18`}/>)}</g>,
 messages:<path d="M32 12c-15 0-25 9-25 21 0 9 6 16 15 19l-5 8c-1 2 1 2 3 1l15-8c13-1 22-9 22-20 0-12-10-21-25-21z" transform="translate(0 -3)"/>,
 approvals:<path fillRule="evenodd" d="M16 9h24l12 12v32a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4zm23 2v13h11zm-18 26 8 8 16-17-4-4-12 13-4-4z"/>,
 directory:<><path fillRule="evenodd" d="M18 10h30a6 6 0 0 1 6 6v32a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6zm15 9a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 45h24v-3c0-6-5-9-12-9s-12 3-12 9z"/><path d="M8 21h9M8 32h9M8 43h9" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></>,
 notifications:<path d="M28 13a4 4 0 0 1 8 0c9 2 14 9 14 19v7l5 7a3 3 0 0 1-2 5H11a3 3 0 0 1-2-5l5-7v-7c0-10 5-17 14-19zm-3 41h14a7 7 0 0 1-14 0z"/>,
 sales:<><path fillRule="evenodd" d="M15 23h34l5 28a5 5 0 0 1-5 6H15a5 5 0 0 1-5-6zm9 4v5h16v-5z"/><path d="M22 24v-6a10 10 0 0 1 20 0v6" stroke="#fff" strokeWidth="5" fill="none"/></>,
 procurement:<><path d="M8 13h8l5 9h32l-6 21H23l-8-25H8z"/><circle cx="26" cy="51" r="5"/><circle cx="45" cy="51" r="5"/></>,
 inventory:<><path d="M32 9 54 20 32 31 10 20zM9 24l21 11v23L9 46zM34 35l21-11v22L34 58z"/></>,
 pos:<><path fillRule="evenodd" d="M38 8h14a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-5v6h-5v-6h-4a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3zm2 5v3h10v-3zM19 24h27a5 5 0 0 1 5 4l5 14H8l6-14a5 5 0 0 1 5-4zm0 6-1 4h6l1-4zm10 0v4h6v-4zm11 0v4h6v-4zM16 36l-1 4h7l1-4zm13 0v4h6v-4zm11 0v4h7l-1-4zM11 45h42a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4zm21 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></>,
 crm:<><circle cx="22" cy="20" r="10"/><path d="M6 48c0-10 7-16 16-16s16 6 16 16v5H6z"/><path d="m41 32 10-7m-10 9 10 9" stroke="#fff" strokeWidth="4"/><circle cx="39" cy="33" r="5"/><circle cx="52" cy="24" r="6"/><circle cx="52" cy="44" r="6"/></>,
 projects:<><rect x="9" y="13" width="27" height="9" rx="4"/><rect x="20" y="27" width="33" height="9" rx="4"/><rect x="32" y="41" width="24" height="9" rx="4"/></>,
 production:<><path d="M11 51h27v6H11zM18 49l7-18 6 2-6 16zM29 25l15-14 5 5-15 15zM47 13l9 8-4 5-8-8z"/><circle cx="27" cy="28" r="8"/><circle cx="46" cy="14" r="5"/><path d="M53 24v7l-5 4m5-4 5 4" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/></>,
 marketing:<><path d="M9 27h11l27-13v36L20 37H9a5 5 0 0 1-5-5 5 5 0 0 1 5-5zm8 13h9l5 13h-9z"/><path d="m53 20 6-4m-5 16h7m-8 12 6 4" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></>,
 finance:<path fillRule="evenodd" d="M12 22 45 13a5 5 0 0 1 6 5v4zm-1 4h42a5 5 0 0 1 5 5v19a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V31a5 5 0 0 1 5-5zm35 10a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>,
 billing:<path fillRule="evenodd" d="M14 10h36v46l-6-4-6 4-6-4-6 4-6-4-6 4zm7 12v4h22v-4zm0 10v4h22v-4zm0 10v4h15v-4z"/>,
 hr:<><circle cx="32" cy="20" r="10"/><circle cx="13" cy="27" r="7"/><circle cx="51" cy="27" r="7"/><path d="M17 54v-7c0-9 6-15 15-15s15 6 15 15v7zM3 49v-5c0-6 4-10 10-10h4c-4 4-5 9-5 15zm49 0c0-6-1-11-5-15h4c6 0 10 4 10 10v5z"/></>,
 reports:<><rect x="11" y="36" width="11" height="19" rx="3"/><rect x="27" y="25" width="11" height="30" rx="3"/><rect x="43" y="12" width="11" height="43" rx="3"/></>,
 settings:<path fillRule="evenodd" d="M27 8h10l2 7 5 3 7-2 6 9-5 6v5l5 6-6 9-7-2-5 3-2 7H27l-2-7-5-3-7 2-6-9 5-6v-5l-5-6 6-9 7 2 5-3zm5 15a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>,
 administration:<><path fillRule="evenodd" d="M11 20h42a5 5 0 0 1 5 5v26a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V25a5 5 0 0 1 5-5zm-1 15v4h44v-4zm17-2v9h10v-9z"/><path d="M23 20v-7h18v7" stroke="#fff" strokeWidth="5" fill="none" strokeLinejoin="round"/></>,
 operations:<><path d="M12 30a21 21 0 0 1 36-15M47 10l4 11-12-1M52 34a21 21 0 0 1-36 15M17 54l-4-11 12 1" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/><path fillRule="evenodd" d="M29 20h6l2 5 5 1 3 5-3 4-1 5-5 1-2 4h-6l-2-5-5-1-3-5 3-4 1-5 5-1zm3 7a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/></>,
 demo:<><path fillRule="evenodd" d="M11 12h42a5 5 0 0 1 5 5v28a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5zm1 6v26h40V18z"/><path d="m27 22 14 9-14 9zM29 49h6v6h9v4H20v-4h9z"/></>,
 application:<>{[13,35].flatMap(x=>[13,35].map(y=><rect key={x+'-'+y} x={x} y={y} width="16" height="16" rx="4"/>))}</>,
};
const COLORS={
 agenda:['#FACC15','#E6A900'],tasks:['#2799F2','#1765D4'],messages:['#F77DC9','#E93696'],approvals:['#FFA527','#F16A06'],directory:['#14C6B0','#008E82'],notifications:['#FF6464','#E52738'],sales:['#28D66E','#079D49'],procurement:['#FFB13C','#EC7808'],inventory:['#15C8EA','#009AC9'],pos:['#06BDEB','#0751C9'],crm:['#A567E9','#6536BA'],projects:['#15C4C7','#008E98'],production:['#A85BF0','#7130BA'],marketing:['#EF66CF','#B92AA1'],finance:['#72CE45','#299322'],billing:['#16D0C8','#00A3A5'],hr:['#7375F0','#4140BA'],reports:['#FF7764','#F03E3C'],settings:['#9CA8B2','#64727E'],administration:['#5C91C2','#315F90'],operations:['#FFCB25','#F26C05'],demo:['#557B99','#294960'],application:['#82A8C8','#48769F'],
};
export default function OSSystemAppIcon({appKey='application',size=48,fallback:Fallback}){
  const id='haibu-'+useId().replace(/:/g,'');
  const art=ART[appKey];
  if(!art)return Fallback?<Fallback size={Math.round(size*.52)} aria-hidden="true"/>:null;
  const [light,dark]=COLORS[appKey];
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="#fff" role="img" aria-hidden="true" data-haibu-app-icon={appKey}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></linearGradient></defs>
    <rect x="1" y="1" width="62" height="62" rx="17" fill={`url(#${id})`}/>
    <g transform="translate(4 4) scale(.875)">{art}</g>
  </svg>;
}
