import {createContext,useContext,useState} from 'react';

// Ephemeral demo state. Provider is mounted inside the tenant-scoped OS stage.
// Never use this for production messaging or cross-company persistence.
const Context=createContext(null);
export const demoContacts=[
 {id:'ana',name:'Ana Martínez',team:'Ventas',status:'Disponible',color:'#38b66b',initials:'AM'},
 {id:'carlos',name:'Carlos Rivera',team:'Operaciones',status:'Ocupado',color:'#ed9d39',initials:'CR'},
 {id:'sofia',name:'Sofía López',team:'Recursos Humanos',status:'Disponible',color:'#38b66b',initials:'SL'},
 {id:'equipo',name:'Equipo de proyectos',team:'Grupo de ejemplo',status:'Grupo',color:'#7295c6',initials:'EP'},
];
export const demoInitialMessages={
 ana:[{id:1,author:'them',text:'¡Hola! ¿Cómo va el reporte de ventas?',time:'10:24'},{id:2,author:'me',text:'Estoy revisando los últimos datos.',time:'10:26'}],
 carlos:[{id:1,author:'them',text:'Tenemos pendiente la revisión del inventario.',time:'09:12'}],
 sofia:[{id:1,author:'them',text:'¡Buen día! Bienvenido al equipo.',time:'Ayer'}],
 equipo:[{id:1,author:'them',text:'Bienvenidos al espacio del proyecto.',time:'Ayer'}],
};
export function MessengerDemoProvider({children}){
 const [messages,setMessages]=useState(demoInitialMessages);
 const [drafts,setDrafts]=useState({});
 const [popoutDrafts,setPopoutDrafts]=useState({});
 return <Context.Provider value={{messages,setMessages,drafts,setDrafts,popoutDrafts,setPopoutDrafts}}>{children}</Context.Provider>;
}
export function useMessengerDemo(){return useContext(Context);}
