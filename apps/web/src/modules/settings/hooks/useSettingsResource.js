import {useCallback, useEffect, useState} from 'react';

/** Shared async state for Settings; presentation stays independent from transport. */
export function useSettingsResource(loader, initialData) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { const result = await loader(); setData(result); return result; }
    catch (nextError) { setError(nextError); throw nextError; }
    finally { setLoading(false); }
  }, [loader]);
  useEffect(() => { reload().catch(() => {}); }, [reload]);
  return {data, setData, loading, error, reload};
}
