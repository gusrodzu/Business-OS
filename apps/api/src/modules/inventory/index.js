import productsRouter from './api/products.js';
import inventoryRouter from './api/inventory.js';
import inventoryOperationsRouter from './api/inventoryOperations.js';

export default {
  id: 'inventory',
  routes: [
    {path: '/api/products', router: productsRouter},
    {path: '/api/inventory', router: inventoryRouter},
    {path: '/api/inventory-operations', router: inventoryOperationsRouter},
  ],
};
