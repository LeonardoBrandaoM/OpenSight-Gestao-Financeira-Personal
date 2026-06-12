import { useEffect, useState } from 'react';
import { consentimentos as mock, type Consentimento } from './data';
import { fetchConsentimentos } from './api';

// Consentimentos do consent-service; inicia com mock (sem flash), mantém em falha.
export function useConsentimentos(): { consentimentos: Consentimento[] } {
  const [list, setList] = useState<Consentimento[]>(mock);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchConsentimentos(ctrl.signal)
      .then(setList)
      .catch(() => {
        /* mantém mock */
      });
    return () => ctrl.abort();
  }, []);
  return { consentimentos: list };
}
