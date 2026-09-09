import customersRouter from './api/customers.js';
import businessPartiesRouter from './api/businessParties.js';
import marketingRouter from './api/marketing.js';

export default {
  id: 'crm',
  routes: [
    {path: '/api/customers', router: customersRouter},
    {path: '/api/business-parties', router: businessPartiesRouter},
    {path: '/api/marketing', router: marketingRouter},
  ],
};
