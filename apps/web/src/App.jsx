import {lazy, Suspense} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {AuthProvider} from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppShell from './layout/AppShell';
import PlatformShell from './layout/PlatformShell';
import {erpModuleRoutes, assertUniqueModuleRoutes} from './modules/registry';
import {platformRoutes} from './modules/platform/routes';
import UXRouteFrame from './ux-foundation/UXRouteFrame';
import styles from './App.module.css';

const Login=lazy(()=>import('./pages/Login'));
const NotFound=lazy(()=>import('./pages/NotFound'));
const PlatformEntry=lazy(()=>import('./pages/PlatformEntry'));
const IndustryConfigurator=lazy(()=>import('./pages/IndustryConfigurator'));
const AutomotiveWorkshopDemo=lazy(()=>import('./pages/AutomotiveWorkshopDemo'));

assertUniqueModuleRoutes();

function renderModuleRoute(route) {
  if (route.index) return <Route key={route.id} index element={<UXRouteFrame routeId={route.id}><route.Component /></UXRouteFrame>} />;
  if (route.element) return <Route key={route.id} path={route.path} element={route.element} />;
  return <Route key={route.id} path={route.path} element={<UXRouteFrame routeId={route.id}><route.Component /></UXRouteFrame>} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className={styles.routeLoading} role="status" aria-live="polite">Cargando módulo…</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<Navigate to="/login" replace />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/platform-entry" element={<PlatformEntry />} />
              <Route element={<PlatformShell />}>
                {platformRoutes.map(renderModuleRoute)}
              </Route>
              <Route element={<AppShell />}>
                {erpModuleRoutes.map(renderModuleRoute)}
                <Route path="/configuracion/giros" element={<IndustryConfigurator />} />
                <Route path="/configuracion/giros/automotriz-demo" element={<AutomotiveWorkshopDemo />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
