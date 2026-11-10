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
  onErrorRef.current = onError;

  async function reload() {
    const response = await salesApi.dashboard();
    if (mountedRef.current) setData(response);
  }

  useEffect(() => {
    let active = true;
    mountedRef.current = true;
    salesApi.dashboard().then(
      (response) => {
        if (active) setData(response);
      },
      (error) => {
        if (active) onErrorRef.current?.(error);
      },
    );
    return () => {
      active = false;
      mountedRef.current = false;
    };
  }, []);

  return {data, reload};
}
