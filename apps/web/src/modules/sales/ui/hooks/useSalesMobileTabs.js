import {useEffect, useState} from 'react';

const MOBILE_TABS_QUERY = '(max-width: 760px)';

/** Keep Sales module tabs inline on mobile without coupling the page to media events. */
export default function useSalesMobileTabs() {
  const [inlineMobileTabs, setInlineMobileTabs] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_TABS_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_TABS_QUERY);
    const sync = () => setInlineMobileTabs(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return inlineMobileTabs;
}
