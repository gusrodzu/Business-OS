import {lazy} from 'react';
const Pos=lazy(()=>import('./ui/pages/Pos'));

export const posRoutes = [
  {id: 'pos:pos', path: 'pos', Component: Pos},
];
