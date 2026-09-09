import {lazy} from 'react';
const PlatformAdmin=lazy(()=>import('./ui/pages/PlatformAdmin'));
export const platformRoutes=[
  {id:'platform:admin-saas', path:'admin-saas', Component:PlatformAdmin},
];
