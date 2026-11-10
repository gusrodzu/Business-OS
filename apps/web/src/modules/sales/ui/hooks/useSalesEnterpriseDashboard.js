import {useEffect, useRef, useState} from 'react';
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

  async function reload() {
    const requestId = ++requestIdRef.current;
    const response = await salesApi.dashboard();
    if (mountedRef.current && requestId === requestIdRef.current) setData(response);
  }

  useEffect(() => {
    let active = true;
    mountedRef.current = true;
    const requestId = ++requestIdRef.current;
    salesApi.dashboard().then(
      (response) => {
        if (active && requestId === requestIdRef.current) setData(response);
      },
      (error) => {
        if (active && requestId === requestIdRef.current) onErrorRef.current?.(error);
      },
    );
    return () => {
      active = false;
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  return {data, reload};
}
