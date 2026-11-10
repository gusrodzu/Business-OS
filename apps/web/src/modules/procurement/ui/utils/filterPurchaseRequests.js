// Selector puro para mantener filtros de solicitudes fuera del componente de página.
const VIEW_STATUSES = {pending:'PENDING',approved:'APPROVED',draft:'DRAFT'};

export function filterPurchaseRequests(requests,{query='',view='all',statusFilter='',priorityFilter=''}){
  const search=query.toLowerCase().trim();
  return requests.filter(request=>{
    if(VIEW_STATUSES[view] && request.status!==VIEW_STATUSES[view])return false;
    if(statusFilter && request.status!==statusFilter)return false;
    if(priorityFilter && request.priority!==priorityFilter)return false;
    if(!search)return true;
    return [request.folio,request.title,request.status,request.requestedBy?.firstName,request.requestedBy?.lastName,request.warehouse?.name]
      .filter(Boolean).join(' ').toLowerCase().includes(search);
  });
}
