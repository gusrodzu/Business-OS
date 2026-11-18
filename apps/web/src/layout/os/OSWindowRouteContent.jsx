import {lazy} from 'react';
import {Route,Routes} from 'react-router-dom';
import {erpModuleRoutes} from '../../modules/registry';
import UXRouteFrame from '../../ux-foundation/UXRouteFrame';

const IndustryConfigurator=lazy(()=>import('../../pages/IndustryConfigurator'));
const AutomotiveWorkshopDemo=lazy(()=>import('../../pages/AutomotiveWorkshopDemo'));
const NotFound=lazy(()=>import('../../pages/NotFound'));

function renderWindowRoute(route) {
  if(route.index) return <Route key={route.id} index element={<UXRouteFrame routeId={route.id}><route.Component/></UXRouteFrame>}/>;
  if(route.element) return <Route key={route.id} path={route.path} element={route.element}/>;
  return <Route key={route.id} path={route.path} element={<UXRouteFrame routeId={route.id}><route.Component/></UXRouteFrame>}/>;
}

/**
 * Every OS window gets its own React Router location context, while the
 * application's ProtectedRoute and AuthProvider remain the outer boundary.
 * No route is authorized here; domain screens retain their existing guards.
 */
export default function OSWindowRouteContent({pathname}) {
  return <Routes location={pathname}>
    {erpModuleRoutes.map(renderWindowRoute)}
    <Route path="configuracion/giros" element={<IndustryConfigurator/>}/>
    <Route path="configuracion/giros/automotriz-demo" element={<AutomotiveWorkshopDemo/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes>;
}
