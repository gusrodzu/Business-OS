import projectsRouter from './api/projects.js';

export default {
  id: 'projects',
  routes: [
    {path: '/api/projects', router: projectsRouter},
  ],
};
