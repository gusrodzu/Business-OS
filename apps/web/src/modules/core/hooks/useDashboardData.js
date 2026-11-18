import {useEffect, useState} from 'react';
import {apiRequest} from '../../../api';

// Keep tenant-scoped data hidden during a company or offline-demo switch.
export function useDashboardData(dashboardScope) {
  const [dashboardState, setDashboardState] = useState(() => ({
    scope: dashboardScope, data: null, loading: true, error: '',
  }));
  // Never render a previous tenant's data while a company switch is in flight.
  const scopedDashboard = dashboardState.scope === dashboardScope ? dashboardState : null;
  const data = scopedDashboard?.data || null;
  const loading = !scopedDashboard || scopedDashboard.loading;
  const error = scopedDashboard?.error || '';

  useEffect(() => {
    let active = true;
    apiRequest('/dashboard')
      .then((result) => {
        if (active) setDashboardState({scope: dashboardScope, data: result, loading: false, error: ''});
      })
      .catch((err) => {
        if (active) setDashboardState({
          scope: dashboardScope, data: null, loading: false,
          error: err?.message || 'No se pudo cargar la información',
        });
      });
    return () => { active = false; };
  }, [dashboardScope]);

  return {data, loading, error};
}
