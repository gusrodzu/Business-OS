import {lazy} from 'react';
const Intelligence=lazy(()=>import('./ui/pages/Intelligence'));

export const intelligenceRoutes = [
  {id: 'intelligence:inteligencia', path: 'inteligencia', Component: Intelligence},
];
