/**
 * Lectura del estado de configuración de un tenant REAL para Super Admin.
 * NO es un workflow persistido de onboarding ni una autorización para entrar al tenant.
 * La información proviene de GET /platform-admin/companies (backend protegido).
 */
export const IMPLEMENTATION_CHECKS=[
  {id:'industry',label:'Giro empresarial'},
  {id:'plan',label:'Plan registrado'},
  {id:'users',label:'Usuarios vinculados'},
  {id:'modules',label:'Módulos vinculados'},
];

export function companyReadiness(company){
  const subscription=company?.subscriptions?.[0];
  const counts=company?._count||{};
  const checks=[
    {id:'industry',label:'Giro empresarial',ready:Boolean(company?.industry?.trim()),detail:company?.industry||'Sin giro registrado'},
    {id:'plan',label:'Plan registrado',ready:Boolean(subscription?.plan?.name),detail:subscription?.plan?.name||'Sin plan registrado'},
    {id:'users',label:'Usuarios vinculados',ready:Number(counts.users||0)>0,detail:String(Number(counts.users||0))+' usuario(s)'},
    {id:'modules',label:'Módulos vinculados',ready:Number(counts.enabledModules||0)>0,detail:String(Number(counts.enabledModules||0))+' asignación(es)'},
  ];
  const complete=checks.filter(item=>item.ready).length;
  return {
    id:company?.id,
    name:company?.name||'Empresa sin nombre',
    checks,complete,total:checks.length,
    subscriptionStatus:subscription?.status||null,
    active:company?.active===true,
    // A summary of observed configuration only; not a saved onboarding status.
    summary:complete===4?'Base documentada':complete===0?'Sin configuración registrada':'Configuración parcial',
  };
}
