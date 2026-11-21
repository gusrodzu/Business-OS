import {lazy} from 'react';
const PlatformAdmin=lazy(()=>import('./ui/pages/PlatformAdmin'));
const AgentOffice=lazy(()=>import('./ui/pages/AgentOffice'));
export const platformRoutes=[
  {id:'platform:admin-saas', path:'admin-saas', Component:PlatformAdmin},
  {id:'platform:agent-office', path:'agent-office', Component:AgentOffice},
];
