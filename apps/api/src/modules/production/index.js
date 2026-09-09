import productionRouter from './api/production.js';

export default {
  id: 'production',
  routes: [
    {path: '/api/production', router: productionRouter},
  ],
};
