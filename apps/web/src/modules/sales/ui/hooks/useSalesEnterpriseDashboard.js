import {useCallback, useEffect, useRef, useState} from 'react';
import {salesApi} from '../../services/salesApi';

const INITIAL_DASHBOARD = {
  summary: {},
  pipeline: [],
  prospects: [],
  quotes: [],
  orders: [],
  receivables: [],
  activities: [],
};

/**
 * Owns Sales Enterprise dashboard reads; mutations and permissions remain in the page.
 * Reload stays available to existing save/stage handlers.
 */
export default function useSalesEnterpriseDashboard(onError) {
  const [data, setData] = useState(INITIAL_DASHBOARD);
  const onErrorRef = useRef(onError);
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);
  onErrorRef.current = onError;

  // A single read path serves initial loading and post-mutation refreshes.
  // Only the latest request may commit data, including across unmounts.
  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const response = await salesApi.dashboard();
    if (mountedRef.current && requestId === requestIdRef.current) {
      setData(response);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    reload().catch((error) => {
      if (mountedRef.current) onErrorRef.current?.(error);
    });
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [reload]);

  return {data, reload};
}
