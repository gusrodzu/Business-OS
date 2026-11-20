import {useId} from 'react';

/** Original Business OS app artwork. Shared by launcher and window chrome. */
const ART={
  sales:<><path d="M13 28h38l-4 24H18z" fill="#fff" opacity=".93"/><path d="M21 28v-5a11 11 0 0 1 22 0v5" fill="none" stroke="#ffde7d" strokeWidth="4"/><path d="M26 39h12" stroke="#0d9d6e" strokeWidth="4" strokeLinecap="round"/></>,
  procurement:<><path d="M11 29h42l-5 22H18z" fill="#ffe6a8"/><path d="M31 10v21m-8-8 8 8 8-8" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="22" cy="54" r="4" fill="#fff"/><circle cx="44" cy="54" r="4" fill="#fff"/></>,
  inventory:<><path d="m12 23 19-11 20 11v23L31 57 12 46z" fill="#c9efff"/><path d="m12 23 19 11 20-11M31 34v23" fill="none" stroke="#2278c9" strokeWidth="3"/><path d="m21 18 19 11v10" fill="none" stroke="#fff" strokeWidth="4"/></>,
  production:<><rect x="7" y="44" width="50" height="12" rx="6" fill="#9aa5c8"/><circle cx="16" cy="50" r="3" fill="#34345f"/><circle cx="32" cy="50" r="3" fill="#34345f"/><circle cx="48" cy="50" r="3" fill="#34345f"/><path d="M18 43V30l12-12 13 5 6-9" fill="none" stroke="#f8c55d" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round"/><circle cx="30" cy="18" r="6" fill="#e7e5ff" stroke="#7065b5" strokeWidth="2"/><circle cx="49" cy="14" r="6" fill="#f4dfad" stroke="#7065b5" strokeWidth="2"/><path d="M49 20v13" stroke="#f7e4b5" strokeWidth="4"/><rect x="43" y="32" width="13" height="12" rx="2" fill="#ff9d32"/></>,
  crm:<><circle cx="24" cy="23" r="9" fill="#e9e5ff"/><circle cx="43" cy="25" r="8" fill="#c4e6ff"/><path d="M10 47c0-11 7-16 15-16s15 5 15 16v5H10z" fill="#e9e5ff"/><path d="M39 36c9-2 15 4 15 12v4H41" fill="#b8dcff"/><path d="m43 40 7 4-7 4z" fill="#ffc05e"/></>,
  projects:<><rect x="10" y="14" width="28" height="9" rx="4" fill="#d7f7ff"/><rect x="10" y="28" width="40" height="9" rx="4" fill="#a6e9fa"/><rect x="10" y="42" width="29" height="9" rx="4" fill="#d7f7ff"/><path d="m43 45 5 5 9-12" fill="none" stroke="#80f7b1" strokeWidth="5" strokeLinecap="round"/></>,
  finance:<><rect x="12" y="38" width="9" height="17" rx="3" fill="#b8f4ff"/><rect x="27" y="28" width="9" height="27" rx="3" fill="#c6b9ff"/><rect x="42" y="17" width="9" height="38" rx="3" fill="#ffd47a"/><path d="m13 27 15-11 10 4 13-12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></>,
  hr:<><circle cx="32" cy="19" r="10" fill="#fff"/><circle cx="14" cy="25" r="7" fill="#c2c6ff"/><circle cx="50" cy="25" r="7" fill="#c2c6ff"/><path d="M17 53V45c0-10 7-15 15-15s15 5 15 15v8z" fill="#f0e5ff"/><path d="M4 50v-8c0-6 4-10 10-10h4M60 50v-8c0-6-4-10-10-10h-4" fill="none" stroke="#d6c4ff" strokeWidth="6"/><path d="m32 35-4 7 4 8 4-8z" fill="#7553bf"/></>,
  reports:<><rect x="12" y="10" width="40" height="45" rx="6" fill="#efe9ff"/><rect x="20" y="36" width="7" height="12" rx="2" fill="#7764d6"/><rect x="30" y="27" width="7" height="21" rx="2" fill="#7764d6"/><rect x="40" y="19" width="7" height="29" rx="2" fill="#7764d6"/></>,
  tasks:<><rect x="11" y="10" width="42" height="45" rx="8" fill="#e9f6ff"/>{[22,36,49].map(y=><g key={y}><path d={`m18 ${y} 4 4 6-7`} stroke="#ffb72c" strokeWidth="3" fill="none" strokeLinecap="round"/><path d={`M34 ${y+1}h12`} stroke="#3d89d5" strokeWidth="3" strokeLinecap="round"/></g>)}</>,
  messages:<><path d="M10 17a8 8 0 0 1 8-8h29a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H28L15 56v-9a8 8 0 0 1-5-8z" fill="#eee5ff"/><circle cx="23" cy="28" r="3" fill="#7955c7"/><circle cx="33" cy="28" r="3" fill="#7955c7"/><circle cx="43" cy="28" r="3" fill="#7955c7"/></>,
  settings:<><path d="M27 8h10l3 8 8 3 8-3 5 9-6 7 1 9-6 8-9-2-7 5-9-5-9 2-6-8 1-9-6-7 5-9 8 3 8-3z" transform="translate(3 -1) scale(.9)" fill="#e4e8ff"/><circle cx="32" cy="32" r="11" fill="#7d83ae"/><circle cx="32" cy="32" r="5" fill="#e4e8ff"/></>,
  marketing:<><path d="m12 26 29-13v38L12 38z" fill="#fff"/><path d="M19 39l5 13h10l-6-16" fill="#ffc2e4"/><path d="M47 21q10 10 0 20" fill="none" stroke="#ffcf80" strokeWidth="4" strokeLinecap="round"/></>,
  billing:<><path d="M17 9h30v46l-6-4-6 4-6-4-6 4-6-4z" fill="#f2ffff"/><path d="M23 22h18M23 31h12M23 40h17" stroke="#2c9ac2" strokeWidth="3" strokeLinecap="round"/></>,
  pos:<><rect x="12" y="12" width="40" height="30" rx="5" fill="#eaf4ff"/><rect x="18" y="19" width="28" height="14" rx="2" fill="#7ac1fa"/><path d="M25 43v9h14v-9" stroke="#eaf4ff" strokeWidth="5"/><path d="M20 54h24" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></>,
};
const COLORS={sales:['#22e5a0','#087d6a'],procurement:['#ffca65','#ef6819'],inventory:['#23cbf2','#1258d4'],production:['#9654f8','#4622a3'],crm:['#25c3fa','#4936d4'],projects:['#18d2d0','#075a9d'],finance:['#14d6ed','#3324b8'],hr:['#c27af5','#6120b2'],reports:['#a48bff','#5236b9'],tasks:['#3ccfff','#1455d0'],messages:['#b15dff','#5a2cb6'],settings:['#9ba9d1','#435174'],marketing:['#ff75bd','#aa2b8a'],billing:['#40d9e9','#1379ad'],pos:['#7a9ffc','#294cb3']};
export default function OSSystemAppIcon({appKey='application',size=48,className='',fallback:Fallback}){
  const id=useId().replace(/:/g,'');
  const art=ART[appKey];
  if(!art)return Fallback?<Fallback size={Math.round(size*.52)} aria-hidden="true"/>:null;
  const [light,dark]=COLORS[appKey];
  return <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-hidden="true">
    <defs><linearGradient id={id} x1="5" y1="3" x2="59" y2="62" gradientUnits="userSpaceOnUse"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></linearGradient></defs>
    <rect x="1" y="1" width="62" height="62" rx="15" fill={`url(#${id})`}/>
    <path d="M13 5h38" stroke="#fff" strokeOpacity=".23" strokeWidth="2" strokeLinecap="round"/>
    {art}
  </svg>;
}
