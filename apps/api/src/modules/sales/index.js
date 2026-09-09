import salesRouter from './api/sales.js';
import salesEnterpriseRouter from './api/salesEnterprise.js';
import salesFulfillmentRouter from './api/salesFulfillment.js';
import salesReturnsRouter from './api/salesReturns.js';
import orderToCashRouter from './api/orderToCash.js';

export default {
  id: 'sales',
  routes: [
    {path: '/api/sales', router: salesRouter},
    {path: '/api/sales-enterprise', router: salesEnterpriseRouter},
    {path: '/api/sales-fulfillment', router: salesFulfillmentRouter},
    {path: '/api/sales-returns', router: salesReturnsRouter},
    {path: '/api/order-to-cash', router: orderToCashRouter},
  ],
};
