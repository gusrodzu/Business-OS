import {lazy} from 'react';
const Projects=lazy(()=>import('./ui/pages/Projects'));

export const projectsRoutes = [
  {id: 'projects:proyectos', path: 'proyectos', Component: Projects},
];
