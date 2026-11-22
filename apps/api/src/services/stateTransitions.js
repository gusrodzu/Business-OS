export class InvalidStateTransitionError extends Error{
  constructor({entity='Documento',from,to,allowed=[]}){
    super(`${String(entity)}: transición inválida ${String(from)} → ${String(to)}.`);
    this.name='InvalidStateTransitionError';
    this.code='INVALID_STATE_TRANSITION';
    this.statusCode=409;
    this.expose=true;
    this.from=from; this.to=to; this.allowed=allowed;
  }
}
export function assertTransition({entity,from,to,map}){
  // Idempotency applies only to states declared by the entity's state machine.
  if(from===to && Object.prototype.hasOwnProperty.call(map ?? {},from))return true;
  // Never read inherited Object.prototype properties as transition lists.
  const allowed=Object.prototype.hasOwnProperty.call(map ?? {},from)?map[from]:[];
  if(!allowed.includes(to))throw new InvalidStateTransitionError({entity,from,to,allowed});
  return true;
}
export const STATE_MACHINES={
  PAYROLL:{DRAFT:['CALCULATED','CANCELLED'],CALCULATED:['APPROVED','CANCELLED'],APPROVED:['PAID','CANCELLED'],PAID:[],CANCELLED:[]},
  EXPENSE:{DRAFT:['SUBMITTED','APPROVED','CANCELLED'],SUBMITTED:['APPROVED','REJECTED','CANCELLED'],APPROVED:['PAID','CANCELLED'],REJECTED:['CANCELLED'],PAID:[],CANCELLED:[]},
  PURCHASE_REQUEST:{DRAFT:['PENDING','CANCELLED'],PENDING:['APPROVED','REJECTED','CANCELLED'],APPROVED:['ORDERED','CANCELLED'],REJECTED:[],ORDERED:[],CANCELLED:[]},
  PURCHASE_ORDER:{DRAFT:['ISSUED','CANCELLED'],ISSUED:['PARTIALLY_RECEIVED','RECEIVED','CANCELLED'],PARTIALLY_RECEIVED:['RECEIVED','CANCELLED'],RECEIVED:[],CANCELLED:[]},
  ACCOUNTS_PAYABLE:{PENDING:['PARTIALLY_PAID','PAID','OVERDUE','CANCELLED'],PARTIALLY_PAID:['PAID','OVERDUE','CANCELLED'],OVERDUE:['PARTIALLY_PAID','PAID','CANCELLED'],PAID:[],CANCELLED:[]},
  ACCOUNTS_RECEIVABLE:{PENDING:['PARTIALLY_PAID','PAID','OVERDUE','CANCELLED'],PARTIALLY_PAID:['PAID','OVERDUE','CANCELLED'],OVERDUE:['PARTIALLY_PAID','PAID','CANCELLED'],PAID:[],CANCELLED:[]}
};
