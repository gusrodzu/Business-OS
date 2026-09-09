import posRouter from './api/pos.js';

export default {
  id: 'pos',
  routes: [
    {path: '/api/pos', router: posRouter},
  ],
};
