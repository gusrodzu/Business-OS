// Commercial templates are curated examples; not the full official SCIAN classes.
export const SECTORS = Object.freeze([
'11 Agricultura, cría y explotación de animales, aprovechamiento forestal, pesca y caza',
'21 Minería','22 Generación y distribución de energía, agua y gas','23 Construcción',
'31-33 Industrias manufactureras','43 Comercio al por mayor','46 Comercio al por menor',
'48-49 Transportes, correos y almacenamiento','51 Información en medios masivos',
'52 Servicios financieros y de seguros','53 Servicios inmobiliarios y de alquiler',
'54 Servicios profesionales, científicos y técnicos','55 Corporativos',
'56 Servicios de apoyo a los negocios y manejo de residuos','61 Servicios educativos',
'62 Servicios de salud y asistencia social','71 Servicios de esparcimiento, culturales y deportivos',
'72 Servicios de alojamiento temporal y preparación de alimentos y bebidas',
'81 Otros servicios excepto actividades gubernamentales',
'93 Actividades legislativas, gubernamentales y de impartición de justicia'
].map(label=>({code:label.split(' ')[0],name:label.substring(label.indexOf(' ')+1)})));
export const PROFILES = Object.freeze([
{slug:'refaccionaria',name:'Refaccionaria',sector:'46',required:['pos','inventory','procurement','sales'],optional:['crm','finance']},
{slug:'restaurante',name:'Restaurante',sector:'72',required:['pos','inventory','procurement'],optional:['crm','hr','finance'],capabilities:['tables','kitchen_orders']},
{slug:'barberia',name:'Barbería y estética',sector:'81',required:['agenda','crm','pos'],optional:['hr','inventory'],capabilities:['staff_booking','commissions']},
{slug:'transporte',name:'Empresa de transporte',sector:'48-49',required:['sales','crm','hr','procurement','finance','projects','operations'],optional:['inventory'],capabilities:['fleet','dispatch','routing','proof_of_delivery']},
{slug:'manufactura',name:'Manufactura',sector:'31-33',required:['production','inventory','procurement','sales'],optional:['hr','finance'],capabilities:['bom','quality_control']},
{slug:'clinica',name:'Clínica',sector:'62',required:['agenda','crm','finance'],optional:['inventory','hr'],capabilities:['medical_records','restricted_access']},
{slug:'escuela',name:'Escuela',sector:'61',required:['crm','finance','hr'],optional:['agenda','projects'],capabilities:['enrollment','attendance']},
{slug:'constructora',name:'Constructora',sector:'23',required:['projects','procurement','finance','hr'],optional:['inventory','sales'],capabilities:['work_sites','progress_tracking']},
{slug:'tienda',name:'Tienda minorista',sector:'46',required:['pos','inventory','procurement'],optional:['sales','crm','finance']},
{slug:'agencia',name:'Agencia y consultoría',sector:'54',required:['crm','projects','sales'],optional:['finance','hr'],capabilities:['billable_hours']}
]);
