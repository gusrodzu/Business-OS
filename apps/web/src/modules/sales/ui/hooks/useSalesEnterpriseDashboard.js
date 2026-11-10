import {useEffect, useState} from 'react';
import {salesRequest} from '../../services/salesApi';

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
 * Reload is intentionally exposed so existing save/stage handlers refresh the same data.
 */
export default function useSalesEnterpriseDashboard(onError) {
  const [data, setData] = useState(INITIAL_DASHBOARD);

  async function reload() {
    const response = await salesRequest('/sales-enterprise/dashboard');
    setData(response);
  }

  useEffect(() => {
    reload().catch((error) => onError(error));
  }, []);

  return {data, reload};
}
