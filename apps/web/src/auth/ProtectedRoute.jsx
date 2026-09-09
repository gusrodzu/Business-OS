import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuth} from './AuthContext';

export default function ProtectedRoute() {
  const {authenticated, platformSession, loading} = useAuth();
  const location = useLocation();
  const adminTarget = location.pathname.startsWith('/admin-saas') || location.pathname.startsWith('/platform-entry');

  if (loading) return <div style={{display:'grid',placeItems:'center',minHeight:'100vh'}}>Cargando sesión…</div>;

  if (!authenticated) {
    return <Navigate to="/login" replace state={{from: location}} />;
  }

  // Las sesiones de plataforma y ERP son contextos mutuamente excluyentes.
  // Un Super Admin no entra accidentalmente a módulos operativos de tenants,
  // y una sesión ERP normal nunca accede al shell global SaaS.
  if (platformSession && !adminTarget) return <Navigate to="/platform-entry" replace />;
  if (!platformSession && adminTarget) return <Navigate to="/login" replace state={{from: location}} />;

  return <Outlet />;
}
