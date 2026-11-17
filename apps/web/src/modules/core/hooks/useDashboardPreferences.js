import {useEffect, useMemo, useState} from 'react';
import {METRIC_CATALOG, dashboardPreferencesKey, defaultDashboardPreferences, normalizeDashboardPreferences, readDashboardPreferences, writeDashboardPreferences} from '../../../components/honeycombPreferences';
import {widgetCatalog} from '../ui/components/DashboardCustomizer';

/** Keeps dashboard customization scoped to the active user, tenant and demo mode. */
export function useDashboardPreferences(user, offlineDemo) {
  const preferencesKey = dashboardPreferencesKey(user, offlineDemo);
  const [scopedPreferences, setScopedPreferences] = useState(() => ({
    key: preferencesKey, value: readDashboardPreferences(preferencesKey),
  }));
  const preferences = scopedPreferences.key === preferencesKey
    ? scopedPreferences.value
    : readDashboardPreferences(preferencesKey);
  function setPreferences(update) {
    setScopedPreferences(previous => {
      const current = previous.key === preferencesKey
        ? previous.value
        : readDashboardPreferences(preferencesKey);
      const next = typeof update === 'function' ? update(current) : update;
      return {key:preferencesKey, value:normalizeDashboardPreferences(next)};
    });
  }
  useEffect(() => {
    if (scopedPreferences.key === preferencesKey) {
      writeDashboardPreferences(preferencesKey, scopedPreferences.value);
    }
  }, [scopedPreferences, preferencesKey]);

  const visibleWidgets = useMemo(
    () => new Set(widgetCatalog.filter((widget) => !preferences.hiddenWidgets.includes(widget.id)).map((widget) => widget.id)),
    [preferences.hiddenWidgets],
  );

  function toggleWidget(widgetId) {
    setPreferences((current) => ({
      ...current,
      hiddenWidgets: current.hiddenWidgets.includes(widgetId)
        ? current.hiddenWidgets.filter((id) => id !== widgetId)
        : [...current.hiddenWidgets, widgetId],
    }));
  }

  function resetDashboard() {
    setPreferences(defaultDashboardPreferences());
  }

  function toggleMetric(metricId) {
    if (!METRIC_CATALOG.some(item => item.id === metricId)) return;
    setPreferences(current => ({
      ...current,
      selectedMetrics: current.selectedMetrics.includes(metricId)
        ? current.selectedMetrics.filter(id => id !== metricId)
        : [...current.selectedMetrics,metricId],
    }));
  }


  return {preferences, visibleWidgets, setPreferences, toggleWidget, toggleMetric, resetDashboard};
}
