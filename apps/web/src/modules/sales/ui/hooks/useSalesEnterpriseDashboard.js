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
  onErrorRef.current = onError;

  async function reload() {
    const response = await salesApi.dashboard();
    setData(response);
  }

  useEffect(() => {
    let active = true;
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
    };
  }, []);

  return {data, reload};
}
