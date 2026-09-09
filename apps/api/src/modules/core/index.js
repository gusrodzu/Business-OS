import authRouter from './api/auth.js';
import dashboardRouter from './api/dashboard.js';
import agendaRouter from './api/agenda.js';
import companyRouter from './api/company.js';
import adminRouter from './api/admin.js';
import activityRouter from './api/activity.js';

export default {
  id: 'core',
  routes: [
    {path: '/api/auth', router: authRouter},
    {path: '/api/dashboard', router: dashboardRouter},
    {path: '/api/agenda', router: agendaRouter},
    {path: '/api/company', router: companyRouter},
    {path: '/api/admin', router: adminRouter},
    {path: '/api/activity', router: activityRouter},
  ],
};
