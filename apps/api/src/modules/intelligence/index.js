import intelligenceRouter from './api/intelligence.js';
import aiRouter from './api/ai.js';

export default {
  id: 'intelligence',
  routes: [
    {path: '/api/intelligence', router: intelligenceRouter},
    {path: '/api/ai', router: aiRouter},
  ],
};
